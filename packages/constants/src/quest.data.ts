// packages/constants/src/quest.data.ts

import type { QuestReward } from "@sunny-game/types/economy.types";

export type QuestCategory = "DAILY" | "WEEKLY" | "CHALLENGE";

export interface QuestDefinition {
  id: string;
  key: string;
  title: string;
  description: string;
  category: QuestCategory;
  target: number;
  unit: string;
  reward: QuestReward;
}

export const DAILY_QUESTS: QuestDefinition[] = [
  {
    id: "q_daily_01",
    key: "PLAY_ROUNDS",
    title: "Mở Cửa Hàng",
    description: "Chơi tối thiểu {target} vòng",
    category: "DAILY",
    target: 3,
    unit: "vòng",
    reward: { xp: 50, coins: 100 },
  },
  {
    id: "q_daily_02",
    key: "WIN_GAME",
    title: "Chiến Thắng",
    description: "Thắng 1 ván chơi",
    category: "DAILY",
    target: 1,
    unit: "thắng",
    reward: { xp: 100, coins: 200 },
  },
  {
    id: "q_daily_03",
    key: "EARN_PROFIT",
    title: "Kinh Doanh Có Lời",
    description: "Đạt tổng lợi nhuận {target} coins",
    category: "DAILY",
    target: 5000,
    unit: "coins",
    reward: { xp: 80, coins: 150 },
  },
  {
    id: "q_daily_04",
    key: "USE_CARDS",
    title: "Sử Dụng Thẻ Bài",
    description: "Sử dụng {target} thẻ bài trong một ván",
    category: "DAILY",
    target: 5,
    unit: "thẻ bài",
    reward: { xp: 60, coins: 120 },
  },
  {
    id: "q_daily_05",
    key: "SURVIVE_ROUNDS",
    title: "Sống Sót",
    description: "Sống sót qua {target} vòng chơi",
    category: "DAILY",
    target: 10,
    unit: "vòng",
    reward: { xp: 120, coins: 250 },
  },
  {
    id: "q_daily_06",
    key: "CRIT_HITS",
    title: "Đại Diện May Mắn",
    description: "Có {target} lần CRIT trong một ván",
    category: "DAILY",
    target: 3,
    unit: "crit",
    reward: { xp: 70, coins: 150 },
  },
  {
    id: "q_daily_07",
    key: "STREAK_WINS",
    title: "Chuỗi Thắng",
    description: "Thắng liên tiếp {target} vòng",
    category: "DAILY",
    target: 5,
    unit: "vòng liên tiếp",
    reward: { xp: 150, coins: 300 },
  },
  {
    id: "q_daily_08",
    key: "EARN_XP",
    title: "Tích Lũy Kiến Thức",
    description: "Thu thập {target} XP",
    category: "DAILY",
    target: 300,
    unit: "XP",
    reward: { xp: 30, coins: 80 },
  },
];

export const WEEKLY_QUESTS: QuestDefinition[] = [
  {
    id: "q_weekly_01",
    key: "PLAY_GAMES",
    title: "Người Chơi Chăm Chỉ",
    description: "Hoàn thành {target} ván chơi",
    category: "WEEKLY",
    target: 20,
    unit: "ván",
    reward: { xp: 500, coins: 1000 },
  },
  {
    id: "q_weekly_02",
    key: "TOP_THREE",
    title: "Trong Top 3",
    description: "Về đích top 3 trong {target} ván",
    category: "WEEKLY",
    target: 10,
    unit: "lần",
    reward: { xp: 800, coins: 1500 },
  },
  {
    id: "q_weekly_03",
    key: "WIN_GAMES",
    title: "Ngôi Sao Chiến Thắng",
    description: "Thắng {target} ván chơi",
    category: "WEEKLY",
    target: 7,
    unit: "thắng",
    reward: { xp: 1000, coins: 2000, cardPack: "MEDIUM" },
  },
  {
    id: "q_weekly_04",
    key: "TOTAL_PROFIT",
    title: "Doanh Nhân Tuần",
    description: "Đạt tổng lợi nhuận {target} coins",
    category: "WEEKLY",
    target: 50000,
    unit: "coins",
    reward: { xp: 1200, coins: 2500 },
  },
  {
    id: "q_weekly_05",
    key: "USE_EPIC_CARDS",
    title: "Sưu Tầm Thẻ Hiếm",
    description: "Sử dụng {target} thẻ EPIC trong tuần",
    category: "WEEKLY",
    target: 15,
    unit: "thẻ EPIC",
    reward: { xp: 600, coins: 1200 },
  },
  {
    id: "q_weekly_06",
    key: "NO_DEATH",
    title: "Bất Tử",
    description: "Không thua trong {target} ván liên tiếp",
    category: "WEEKLY",
    target: 5,
    unit: "ván",
    reward: { xp: 1500, coins: 3000, cardPack: "MEDIUM" },
  },
];

export const CHALLENGE_QUESTS: QuestDefinition[] = [
  {
    id: "q_challenge_01",
    key: "WIN_WITH_LOW_HP",
    title: "Kẻ Sống Sót",
    description: "Thắng ván chơi khi HP dưới 20",
    category: "CHALLENGE",
    target: 1,
    unit: "lần",
    reward: { xp: 300, coins: 500, cardPack: "SMALL" },
  },
  {
    id: "q_challenge_02",
    key: "MAX_STREAK",
    title: "Chuỗi Vô Địch",
    description: "Đạt streak {target} vòng liên tiếp",
    category: "CHALLENGE",
    target: 10,
    unit: "streak",
    reward: { xp: 500, coins: 800, cardPack: "MEDIUM" },
  },
  {
    id: "q_challenge_03",
    key: "LEGENDARY_CARD",
    title: "Huyền Thoại Xuất Hiện",
    description: "Sử dụng thẻ LEGENDARY trong trận thắng",
    category: "CHALLENGE",
    target: 1,
    unit: "lần",
    reward: { xp: 400, coins: 600, cardPack: "LARGE" },
  },
  {
    id: "q_challenge_04",
    key: "PANDEMIC_WIN",
    title: "Chống Chọi Đại Dịch",
    description: "Thắng trong điều kiện môi trường Đại Dịch",
    category: "CHALLENGE",
    target: 1,
    unit: "lần",
    reward: { xp: 350, coins: 700 },
  },
  {
    id: "q_challenge_05",
    key: "PERFECT_GAME",
    title: "Trận Đấu Hoàn Hảo",
    description: "Thắng ván mà không bị mất HP lần nào",
    category: "CHALLENGE",
    target: 1,
    unit: "lần",
    reward: { xp: 600, coins: 1000, cardPack: "LARGE" },
  },
  {
    id: "q_challenge_06",
    key: "DEFEAT_ALL",
    title: "Loại Bỏ Đối Thủ",
    description: "Loại {target} đối thủ trong một ván",
    category: "CHALLENGE",
    target: 3,
    unit: "đối thủ",
    reward: { xp: 450, coins: 900, cardPack: "MEDIUM" },
  },
];

export const ALL_QUESTS: QuestDefinition[] = [
  ...DAILY_QUESTS,
  ...WEEKLY_QUESTS,
  ...CHALLENGE_QUESTS,
];

export const QUEST_BY_KEY: Record<string, QuestDefinition> = Object.fromEntries(
  ALL_QUESTS.map((q) => [q.key, q]),
);
