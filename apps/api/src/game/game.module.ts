// apps/api/src/game/game.module.ts

import { Module, forwardRef } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { GameGateway } from "./gateways/game.gateway";
import { GameEngine } from "./game.engine";
import { MatchmakingService } from "./matchmaking.service";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { AchievementsModule } from "../modules/achievement/achievements.module";
import { BattlePassModule } from "../modules/battlepass/battlepass.module";
import { SeasonModule } from "../modules/season/season.module";

@Module({
  imports: [UsersModule, AuthModule, AchievementsModule, BattlePassModule, SeasonModule],
  controllers: [GameController],
  providers: [
    // GameGateway must come before GameEngine to resolve circular dependency
    GameGateway,
    GameService,
    GameEngine,
    MatchmakingService,
  ],
  exports: [GameService, GameEngine, MatchmakingService],
})
export class GameModule {}
