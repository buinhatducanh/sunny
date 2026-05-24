// apps/api/src/modules/shop/shop.service.ts

import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CARD_BY_KEY } from "@sunny-game/constants/card.data";
import type { Card, Rarity } from "@sunny-game/types/card.types";
import type { PackResult } from "@sunny-game/types/card.types";

export interface ShopPack {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "coins" | "gems";
  cardCount: number;
  guaranteedRarity?: Rarity;
  pityCounter?: number;
}

const PACKS: ShopPack[] = [
  {
    id: "starter_pack",
    name: "Gói Khởi Đầu",
    description: "3 lá bài — 100% Common",
    price: 100,
    currency: "coins",
    cardCount: 3,
  },
  {
    id: "bronze_pack",
    name: "Gói Bronze",
    description: "5 lá bài, bảo đảm Rare",
    price: 500,
    currency: "coins",
    cardCount: 5,
    guaranteedRarity: "RARE",
  },
  {
    id: "silver_pack",
    name: "Gói Silver",
    description: "5 lá bài, bảo đảm Rare",
    price: 1000,
    currency: "coins",
    cardCount: 5,
    guaranteedRarity: "RARE",
  },
  {
    id: "gold_pack",
    name: "Gói Vàng",
    description: "5 lá bài, bảo đảm Rare+",
    price: 2500,
    currency: "coins",
    cardCount: 5,
    guaranteedRarity: "RARE",
  },
  {
    id: "legend_pack",
    name: "Gói Huyền Thoại",
    description: "5 lá bài, bảo đảm Epic+",
    price: 100,
    currency: "gems",
    cardCount: 5,
    guaranteedRarity: "EPIC",
  },
];

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  getPacks(): ShopPack[] {
    return PACKS.map((p) => ({
      ...p,
      price: p.id === "legend_pack" ? 100 : p.price,
    }));
  }

  async buyPack(playerId: string, packId: string): Promise<PackResult> {
    const player = await this.prisma.player.findFirst({ where: { id: playerId } });
    if (!player) throw new BadRequestException("Player not found");

    const pack = PACKS.find((p) => p.id === packId);
    if (!pack) throw new BadRequestException("Pack not found");

    const cost = pack.price;
    const currency = pack.currency;
    if (currency === "coins") {
      if (player.coins < cost) throw new BadRequestException("Không đủ coins");
      await this.prisma.player.update({
        where: { id: playerId },
        data: { coins: player.coins - cost },
      });
    } else {
      if (player.gems < cost) throw new BadRequestException("Không đủ gems");
      await this.prisma.player.update({
        where: { id: playerId },
        data: { gems: player.gems - cost },
      });
    }

    // Get player's owned cards for pity system
    const owned = await this.prisma.cardOwnership.findMany({ where: { playerId } });
    const ownedKeys = new Set(owned.map((o) => o.cardKey));

    const cards: Card[] = [];

    // Draw cards
    const allCards = Object.values(CARD_BY_KEY);
    const guaranteedPool = pack.guaranteedRarity
      ? allCards.filter((c) => this.getRarityWeight(c.rarity) >= this.getRarityWeight(pack.guaranteedRarity!))
      : allCards;

    for (let i = 0; i < pack.cardCount; i++) {
      // Weighted random
      const pool = guaranteedPool.length > 0 && i === 0 ? guaranteedPool : allCards;
      const totalWeight = pool.reduce((sum, c) => sum + this.getRarityWeight(c.rarity), 0);
      let rand = Math.random() * totalWeight;
      let selected: Card | undefined;

      for (const card of pool) {
        rand -= this.getRarityWeight(card.rarity);
        if (rand <= 0) {
          selected = card;
          break;
        }
      }
      if (!selected) selected = pool[Math.floor(Math.random() * pool.length)]!;
      if (!selected) continue;

      cards.push(selected);

      // Update ownership
      if (ownedKeys.has(selected.cardKey)) {
        await this.prisma.cardOwnership.update({
          where: { playerId_cardKey: { playerId, cardKey: selected.cardKey } },
          data: { count: { increment: 1 } },
        });
      } else {
        await this.prisma.cardOwnership.create({
          data: { playerId, cardKey: selected.cardKey, count: 1 },
        });
      }
    }

    return {
      cards,
      pityProgress: 0,
      isPityTriggered: false,
    };
  }

  async getShopInventory(playerId: string) {
    const owned = await this.prisma.cardOwnership.findMany({
      where: { playerId },
      orderBy: { obtainedAt: "desc" },
    });

    return {
      totalCards: owned.reduce((sum, o) => sum + o.count, 0),
      uniqueCards: owned.length,
      recentCards: owned.slice(0, 10).map((o) => ({
        cardKey: o.cardKey,
        count: o.count,
        obtainedAt: o.obtainedAt,
      })),
    };
  }

  private getRarityWeight(rarity: Rarity): number {
    const weights: Record<string, number> = {
      COMMON: 50,
      UNCOMMON: 30,
      RARE: 15,
      EPIC: 4,
      LEGENDARY: 1,
    };
    return weights[rarity] ?? 10;
  }
}
