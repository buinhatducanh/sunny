// apps/api/src/modules/guild/guild.service.ts

import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GuildService {
  constructor(private prisma: PrismaService) {}

  async createGuild(userId: string, name: string, tag: string) {
    const player = await this.prisma.player.findFirst({ where: { userId } });
    if (!player) throw new NotFoundException("Player not found");

    // Check if already in a guild
    const existing = await this.prisma.guildMember.findFirst({ where: { userId } });
    if (existing) throw new BadRequestException("Already in a guild");

    // Check name/tag uniqueness
    const nameTaken = await this.prisma.guild.findFirst({
      where: { OR: [{ name }, { tag }] },
    });
    if (nameTaken) throw new BadRequestException("Tên hoặc tag guild đã tồn tại");

    const guild = await this.prisma.guild.create({
      data: {
        name,
        tag: tag.toUpperCase(),
        members: {
          create: {
            playerId: player.id,
            userId,
            role: "LEADER",
          },
        },
      },
      include: { members: { include: { player: true } } },
    });

    return this.formatGuild(guild);
  }

  async getGuild(guildId: string) {
    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: { members: { include: { player: true } } },
    });
    if (!guild) throw new NotFoundException("Guild not found");
    return this.formatGuild(guild);
  }

  async searchGuilds(query: string) {
    const guilds = await this.prisma.guild.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tag: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { _count: { select: { members: true } } },
      take: 20,
    });

    return guilds.map((g) => ({
      id: g.id,
      name: g.name,
      tag: g.tag,
      level: g.level,
      memberCount: g._count.members,
    }));
  }

  async joinGuild(userId: string, guildId: string) {
    const player = await this.prisma.player.findFirst({ where: { userId } });
    if (!player) throw new NotFoundException("Player not found");

    const existing = await this.prisma.guildMember.findFirst({ where: { userId } });
    if (existing) throw new BadRequestException("Already in a guild");

    const guild = await this.prisma.guild.findUnique({
      where: { id: guildId },
      include: { _count: { select: { members: true } } },
    });
    if (!guild) throw new NotFoundException("Guild not found");
    if (guild._count.members >= 50) throw new BadRequestException("Guild đã đầy");

    await this.prisma.guildMember.create({
      data: { guildId, playerId: player.id, userId, role: "MEMBER" },
    });

    return { ok: true, guildId };
  }

  async leaveGuild(userId: string) {
    const member = await this.prisma.guildMember.findFirst({ where: { userId } });
    if (!member) throw new NotFoundException("Không có trong guild");

    if (member.role === "LEADER") {
      const count = await this.prisma.guildMember.count({ where: { guildId: member.guildId } });
      if (count > 1) {
        throw new BadRequestException("Leader không thể rời guild. Chuyển quyền trước.");
      }
      // Last member — delete guild
      await this.prisma.guild.delete({ where: { id: member.guildId } });
    } else {
      await this.prisma.guildMember.delete({ where: { id: member.id } });
    }

    return { ok: true };
  }

  async getPlayerGuild(userId: string) {
    const member = await this.prisma.guildMember.findFirst({
      where: { userId },
      include: { guild: { include: { members: { include: { player: true } } } } },
    });
    if (!member) return null;
    return this.formatGuild(member.guild as Parameters<typeof this.formatGuild>[0]);
  }

  async addXP(guildId: string, xpAmount: number) {
    const guild = await this.prisma.guild.update({
      where: { id: guildId },
      data: { totalXP: { increment: xpAmount } },
    });

    // Level up: every 1000 XP
    const newLevel = Math.floor(guild.totalXP / 1000) + 1;
    if (newLevel !== guild.level) {
      await this.prisma.guild.update({
        where: { id: guildId },
        data: { level: newLevel },
      });
    }

    return { level: newLevel, totalXP: guild.totalXP };
  }

  async getGuildLeaderboard() {
    const guilds = await this.prisma.guild.findMany({
      orderBy: { totalXP: "desc" },
      take: 50,
      include: { _count: { select: { members: true } } },
    });

    return guilds.map((g, i) => ({
      rank: i + 1,
      id: g.id,
      name: g.name,
      tag: g.tag,
      level: g.level,
      totalXP: g.totalXP,
      memberCount: g._count.members,
    }));
  }

  private formatGuild(guild: {
    id: string;
    name: string;
    tag: string;
    level: number;
    totalXP: number;
    createdAt: Date;
    members: Array<{
      id: string;
      role: string;
      joinedAt: Date;
      player: { displayName: string; level: number } | null;
    }>;
  }) {
    return {
      id: guild.id,
      name: guild.name,
      tag: guild.tag,
      level: guild.level,
      totalXP: guild.totalXP,
      memberCount: guild.members.length,
      createdAt: guild.createdAt,
      members: guild.members.map((m) => ({
        memberId: m.id,
        displayName: m.player?.displayName ?? "Unknown",
        level: m.player?.level ?? 1,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };
  }
}
