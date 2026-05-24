// apps/api/src/modules/leaderboard/leaderboard.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  totalXP: number;
  winRate: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const players = await this.prisma.player.findMany({
      where: { totalGames: { gt: 0 } },
      select: {
        id: true,
        displayName: true,
        level: true,
        xp: true,
        totalGames: true,
        totalWins: true,
      },
      orderBy: { totalWins: "desc" },
      take: limit,
    });

    return players.map((p, i) => ({
      rank: i + 1,
      playerId: p.id,
      displayName: p.displayName,
      level: p.level,
      gamesPlayed: p.totalGames,
      gamesWon: p.totalWins,
      totalXP: p.xp,
      winRate: p.totalGames > 0 ? Math.round((p.totalWins / p.totalGames) * 100) : 0,
    }));
  }

  async getPlayerRank(playerId: string): Promise<number> {
    const players = await this.prisma.player.findMany({
      where: { totalGames: { gt: 0 } },
      orderBy: { totalWins: "desc" },
      select: { id: true },
    });
    const idx = players.findIndex((p) => p.id === playerId);
    return idx >= 0 ? idx + 1 : -1;
  }
}
