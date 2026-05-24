// apps/api/src/modules/card/cards.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CARD_BY_KEY,
  ALL_CARDS,
} from "@sunny-game/constants/card.data";
import type { Rarity } from "@sunny-game/types/card.types";

export interface CardInfo {
  id: string;
  cardKey: string;
  name: string;
  emoji: string;
  rarity: Rarity;
  storeType: string;
  description: string;
  baseRevenue: number;
  baseCost: number;
  energyCost: number;
  effects: unknown[];
  duration: string;
}

export interface CollectionCard extends CardInfo {
  isOwned: boolean;
  count: number;
}

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async getPlayerCollection(playerId: string) {
    const ownership = await this.prisma.cardOwnership.findMany({
      where: { playerId },
    });

    const ownedKeys = new Set<string>();
    const ownedCounts = new Map<string, number>();
    for (const o of ownership) {
      ownedKeys.add(o.cardKey);
      ownedCounts.set(o.cardKey, o.count);
    }

    const cards: CollectionCard[] = ALL_CARDS.map((card) => {
      const cardAny = card as unknown as Record<string, unknown>;
      const key = (cardAny["cardKey"] as string | undefined) ?? card.name.replace(/\s+/g, "_").toUpperCase().slice(0, 6);
      return {
        id: card.name.replace(/\s+/g, "_").toUpperCase(),
        cardKey: key,
        name: card.name,
        emoji: (cardAny["iconEmoji"] as string | undefined) ?? "🃏",
        rarity: (cardAny["rarity"] as Rarity | undefined) ?? "COMMON",
        storeType: (cardAny["storeType"] as string | undefined) ?? "CAFE",
        description: cardAny["description"] as string ?? "",
        baseRevenue: (cardAny["baseRevenue"] as number | undefined) ?? 0,
        baseCost: (cardAny["baseCost"] as number | undefined) ?? 0,
        energyCost: (cardAny["energyCost"] as number | undefined) ?? 0,
        effects: (cardAny["effects"] as unknown[] | undefined) ?? [],
        duration: (cardAny["duration"] as string | undefined) ?? "INSTANT",
        isOwned: ownedKeys.has(key),
        count: ownedCounts.get(key) ?? 0,
      };
    });

    const ownedCards = cards.filter((c) => c.isOwned);

    return {
      cards,
      total: ownedCards.length,
      byRarity: {
        COMMON: ownedCards.filter((c) => c.rarity === "COMMON").length,
        RARE: ownedCards.filter((c) => c.rarity === "RARE").length,
        EPIC: ownedCards.filter((c) => c.rarity === "EPIC").length,
        LEGENDARY: ownedCards.filter((c) => c.rarity === "LEGENDARY").length,
      },
    };
  }

  async getCardByKey(cardKey: string): Promise<CardInfo | null> {
    const card = CARD_BY_KEY[cardKey];
    if (!card) return null;

    const cardAny = card as unknown as Record<string, unknown>;
    return {
      id: cardKey,
      cardKey,
      name: card.name,
      emoji: (cardAny["iconEmoji"] as string | undefined) ?? "🃏",
      rarity: (cardAny["rarity"] as Rarity | undefined) ?? "COMMON",
      storeType: (cardAny["storeType"] as string | undefined) ?? "CAFE",
      description: cardAny["description"] as string ?? "",
      baseRevenue: (cardAny["baseRevenue"] as number | undefined) ?? 0,
      baseCost: (cardAny["baseCost"] as number | undefined) ?? 0,
      energyCost: (cardAny["energyCost"] as number | undefined) ?? 0,
      effects: (cardAny["effects"] as unknown[] | undefined) ?? [],
      duration: (cardAny["duration"] as string | undefined) ?? "INSTANT",
    };
  }

  async addCardToPlayer(playerId: string, cardKey: string, count = 1) {
    return this.prisma.cardOwnership.upsert({
      where: { playerId_cardKey: { playerId, cardKey } },
      create: { playerId, cardKey, count },
      update: { count: { increment: count } },
    });
  }
}
