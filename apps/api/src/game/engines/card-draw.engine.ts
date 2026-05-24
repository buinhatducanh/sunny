// apps/api/src/game/engines/card-draw.engine.ts

import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import { CARD_BY_KEY } from "@sunny-game/constants/card.data";
import type { CardItem } from "@sunny-game/types/card.types";
import { PrismaService } from "../../prisma/prisma.service";

const RARITY_WEIGHTS: Record<string, number> = {
  COMMON: 50,
  UNCOMMON: 30,
  RARE: 15,
  EPIC: 4,
  LEGENDARY: 1,
};

function weightedRandomDraw(
  ownedCards: Array<{ cardKey: string; count: number }>,
): string[] {
  if (ownedCards.length === 0) return [];

  const pool: string[] = [];
  for (const { cardKey, count } of ownedCards) {
    const rarity = CARD_BY_KEY[cardKey]?.rarity ?? "COMMON";
    const weight = RARITY_WEIGHTS[rarity] ?? 10;
    for (let i = 0; i < count * weight; i++) {
      pool.push(cardKey);
    }
  }

  const handSize = GAME_CONSTANTS.HAND_SIZE;
  const hand: string[] = [];
  const usedKeys = new Set<string>();

  for (let i = 0; i < handSize && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const cardKey = pool[idx]!;
    hand.push(cardKey);
    usedKeys.add(cardKey);
    // Remove one instance of this card from pool
    const lastIdx = pool.lastIndexOf(cardKey);
    if (lastIdx !== -1) pool.splice(lastIdx, 1);
  }

  return hand;
}

export class CardDrawEngine {
  constructor(private prisma: PrismaService) {}

  async drawHand(playerId: string, roomId: string): Promise<CardItem[]> {
    const ownerships = await this.prisma.cardOwnership.findMany({
      where: { playerId, count: { gt: 0 } },
    });

    if (ownerships.length === 0) return [];

    const drawnKeys = weightedRandomDraw(ownerships);
    const hand: CardItem[] = [];

    for (let i = 0; i < drawnKeys.length; i++) {
      const cardKey = drawnKeys[i]!;
      const cardDef = CARD_BY_KEY[cardKey];
      if (!cardDef) continue;

      // Create instance ID
      const instanceId = `${cardKey}_${roomId}_${Date.now()}_${i}`;

      hand.push({
        id: instanceId,
        cardKey,
        name: cardDef.name,
        description: cardDef.description,
        rarity: cardDef.rarity,
        energyCost: cardDef.energyCost,
        moneyCost: cardDef.moneyCost,
        storeTypes: cardDef.storeTypes,
        phase: cardDef.phase,
        slotType: cardDef.slotType,
        duration: cardDef.duration,
        primaryEffect: cardDef.primaryEffect,
        secondaryEffect: cardDef.secondaryEffect,
        professionKey: cardDef.professionKey,
        emoji: cardDef.iconEmoji,
        rarityColor: cardDef.color,
      });
    }

    return hand;
  }

  toCardItem(cardKey: string, instanceId: string): CardItem | null {
    const cardDef = CARD_BY_KEY[cardKey];
    if (!cardDef) return null;
    return {
      id: instanceId,
      cardKey,
      name: cardDef.name,
      description: cardDef.description,
      rarity: cardDef.rarity,
      energyCost: cardDef.energyCost,
      moneyCost: cardDef.moneyCost,
      storeTypes: cardDef.storeTypes,
      phase: cardDef.phase,
      slotType: cardDef.slotType,
      duration: cardDef.duration,
      primaryEffect: cardDef.primaryEffect,
      secondaryEffect: cardDef.secondaryEffect,
      professionKey: cardDef.professionKey,
    };
  }
}
