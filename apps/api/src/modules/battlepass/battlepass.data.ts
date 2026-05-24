// apps/api/src/modules/battlepass/battlepass.data.ts

import type { QuestReward } from "@sunny-game/types/economy.types";

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  reward: QuestReward;
  isPremium: boolean;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  tiers: BattlePassTier[];
}

function tierReward(
  xp: number,
  coins: number,
  premium = false,
): BattlePassTier["reward"] {
  return { xp, coins };
}

function createTier(
  tier: number,
  xpRequired: number,
  coins: number,
  premium = false,
): BattlePassTier {
  return {
    tier,
    xpRequired,
    reward: premium ? { coins } : { coins },
    isPremium: premium,
  };
}

// Season 1: "Khởi Đầu Rực Rỡ"
export const CURRENT_SEASON: BattlePassSeason = {
  id: "season_01",
  name: "Khởi Đầu Rực Rỡ",
  startDate: new Date("2026-01-01"),
  endDate: new Date("2026-12-31"),
  tiers: [
    // Free tiers
    createTier(1, 0, 100),
    createTier(2, 100, 150),
    createTier(3, 200, 200),
    createTier(4, 350, 250),
    createTier(5, 500, 300, false),
    createTier(6, 700, 350),
    createTier(7, 900, 400),
    createTier(8, 1150, 450),
    createTier(9, 1400, 500),
    createTier(10, 1700, 600, false),
    createTier(11, 2000, 650),
    createTier(12, 2350, 700),
    createTier(13, 2700, 750),
    createTier(14, 3100, 800),
    createTier(15, 3500, 900, false),
    createTier(16, 3950, 950),
    createTier(17, 4400, 1000),
    createTier(18, 4900, 1100),
    createTier(19, 5400, 1200),
    createTier(20, 5950, 1300, false),
    createTier(21, 6500, 1400),
    createTier(22, 7100, 1500),
    createTier(23, 7750, 1600),
    createTier(24, 8400, 1700),
    createTier(25, 9100, 1800, false),
    createTier(26, 9850, 1900),
    createTier(27, 10600, 2000),
    createTier(28, 11400, 2200),
    createTier(29, 12200, 2400),
    createTier(30, 13100, 2600, false),
    createTier(31, 14000, 2800),
    createTier(32, 15000, 3000),
    createTier(33, 16000, 3200),
    createTier(34, 17100, 3400),
    createTier(35, 18200, 3600, false),
    createTier(36, 19400, 3800),
    createTier(37, 20600, 4000),
    createTier(38, 21900, 4200),
    createTier(39, 23200, 4400),
    createTier(40, 24600, 4600, false),
    createTier(41, 26000, 4800),
    createTier(42, 27500, 5000),
    createTier(43, 29000, 5200),
    createTier(44, 30600, 5400),
    createTier(45, 32200, 5600, false),
    createTier(46, 33900, 5800),
    createTier(47, 35600, 6000),
    createTier(48, 37400, 6200),
    createTier(49, 39200, 6400),
    createTier(50, 41100, 10000, false),
  ],
};

export function getCurrentSeason(): BattlePassSeason {
  const now = new Date();
  if (now < CURRENT_SEASON.endDate) return CURRENT_SEASON;
  return CURRENT_SEASON;
}
