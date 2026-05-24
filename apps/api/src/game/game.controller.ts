// apps/api/src/game/game.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { GameService } from "./game.service";
import { GameGateway } from "./gateways/game.gateway";
import { MatchmakingService } from "./matchmaking.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { StoreType } from "@sunny-game/types/card.types";
import type { RoomStatus } from "@sunny-game/types/player.types";

@ApiTags("game")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("game")
export class GameController {
  constructor(
    private game: GameService,
    private gateway: GameGateway,
    private matchmaking: MatchmakingService,
  ) {}

  @Get("online")
  @ApiOperation({ summary: "Get online player count" })
  getOnlineCount() {
    return { online: this.gateway.getOnlineCount() };
  }

  @Post("matchmaking/join")
  @ApiOperation({ summary: "Join matchmaking queue" })
  joinMatchmaking(
    @CurrentUser("id") userId: string,
    @CurrentUser("playerId") playerId: string,
  ) {
    return this.matchmaking.joinQueue(playerId, userId);
  }

  @Delete("matchmaking/leave")
  @ApiOperation({ summary: "Leave matchmaking queue" })
  leaveMatchmaking(@CurrentUser("playerId") playerId: string) {
    this.matchmaking.leaveQueue(playerId);
    return { ok: true };
  }

  @Get("matchmaking/status")
  @ApiOperation({ summary: "Get matchmaking status" })
  getMatchmakingStatus(@CurrentUser("playerId") playerId: string) {
    return {
      queueSize: this.matchmaking.getQueueSize(),
      position: this.matchmaking.getQueuePosition(playerId),
    };
  }

  @Post("rooms")
  @ApiOperation({ summary: "Create a new game room" })
  createRoom(
    @CurrentUser("id") userId: string,
    @CurrentUser("playerId") playerId: string,
    @Body()
    dto: {
      name?: string;
      maxPlayers?: number;
      roundTimeLimit?: number;
      votingTimeLimit?: number;
      isPrivate?: boolean;
    },
  ) {
    return this.game.createRoom(userId, playerId, dto);
  }

  @Get("rooms")
  @ApiOperation({ summary: "List public waiting rooms" })
  @ApiQuery({ name: "status", required: false, enum: ["WAITING", "VOTING", "RUNNING"] })
  listRooms(
    @Query("status") status = "WAITING",
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.game.listRooms(status as RoomStatus, Number(page), Number(limit));
  }

  @Get("rooms/:roomId")
  @ApiOperation({ summary: "Get room details" })
  getRoom(@Param("roomId") roomId: string) {
    return this.game.getRoom(roomId);
  }

  @Post("rooms/:roomId/join")
  @ApiOperation({ summary: "Join a room" })
  joinRoom(
    @Param("roomId") roomId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("playerId") playerId: string,
    @Body() body: { inviteCode?: string },
  ) {
    return this.game.joinRoom(roomId, userId, playerId, body.inviteCode);
  }

  @Delete("rooms/:roomId/leave")
  @ApiOperation({ summary: "Leave a room" })
  leaveRoom(
    @Param("roomId") roomId: string,
    @CurrentUser("id") userId: string,
    @CurrentUser("playerId") playerId: string,
  ) {
    return this.game.leaveRoom(roomId, userId, playerId);
  }

  @Post("rooms/:roomId/start")
  @ApiOperation({ summary: "Start the game (host only)" })
  startGame(
    @Param("roomId") roomId: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.game.startGame(roomId, userId);
  }

  @Post("rooms/:roomId/vote")
  @ApiOperation({ summary: "Vote for store type" })
  voteStore(
    @Param("roomId") roomId: string,
    @CurrentUser("playerId") playerId: string,
    @Body() body: { storeType: StoreType },
  ) {
    return this.game.voteStore(roomId, playerId, body.storeType);
  }

  @Post("energy/restore")
  @ApiOperation({ summary: "Spend gems to restore energy" })
  restoreEnergy(
    @CurrentUser("playerId") playerId: string,
    @Body() body: { amount?: number },
  ) {
    return this.game.restoreEnergy(playerId, body.amount ?? 50);
  }
}
