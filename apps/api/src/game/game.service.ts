// apps/api/src/game/game.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import type { RoomStatus } from "@sunny-game/types/player.types";
import type { StoreType } from "@sunny-game/types/card.types";
import { generateInviteCode } from "@sunny-game/utils/random";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createRoom(
    userId: string,
    playerId: string,
    dto: {
      name?: string;
      maxPlayers?: number;
      roundTimeLimit?: number;
      votingTimeLimit?: number;
      isPrivate?: boolean;
    },
    maxRounds?: number,
  ) {
    const room = await this.prisma.gameRoom.create({
      data: {
        hostId: userId,
        name: dto.name ?? "Phòng của tôi",
        maxPlayers: Math.min(
          Math.max(dto.maxPlayers ?? GAME_CONSTANTS.DEFAULT_ROOM_MAX_PLAYERS, 2),
          GAME_CONSTANTS.MAX_PLAYERS,
        ),
        maxRounds: maxRounds ?? GAME_CONSTANTS.MAX_ROUNDS,
        config: {
          roundTimeLimit: dto.roundTimeLimit ?? GAME_CONSTANTS.DEFAULT_ROUND_TIME_LIMIT,
          votingTimeLimit: dto.votingTimeLimit ?? GAME_CONSTANTS.DEFAULT_VOTING_TIME_LIMIT,
          maxPlayers: dto.maxPlayers ?? GAME_CONSTANTS.DEFAULT_ROOM_MAX_PLAYERS,
          isPrivate: dto.isPrivate ?? false,
        },
        inviteCode: generateInviteCode(),
        players: {
          create: {
            playerId,
            orderIndex: 0,
            hp: GAME_CONSTANTS.STARTING_HP,
            money: GAME_CONSTANTS.STARTING_MONEY,
            energy: GAME_CONSTANTS.STARTING_ENERGY,
            maxEnergy: GAME_CONSTANTS.STARTING_MAX_ENERGY,
          },
        },
      },
      include: { players: { include: { player: true } } },
    });

    return this.formatRoom(room);
  }

  async listRooms(status: RoomStatus = "WAITING", page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [rooms, total] = await Promise.all([
      this.prisma.gameRoom.findMany({
        where: { status, config: { path: ["isPrivate"], equals: false } },
        include: { players: { include: { player: true }, take: 1 } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.gameRoom.count({
        where: { status, config: { path: ["isPrivate"], equals: false } },
      }),
    ]);

    return {
      rooms: rooms.map((r) => this.formatRoom(r)),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getRoom(roomId: string) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true }, orderBy: { orderIndex: "asc" } } },
    });
    if (!room) throw new NotFoundException("Room not found");
    return this.formatRoom(room);
  }

  async joinRoom(
    roomId: string,
    userId: string,
    playerId: string,
    inviteCode?: string,
  ) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) throw new NotFoundException("Room not found");
    if (room.status !== "WAITING") throw new BadRequestException("Room not in waiting state");
    if (room.players.length >= room.maxPlayers) {
      throw new BadRequestException("Room is full");
    }
    if (inviteCode && room.inviteCode !== inviteCode) {
      throw new BadRequestException("Invalid invite code");
    }

    const existing = room.players.find((p) => p.playerId === playerId);
    if (existing) {
      throw new BadRequestException("Already in this room");
    }

    const updated = await this.prisma.gameRoom.update({
      where: { id: roomId },
      data: {
        players: {
          create: {
            playerId,
            orderIndex: room.players.length,
            hp: GAME_CONSTANTS.STARTING_HP,
            money: GAME_CONSTANTS.STARTING_MONEY,
            energy: GAME_CONSTANTS.STARTING_ENERGY,
            maxEnergy: GAME_CONSTANTS.STARTING_MAX_ENERGY,
          },
        },
      },
      include: { players: { include: { player: true } } },
    });

    return this.formatRoom(updated);
  }

  async leaveRoom(roomId: string, userId: string, playerId: string) {
    await this.prisma.playerState.deleteMany({
      where: { roomId, playerId },
    });

    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (room && room.players.length === 0) {
      await this.prisma.gameRoom.update({
        where: { id: roomId },
        data: { status: "ABANDONED" },
      });
    }

    return { success: true };
  }

  async startGame(roomId: string, userId: string) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) throw new NotFoundException("Room not found");
    if (room.hostId !== userId) throw new BadRequestException("Only host can start");
    if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      throw new BadRequestException("Need at least 2 players");
    }

    const updated = await this.prisma.gameRoom.update({
      where: { id: roomId },
      data: { status: "VOTING", startedAt: new Date() },
      include: { players: { include: { player: true } } },
    });

    return this.formatRoom(updated);
  }

  async voteStore(roomId: string, playerId: string, storeType: StoreType) {
    const existing = await this.prisma.vote.findUnique({
      where: { roomId_playerId: { roomId, playerId } },
    });

    if (existing) {
      await this.prisma.vote.update({
        where: { id: existing.id },
        data: { storeType },
      });
    } else {
      await this.prisma.vote.create({
        data: { roomId, playerId, storeType },
      });
    }

    return { success: true };
  }

  async updatePlayerState(
    roomId: string,
    playerId: string,
    updates: {
      hp?: number;
      money?: number;
      energy?: number;
      isReady?: boolean;
      hand?: string[];
      slots?: string[];
      effects?: string[];
      lockedCardId?: string;
    },
  ) {
    await this.prisma.playerState.updateMany({
      where: { roomId, playerId },
      data: {
        ...updates,
        ...(updates.hand !== undefined ? { hand: JSON.stringify(updates.hand) } : {}),
        ...(updates.slots !== undefined ? { slots: JSON.stringify(updates.slots) } : {}),
        ...(updates.effects !== undefined ? { effects: JSON.stringify(updates.effects) } : {}),
        lastActionAt: new Date(),
      },
    });
  }

  private formatRoom(room: {
    id: string;
    hostId: string;
    inviteCode: string;
    name: string;
    status: RoomStatus;
    storeType?: StoreType | null;
    maxPlayers: number;
    currentRound: number;
    maxRounds: number;
    config: unknown;
    winnerId?: string | null;
    createdAt: Date;
    startedAt?: Date | null;
    endedAt?: Date | null;
    players: Array<{
      id: string;
      orderIndex: number;
      hp: number;
      money: number;
      energy: number;
      maxEnergy: number;
      isReady: boolean;
      isConnected: boolean;
      handCount: number;
      lockedCardId?: string | null;
      player?: { id: string; displayName: string; level: number; mainProfession: string } | null;
    }>;
  }) {
    return {
      id: room.id,
      hostId: room.hostId,
      inviteCode: room.inviteCode,
      name: room.name,
      status: room.status,
      storeType: room.storeType,
      maxPlayers: room.maxPlayers,
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
      config: room.config,
      winnerId: room.winnerId,
      createdAt: room.createdAt,
      startedAt: room.startedAt,
      endedAt: room.endedAt,
      players: room.players.map((p) => ({
        id: p.id,
        playerId: p.player?.id,
        displayName: p.player?.displayName ?? "Unknown",
        level: p.player?.level ?? 1,
        profession: p.player?.mainProfession ?? "SOFTWARE_ENGINEERING",
        orderIndex: p.orderIndex,
        hp: p.hp,
        money: p.money,
        energy: p.energy,
        maxEnergy: p.maxEnergy,
        isReady: p.isReady,
        isConnected: p.isConnected,
        handCount: p.handCount,
        lockedCardId: p.lockedCardId,
      })),
    };
  }

  async restoreEnergy(playerId: string, amount: number) {
    const player = await this.prisma.player.findFirst({ where: { id: playerId } });
    if (!player) throw new NotFoundException("Player not found");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = player as any;
    const currentEnergy = p.energy ?? 100;
    const maxEnergy = p.maxEnergy ?? 100;
    const actualRestored = Math.min(amount, maxEnergy - currentEnergy);
    const actualCost = Math.ceil(actualRestored / 10);

    if (player.gems < actualCost) {
      throw new BadRequestException(`Không đủ gems. Cần ${actualCost} gems cho ${actualRestored} năng lượng.`);
    }

    const newGems = player.gems - actualCost;
    const newEnergy = currentEnergy + actualRestored;

    await this.prisma.player.update({
      where: { id: playerId },
      data: { gems: newGems, energy: newEnergy },
    });

    return {
      ok: true,
      gemsSpent: actualCost,
      energyRestored: actualRestored,
      currentEnergy: newEnergy,
      maxEnergy,
      remainingGems: newGems,
    };
  }
}
