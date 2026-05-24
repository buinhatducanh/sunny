// apps/api/src/game/gateways/game.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Inject, forwardRef } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { GameEngine } from "../game.engine";
import { gameBus } from "../game-bus";
import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import { CARD_BY_KEY } from "@sunny-game/constants/card.data";
import { ENVIRONMENT_COLORS } from "@sunny-game/constants/env.data";
import type { StoreType } from "@sunny-game/types/card.types";
import type { RoundPhase } from "@sunny-game/types/player.types";

const STORE_TYPES: StoreType[] = ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"];

interface AuthPayload {
  token: string;
}

interface CardPlayPayload {
  roomId: string;
  cardInstanceId: string;
  slotIndex: number;
  targetPlayerId?: string;
}

interface ReadyPayload {
  roomId: string;
  ready: boolean;
}

interface SlotUpdatePayload {
  roomId: string;
  slotIndex: number;
  cardInstanceId: string | null;
}

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/game",
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  private socketUserMap = new Map<string, { userId: string; playerId: string }>();

  constructor(@Inject(forwardRef(() => GameEngine)) private engine: GameEngine) {}

  afterInit() {
    this.registerGameBusListeners();
  }

  private registerGameBusListeners() {
    gameBus.on("votingComplete", (data: { roomId: string; storeType: string; votes: Record<string, number> }) => {
      this.server.to(`room:${data.roomId}`).emit("votingComplete", {
        storeType: data.storeType,
        votes: data.votes,
      });
    });

    gameBus.on("roundStart", (data: {
      roomId: string;
      playerId: string;
      socketId?: string;
      round: number;
      phase: RoundPhase;
      timeLeft: number;
      environment: { name: string; color: string };
      hand: Array<{ id: string; name: string; energyCost: number; description: string; rarity: string; rarityColor: string; emoji: string }>;
    }) => {
      if (data.socketId) {
        const socket = this.server.sockets.sockets.get(data.socketId);
        if (socket) {
          socket.emit("roundStart", {
            roomId: data.roomId,
            round: data.round,
            phase: data.phase,
            timeLeft: data.timeLeft,
            environment: data.environment,
            hand: data.hand.map((card) => ({
              id: card.id,
              name: card.name,
              energyCost: card.energyCost,
              description: card.description,
              rarityColor: card.rarityColor,
              emoji: card.emoji,
            })),
          });
        }
      }
    });

    gameBus.on("levelUp", (data: { roomId: string; playerId: string; newLevel: number; maxLevel: number }) => {
      const socketId = this.findSocketByPlayerId(data.playerId);
      if (socketId) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) socket.emit("levelUp", { newLevel: data.newLevel, maxLevel: data.maxLevel });
      }
    });

    gameBus.on("playerDied", (data: { roomId: string; playerId: string; cause: string }) => {
      this.server.to(`room:${data.roomId}`).emit("playerDied", {
        playerId: data.playerId,
        cause: data.cause,
      });
    });

    gameBus.on("roundResolved", (data: { roomId: string; roundResults: Array<{ playerId: string; displayName: string; hpChange: number; moneyChange: number; cardsPlayed: string[]; newHp: number; newMoney: number }> }) => {
      this.server.to(`room:${data.roomId}`).emit("roundResolved", { roundResults: data.roundResults });
    });

    gameBus.on("gameOver", (data: { roomId: string; winner: boolean; finalScore: number; survivedRounds: number; isMvp: boolean; scores: Array<{ playerId: string; displayName: string; score: number; hp: number; money: number; profit: number; isAlive: boolean; isWinner: boolean }> }) => {
      this.server.to(`room:${data.roomId}`).emit("gameOver", {
        winner: data.winner,
        finalScore: data.finalScore,
        survivedRounds: data.survivedRounds,
        isMvp: data.isMvp,
        scores: data.scores,
      });
    });
  }

  private findSocketByPlayerId(playerId: string): string | undefined {
    for (const [socketId, info] of this.socketUserMap.entries()) {
      if (info.playerId === playerId) return socketId;
    }
    return undefined;
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        const decoded = this.engine.verifySocketToken(token);
        this.socketUserMap.set(client.id, decoded);
        console.log(`[WS] Authenticated: ${client.id} -> player:${decoded.playerId}`);
        return;
      } catch {
        console.log(`[WS] Invalid token on connect: ${client.id}`);
      }
    }
    console.log(`[WS] Client connected (no token): ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const user = this.socketUserMap.get(client.id);
    if (user) {
      await this.engine.handleDisconnect(user.playerId);
      this.socketUserMap.delete(client.id);
    }
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("auth")
  async handleAuth(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AuthPayload,
  ) {
    try {
      const decoded = this.engine.verifySocketToken(payload.token);
      this.socketUserMap.set(client.id, decoded);

      client.join(`user:${decoded.userId}`);
      client.emit("auth:success", { playerId: decoded.playerId });
    } catch {
      client.emit("auth:error", { message: "Invalid token" });
      client.disconnect();
    }
  }

  @SubscribeMessage("room:join")
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string },
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) {
      client.emit("error", { message: "Not authenticated" });
      return;
    }

    try {
      await this.engine.joinRoom(payload.roomId, user.playerId, client.id);
      client.join(`room:${payload.roomId}`);

      const players = await this.engine.getRoomPlayers(payload.roomId);
      const roomStatus = await this.engine.getRoomStatus(payload.roomId);

      // Send full room state to the joining player
      client.emit("room:state", {
        roomId: payload.roomId,
        players,
        status: roomStatus,
      });

      // If room is in VOTING phase, emit voting UI
      if (roomStatus === "VOTING") {
        client.emit("votingStart", { storeTypes: STORE_TYPES });
      }

      // Notify others
      this.server.to(`room:${payload.roomId}`).emit("player:joined", {
        playerId: user.playerId,
        displayName: players.find((p) => p.playerId === user.playerId)?.displayName ?? user.playerId,
        hp: players.find((p) => p.playerId === user.playerId)?.hp ?? 100,
        slots: players.find((p) => p.playerId === user.playerId)?.slots ?? [null, null, null, null, null],
        isReady: false,
      });
    } catch (err) {
      client.emit("error", { message: (err as Error).message });
    }
  }

  @SubscribeMessage("card:play")
  async handleCardPlay(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CardPlayPayload,
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) return;

    try {
      const result = await this.engine.playCard(
        payload.roomId,
        user.playerId,
        payload.cardInstanceId,
        payload.slotIndex,
        payload.targetPlayerId,
      );

      this.server.to(`room:${payload.roomId}`).emit("card:played", result);
    } catch (err) {
      client.emit("error", { message: (err as Error).message });
    }
  }

  @SubscribeMessage("slot:update")
  async handleSlotUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SlotUpdatePayload,
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) return;

    await this.engine.updateSlot(
      payload.roomId,
      user.playerId,
      payload.slotIndex,
      payload.cardInstanceId,
    );

    client.to(`room:${payload.roomId}`).emit("slot:updated", {
      playerId: user.playerId,
      slotIndex: payload.slotIndex,
      cardInstanceId: payload.cardInstanceId,
    });
  }

  @SubscribeMessage("player:ready")
  async handleReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ReadyPayload,
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) return;

    const allReady = await this.engine.setReady(
      payload.roomId,
      user.playerId,
      payload.ready,
    );

    this.server.to(`room:${payload.roomId}`).emit("player:ready", {
      playerId: user.playerId,
      ready: payload.ready,
    });

    if (allReady) {
      const roomState = this.engine.getRoomState(payload.roomId, user.playerId);
      this.server.to(`room:${payload.roomId}`).emit("roundStart", {
        round: roomState?.round ?? 1,
        phase: "ACTION",
        timeLeft: GAME_CONSTANTS.DEFAULT_ROUND_TIME_LIMIT,
        environment: {
          name: roomState?.environment.name ?? "Bình Thường",
          color: ENVIRONMENT_COLORS[roomState?.environment.key ?? "NORMAL"] ?? "#6C63FF",
        },
        hand: (roomState?.hand ?? []).map((cardKey) => {
          const card = CARD_BY_KEY[cardKey];
          return {
            id: cardKey,
            name: card?.name ?? cardKey,
            emoji: "🎴",
            energyCost: card?.energyCost ?? 0,
            rarityColor: "#6C63FF",
            description: card?.description ?? "",
          };
        }),
      });
    }
  }

  @SubscribeMessage("player:vote")
  async handleVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; storeType: StoreType },
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) return;

    if (!STORE_TYPES.includes(payload.storeType)) {
      client.emit("error", { message: "Invalid store type" });
      return;
    }

    await this.engine.castVote(payload.roomId, user.playerId, payload.storeType);
  }

  @SubscribeMessage("card:lock")
  async handleLockCard(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; cardInstanceId: string | null },
  ) {
    const user = this.socketUserMap.get(client.id);
    if (!user) return;

    await this.engine.lockCard(
      payload.roomId,
      user.playerId,
      payload.cardInstanceId,
    );
  }

  emitToRoom(roomId: string, event: string, data: unknown) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }

  getOnlineCount(): number {
    return this.socketUserMap.size;
  }

  emitToUser(playerId: string, event: string, data: unknown) {
    for (const [socketId, info] of this.socketUserMap.entries()) {
      if (info.playerId === playerId) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit(event, data);
        }
        break;
      }
    }
  }
}
