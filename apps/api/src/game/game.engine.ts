// apps/api/src/game/game.engine.ts

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import { getRandomEnvironment, ENVIRONMENT_COLORS } from "@sunny-game/constants/env.data";
import { CARD_BY_KEY } from "@sunny-game/constants/card.data";
import { validateCardPlay } from "@sunny-game/utils/validation";
import type { RoundPhase } from "@sunny-game/types/player.types";
import type { StoreType, CardItem } from "@sunny-game/types/card.types";
import { EconomyEngine, SlotCard } from "./engines/economy.engine";
import { CardDrawEngine } from "./engines/card-draw.engine";
import { AchievementsService } from "../modules/achievement/achievements.service";
import { BattlePassService } from "../modules/battlepass/battlepass.service";
import { gameBus } from "./game-bus";
import { BotService } from "./bots/bot.service";

interface ActiveRoom {
  roomId: string;
  round: number;
  phase: RoundPhase;
  environment: ReturnType<typeof getRandomEnvironment>;
  playerHands: Map<string, string[]>;
  playerSlots: Map<string, (string | null)[]>;
  playerReady: Map<string, boolean>;
  socketMap: Map<string, string>;
}

@Injectable()
export class GameEngine {
  private rooms = new Map<string, ActiveRoom>();
  private economyEngine = new EconomyEngine();
  private cardDraw: CardDrawEngine;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private achievements: AchievementsService,
    private battlepass: BattlePassService,
    private botService: BotService,
  ) {
    this.cardDraw = new CardDrawEngine(prisma);
  }

  verifySocketToken(token: string) {
    const payload = this.jwt.verify(token, {
      secret: this.config.get("JWT_SECRET"),
    });
    return payload as { sub: string; playerId: string; userId: string };
  }

  async joinRoom(roomId: string, playerId: string, socketId: string) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { where: { playerId } } },
    });
    if (!room) throw new Error("Room not found");
    if (room.status !== "WAITING" && room.status !== "VOTING") {
      throw new Error("Room not joinable");
    }
    const active = this.getOrCreateRoom(roomId);
    active.socketMap.set(socketId, playerId);
  }

  private votingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  async beginVotingPhase(roomId: string) {
    const active = this.rooms.get(roomId);
    if (!active) return;

    // Idempotent: only start once
    if (active.phase === "VOTING_PHASE" && this.votingTimers.has(roomId)) return;

    const room = await this.prisma.gameRoom.findUnique({ where: { id: roomId } });
    const config = room?.config as { votingTimeLimit?: number } | null;
    const votingTimeLimitSeconds = config?.votingTimeLimit ?? GAME_CONSTANTS.DEFAULT_VOTING_TIME_LIMIT;

    active.phase = "VOTING_PHASE";

    // Trigger bot votes immediately
    const bots = this.botService.getBotsInRoom(roomId);
    for (const [botId] of bots) {
      if (!this.botService.isBot(botId)) continue;
      const existingVote = await this.prisma.vote.findUnique({
        where: { roomId_playerId: { roomId, playerId: botId } },
      });
      if (!existingVote) {
        await this.botService.voteForBot(roomId, botId);
      }
    }

    // Force-resolve after voting time limit
    this.clearVotingTimer(roomId);
    const timer = setTimeout(async () => {
      this.votingTimers.delete(roomId);
      const currentRoom = await this.prisma.gameRoom.findUnique({ where: { id: roomId }, select: { status: true } });
      if (currentRoom?.status === "VOTING") {
        await this.forceResolveVoting(roomId);
      }
    }, votingTimeLimitSeconds * 1000);
    this.votingTimers.set(roomId, timer);
  }

  private clearVotingTimer(roomId: string) {
    const existing = this.votingTimers.get(roomId);
    if (existing) {
      clearTimeout(existing);
      this.votingTimers.delete(roomId);
    }
  }

  async getRoomPlayers(roomId: string) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true } } },
    });
    if (!room) return [];
    return room.players.map((state) => ({
      playerId: state.playerId,
      displayName: state.player.displayName,
      hp: state.hp,
      slots: (state.slots as (string | null)[]) ?? [null, null, null, null, null],
      isReady: false,
    }));
  }

  async castVote(roomId: string, playerId: string, storeType: StoreType) {
    const active = this.rooms.get(roomId);
    if (!active || active.phase !== "VOTING_PHASE") return;

    const existing = await this.prisma.vote.findUnique({
      where: { roomId_playerId: { roomId, playerId } },
    });
    if (existing) {
      await this.prisma.vote.update({ where: { id: existing.id }, data: { storeType } });
    } else {
      await this.prisma.vote.create({ data: { roomId, playerId, storeType } });
    }

    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true, votes: true },
    });
    if (!room) return;

    const allVoted = room.players.every((p) =>
      room.votes.some((v) => v.playerId === p.playerId),
    );
    if (allVoted) await this.resolveVoting(roomId);
  }

  async resolveVoting(roomId: string): Promise<void> {
    const active = this.rooms.get(roomId);
    if (!active) return;

    this.clearVotingTimer(roomId);

    const bots = this.botService.getBotsInRoom(roomId);

    const votes = await this.prisma.vote.findMany({ where: { roomId } });
    const counts: Record<string, number> = {};
    for (const v of votes) counts[v.storeType] = (counts[v.storeType] ?? 0) + 1;

    let winner: StoreType = "CAFE";
    let maxVotes = 0;
    for (const [st, count] of Object.entries(counts)) {
      if (count > maxVotes) { maxVotes = count; winner = st as StoreType; }
    }

    await this.prisma.gameRoom.update({
      where: { id: roomId },
      data: { storeType: winner, status: "RUNNING" },
    });

    active.phase = "ACTION_PHASE";

    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true } } },
    });

    gameBus.emit("votingComplete", { roomId, storeType: winner, votes: counts });

    if (room) {
      for (const state of room.players) {
        const hand = await this.cardDraw.drawHand(state.playerId, roomId);
        active.playerHands.set(state.playerId, hand.map((c) => c.id));
        const socketId = [...active.socketMap.entries()].find(([, pid]) => pid === state.playerId)?.[0];
        gameBus.emit("roundStart", {
          roomId,
          playerId: state.playerId,
          socketId,
          round: active.round,
          phase: "ACTION",
          timeLeft: GAME_CONSTANTS.DEFAULT_ROUND_TIME_LIMIT,
          environment: {
            name: active.environment.name,
            color: ENVIRONMENT_COLORS[active.environment.key] ?? "#6C63FF",
          },
          hand,
        });
      }
    }

    // Trigger bot card drawing and schedule bot card plays
    for (const [botId] of bots) {
      if (!this.botService.isBot(botId)) continue;
      const hand = this.botService.drawBotHand(botId, active.round);
      active.playerHands.set(botId, hand.map((c) => c.id));
      // Schedule bot card play after a short delay
      setTimeout(async () => {
        try {
          await this.botService.playBotCards(
            roomId,
            botId,
            active.round,
            async () => {
              const allReady = await this.checkAllPlayersReady(roomId, bots);
              if (allReady) {
                await this.executeResolution(roomId);
              }
              return allReady;
            },
          );
        } catch (err) {
          console.error(`Bot ${botId} card play failed:`, err);
        }
      }, 500);
    }
  }

  private async checkAllPlayersReady(roomId: string, bots: Map<string, unknown>): Promise<boolean> {
    const active = this.rooms.get(roomId);
    if (!active) return false;

    const humanReady = [...active.playerReady.values()].every(Boolean);
    let allBotsReady = true;
    for (const [botId] of bots) {
      if (!this.botService.isBotReady(botId)) {
        allBotsReady = false;
        break;
      }
    }

    return humanReady && allBotsReady;
  }

  async forceResolveVoting(roomId: string): Promise<void> {
    const active = this.rooms.get(roomId);
    if (!active || active.phase !== "VOTING_PHASE") return;
    await this.resolveVoting(roomId);
  }

  async applyGameRewards(
    roomId: string,
    winnerId: string | undefined,
    totalRounds: number,
    roundResults: Array<{ playerId: string; moneyChange: number; cardsPlayed: string[] }>,
  ) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true } } },
    });
    if (!room) return;

    for (const state of room.players) {
      const player = state.player;
      const result = roundResults.find((r) => r.playerId === state.playerId);
      const isWinner = state.playerId === winnerId;
      const cardsUsed = result?.cardsPlayed.length ?? 0;
      const profit = result?.moneyChange ?? 0;

      const baseXp = totalRounds * GAME_CONSTANTS.XP_BASE_PER_ROUND;
      const winBonus = isWinner ? GAME_CONSTANTS.XP_WIN_BONUS : 0;
      const topBonus = !isWinner && winnerId ? Math.floor(GAME_CONSTANTS.XP_WIN_BONUS * 0.5) : 0;
      const xpGain = baseXp + winBonus + topBonus;

      const newXp = player.xp + xpGain;
      const xpForNextLevel = Math.floor(
        GAME_CONSTANTS.XP_PER_LEVEL * Math.pow(1 + GAME_CONSTANTS.XP_GROWTH_PER_LEVEL, player.level - 1),
      );

      let newLevel = player.level;
      let remainingXp = newXp;
      let leveledUp = false;

      while (remainingXp >= xpForNextLevel && newLevel < GAME_CONSTANTS.MAX_LEVEL) {
        remainingXp -= xpForNextLevel;
        newLevel++;
        leveledUp = true;
      }

      await this.prisma.player.update({
        where: { id: player.id },
        data: {
          xp: leveledUp ? remainingXp : newXp,
          level: newLevel,
          totalGames: { increment: 1 },
          ...(isWinner ? { totalWins: { increment: 1 } } : {}),
        },
      });

      if (leveledUp) {
        gameBus.emit("levelUp", {
          roomId,
          playerId: state.playerId,
          newLevel,
          maxLevel: GAME_CONSTANTS.MAX_LEVEL,
        });
      }

      await this.battlepass.addXP(player.userId, xpGain);

      const userId = player.userId;
      await this.incrementQuestProgress(userId, "PLAY_ROUNDS", totalRounds);
      await this.incrementQuestProgress(userId, "USE_CARDS", cardsUsed);
      await this.incrementQuestProgress(userId, "EARN_PROFIT", Math.max(0, profit));
      await this.incrementQuestProgress(userId, "SURVIVE_ROUNDS", 1);
      if (isWinner) await this.incrementQuestProgress(userId, "WIN_GAME", 1);
    }

    for (const state of room.players) {
      await this.achievements.checkAndUnlockAchievements(state.player.userId);
    }
  }

  private async incrementQuestProgress(userId: string, questKey: string, amount: number) {
    if (amount <= 0) return;
    const quest = await this.prisma.dailyQuest.findFirst({
      where: { userId, questType: questKey, completed: false },
    });
    if (!quest) return;
    const newProgress = quest.progress + amount;
    const completed = newProgress >= quest.target;
    await this.prisma.dailyQuest.update({
      where: { id: quest.id },
      data: { progress: newProgress, completed },
    });
  }

  async handleDisconnect(playerId: string) {
    for (const [, room] of this.rooms.entries()) {
      room.playerReady.delete(playerId);
      for (const [socketId, pid] of room.socketMap.entries()) {
        if (pid === playerId) room.socketMap.delete(socketId);
      }
    }
    await this.prisma.playerState.updateMany({
      where: { playerId },
      data: { isConnected: false },
    });
  }

  async playCard(roomId: string, playerId: string, cardInstanceId: string, slotIndex: number) {
    const active = this.rooms.get(roomId);
    if (!active || active.phase !== "ACTION_PHASE") throw new Error("Not in action phase");

    const hand = active.playerHands.get(playerId) ?? [];
    if (!hand.includes(cardInstanceId)) throw new Error("Card not in hand");

    const slots = active.playerSlots.get(playerId) ?? [null, null, null, null, null];
    if (slots[slotIndex] !== null) throw new Error("Slot already occupied");

    slots[slotIndex] = cardInstanceId;
    active.playerSlots.set(playerId, slots);
    const idx = hand.indexOf(cardInstanceId);
    if (idx !== -1) hand.splice(idx, 1);
    active.playerHands.set(playerId, hand);

    return { playerId, slotIndex, cardInstanceId };
  }

  async updateSlot(roomId: string, playerId: string, slotIndex: number, cardInstanceId: string | null) {
    const active = this.rooms.get(roomId);
    if (!active) return;
    const slots = active.playerSlots.get(playerId) ?? [null, null, null, null, null];
    slots[slotIndex] = cardInstanceId;
    active.playerSlots.set(playerId, slots);
  }

  async setReady(roomId: string, playerId: string, ready: boolean) {
    const active = this.rooms.get(roomId);
    if (!active) return false;
    active.playerReady.set(playerId, ready);
    const allReady = [...active.playerReady.values()].every(Boolean);
    if (allReady && active.phase === "ACTION_PHASE") {
      await this.executeResolution(roomId);
    }
    return allReady;
  }

  async lockCard(roomId: string, playerId: string, cardInstanceId: string | null) {
    await this.prisma.playerState.updateMany({
      where: { roomId, playerId },
      data: { lockedCardId: cardInstanceId ?? null },
    });
  }

  async getCurrentRound(roomId: string) {
    return this.rooms.get(roomId)?.round ?? 1;
  }

  async getRoomStatus(roomId: string) {
    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      select: { status: true },
    });
    return room?.status ?? null;
  }

  getRoomState(roomId: string, playerId: string) {
    const active = this.rooms.get(roomId);
    if (!active) return null;
    return {
      round: active.round,
      environment: {
        name: active.environment.name,
        key: active.environment.key,
      },
      hand: active.playerHands.get(playerId) ?? [],
    };
  }

  private getOrCreateRoom(roomId: string): ActiveRoom {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        round: 1,
        phase: "ROUND_START",
        environment: getRandomEnvironment(),
        playerHands: new Map(),
        playerSlots: new Map(),
        playerReady: new Map(),
        socketMap: new Map(),
      });
    }
    return this.rooms.get(roomId)!;
  }

  /** Bot in-memory state: botId -> { hp, money, energy, streak } */
  private botStates = new Map<string, { hp: number; money: number; energy: number; streak: number }>();

  private getOrInitBotState(botId: string) {
    if (!this.botStates.has(botId)) {
      this.botStates.set(botId, {
        hp: GAME_CONSTANTS.STARTING_HP,
        money: GAME_CONSTANTS.STARTING_MONEY,
        energy: GAME_CONSTANTS.STARTING_MAX_ENERGY,
        streak: 0,
      });
    }
    return this.botStates.get(botId)!;
  }

  private async executeResolution(roomId: string) {
    const active = this.rooms.get(roomId);
    if (!active) return;

    active.phase = "RESOLUTION_PHASE";

    const room = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true } } },
    });
    if (!room) return;

    const storeType: StoreType = room.storeType ?? "CAFE";
    const roundResults: Array<{
      playerId: string;
      displayName: string;
      hpChange: number;
      moneyChange: number;
      cardsPlayed: string[];
      newHp: number;
      newMoney: number;
    }> = [];

    for (const state of room.players) {
      const player = state.player;
      const slots: (string | null)[] = (state.slots as (string | null)[]) ?? [null, null, null, null, null];
      const slotCards: SlotCard[] = slots
        .map((cardKey) => {
          if (!cardKey) return null;
          const card = CARD_BY_KEY[cardKey];
          if (!card) return null;
          return { card, instanceId: cardKey };
        })
        .filter((s): s is SlotCard => s !== null);

      const ctx = {
        playerId: state.playerId,
        professionKey: player.mainProfession,
        stats: {
          intelligence: player.intelligence,
          stamina: player.stamina,
          speed: player.speed,
          spirit: player.spirit,
          agility: player.agility,
          diplomacy: player.diplomacy,
        },
        streak: 0,
        buffs: [],
        storeType,
        money: state.money,
        hp: state.hp,
        energy: state.energy,
      };

      const result = this.economyEngine.calculateRound(ctx, slotCards, active.environment, active.round);
      const { newHP, newMoney, isDead, deathReason } = result;
      const hpChange = newHP - state.hp;
      const moneyChange = newMoney - state.money;

      const energyUsed = slotCards.reduce((s, sc) => s + (sc.card.energyCost ?? 0), 0);
      const energyRestore = Math.floor(GAME_CONSTANTS.STARTING_MAX_ENERGY * GAME_CONSTANTS.ENERGY_RESTORE_PERCENT / 100);
      const finalEnergy = Math.min(GAME_CONSTANTS.STARTING_MAX_ENERGY, state.energy - energyUsed + energyRestore);

      await this.prisma.playerState.update({
        where: { roomId_playerId: { roomId, playerId: state.playerId } },
        data: {
          hp: newHP,
          money: newMoney,
          energy: finalEnergy,
          consecutiveRoundsCannotPay: newMoney < 0 ? state.consecutiveRoundsCannotPay + 1 : 0,
          effects: JSON.stringify(result.cardEffects.map((e) => ({ type: e.type, log: e.log }))),
        },
      });

      await this.prisma.roundHistory.create({
        data: {
          roomId,
          playerId: state.playerId,
          playerStateId: state.id,
          round: active.round,
          hand: JSON.stringify(active.playerHands.get(state.playerId) ?? []),
          slots: JSON.stringify(slots),
          moneyBefore: state.money,
          moneyAfter: newMoney,
          hpBefore: state.hp,
          hpAfter: newHP,
          revenue: result.revenue,
          costs: result.operatingCost + result.cardCosts,
          profit: result.profit,
          state: isDead ? "dead" : "alive",
        },
      });

      roundResults.push({
        playerId: state.playerId,
        displayName: player.displayName,
        hpChange,
        moneyChange,
        cardsPlayed: slots.filter(Boolean) as string[],
        newHp: newHP,
        newMoney: newMoney,
      });

      if (isDead) {
        gameBus.emit("playerDied", { roomId, playerId: state.playerId, cause: deathReason ?? "Eliminated" });
      }
    }

    // Process bot players
    const bots = this.botService.getBotsInRoom(roomId);
    for (const [botId] of bots) {
      if (!this.botService.isBot(botId)) continue;

      const botState = this.getOrInitBotState(botId);
      const botSlots = this.botService.getBotSlots(botId);

      const botProfile = this.botService.getProfile(botId);
      if (!botProfile) continue;

      const slotCards: SlotCard[] = botSlots
        .map((cardKey) => {
          if (!cardKey) return null;
          // cardKey format: `${cardKey}_bot_${round}_${i}`
          const match = cardKey.match(/^(.+?)_bot_/);
          const actualCardKey = match ? match[1]! : cardKey;
          const card = CARD_BY_KEY[actualCardKey];
          if (!card) return null;
          return { card, instanceId: cardKey };
        })
        .filter((s): s is SlotCard => s !== null);

      const ctx = {
        playerId: botId,
        professionKey: botProfile.mainProfession,
        stats: botProfile.stats,
        streak: botState.streak,
        buffs: [],
        storeType,
        money: botState.money,
        hp: botState.hp,
        energy: botState.energy,
      };

      const result = this.economyEngine.calculateRound(ctx, slotCards, active.environment, active.round);
      const { newHP, newMoney, isDead, deathReason } = result;

      const hpChange = newHP - botState.hp;
      const moneyChange = newMoney - botState.money;

      botState.hp = newHP;
      botState.money = newMoney;
      botState.streak = result.profit >= 0 ? botState.streak + 1 : 0;
      botState.energy = Math.min(
        GAME_CONSTANTS.STARTING_MAX_ENERGY,
        botState.energy -
          slotCards.reduce((s, sc) => s + (sc.card.energyCost ?? 0), 0) +
          Math.floor(GAME_CONSTANTS.STARTING_MAX_ENERGY * GAME_CONSTANTS.ENERGY_RESTORE_PERCENT / 100),
      );

      roundResults.push({
        playerId: botId,
        displayName: botProfile.name,
        hpChange,
        moneyChange,
        cardsPlayed: botSlots.filter(Boolean) as string[],
        newHp: newHP,
        newMoney: newMoney,
      });

      // Reset bot slots for next round
      this.botService.resetBotForRound(botId);

      if (isDead) {
        gameBus.emit("playerDied", { roomId, playerId: botId, cause: deathReason ?? "Eliminated" });
      }
    }

    gameBus.emit("roundResolved", { roomId, roundResults });

    // Game over check
    const alivePlayers = room.players.filter((s) => {
      const result = roundResults.find((r) => r.playerId === s.playerId);
      return result ? result.newHp > 0 : true;
    });

    const gameOver = active.round >= room.maxRounds || alivePlayers.length <= 1;

    if (gameOver) {
      const winnerId = alivePlayers[0]?.playerId;
      await this.prisma.gameRoom.update({
        where: { id: roomId },
        data: { status: "FINISHED", winnerId },
      });
      await this.applyGameRewards(roomId, winnerId, active.round, roundResults);

      const scores = roundResults
        .map((r) => ({
          playerId: r.playerId,
          displayName: r.displayName,
          score: r.newMoney + r.newHp * 100 + active.round * 100,
          hp: r.newHp,
          money: r.newMoney,
          profit: r.moneyChange,
          isAlive: r.newHp > 0,
          isWinner: r.playerId === winnerId,
        }))
        .sort((a, b) => b.score - a.score);

      let mvpId = scores.filter((s) => s.isAlive)[0]?.playerId ?? winnerId;
      if (winnerId && scores[0]?.playerId !== winnerId) {
        const winnerScore = scores.find((s) => s.playerId === winnerId);
        if (winnerScore?.isAlive && winnerScore.score >= (scores.filter((s) => s.isAlive)[0]?.score ?? 0) * 0.8) {
          mvpId = winnerId;
        }
      }

      gameBus.emit("gameOver", {
        roomId,
        winner: !!winnerId,
        finalScore: scores[0]?.score ?? 0,
        survivedRounds: active.round,
        isMvp: mvpId === winnerId,
        scores,
      });

      // Cleanup bot state
      this.clearVotingTimer(roomId);
      for (const [botId] of this.botService.getBotsInRoom(roomId)) {
        this.botStates.delete(botId);
      }
      this.botService.removeBotsFromRoom(roomId);

      return;
    }

    // Advance round
    active.round++;
    active.phase = "ROUND_START";
    active.playerSlots = new Map();
    active.playerReady = new Map();
    active.environment = getRandomEnvironment();

    await this.prisma.gameRoom.update({
      where: { id: roomId },
      data: { currentRound: active.round },
    });

    const updatedRoom = await this.prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: { include: { player: true } } },
    });

    if (updatedRoom) {
      for (const state of updatedRoom.players) {
        const hand = await this.cardDraw.drawHand(state.playerId, roomId);
        active.playerHands.set(state.playerId, hand.map((c) => c.id));
        const socketId = [...active.socketMap.entries()].find(([, pid]) => pid === state.playerId)?.[0];
        gameBus.emit("roundStart", {
          roomId,
          playerId: state.playerId,
          socketId,
          round: active.round,
          phase: "ACTION",
          timeLeft: GAME_CONSTANTS.DEFAULT_ROUND_TIME_LIMIT,
          environment: {
            name: active.environment.name,
            color: ENVIRONMENT_COLORS[active.environment.key] ?? "#6C63FF",
          },
          hand,
        });
      }
    }

    // Draw hands and schedule card plays for bots
    const botsForPlay = this.botService.getBotsInRoom(roomId);
    for (const [botId] of botsForPlay) {
      if (!this.botService.isBot(botId)) continue;
      const hand = this.botService.drawBotHand(botId, active.round);
      active.playerHands.set(botId, hand.map((c) => c.id));
      this.botService.resetBotForRound(botId);
      setTimeout(async () => {
        try {
          await this.botService.playBotCards(
            roomId,
            botId,
            active.round,
            async () => {
              const allReady = await this.checkAllPlayersReady(roomId, botsForPlay);
              if (allReady) {
                await this.executeResolution(roomId);
              }
              return allReady;
            },
          );
        } catch (err) {
          console.error(`Bot ${botId} card play failed:`, err);
        }
      }, 500);
    }
  }
}
