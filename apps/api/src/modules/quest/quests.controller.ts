// apps/api/src/modules/quest/quests.controller.ts

import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { QuestsService } from "./quests.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("quests")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("quests")
export class QuestsController {
  constructor(private quests: QuestsService) {}

  @Get("daily")
  @ApiOperation({ summary: "Get daily quests" })
  async getDaily(@CurrentUser("id") userId: string) {
    return this.quests.getDailyQuests(userId);
  }

  @Get("weekly")
  @ApiOperation({ summary: "Get weekly quests" })
  async getWeekly(@CurrentUser("id") userId: string) {
    return this.quests.getWeeklyQuests(userId);
  }

  @Post(":id/claim")
  @ApiOperation({ summary: "Claim quest reward" })
  async claim(
    @CurrentUser("id") userId: string,
    @Param("id") questId: string,
  ) {
    return this.quests.claimQuest(userId, questId);
  }
}
