// apps/api/src/game/bots/bot.service.types.ts

export type BotDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface BotProfile {
  id: string;
  name: string;
  difficulty: BotDifficulty;
  avatarSeed: number;
  mainProfession: string;
  roomId?: string;
  stats: {
    intelligence: number;
    stamina: number;
    speed: number;
    spirit: number;
    agility: number;
    diplomacy: number;
  };
}
