// apps/api/src/modules/battlepass/battlepass.module.ts

import { Module } from "@nestjs/common";
import { BattlePassController } from "./battlepass.controller";
import { BattlePassService } from "./battlepass.service";

@Module({
  controllers: [BattlePassController],
  providers: [BattlePassService],
  exports: [BattlePassService],
})
export class BattlePassModule {}
