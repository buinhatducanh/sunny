// packages/types/src/player.types.ts

import type { StoreType } from "./card.types.js";

export type ProfessionType =
  | "SOFTWARE_ENGINEERING"
  | "HARDWARE_ENGINEERING"
  | "MARKETING"
  | "GRAPHIC_DESIGN"
  | "LAWYER"
  | "ELECTRICAL_ENGINEER";

export interface PlayerStats {
  intelligence: number;
  stamina: number;
  speed: number;
  spirit: number;
  agility: number;
  diplomacy: number;
}

export interface Player {
  id: string;
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  stats: PlayerStats;
  mainProfession: ProfessionType;
  secondaryProfession: ProfessionType;
  cardBackSkin: string;
  cardFrame: string;
  title: string;
  totalGames: number;
  totalWins: number;
  totalRevenue: number;
  highestRound: number;
  createdAt: Date;
}

export interface PlayerState {
  id: string;
  roomId: string;
  playerId: string;
  orderIndex: number;
  hp: number;
  money: number;
  energy: number;
  maxEnergy: number;
  isReady: boolean;
  isConnected: boolean;
  hand: string[];
  handCount: number;
  lockedCardId?: string;
  slots: Array<string | null>;
  effects: PlayerEffect[];
  consecutiveRoundsCannotPay: number;
  lastActionAt: Date;
}

export interface PlayerEffect {
  cardId: string;
  type: string;
  value: number;
  ticksRemaining: number;
  sourcePlayerId: string;
}

export interface StreakData {
  consecutiveProfit: number;
  lastRoundProfit: number;
}

export interface PlayerSummary {
  playerId: string;
  displayName: string;
  avatarUrl?: string;
  profession: ProfessionType;
  level: number;
  hp: number;
  isReady: boolean;
  handCount: number;
  slotCards: Array<string | null>;
}

export interface RoomConfig {
  roundTimeLimit: number;
  votingTimeLimit: number;
  maxPlayers: number;
  storeTypes?: StoreType[];
  isPrivate: boolean;
}

export interface GameRoom {
  id: string;
  hostId: string;
  inviteCode: string;
  name: string;
  status: RoomStatus;
  storeType?: StoreType;
  maxPlayers: number;
  currentRound: number;
  maxRounds: number;
  config: RoomConfig;
  winnerId?: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  players: PlayerSummary[];
}

export type RoomStatus = "WAITING" | "VOTING" | "RUNNING" | "FINISHED" | "ABANDONED";

export interface GameState {
  roomId: string;
  round: number;
  phase: RoundPhase;
  environment?: Environment;
  turnOrder: string[];
  startTime: Date;
  endTime?: Date;
}

export type RoundPhase =
  | "ROUND_START"
  | "VOTING_PHASE"
  | "DRAW_PHASE"
  | "ACTION_PHASE"
  | "RESOLUTION_PHASE"
  | "CLEANUP_PHASE";

export interface Environment {
  key: string;
  name: string;
  description: string;
  customerMultiplier: number;
  costMultiplier: number;
  revenueCatMult?: Record<StoreType, number>;
  hpDamagePerRound?: number;
  specialEffect?: string;
  moneyPerRound?: number;
  isGood: boolean;
  expiresAtRound: number;
}

export interface RoundResult {
  round: number;
  playerResults: PlayerRoundResult[];
  environment?: Environment;
  totalRevenue: number;
}

export interface PlayerRoundResult {
  playerId: string;
  revenue: number;
  costs: number;
  profit: number;
  hpChange: number;
  hp: number;
  money: number;
  customers: number;
  avgTicket: number;
  critsLanded: number;
  isDead: boolean;
  revived: boolean;
  cardsPlayed: string[];
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  avatarUrl?: string;
  value: number;
  type: "survival" | "wins" | "guild";
  period: "weekly" | "monthly" | "all";
}
