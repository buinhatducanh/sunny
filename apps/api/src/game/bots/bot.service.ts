// apps/api/src/game/bots/bot.service.ts
// AI bot player service for solo practice mode

import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import { CARD_BY_KEY, ALL_CARDS } from "@sunny-game/constants/card.data";
import type { StoreType, Card } from "@sunny-game/types/card.types";
import type { CardItem } from "@sunny-game/types/card.types";
import type { BotDifficulty, BotProfile } from "./bot.service.types";
import { BotDecisionEngine } from "./bot-decision.engine";

export type { BotDifficulty, BotProfile } from "./bot.service.types";

const BOT_NAMES = [
  "Minh Quân", "Thu Hà", "Hoàng Nam", "Phương Linh", "Đức Anh",
  "Minh Chiến", "Thanh Hà", "Văn Minh", "Anh Tuấn", "Minh Châu",
];

const BOT_PROFESSIONS = [
  "SOFTWARE_ENGINEERING",
  "MARKETING",
  "GRAPHIC_DESIGN",
  "ELECTRICAL_ENGINEER",
  "HARDWARE_ENGINEERING",
  "LAWYER",
];

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function createBotProfile(index: number, difficulty: BotDifficulty): BotProfile {
  const rng = seededRng(index * 17 + 31);
  const nameIdx = Math.floor(rng() * BOT_NAMES.length);
  const profIdx = Math.floor(rng() * BOT_PROFESSIONS.length);

  const baseStats = {
    intelligence: 8 + Math.floor(rng() * 10),
    stamina: 8 + Math.floor(rng() * 10),
    speed: 8 + Math.floor(rng() * 10),
    spirit: 8 + Math.floor(rng() * 10),
    agility: 8 + Math.floor(rng() * 10),
    diplomacy: 8 + Math.floor(rng() * 10),
  };

  const profBonus =
    GAME_CONSTANTS.PROFESSION_STAT_BONUS[
      BOT_PROFESSIONS[profIdx] as keyof typeof GAME_CONSTANTS.PROFESSION_STAT_BONUS
    ] ?? {};

  return {
    id: `bot_${Date.now().toString(36)}_${index}`,
    name: `${BOT_NAMES[nameIdx] ?? `Bot${index}`}`,
    difficulty,
    avatarSeed: Math.floor(rng() * 1000),
    mainProfession: BOT_PROFESSIONS[profIdx] ?? "SOFTWARE_ENGINEERING",
    stats: {
      intelligence: Math.min(100, baseStats.intelligence + (profBonus.intelligence ?? 0)),
      stamina: Math.min(100, baseStats.stamina + (profBonus.stamina ?? 0)),
      speed: Math.min(100, baseStats.speed),
      spirit: Math.min(100, baseStats.spirit + (profBonus.spirit ?? 0)),
      agility: Math.min(100, baseStats.agility),
      diplomacy: Math.min(100, baseStats.diplomacy + (profBonus.diplomacy ?? 0)),
    },
  };
}

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  /** In-memory bot state: roomId -> playerId -> BotProfile */
  private botProfiles = new Map<string, BotProfile>();

  /** Bot hands: playerId -> CardItem[] */
  private botHands = new Map<string, CardItem[]>();

  /** Bot slots: playerId -> (string | null)[] */
  private botSlots = new Map<string, (string | null)[]>();

  /** Bot ready status: playerId -> boolean */
  private botReady = new Map<string, boolean>();

  /** Timers for bot actions */
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log("BotService initialized");
  }

  // ─── Public API ────────────────────────────────────────────────────────────────

  isBot(playerId: string): boolean {
    return playerId.startsWith("bot_");
  }

  getProfile(playerId: string): BotProfile | undefined {
    return this.botProfiles.get(playerId);
  }

  getBotIdsForRoom(roomId: string): string[] {
    return [...this.botProfiles.keys()].filter((id) => id.includes(roomId) || this.isBot(id));
  }

  getBotsInRoom(roomId: string): Map<string, BotProfile> {
    const result = new Map<string, BotProfile>();
    for (const [botId, profile] of this.botProfiles) {
      if (profile.roomId === roomId) {
        result.set(botId, profile);
      }
    }
    return result;
  }

  getBotHand(playerId: string): CardItem[] {
    return this.botHands.get(playerId) ?? [];
  }

  getBotSlots(playerId: string): (string | null)[] {
    return this.botSlots.get(playerId) ?? [null, null, null, null, null];
  }

  isBotReady(playerId: string): boolean {
    return this.botReady.get(playerId) ?? false;
  }

  /**
   * Add bots to fill a room. Creates DB records and in-memory state.
   */
  async addBotsToRoom(roomId: string, count: number): Promise<BotProfile[]> {
    const bots: BotProfile[] = [];
    for (let i = 0; i < count; i++) {
      const botIndex = this.botProfiles.size + i;
      const difficulty = this.selectDifficulty(botIndex);
      const profile = createBotProfile(botIndex, difficulty);
      profile.roomId = roomId;

      this.botProfiles.set(profile.id, profile);
      this.botSlots.set(profile.id, [null, null, null, null, null]);
      this.botReady.set(profile.id, false);

      this.logger.log(`Bot added to room ${roomId}: ${profile.name} (${profile.difficulty}) [${profile.id}]`);
      bots.push(profile);
    }
    return bots;
  }

  /**
   * Draw cards for a bot from the card catalog (not from CardOwnership).
   */
  drawBotHand(playerId: string, round: number): CardItem[] {
    const bot = this.botProfiles.get(playerId);
    if (!bot) return [];

    const rng = seededRng(playerId.charCodeAt(0) * 31 + round * 7 + Date.now() % 1000);

    // Build weighted pool from all cards
    const pool: Card[] = [];
    const RARITY_WEIGHTS: Record<string, number> = {
      COMMON: 60,
      RARE: 27,
      EPIC: 10,
      LEGENDARY: 3,
    };
    for (const card of ALL_CARDS) {
      const weight = RARITY_WEIGHTS[card.rarity] ?? 10;
      for (let i = 0; i < weight; i++) pool.push(card);
    }

    // Pick random cards
    const handSize = GAME_CONSTANTS.HAND_SIZE;
    const hand: CardItem[] = [];
    const usedKeys = new Set<string>();

    for (let i = 0; i < handSize && pool.length > 0; i++) {
      const idx = Math.floor(rng() * pool.length);
      const card = pool[idx]!;
      const instanceId = `${card.cardKey}_bot_${round}_${i}`;

      // Avoid duplicate card instances in hand
      if (!usedKeys.has(card.cardKey)) {
        hand.push({
          id: instanceId,
          cardKey: card.cardKey,
          name: card.name,
          description: card.description,
          rarity: card.rarity,
          energyCost: card.energyCost,
          moneyCost: card.moneyCost,
          storeTypes: card.storeTypes,
          phase: card.phase,
          slotType: card.slotType,
          duration: card.duration,
          primaryEffect: card.primaryEffect,
          secondaryEffect: card.secondaryEffect,
          professionKey: card.professionKey,
        });
        usedKeys.add(card.cardKey);
      } else {
        i--; // retry
      }
    }

    this.botHands.set(playerId, hand);
    return hand;
  }

  /**
   * Vote for a store type for a bot.
   */
  async voteForBot(roomId: string, botId: string): Promise<StoreType> {
    const bot = this.botProfiles.get(botId);
    if (!bot) return "CAFE";

    const hand = this.botHands.get(botId) ?? [];
    const storeType = BotDecisionEngine.chooseStoreType(hand, bot);

    await this.delay(this.thinkDelay(bot.difficulty, 800, 2000));

    // Store vote in DB so voting resolution picks it up
    await this.prisma.vote.upsert({
      where: { roomId_playerId: { roomId, playerId: botId } },
      create: { roomId, playerId: botId, storeType },
      update: { storeType },
    });

    this.logger.debug(`Bot ${bot.name} voted: ${storeType}`);
    return storeType;
  }

  /**
   * Execute bot card play: decide and execute slot placements.
   */
  async playBotCards(
    roomId: string,
    botId: string,
    roomRound: number,
    onReady: () => Promise<boolean>,
  ): Promise<void> {
    const bot = this.botProfiles.get(botId);
    if (!bot) return;

    const hand = this.botHands.get(botId) ?? [];
    const currentSlots = this.botSlots.get(botId) ?? [null, null, null, null, null];

    const handWithInstances = hand.map((c, i) => ({
      card: c,
      instanceId: c.id,
      cardDef: CARD_BY_KEY[c.cardKey],
    }));

    const placements = BotDecisionEngine.planCardPlacement(handWithInstances, currentSlots, roomRound, bot);

    // Small think delay
    await this.delay(this.thinkDelay(bot.difficulty, 1500, 5000));

    // Place each card
    for (const { instanceId, slotIndex } of placements) {
      const card = hand.find((c) => c.id === instanceId);
      if (!card) continue;

      currentSlots[slotIndex] = instanceId;
      const handCopy = hand.filter((c) => c.id !== instanceId);
      this.botHands.set(botId, handCopy);
    }
    this.botSlots.set(botId, currentSlots);

    this.logger.debug(
      `Bot ${bot.name} placed ${placements.length} cards in room ${roomId}`,
    );

    // Set ready after placement
    await this.delay(this.thinkDelay(bot.difficulty, 300, 1000));
    const allReady = await onReady();
    this.botReady.set(botId, true);

    if (allReady) {
      this.logger.debug(`Bot ${bot.name} triggered resolution in room ${roomId}`);
    }
  }

  /**
   * Reset bot state for a new round.
   */
  resetBotForRound(playerId: string): void {
    this.botSlots.set(playerId, [null, null, null, null, null]);
    this.botReady.set(playerId, false);
  }

  /**
   * Remove a bot from the system.
   */
  removeBot(botId: string): void {
    this.clearTimers(botId);
    this.botProfiles.delete(botId);
    this.botHands.delete(botId);
    this.botSlots.delete(botId);
    this.botReady.delete(botId);
  }

  /**
   * Remove all bots from a room.
   */
  removeBotsFromRoom(roomId: string): void {
    for (const [botId, profile] of this.botProfiles) {
      if (profile.roomId === roomId) {
        this.removeBot(botId);
      }
    }
  }

  /**
   * Get all bot stats for economy calculation.
   */
  getBotStats(botId: string): {
    intelligence: number;
    stamina: number;
    speed: number;
    spirit: number;
    agility: number;
    diplomacy: number;
    mainProfession: string;
  } | null {
    const bot = this.botProfiles.get(botId);
    if (!bot) return null;
    return {
      intelligence: bot.stats.intelligence,
      stamina: bot.stats.stamina,
      speed: bot.stats.speed,
      spirit: bot.stats.spirit,
      agility: bot.stats.agility,
      diplomacy: bot.stats.diplomacy,
      mainProfession: bot.mainProfession,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private selectDifficulty(index: number): BotDifficulty {
    const rng = seededRng(index * 7 + 13);
    const roll = rng();
    if (roll < 0.25) return "EASY";
    if (roll < 0.65) return "MEDIUM";
    return "HARD";
  }

  private thinkDelay(difficulty: BotDifficulty, min: number, max: number): number {
    switch (difficulty) {
      case "EASY":
        return min + Math.random() * (max - min);
      case "MEDIUM":
        return min * 1.3 + Math.random() * (max - min) * 0.6;
      case "HARD":
        return min * 1.8 + Math.random() * (max - min) * 0.3;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private clearTimers(botId: string): void {
    for (const [key, timer] of this.timers) {
      if (key.includes(botId)) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
    }
  }
}
