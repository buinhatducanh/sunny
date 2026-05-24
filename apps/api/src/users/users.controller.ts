// apps/api/src/users/users.controller.ts

import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  getMe(@CurrentUser("id") userId: string) {
    return this.users.getMe(userId);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current user profile" })
  updateMe(
    @CurrentUser("id") userId: string,
    @Body() dto: { displayName?: string; avatarUrl?: string; mainProfession?: string; secondaryProfession?: string },
  ) {
    return this.users.updateMe(userId, dto);
  }

  @Get("me/stats")
  @ApiOperation({ summary: "Get player stats" })
  getStats(@CurrentUser("id") userId: string) {
    return this.users.getStats(userId);
  }
}
