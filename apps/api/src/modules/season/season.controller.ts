// apps/api/src/modules/season/season.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SeasonService } from "./season.service";

@Controller("season")
@UseGuards(JwtAuthGuard)
export class SeasonController {
  constructor(private season: SeasonService) {}

  @Get("current")
  async getCurrentSeason() {
    return this.season.getOrCreateCurrentSeason();
  }

  @Get("progress/:seasonId")
  async getSeasonProgress(@Param("seasonId") seasonId: string) {
    return this.season.getSeasonProgress(seasonId);
  }

  @Post("create")
  async createSeason(
    @Body() body: { name: string; seasonNumber: number; durationDays: number },
  ) {
    const now = new Date();
    const endDate = new Date(now.getTime() + body.durationDays * 24 * 60 * 60 * 1000);
    return this.season.createSeason(body.name, body.seasonNumber, now, endDate);
  }
}
