// apps/api/src/modules/analytics/analytics.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { Prisma } from "@prisma/client";

interface TrackEventInput {
  userId?: string;
  playerId?: string;
  eventName: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(input: TrackEventInput) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId: input.userId,
        playerId: input.playerId,
        eventName: input.eventName,
        eventData: (input.eventData ?? {}) as Prisma.InputJsonValue,
        sessionId: input.sessionId,
      },
    });
  }

  async trackGameStart(userId: string, playerId: string, roomId: string, sessionId: string) {
    return this.trackEvent({
      userId,
      playerId,
      eventName: "game_start",
      eventData: { roomId },
      sessionId,
    });
  }

  async trackGameEnd(userId: string, playerId: string, sessionId: string, result: string, score: number, rounds: number, place: number) {
    return this.trackEvent({
      userId,
      playerId,
      eventName: "game_end",
      eventData: { result, score, rounds, place },
      sessionId,
    });
  }

  async trackCardPlayed(userId: string, playerId: string, sessionId: string, cardKey: string, slot: number) {
    return this.trackEvent({
      userId,
      playerId,
      eventName: "card_played",
      eventData: { cardKey, slot },
      sessionId,
    });
  }

  async trackVote(userId: string, playerId: string, sessionId: string, storeType: string) {
    return this.trackEvent({
      userId,
      playerId,
      eventName: "store_vote",
      eventData: { storeType },
      sessionId,
    });
  }

  async trackBattlePassPurchase(userId: string) {
    return this.trackEvent({
      userId,
      eventName: "battlepass_purchase",
    });
  }

  async trackSessionStart(userId: string, playerId: string): Promise<string> {
    const session = await this.prisma.gameSession.create({
      data: { userId, playerId, roomId: "" },
    });
    return session.id;
  }

  async trackSessionEnd(
    sessionId: string,
    roomId: string,
    result: string,
    finalScore: number,
    roundsPlayed: number,
    place: number,
  ) {
    const session = await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        roomId,
        endedAt: new Date(),
        duration: 0,
        result,
        finalScore,
        roundsPlayed,
        place,
      },
    });

    const start = session.startedAt.getTime();
    const end = session.endedAt?.getTime() ?? Date.now();
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { duration: Math.floor((end - start) / 1000) },
    });

    return session;
  }

  async updateDailyStats(userId: string, delta: {
    gamesPlayed?: number;
    gamesWon?: number;
    xpEarned?: number;
    coinsSpent?: number;
    timePlayed?: number;
  }) {
    const today = new Date().toISOString().split("T")[0]!;

    const existing = await this.prisma.dailyStats.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    if (existing) {
      return this.prisma.dailyStats.update({
        where: { id: existing.id },
        data: {
          gamesPlayed: { increment: delta.gamesPlayed ?? 0 },
          gamesWon: { increment: delta.gamesWon ?? 0 },
          xpEarned: { increment: delta.xpEarned ?? 0 },
          coinsSpent: { increment: delta.coinsSpent ?? 0 },
          timePlayed: { increment: delta.timePlayed ?? 0 },
        },
      });
    }

    return this.prisma.dailyStats.create({
      data: {
        userId,
        date: today,
        gamesPlayed: delta.gamesPlayed ?? 0,
        gamesWon: delta.gamesWon ?? 0,
        xpEarned: delta.xpEarned ?? 0,
        coinsSpent: delta.coinsSpent ?? 0,
        timePlayed: delta.timePlayed ?? 0,
      },
    });
  }

  async getPlayerStats(userId: string) {
    const [daily, sessions, events] = await Promise.all([
      this.prisma.dailyStats.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      this.prisma.gameSession.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 50 }),
      this.prisma.analyticsEvent.groupBy({
        by: ["eventName"],
        where: { userId },
        _count: { eventName: true },
      }),
    ]);

    const totalGames = sessions.length;
    const totalWins = sessions.filter((s) => s.result === "WIN").length;
    const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      dailyActivity: daily,
      recentSessions: sessions.map((s) => ({
        id: s.id,
        result: s.result,
        score: s.finalScore,
        rounds: s.roundsPlayed,
        place: s.place,
        duration: s.duration,
        playedAt: s.startedAt,
      })),
      eventCounts: events.reduce((acc, e) => {
        acc[e.eventName] = e._count.eventName;
        return acc;
      }, {} as Record<string, number>),
      summary: {
        totalGames,
        totalWins,
        winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
        totalTimePlayed: totalTime,
      },
    };
  }
}
