// packages/constants/src/game.constants.ts

import type { ProfessionType } from "@sunny-game/types/player.types";

export const GAME_CONSTANTS = {
  // Player starting stats
  STARTING_HP: 100,
  STARTING_MONEY: 5000,
  STARTING_ENERGY: 100,
  STARTING_MAX_ENERGY: 100,
  MAX_HP: 100,

  // Game flow
  MAX_ROUNDS: 20,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 5,
  DEFAULT_ROOM_MAX_PLAYERS: 5,

  // Timing (in seconds)
  DEFAULT_ROUND_TIME_LIMIT: 60,
  DEFAULT_VOTING_TIME_LIMIT: 30,
  RESOLUTION_TIME: 3,
  CLEANUP_TIME: 2,
  ROOM_IDLE_TIMEOUT: 300, // 5 minutes

  // Hand & deck
  HAND_SIZE: 5,
  DECK_SIZE: 40,
  DISCARD_PILE_SIZE: 0,

  // Energy
  ENERGY_RESTORE_PERCENT: 50,
  ENERGY_MIN_THRESHOLD: 0,
  ENERGY_MAX_THRESHOLD: 100,

  // HP
  HP_GAIN_PER_PROFIT: 50,
  HP_GAIN_CAP: 20,
  REVIVAL_HP: 30,
  DEATH_ROUND_LIMIT: 2,

  // Economy
  BASE_CUSTOMERS: 50,
  BASE_AVG_TICKET: 100,
  AVG_TICKET_ROUND_GROWTH: 15,
  BASE_OPERATING_COST: 500,
  COST_GROWTH_RATE: 0.1,
  BASE_TAX_RATE: 0.05,
  TAX_GROWTH_PER_ROUND: 0.005,

  // Streak
  STREAK_CUSTOMER_BONUS: 5,
  STREAK_REVENUE_MULTIPLIER: 0.05,
  STREAK_MAX_MULTIPLIER: 1.5,

  // Crit
  BASE_CRIT_CHANCE: 10,
  BASE_CRIT_MULTIPLIER: 2.0,

  // XP
  XP_BASE_PER_ROUND: 10,
  XP_WIN_BONUS: 200,
  XP_FIRST_GAME: 100,

  // Leveling
  XP_PER_LEVEL: 500,
  XP_GROWTH_PER_LEVEL: 0.5,
  MAX_LEVEL: 100,

  // Economy multipliers by store
  STORE_COST_MULT: {
    CAFE: 1.3,
    CLOTHING: 1.0,
    ELECTRONICS: 1.2,
    AD_AGENCY: 0.8,
  },

  // Revenue multipliers by profession
  PROFESSION_REVENUE_MULT: {
    SOFTWARE_ENGINEERING: 1.1,
    HARDWARE_ENGINEERING: 1.05,
    MARKETING: 1.15,
    GRAPHIC_DESIGN: 1.0,
    LAWYER: 0.95,
    ELECTRICAL_ENGINEER: 1.0,
  } as Record<ProfessionType, number>,

  // Cost multipliers by profession
  PROFESSION_COST_MULT: {
    SOFTWARE_ENGINEERING: 1.0,
    HARDWARE_ENGINEERING: 0.95,
    MARKETING: 1.05,
    GRAPHIC_DESIGN: 1.0,
    LAWYER: 0.9,
    ELECTRICAL_ENGINEER: 0.85,
  } as Record<ProfessionType, number>,

  // Profession stat bonuses
  PROFESSION_STAT_BONUS: {
    SOFTWARE_ENGINEERING: { intelligence: 5, stamina: 3 },
    HARDWARE_ENGINEERING: { intelligence: 3, stamina: 5 },
    MARKETING: { diplomacy: 5, spirit: 3 },
    GRAPHIC_DESIGN: { agility: 5, spirit: 3 },
    LAWYER: { diplomacy: 5, intelligence: 3 },
    ELECTRICAL_ENGINEER: { intelligence: 4, stamina: 4 },
  } as Record<ProfessionType, Record<string, number>>,

  // Environment
  ENV_TRIGGER_CHANCE: 0.3,
  ENV_BAD_CHANCE: 0.25,
  ENV_GOOD_CHANCE: 0.15,

  // Buff durations
  DURATION_TICKS: {
    SHORT: 6,
    LONG: 12,
    PERMANENT: -1,
  },

  // Socket
  SOCKET_RECONNECT_WINDOW: 30,
  SOCKET_PING_INTERVAL: 25000,
  SOCKET_PING_TIMEOUT: 5000,

  // Validation
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 8,
  ROOM_NAME_MAX: 30,

  // Daily quests
  DAILY_QUEST_COUNT: 3,
  DAILY_QUEST_RESET_HOUR: 0,

  // Battle pass
  BATTLE_PASS_TIERS: 50,
  BATTLE_PASS_DURATION_WEEKS: 8,
  BATTLE_PASS_XP_PER_TIER: 100,
} as const;

export type GameConstants = typeof GAME_CONSTANTS;
