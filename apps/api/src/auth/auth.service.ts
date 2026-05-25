// apps/api/src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { QuestsService } from "../modules/quest/quests.service";
import type { RegisterDto, LoginDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private quests: QuestsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException("Email or username already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash,
        player: {
          create: {
            displayName: dto.username,
          },
        },
      },
      include: { player: true },
    });

    // Generate daily and weekly quests for the new player
    if (user.player) {
      await this.quests.getDailyQuests(user.id);
      await this.quests.getWeeklyQuests(user.id);
    }

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { player: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get("JWT_SECRET") + "-refresh",
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { player: true },
      });

      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user.id);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async logout(userId: string) {
    return { success: true };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get("JWT_SECRET"),
      expiresIn: this.config.get("JWT_EXPIRES_IN", "7d"),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get("JWT_SECRET") + "-refresh",
      expiresIn: this.config.get("REFRESH_TOKEN_EXPIRES_IN", "30d"),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: {
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
      mainProfession: string;
      secondaryProfession: string;
      totalGames: number;
      totalWins: number;
      highestRound: number;
      coins: number;
      gems: number;
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
            title: user.player.title,
            mainProfession: user.player.mainProfession,
            secondaryProfession: user.player.secondaryProfession,
            totalGames: user.player.totalGames,
            totalWins: user.player.totalWins,
            highestRound: user.player.highestRound,
            coins: user.player.coins,
            gems: user.player.gems,
            energy: (user.player as any).energy ?? 100,
            maxEnergy: (user.player as any).maxEnergy ?? 100,
          }
        : null,
    };
  }
}
