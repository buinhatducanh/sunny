// packages/constants/src/achievement.data.ts

import type { QuestReward } from "@sunny-game/types/economy.types";

export type AchievementCategory = "PLAY" | "ECONOMY" | "SOCIAL" | "COLLECTION" | "SEASON";

export interface AchievementDefinition {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  target: number;
  reward: QuestReward;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Play achievements ─────────────────────────────────────────────────────
  {
    id: "ach_first_game",
    key: "FIRST_GAME",
    title: "Khởi Đầu",
    description: "Chơi ván đầu tiên",
    category: "PLAY",
    target: 1,
    reward: { xp: 50, coins: 100 },
    icon: "🎮",
  },
  {
    id: "ach_10_games",
    key: "REGULAR_PLAYER",
    title: "Người Chơi Thường Xuyên",
    description: "Chơi 10 ván",
    category: "PLAY",
    target: 10,
    reward: { xp: 200, coins: 400 },
    icon: "🎯",
  },
  {
    id: "ach_50_games",
    key: "VETERAN",
    title: "Cựu Chiến Binh",
    description: "Chơi 50 ván",
    category: "PLAY",
    target: 50,
    reward: { xp: 1000, coins: 2000, cardPack: "SMALL" },
    icon: "🏅",
  },
  {
    id: "ach_100_games",
    key: "LEGENDARY_PLAYER",
    title: "Huyền Thoại",
    description: "Chơi 100 ván",
    category: "PLAY",
    target: 100,
    reward: { xp: 3000, coins: 5000, cardPack: "MEDIUM" },
    icon: "⭐",
  },
  {
    id: "ach_500_games",
    key: "DEDICATED",
    title: "Tận Tâm",
    description: "Chơi 500 ván",
    category: "PLAY",
    target: 500,
    reward: { xp: 10000, coins: 20000, cardPack: "LARGE" },
    icon: "👑",
  },

  // ── Economy achievements ───────────────────────────────────────────────────
  {
    id: "ach_first_win",
    key: "FIRST_WIN",
    title: "Chiến Thắng Đầu Tiên",
    description: "Thắng ván đầu tiên",
    category: "ECONOMY",
    target: 1,
    reward: { xp: 150, coins: 300 },
    icon: "🏆",
  },
  {
    id: "ach_10_wins",
    key: "WINNER",
    title: "Người Thắng Cuộc",
    description: "Thắng 10 ván",
    category: "ECONOMY",
    target: 10,
    reward: { xp: 500, coins: 1000 },
    icon: "🏅",
  },
  {
    id: "ach_50_wins",
    key: "CHAMPION",
    title: "Vô Địch",
    description: "Thắng 50 ván",
    category: "ECONOMY",
    target: 50,
    reward: { xp: 2500, coins: 5000, cardPack: "MEDIUM" },
    icon: "🏆",
  },
  {
    id: "ach_100_wins",
    key: "GRANDMASTER",
    title: "Đại Sư",
    description: "Thắng 100 ván",
    category: "ECONOMY",
    target: 100,
    reward: { xp: 8000, coins: 15000, cardPack: "LARGE" },
    icon: "💎",
  },
  {
    id: "ach_first_place",
    key: "FIRST_PLACE",
    title: "Nhất Bảng",
    description: "Về đích đầu tiên trong 1 ván",
    category: "ECONOMY",
    target: 1,
    reward: { xp: 300, coins: 600 },
    icon: "🥇",
  },
  {
    id: "ach_top3_10",
    key: "TOP_PERFORMER",
    title: "Top 3 Thường Xuyên",
    description: "Về top 3 trong 10 ván",
    category: "ECONOMY",
    target: 10,
    reward: { xp: 600, coins: 1200 },
    icon: "🥉",
  },
  {
    id: "ach_streak_5",
    key: "STREAK_5",
    title: "Chuỗi 5",
    description: "Thắng liên tiếp 5 vòng",
    category: "ECONOMY",
    target: 5,
    reward: { xp: 200, coins: 400 },
    icon: "🔥",
  },
  {
    id: "ach_streak_10",
    key: "STREAK_10",
    title: "Chuỗi 10",
    description: "Thắng liên tiếp 10 vòng",
    category: "ECONOMY",
    target: 10,
    reward: { xp: 800, coins: 1600, cardPack: "SMALL" },
    icon: "🔥",
  },
  {
    id: "ach_millionaire",
    key: "MILLIONAIRE",
    title: "Triệu Phú",
    description: "Tích lũy 1,000,000 coins",
    category: "ECONOMY",
    target: 1000000,
    reward: { xp: 5000, coins: 10000, cardPack: "LARGE" },
    icon: "💰",
  },
  {
    id: "ach_max_crit",
    key: "CRIT_MASTER",
    title: "Bậc Thầy Crit",
    description: "Có 10 lần CRIT trong 1 ván",
    category: "ECONOMY",
    target: 10,
    reward: { xp: 400, coins: 800 },
    icon: "⚡",
  },
  {
    id: "ach_survivor",
    key: "SURVIVOR",
    title: "Người Sống Sót",
    description: "Sống sót 50 vòng trong 1 ván",
    category: "ECONOMY",
    target: 50,
    reward: { xp: 1000, coins: 2000, cardPack: "MEDIUM" },
    icon: "🛡️",
  },

  // ── Social achievements ────────────────────────────────────────────────────
  {
    id: "ach_eliminate_10",
    key: "ELIMINATOR",
    title: "Kẻ Loại Bỏ",
    description: "Loại 10 đối thủ",
    category: "SOCIAL",
    target: 10,
    reward: { xp: 500, coins: 1000 },
    icon: "⚔️",
  },
  {
    id: "ach_eliminate_50",
    key: "SLAYER",
    title: "Sát Thủ",
    description: "Loại 50 đối thủ",
    category: "SOCIAL",
    target: 50,
    reward: { xp: 2000, coins: 4000, cardPack: "MEDIUM" },
    icon: "🗡️",
  },
  {
    id: "ach_multi_kill",
    key: "MULTI_KILL",
    title: "Hủy Diệt",
    description: "Loại 3 đối thủ trong 1 vòng",
    category: "SOCIAL",
    target: 1,
    reward: { xp: 300, coins: 600 },
    icon: "💀",
  },

  // ── Collection achievements ────────────────────────────────────────────────
  {
    id: "ach_use_50_cards",
    key: "CARD_COLLECTOR",
    title: "Sưu Tầm Thẻ",
    description: "Sử dụng 50 thẻ bài khác nhau",
    category: "COLLECTION",
    target: 50,
    reward: { xp: 800, coins: 1500, cardPack: "MEDIUM" },
    icon: "🃏",
  },
  {
    id: "ach_all_stores",
    key: "ALL_STORES",
    title: "Đa Ngành",
    description: "Chơi với tất cả 4 loại cửa hàng",
    category: "COLLECTION",
    target: 4,
    reward: { xp: 400, coins: 800 },
    icon: "🏪",
  },
  {
    id: "ach_all_environments",
    key: "ENV_MASTER",
    title: "Thích Nghi",
    description: "Thắng trong tất cả 4 loại môi trường",
    category: "COLLECTION",
    target: 4,
    reward: { xp: 600, coins: 1200 },
    icon: "🌍",
  },
  {
    id: "ach_epic_win",
    key: "EPIC_CARD_WIN",
    title: "Thẻ EPIC Chiến Thắng",
    description: "Thắng ván có sử dụng thẻ EPIC",
    category: "COLLECTION",
    target: 1,
    reward: { xp: 200, coins: 400 },
    icon: "✨",
  },
  {
    id: "ach_legendary_win",
    key: "LEGENDARY_CARD_WIN",
    title: "Thẻ Huyền Thoại",
    description: "Thắng ván có sử dụng thẻ LEGENDARY",
    category: "COLLECTION",
    target: 1,
    reward: { xp: 1000, coins: 2000, cardPack: "LARGE" },
    icon: "🌟",
  },

  // ── Season achievements ────────────────────────────────────────────────────
  {
    id: "ach_season_1",
    key: "SEASON_1_PLAYER",
    title: "Mùa Giải Đầu Tiên",
    description: "Tham gia mùa giải đầu tiên",
    category: "SEASON",
    target: 1,
    reward: { xp: 500, coins: 1000 },
    icon: "🏺",
  },
  {
    id: "ach_season_top10",
    key: "SEASON_TOP_10",
    title: "Top 10 Mùa Giải",
    description: "Về top 10 trong bảng xếp hạng mùa giải",
    category: "SEASON",
    target: 1,
    reward: { xp: 5000, coins: 10000, cardPack: "LARGE" },
    icon: "🏆",
  },
  {
    id: "ach_season_win",
    key: "SEASON_CHAMPION",
    title: "Vô Địch Mùa Giải",
    description: "Về nhất trong bảng xếp hạng mùa giải",
    category: "SEASON",
    target: 1,
    reward: { xp: 20000, coins: 50000, cardPack: "LARGE" },
    icon: "👑",
  },
];

export const ACHIEVEMENT_BY_KEY: Record<string, AchievementDefinition> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.key, a]),
);

export const ACHIEVEMENT_BY_ID: Record<string, AchievementDefinition> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);
