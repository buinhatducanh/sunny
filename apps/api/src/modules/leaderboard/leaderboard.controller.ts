// apps/api/src/modules/leaderboard/leaderboard.controller.ts

import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { LeaderboardService } from "./leaderboard.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("leaderboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private leaderboard: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: "Get weekly leaderboard" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getLeaderboard(@Query("limit") limit = 50) {
    return this.leaderboard.getWeeklyLeaderboard(Number(limit));
  }

  @Get("rank")
  @ApiOperation({ summary: "Get player's current rank" })
  async getPlayerRank(@CurrentUser("playerId") playerId: string) {
    const rank = await this.leaderboard.getPlayerRank(playerId);
    return { rank };
  }
}
