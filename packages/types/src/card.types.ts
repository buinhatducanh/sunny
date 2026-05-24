// packages/types/src/card.types.ts

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export type Duration = "INSTANT" | "SHORT" | "LONG" | "PERMANENT";

export type SlotType = "REVENUE" | "COST" | "BUFF" | "DEFENSE" | "SPECIAL";

export type StoreType = "CAFE" | "CLOTHING" | "ELECTRONICS" | "AD_AGENCY";

export type Phase = "EARLY" | "MID" | "LATE";

export type EffectTarget =
  | "SELF"
  | "ALL_ALLIES"
  | "ALL_ENEMIES"
  | "RANDOM_ENEMY"
  | "HIGHEST_HP"
  | "LOWEST_HP"
  | "ROOM";

export type EffectType =
  // Revenue effects
  | "INSTANT_REVENUE"
  | "REVENUE_MULTIPLIER"
  | "CUSTOMER_BOOST"
  | "AVG_TICKET_BOOST"
  | "CRIT_REVENUE"
  | "STREAK_REVENUE"
  // Cost effects
  | "COST_REDUCTION"
  | "OPERATING_COST_MULT"
  | "FREEZE_COST"
  | "DEFER_COST"
  // Defensive effects
  | "HP_HEAL"
  | "HP_SHIELD"
  | "HP_MULT"
  | "REVIVAL"
  | "IMMUNITY"
  // Risk/Attack effects
  | "INSTANT_DAMAGE"
  | "STEAL_REVENUE"
  | "MARKET_STUNT"
  | "DEBUFF_INFLICT"
  // Utility effects
  | "ENERGY_GAIN"
  | "DRAW_CARD"
  | "LOCK_CARD_FREE"
  | "SWAP_CARD_FREE"
  | "RESHUFFLE"
  | "LOOK_DISCARD"
  // Environment effects
  | "ENV_RESISTANCE"
  | "ENV_BOOST"
  | "CANCEL_ENV"
  | "FORCE_GOOD_ENV"
  // Economy effects
  | "TAX_REFUND"
  | "INSURANCE_PAYOUT"
  | "LOAN"
  | "INVESTMENT";

export type EffectCondition =
  | { type: "ROUND_ODD" }
  | { type: "ROUND_EVEN" }
  | { type: "HP_BELOW"; value: number }
  | { type: "HP_ABOVE"; value: number }
  | { type: "MONEY_BELOW"; value: number }
  | { type: "ENVIRONMENT"; env: string }
  | { type: "FIRST_ROUND" }
  | { type: "LAST_STAND" }
  | { type: "STREAK"; count: number };

export type EffectScaling = {
  roundMultiplier: number;
  cap?: number;
};

export interface CardEffect {
  type: EffectType;
  value: number;
  target: EffectTarget;
  condition?: EffectCondition;
  durationTicks?: number;
  scaling?: EffectScaling;
}

export interface Card {
  id: string;
  cardKey: string;
  name: string;
  description: string;
  rarity: Rarity;
  storeTypes: StoreType[];
  professionKey?: string;

  energyCost: number;
  moneyCost: number;
  waterCost: number;
  powerCost: number;

  primaryEffect: CardEffect;
  secondaryEffect?: CardEffect;

  duration: Duration;
  slotType: SlotType;
  phase: Phase;

  imageKey: string;
  color: string;
  iconEmoji: string;

  isPlayable: boolean;
  minRound: number;
  maxRound: number;
}

export interface CardInstance {
  instanceId: string;
  card: Card;
  isLocked: boolean;
  isPlayed: boolean;
  isNew: boolean;
  obtainedAt: Date;
}

export interface OwnedCard {
  cardKey: string;
  count: number;
  card: Card;
}

export interface PackResult {
  cards: Card[];
  pityProgress: number;
  isPityTriggered: boolean;
}

export interface CardPlayAction {
  cardInstanceId: string;
  slotIndex: number;
  targetPlayerId?: string;
}

export interface CardResolutionResult {
  success: boolean;
  error?: string;
  results?: Array<{
    playerId: string;
    effectType: EffectType;
    value: number;
    isCrit: boolean;
    hpChange: number;
    moneyChange: number;
  }>;
  isCrit?: boolean;
  costsPaid?: { energy: number; money: number };
  logs?: string[];
}

export interface CardItem {
  id: string;
  cardKey: string;
  name: string;
  description: string;
  rarity: Rarity;
  storeTypes: StoreType[];
  energyCost: number;
  moneyCost: number;
  phase: Phase;
  slotType: SlotType;
  duration: Duration;
  primaryEffect: CardEffect;
  secondaryEffect?: CardEffect;
  professionKey?: string;
  emoji?: string;
  rarityColor?: string;
  slotIndex?: number;
}
