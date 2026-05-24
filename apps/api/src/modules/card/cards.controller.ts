// apps/api/src/modules/card/cards.controller.ts

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { CardsService } from "./cards.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("cards")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("cards")
export class CardsController {
  constructor(private cards: CardsService) {}

  @Get()
  @ApiOperation({ summary: "Get player's card collection" })
  async getCollection(@CurrentUser("playerId") playerId: string) {
    return this.cards.getPlayerCollection(playerId);
  }

  @Get(":cardKey")
  @ApiOperation({ summary: "Get card details by key" })
  async getCard(@Param("cardKey") cardKey: string) {
    return this.cards.getCardByKey(cardKey);
  }
}
