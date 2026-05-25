// apps/api/src/modules/guild/guild.controller.ts

import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GuildService } from "./guild.service";

@Controller("guilds")
@UseGuards(JwtAuthGuard)
export class GuildController {
  constructor(private guild: GuildService) {}

  @Get("leaderboard")
  async getLeaderboard() {
    return this.guild.getGuildLeaderboard();
  }

  @Get("search")
  async search(@Query("q") query: string) {
    return this.guild.searchGuilds(query ?? "");
  }

  @Get("me")
  async getMyGuild(@CurrentUser("id") userId: string) {
    return this.guild.getPlayerGuild(userId);
  }

  @Get(":guildId")
  async getGuild(@Param("guildId") guildId: string) {
    return this.guild.getGuild(guildId);
  }

  @Post("create")
  async create(
    @CurrentUser("id") userId: string,
    @Body() body: { name: string; tag: string },
  ) {
    return this.guild.createGuild(userId, body.name, body.tag);
  }

  @Post("join/:guildId")
  async join(@CurrentUser("id") userId: string, @Param("guildId") guildId: string) {
    return this.guild.joinGuild(userId, guildId);
  }

  @Delete("leave")
  async leave(@CurrentUser("id") userId: string) {
    return this.guild.leaveGuild(userId);
  }
}
