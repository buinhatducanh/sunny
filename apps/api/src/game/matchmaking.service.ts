// apps/api/src/game/matchmaking.service.ts

import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GameService } from "./game.service";
import { GameGateway } from "./gateways/game.gateway";

interface QueuedPlayer {
  playerId: string;
  userId: string;
  displayName: string;
  joinedAt: Date;
  skillRating: number;
}

@Injectable()
export class MatchmakingService implements OnModuleInit {
  private queue: QueuedPlayer[] = [];
  private readonly MIN_PLAYERS = 2;
  private readonly MAX_PLAYERS = 5;
  private readonly QUEUE_TIMEOUT_MS = 60_000;
  private readonly TICK_INTERVAL_MS = 5_000;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly logger = new Logger(MatchmakingService.name);

  constructor(
    private prisma: PrismaService,
    private gameService: GameService,
    private gateway: GameGateway,
  ) {}

  onModuleInit() {
    this.startTick();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private startTick() {
    this.timer = setInterval(() => {
      this.processQueue();
    }, this.TICK_INTERVAL_MS);
  }

  async joinQueue(playerId: string, userId: string): Promise<{ status: "queued" | "matched"; roomId?: string }> {
    // Check if already queued
    if (this.queue.some((p) => p.playerId === playerId)) {
      return { status: "queued" };
    }

    // Get player skill rating based on level
    const player = await this.prisma.player.findFirst({ where: { id: playerId } });
    const skillRating = player?.level ?? 1;

    // Check if there's a room waiting
    const waitingRoom = await this.findWaitingRoom();
    if (waitingRoom) {
      // Join existing room
      try {
        await this.gameService.joinRoom(waitingRoom.id, playerId, userId);
        return { status: "matched", roomId: waitingRoom.id };
      } catch {
        // Fall through to queue
      }
    }

    // Add to queue
    this.queue.push({
      playerId,
      userId,
      displayName: player?.displayName ?? "Unknown",
      joinedAt: new Date(),
      skillRating,
    });

    // Try to form a match immediately
    await this.processQueue();

    return { status: "queued" };
  }

  leaveQueue(playerId: string) {
    this.queue = this.queue.filter((p) => p.playerId !== playerId);
  }

  getQueuePosition(playerId: string): number {
    const idx = this.queue.findIndex((p) => p.playerId === playerId);
    return idx >= 0 ? idx + 1 : -1;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  private async findWaitingRoom() {
    const room = await this.prisma.gameRoom.findFirst({
      where: {
        status: "WAITING",
        players: { some: {} },
      },
      include: {
        _count: { select: { players: true } },
      },
    });
    if (!room || room._count.players >= room.maxPlayers) return null;
    return room;
  }

  private async processQueue() {
    if (this.queue.length < this.MIN_PLAYERS) return;

    // Sort by skill rating for balanced matchmaking
    const sorted = [...this.queue].sort((a, b) => a.skillRating - b.skillRating);

    // Try to form a group of 2-5 players
    let groupSize = Math.min(sorted.length, this.MAX_PLAYERS);

    // Prefer full groups
    if (sorted.length >= this.MAX_PLAYERS) {
      groupSize = this.MAX_PLAYERS;
    } else if (sorted.length >= 4) {
      groupSize = 4;
    }

    if (groupSize < this.MIN_PLAYERS) return;

    const group = sorted.slice(0, groupSize);
    const playerIds = group.map((p) => p.playerId);

    // Remove from queue
    this.queue = this.queue.filter((p) => !playerIds.includes(p.playerId));

    // Create room and add players
    try {
      const host = group[0]!;
      const room = await this.gameService.createRoom(
        host.userId,
        host.playerId,
        { name: `Phòng #${Math.floor(Math.random() * 9000) + 1000}` },
      );

      for (let i = 1; i < group.length; i++) {
        const member = group[i]!;
        try {
          await this.gameService.joinRoom(room.id, member.playerId, member.userId);
        } catch (err) {
          this.logger.error(`Failed to add player ${member.playerId} to room: ${err}`);
        }
      }

      // Notify all matched players via socket
      for (const p of group) {
        this.gateway.emitToUser(p.playerId, "matchFound", {
          roomId: room.id,
          inviteCode: room.inviteCode,
          displayName: p.displayName,
        });
      }

      this.logger.log(`Matched ${group.length} players into room ${room.id}`);
    } catch (err) {
      this.logger.error(`Matchmaking failed: ${err}`);
      // Re-queue players on failure
      this.queue.push(...group);
    }
  }
}
