// apps/api/src/modules/season/season.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  async getActiveSeason() {
    return this.prisma.season.findFirst({ where: { isActive: true } });
  }

  async createSeason(name: string, seasonNumber: number, startDate: Date, endDate?: Date) {
    // Deactivate all existing seasons
    await this.prisma.season.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return this.prisma.season.create({
      data: {
        name,
        seasonNumber,
        startDate,
        endDate,
        isActive: true,
      },
    });
  }

  async getOrCreateCurrentSeason(): Promise<{ id: string; seasonNumber: number }> {
    const active = await this.getActiveSeason();
    if (active) {
      return { id: active.id, seasonNumber: active.seasonNumber };
    }

    const now = new Date();
    const season = await this.createSeason(
      "Khởi Đầu Rực Rỡ",
      1,
      now,
      new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
    );
    return { id: season.id, seasonNumber: season.seasonNumber };
  }

  async endSeason(seasonId: string) {
    const season = await this.prisma.season.update({
      where: { id: seasonId },
      data: { isActive: false, endDate: new Date() },
    });

    // Archive player stats for the season
    const entries = await this.prisma.battlePassEntry.findMany({
      where: { seasonId },
      include: { player: true },
      orderBy: { xp: "desc" },
      take: 100,
    });

    // Store season leaderboard snapshot
    const topPlayers = entries.map((e, i) => ({
      rank: i + 1,
      playerId: e.playerId,
      displayName: e.player?.displayName ?? "Unknown",
      xp: e.xp,
      tier: e.tier,
    }));

    await this.prisma.seasonSnapshot.create({
      data: { seasonId, topPlayers },
    });

    return season;
  }

  async getSeasonProgress(seasonId: string) {
    const [season, totalPlayers, topBP] = await Promise.all([
      this.prisma.season.findUnique({ where: { id: seasonId } }),
      this.prisma.battlePassEntry.count({ where: { seasonId } }),
      this.prisma.battlePassEntry.findFirst({
        where: { seasonId },
        orderBy: { xp: "desc" },
        include: { player: true },
      }),
    ]);

    return {
      season,
      totalParticipants: totalPlayers,
      topPlayer: topBP && topBP.player
        ? {
            displayName: topBP.player!.displayName,
            tier: topBP.tier,
            xp: topBP.xp,
          }
        : null,
    };
  }
}
