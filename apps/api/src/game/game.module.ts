// apps/api/src/game/game.module.ts

import { Module, forwardRef } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { GameGateway } from "./gateways/game.gateway";
import { GameEngine } from "./game.engine";
import { MatchmakingService } from "./matchmaking.service";
import { BotService } from "./bots/bot.service";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { AchievementsModule } from "../modules/achievement/achievements.module";
import { BattlePassModule } from "../modules/battlepass/battlepass.module";
import { SeasonModule } from "../modules/season/season.module";

@Module({
  imports: [UsersModule, AuthModule, AchievementsModule, BattlePassModule, SeasonModule],
  controllers: [GameController],
  providers: [
    GameGateway,
    GameService,
    GameEngine,
    MatchmakingService,
    BotService,
  ],
  exports: [GameService, GameEngine, MatchmakingService, BotService],
})
export class GameModule {}
