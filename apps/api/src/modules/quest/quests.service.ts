// apps/api/src/modules/quest/quests.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  CHALLENGE_QUESTS,
  QUEST_BY_KEY,
} from "@sunny-game/constants/quest.data";

function getEndOfDay(): Date {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

function getEndOfWeek(): Date {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff + 6);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  async getDailyQuests(userId: string) {
    const player = await this.prisma.player.findFirst({ where: { userId } });
    const playerId = player?.id ?? "";

    const quests = await this.prisma.dailyQuest.findMany({
      where: { userId, questType: { in: DAILY_QUESTS.map((q) => q.key) } },
    });

    const existingKeys = new Set(quests.map((q) => q.questType));
    const missing = DAILY_QUESTS.filter((q) => !existingKeys.has(q.key));

    // Spawn missing daily quests
    if (missing.length > 0 && playerId) {
      await this.prisma.dailyQuest.createMany({
        data: missing.map((q) => ({
          userId,
          playerId,
          questType: q.key,
          target: q.target,
          progress: 0,
          completed: false,
          reward: q.reward as Prisma.InputJsonValue,
          expiresAt: getEndOfDay(),
        })),
      });
    }

    const allQuests = await this.prisma.dailyQuest.findMany({
      where: { userId, questType: { in: DAILY_QUESTS.map((q) => q.key) } },
    });

    return allQuests.map((q) => {
      const def = QUEST_BY_KEY[q.questType];
      return {
        id: q.id,
        key: q.questType,
        title: def?.title ?? q.questType,
        description: def?.description ?? "",
        progress: q.progress,
        target: q.target,
        completed: q.completed,
        reward: q.reward,
        expiresAt: q.expiresAt,
      };
    });
  }

  async claimQuest(userId: string, questId: string) {
    const quest = await this.prisma.dailyQuest.findFirst({
      where: { id: questId, userId },
    });

    if (!quest) throw new NotFoundException("Quest not found");
    if (quest.completed) throw new NotFoundException("Already claimed");
    if (quest.progress < quest.target)
      throw new NotFoundException("Quest not completed");

    const reward = quest.reward as Prisma.InputJsonValue as { xp?: number; coins?: number; cardPack?: string };
    const player = await this.prisma.player.findFirst({
      where: { userId },
    });

    if (!player) throw new NotFoundException("Player not found");

    // Apply rewards
    const xpInc = reward.xp ?? 0;
    const coinsInc = reward.coins ?? 0;

    if (xpInc > 0 || coinsInc > 0) {
      await this.prisma.player.update({
        where: { id: player.id },
        data: {
          ...(xpInc > 0 ? { xp: { increment: xpInc } } : {}),
          ...(coinsInc > 0 ? { coins: { increment: coinsInc } } : {}),
        },
      });
    }

    // Mark as completed
    await this.prisma.dailyQuest.update({
      where: { id: questId },
      data: { completed: true },
    });

    return { claimed: true, reward, questId };
  }

  async incrementProgress(
    userId: string,
    questKey: string,
    amount = 1,
  ) {
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

  async getWeeklyQuests(userId: string) {
    const player = await this.prisma.player.findFirst({ where: { userId } });
    const playerId = player?.id ?? "";

    const quests = await this.prisma.dailyQuest.findMany({
      where: { userId, questType: { in: WEEKLY_QUESTS.map((q) => q.key) } },
    });

    const existingKeys = new Set(quests.map((q) => q.questType));
    const missing = WEEKLY_QUESTS.filter((q) => !existingKeys.has(q.key));

    if (missing.length > 0 && playerId) {
      await this.prisma.dailyQuest.createMany({
        data: missing.map((q) => ({
          userId,
          playerId,
          questType: q.key,
          target: q.target,
          progress: 0,
          completed: false,
          reward: q.reward as Prisma.InputJsonValue,
          expiresAt: getEndOfWeek(),
        })),
      });
    }

    const allQuests = await this.prisma.dailyQuest.findMany({
      where: { userId, questType: { in: WEEKLY_QUESTS.map((q) => q.key) } },
    });

    return allQuests.map((q) => {
      const def = QUEST_BY_KEY[q.questType];
      return {
        id: q.id,
        key: q.questType,
        title: def?.title ?? q.questType,
        description: def?.description ?? "",
        progress: q.progress,
        target: q.target,
        completed: q.completed,
        reward: q.reward,
        expiresAt: q.expiresAt,
      };
    });
  }
}
