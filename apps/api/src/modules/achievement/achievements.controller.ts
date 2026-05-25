// apps/api/src/modules/achievement/achievements.controller.ts

import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { AchievementsService } from "./achievements.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("achievements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("achievements")
export class AchievementsController {
  constructor(private achievements: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: "Get player's achievements with progress" })
  async getAchievements(@CurrentUser("id") userId: string) {
    return this.achievements.getPlayerAchievements(userId);
  }
}
