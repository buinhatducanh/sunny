// apps/api/src/modules/guild/guild.module.ts

import { Module } from "@nestjs/common";
import { GuildController } from "./guild.controller";
import { GuildService } from "./guild.service";

@Module({
  controllers: [GuildController],
  providers: [GuildService],
  exports: [GuildService],
})
export class GuildModule {}
