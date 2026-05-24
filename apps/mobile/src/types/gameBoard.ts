// apps/mobile/src/types/gameBoard.ts

import type { CardItem } from "@sunny-game/types/card.types";
export type { CardItem };

export interface GameBoardPlayer {
  id: string;
  displayName: string;
  hp: number;
  maxHp: number;
  money: number;
  energy: number;
  maxEnergy: number;
  slots: (string | null)[];
  profession: string;
  isReady: boolean;
  isAlive: boolean;
}
