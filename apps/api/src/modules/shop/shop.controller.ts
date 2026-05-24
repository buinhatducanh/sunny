// apps/api/src/modules/shop/shop.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ShopService } from "./shop.service";

@Controller("shop")
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private shop: ShopService) {}

  @Get("packs")
  async getPacks() {
    return this.shop.getPacks();
  }

  @Post("buy/:packId")
  async buyPack(
    @CurrentUser("playerId") playerId: string,
    @Param("packId") packId: string,
  ) {
    return this.shop.buyPack(playerId, packId);
  }

  @Get("inventory")
  async getInventory(@CurrentUser("playerId") playerId: string) {
    return this.shop.getShopInventory(playerId);
  }
}
