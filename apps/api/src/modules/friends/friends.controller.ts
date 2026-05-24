// apps/api/src/modules/friends/friends.controller.ts

import { Controller, Get, Post, Delete, Param, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { FriendsService } from "./friends.service";

@Controller("friends")
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friends: FriendsService) {}

  @Get()
  async getFriends(@CurrentUser("userId") userId: string) {
    return this.friends.getFriends(userId);
  }

  @Get("requests/incoming")
  async getIncoming(@CurrentUser("userId") userId: string) {
    return this.friends.getIncomingRequests(userId);
  }

  @Get("requests/outgoing")
  async getOutgoing(@CurrentUser("userId") userId: string) {
    return this.friends.getOutgoingRequests(userId);
  }

  @Post("request/:userId")
  async sendRequest(
    @CurrentUser("userId") userId: string,
    @Param("userId") targetId: string,
  ) {
    return this.friends.sendFriendRequest(userId, targetId);
  }

  @Post("accept/:requestId")
  async accept(@CurrentUser("userId") userId: string, @Param("requestId") requestId: string) {
    return this.friends.acceptFriendRequest(requestId, userId);
  }

  @Post("reject/:requestId")
  async reject(@CurrentUser("userId") userId: string, @Param("requestId") requestId: string) {
    return this.friends.rejectFriendRequest(requestId, userId);
  }

  @Delete(":friendId")
  async remove(@CurrentUser("userId") userId: string, @Param("friendId") friendId: string) {
    return this.friends.removeFriend(userId, friendId);
  }

  @Get("search")
  async search(@CurrentUser("userId") userId: string, @Query("q") query: string) {
    if (!query || query.trim().length < 2) return [];
    return this.friends.searchPlayers(query.trim(), userId);
  }
}
