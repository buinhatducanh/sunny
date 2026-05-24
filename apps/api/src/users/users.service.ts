// apps/api/src/users/users.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ProfessionType } from "@sunny-game/types/player.types";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        player: {
          include: {
            cardOwnership: true,
            dailyQuests: { where: { completed: false } },
            battlePass: true,
            achievements: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");
    return this.sanitizeProfile(user);
  }

  async updateMe(userId: string, dto: { displayName?: string; avatarUrl?: string; mainProfession?: string; secondaryProfession?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { player: true },
    });

    if (!user || !user.player) throw new NotFoundException();

    const player = await this.prisma.player.update({
      where: { id: user.player.id },
      data: {
        displayName: dto.displayName ?? user.player.displayName,
        ...(dto.avatarUrl ? { avatarUrl: dto.avatarUrl } : {}),
        mainProfession: (dto.mainProfession ?? user.player.mainProfession) as ProfessionType,
        secondaryProfession: (dto.secondaryProfession ?? user.player.secondaryProfession) as ProfessionType,
      },
      include: { cardOwnership: true },
    });

    return player;
  }

  async getStats(userId: string) {
    const player = await this.prisma.player.findFirst({
      where: { userId },
    });

    if (!player) throw new NotFoundException();

    return {
      totalGames: player.totalGames,
      wins: player.totalWins,
      winRate:
        player.totalGames > 0
          ? Math.round((player.totalWins / player.totalGames) * 100)
          : 0,
      highestRound: player.highestRound,
      totalRevenue: player.totalRevenue,
      level: player.level,
      xp: player.xp,
    };
  }

  private sanitizeProfile(user: {
    id: string;
    email: string;
    username: string;
    avatarUrl: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
    player: {
      id: string;
      displayName: string;
      level: number;
      xp: number;
      intelligence: number;
      stamina: number;
      speed: number;
      spirit: number;
      agility: number;
      diplomacy: number;
      mainProfession: string;
      secondaryProfession: string;
      totalGames: number;
      totalWins: number;
      totalRevenue: number;
      highestRound: number;
      coins: number;
      gems: number;
      cardBackSkin: string;
      cardFrame: string;
      title: string;
    } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      player: user.player
        ? {
            id: user.player.id,
            displayName: user.player.displayName,
            level: user.player.level,
            xp: user.player.xp,
            stats: {
              intelligence: user.player.intelligence,
              stamina: user.player.stamina,
              speed: user.player.speed,
              spirit: user.player.spirit,
              agility: user.player.agility,
              diplomacy: user.player.diplomacy,
            },
            mainProfession: user.player.mainProfession,
            secondaryProfession: user.player.secondaryProfession,
            totalGames: user.player.totalGames,
            totalWins: user.player.totalWins,
            totalRevenue: user.player.totalRevenue,
            highestRound: user.player.highestRound,
            coins: user.player.coins,
            gems: user.player.gems,
            cardBackSkin: user.player.cardBackSkin,
            cardFrame: user.player.cardFrame,
            title: user.player.title,
          }
        : null,
    };
  }
}
