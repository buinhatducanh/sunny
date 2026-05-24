// apps/api/src/app.module.ts

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { GameModule } from "./game/game.module";
import { CardsModule } from "./modules/card/cards.module";
import { QuestsModule } from "./modules/quest/quests.module";
import { AchievementsModule } from "./modules/achievement/achievements.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { BattlePassModule } from "./modules/battlepass/battlepass.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { SeasonModule } from "./modules/season/season.module";
import { FriendsModule } from "./modules/friends/friends.module";
import { GuildModule } from "./modules/guild/guild.module";
import { ShopModule } from "./modules/shop/shop.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    GameModule,
    CardsModule,
    QuestsModule,
    AchievementsModule,
    LeaderboardModule,
    BattlePassModule,
    AnalyticsModule,
    SeasonModule,
    FriendsModule,
    GuildModule,
    ShopModule,
    HealthModule,
  ],
})
export class AppModule {}
