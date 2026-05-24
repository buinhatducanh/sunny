// packages/types/src/economy.types.ts

export interface RevenueInput {
  baseCustomers: number;
  diplomacyBonus: number;
  cardCustomers: number;
  streakBonus: number;
  envCustomerMod: number;
  avgTicket: number;
  grossRevenue: number;
  critChance: number;
  critDamage: number;
  envMult: number;
  cardRevenueMult: number;
  professionMult: number;
  streakMult: number;
}

export interface RevenueBreakdown {
  totalCustomers: number;
  avgTicket: number;
  grossRevenue: number;
  totalRevenue: number;
  critCount: number;
  breakdown: RevenueInput;
}

export interface CostBreakdown {
  beforeTax: number;
  tax: number;
  totalCost: number;
  breakdown: {
    roundMod: number;
    storeMod: number;
    envMod: number;
    effectiveTax: number;
  };
}

export interface HPUpdate {
  playerId: string;
  previousHP: number;
  newHP: number;
  changeReason: "PROFIT" | "LOSS" | "DAMAGE" | "HEAL" | "ENVIRONMENT" | "CARD";
  details: string;
}

export interface DeathResult {
  isDead: boolean;
  revived?: boolean;
  revivedFromHP?: number;
  revivedToHP?: number;
}

export interface Buff {
  cardId: string;
  type: string;
  value: number;
  ticksRemaining: number;
  sourcePlayerId: string;
}

export interface XPFormula {
  baseXP: number;
  roundBonus: number;
  winBonus: number;
  killBonus: number;
}

export interface DailyQuest {
  id: string;
  questType: string;
  progress: number;
  target: number;
  reward: QuestReward;
  completed: boolean;
  expiresAt: Date;
}

export interface QuestReward {
  xp?: number;
  coins?: number;
  gems?: number;
  cardPack?: "SMALL" | "MEDIUM" | "LARGE";
}

export interface BattlePassEntry {
  seasonId: string;
  tier: number;
  xp: number;
  purchased: boolean;
  claimedTiers: number[];
}

export interface Achievement {
  id: string;
  achievementType: string;
  unlockedAt: Date;
  progress: number;
}

export interface Season {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  battlePassTiers: number;
  theme: string;
}

export interface IAPProduct {
  id: string;
  type: "CARD_PACK" | "BATTLE_PASS" | "ENERGY_REFILL" | "REMOVE_ADS" | "CURRENCY_BUNDLE";
  priceVND: number;
  priceUSD: number;
  displayName: string;
  description: string;
  contents: Record<string, number>;
}
