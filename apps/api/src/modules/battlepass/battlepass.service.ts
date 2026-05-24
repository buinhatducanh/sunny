// apps/api/src/modules/battlepass/battlepass.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { getCurrentSeason, CURRENT_SEASON } from "./battlepass.data";
import type { Season } from "@prisma/client";

export interface BattlePassTierStatus {
  tier: number;
  xpRequired: number;
  reward: { coins?: number; xp?: number; cardPack?: string };
  isPremium: boolean;
  unlocked: boolean;
  claimed: boolean;
}

export interface PlayerBattlePass {
  seasonId: string;
  seasonName: string;
  xp: number;
  tier: number;
  purchased: boolean;
  totalTiers: number;
  tiers: BattlePassTierStatus[];
}

@Injectable()
export class BattlePassService {
  constructor(private prisma: PrismaService) {}

  private async getSeason(): Promise<Season> {
    const dbSeason = await this.prisma.season.findFirst({ where: { isActive: true } });
    if (dbSeason) return dbSeason;

    // Seed Season 1 from battlepass data
    return this.prisma.season.upsert({
      where: { id: CURRENT_SEASON.id },
      create: {
        id: CURRENT_SEASON.id,
        name: CURRENT_SEASON.name,
        seasonNumber: 1,
        startDate: new Date(),
        isActive: true,
        totalTiers: CURRENT_SEASON.tiers.length,
      },
      update: {},
    });
  }

  async getPlayerBattlePass(userId: string): Promise<PlayerBattlePass> {
    const seasonData = getCurrentSeason();
    const season = await this.getSeason();

    let entry = await this.prisma.battlePassEntry.findUnique({
      where: { userId },
    });

    if (!entry || entry.seasonId !== season.id) {
      entry = await this.prisma.battlePassEntry.upsert({
        where: { userId },
        create: {
          userId,
          playerId: (
            await this.prisma.player.findFirst({ where: { userId }, select: { id: true } })
          )?.id ?? "",
          seasonId: season.id,
          xp: 0,
          tier: 1,
          purchased: false,
          claimedTiers: [],
        },
        update: {
          seasonId: season.id,
          xp: 0,
          tier: 1,
          claimedTiers: [],
        },
      });
    }

    const currentTier = this.getTierForXP(entry.xp, seasonData);
    const tiers: BattlePassTierStatus[] = seasonData.tiers.map((t) => ({
      tier: t.tier,
      xpRequired: t.xpRequired,
      reward: t.reward,
      isPremium: t.isPremium,
      unlocked: entry.xp >= t.xpRequired,
      claimed: (entry.claimedTiers as number[]).includes(t.tier),
    }));

    return {
      seasonId: season.id,
      seasonName: season.name,
      xp: entry.xp,
      tier: currentTier,
      purchased: entry.purchased,
      totalTiers: seasonData.tiers.length,
      tiers,
    };
  }

  async addXP(userId: string, xpGain: number): Promise<{
    xpAdded: number;
    newTier: number;
    leveledUp: boolean;
  }> {
    const seasonData = getCurrentSeason();
    const season = await this.getSeason();

    const entry = await this.prisma.battlePassEntry.findUnique({
      where: { userId },
    });
    if (!entry) return { xpAdded: 0, newTier: 1, leveledUp: false };

    // Migrate to new season if needed
    if (entry.seasonId !== season.id) {
      await this.prisma.battlePassEntry.update({
        where: { userId },
        data: { seasonId: season.id, xp: 0, tier: 1, claimedTiers: [] },
      });
      return { xpAdded: 0, newTier: 1, leveledUp: false };
    }

    const oldTier = this.getTierForXP(entry.xp, seasonData);
    const newXp = entry.xp + xpGain;
    const newTier = this.getTierForXP(newXp, seasonData);
    const leveledUp = newTier > oldTier;

    await this.prisma.battlePassEntry.update({
      where: { userId },
      data: { xp: newXp, tier: newTier },
    });

    return { xpAdded: xpGain, newTier, leveledUp };
  }

  async claimTier(
    userId: string,
    tier: number,
  ): Promise<{ claimed: boolean; reward: { coins?: number } }> {
    const seasonData = getCurrentSeason();
    const tierDef = seasonData.tiers[tier - 1];
    if (!tierDef) throw new Error("Invalid tier");

    const entry = await this.prisma.battlePassEntry.findUnique({
      where: { userId },
    });
    if (!entry) throw new Error("No battle pass entry");

    if (entry.xp < tierDef.xpRequired) {
      throw new Error("Tier not unlocked");
    }

    if ((entry.claimedTiers as number[]).includes(tier)) {
      throw new Error("Tier already claimed");
    }

    // Premium tiers require purchase
    if (tierDef.isPremium && !entry.purchased) {
      throw new Error("Premium tier — battle pass not purchased");
    }

    await this.prisma.battlePassEntry.update({
      where: { userId },
      data: {
        claimedTiers: { push: tier },
      },
    });

    // Apply coins reward
    const player = await this.prisma.player.findFirst({ where: { userId } });
    if (player && tierDef.reward.coins) {
      await this.prisma.player.update({
        where: { id: player.id },
        data: { coins: { increment: tierDef.reward.coins } },
      });
    }

    return { claimed: true, reward: tierDef.reward };
  }

  async purchaseBattlePass(userId: string): Promise<{ success: boolean }> {
    await this.prisma.battlePassEntry.update({
      where: { userId },
      data: { purchased: true },
    });
    return { success: true };
  }

  private getTierForXP(xp: number, season = getCurrentSeason()): number {
    for (let i = season.tiers.length - 1; i >= 0; i--) {
      if (xp >= season.tiers[i]!.xpRequired) {
        return i + 1;
      }
    }
    return 1;
  }
}
