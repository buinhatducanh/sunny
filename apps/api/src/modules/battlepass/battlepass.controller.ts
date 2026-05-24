// apps/api/src/modules/battlepass/battlepass.controller.ts

import { Controller, Get, Post, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { BattlePassService } from "./battlepass.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("battlepass")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("battlepass")
export class BattlePassController {
  constructor(private battlepass: BattlePassService) {}

  @Get()
  @ApiOperation({ summary: "Get player's battle pass status" })
  async getBattlePass(@CurrentUser("userId") userId: string) {
    return this.battlepass.getPlayerBattlePass(userId);
  }

  @Post("claim/:tier")
  @ApiOperation({ summary: "Claim a battle pass tier reward" })
  async claimTier(
    @CurrentUser("userId") userId: string,
    @Param("tier") tier: string,
  ) {
    return this.battlepass.claimTier(userId, parseInt(tier, 10));
  }

  @Post("purchase")
  @ApiOperation({ summary: "Purchase battle pass (IAP stub)" })
  async purchase(@CurrentUser("userId") userId: string) {
    return this.battlepass.purchaseBattlePass(userId);
  }
}
