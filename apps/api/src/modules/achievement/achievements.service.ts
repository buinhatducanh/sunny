// apps/api/src/modules/achievement/achievements.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { QuestReward } from "@sunny-game/types/economy.types";
import type { AchievementCategory } from "@sunny-game/constants/achievement.data";
import {
  ACHIEVEMENTS,
} from "@sunny-game/constants/achievement.data";

export interface PlayerAchievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  progress: number;
  target: number;
  completed: boolean;
  unlockedAt: Date | null;
  reward: QuestReward;
}

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getPlayerAchievements(userId: string): Promise<PlayerAchievement[]> {
    const unlocked = await this.prisma.achievement.findMany({
      where: { userId },
    });

    const unlockedMap = new Map<string, Date>();
    for (const a of unlocked) {
      unlockedMap.set(a.achievementType, a.unlockedAt);
    }

    const stats = await this.getPlayerStats(userId);

    return ACHIEVEMENTS.map((def) => {
      const progress = this.getAchievementProgress(def.key, stats);
      return {
        id: def.id,
        key: def.key,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category as string,
        progress: Math.min(progress, def.target),
        target: def.target,
        completed: unlockedMap.has(def.key),
        unlockedAt: unlockedMap.get(def.key) ?? null,
        reward: def.reward as QuestReward,
      };
    });
  }

  async checkAndUnlockAchievements(userId: string) {
    const stats = await this.getPlayerStats(userId);
    const unlocked = await this.prisma.achievement.findMany({
      where: { userId },
    });
    const unlockedKeys = new Set(unlocked.map((a) => a.achievementType));

    for (const def of ACHIEVEMENTS) {
      if (unlockedKeys.has(def.key)) continue;

      const progress = this.getAchievementProgress(def.key, stats);
      if (progress >= def.target) {
        await this.prisma.achievement.create({
          data: { userId, playerId: stats.playerId, achievementType: def.key },
        });
        // Credit rewards
        if (stats.playerId) {
          const reward = def.reward;
          const player = await this.prisma.player.findFirst({ where: { id: stats.playerId } });
          if (player) {
            await this.prisma.player.update({
              where: { id: stats.playerId },
              data: {
                xp: player.xp + (reward.xp ?? 0),
                coins: player.coins + (reward.coins ?? 0),
                gems: player.gems + (reward.gems ?? 0),
              },
            });
          }
        }
      }
    }
  }

  private async getPlayerStats(userId: string): Promise<{
    playerId: string;
    gamesPlayed: number;
    gamesWon: number;
    totalCoins: number;
    totalKills: number;
    streakWins: number;
    critHits: number;
    roundsSurvived: number;
    cardsUsed: Set<string>;
    storeTypesPlayed: Set<string>;
    environmentsWon: Set<string>;
  }> {
    const player = await this.prisma.player.findFirst({ where: { userId } });
    if (!player) {
      return {
        playerId: "",
        gamesPlayed: 0,
        gamesWon: 0,
        totalCoins: 0,
        totalKills: 0,
        streakWins: 0,
        critHits: 0,
        roundsSurvived: 0,
        cardsUsed: new Set(),
        storeTypesPlayed: new Set(),
        environmentsWon: new Set(),
      };
    }

    const [rooms, rounds, playerStates] = await Promise.all([
      this.prisma.gameRoom.findMany({
        where: {
          players: { some: { playerId: player.id } },
          status: "FINISHED",
        },
        select: { id: true, winnerId: true },
      }),
      this.prisma.roundHistory.groupBy({
        by: ["playerId"],
        where: { playerId: player.id },
        _count: true,
      }),
      this.prisma.playerState.findMany({
        where: { playerId: player.id },
        select: { money: true, consecutiveRoundsCannotPay: true },
      }),
    ]);

    const gamesWon = rooms.filter((r) => r.winnerId === player.id).length;
    const totalCoins = playerStates.reduce((sum, s) => sum + s.money, 0);

    return {
      playerId: player.id,
      gamesPlayed: rooms.length,
      gamesWon,
      totalCoins,
      totalKills: 0,
      streakWins: 0,
      critHits: 0,
      roundsSurvived: rounds.reduce((sum, r) => sum + r._count, 0),
      cardsUsed: new Set(),
      storeTypesPlayed: new Set(),
      environmentsWon: new Set(),
    };
  }

  private getAchievementProgress(key: string, stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalCoins: number;
    totalKills: number;
    streakWins: number;
    critHits: number;
    roundsSurvived: number;
  }): number {
    switch (key) {
      case "FIRST_GAME":
      case "REGULAR_PLAYER":
      case "VETERAN":
      case "LEGENDARY_PLAYER":
      case "DEDICATED":
        return stats.gamesPlayed;
      case "FIRST_WIN":
      case "WINNER":
      case "CHAMPION":
      case "GRANDMASTER":
        return stats.gamesWon;
      case "MILLIONAIRE":
        return stats.totalCoins;
      case "ELIMINATOR":
      case "SLAYER":
        return stats.totalKills;
      case "STREAK_5":
      case "STREAK_10":
        return stats.streakWins;
      case "CRIT_MASTER":
        return stats.critHits;
      case "SURVIVOR":
        return stats.roundsSurvived;
      default:
        return 0;
    }
  }
}
