// packages/constants/src/env.data.ts

import type { Environment } from "@sunny-game/types/player.types";

export const ENVIRONMENT_DATA: Record<string, Environment> = {
  NORMAL: {
    key: "NORMAL",
    name: "Bình Thường",
    description: "Thị trường ổn định, mọi thứ diễn ra bình thường.",
    customerMultiplier: 1.0,
    costMultiplier: 1.0,
    isGood: true,
    expiresAtRound: -1,
  },

  PANDEMIC: {
    key: "PANDEMIC",
    name: "Đại Dịch",
    description: "Đại dịch bùng phát, khách hàng e ngại ra ngoài.",
    customerMultiplier: 0.6,
    costMultiplier: 1.13,
    revenueCatMult: {
      CAFE: 0.5,
      CLOTHING: 0.7,
      ELECTRONICS: 0.8,
      AD_AGENCY: 0.6,
    },
    hpDamagePerRound: 10,
    isGood: false,
    expiresAtRound: -1,
  },

  WAR: {
    key: "WAR",
    name: "Chiến Tranh / Khủng Hoảng",
    description: "Xung đột quân sự, kinh tế suy thoái nghiêm trọng.",
    customerMultiplier: 0.75,
    costMultiplier: 1.4,
    revenueCatMult: {
      CAFE: 0.6,
      CLOTHING: 0.3,
      ELECTRONICS: 0.4,
      AD_AGENCY: 0.5,
    },
    hpDamagePerRound: 8,
    isGood: false,
    expiresAtRound: -1,
  },

  LOCUST_SWARM: {
    key: "LOCUST_SWARM",
    name: "Bầy Quạ (Dịch Bệnh Cục Bộ)",
    description: "Dịch bệnh cục bộ ảnh hưởng đến thực phẩm và đồ tiêu dùng.",
    customerMultiplier: 0.8,
    costMultiplier: 1.35,
    revenueCatMult: {
      CAFE: 0.5,
      CLOTHING: 1.0,
      ELECTRONICS: 1.0,
      AD_AGENCY: 0.9,
    },
    hpDamagePerRound: 3,
    isGood: false,
    expiresAtRound: -1,
  },

  RECESSION: {
    key: "RECESSION",
    name: "Suy Thoái Kinh Tế",
    description: "Suy thoái toàn cầu, người tiêu dùng thắt chặt chi tiêu.",
    customerMultiplier: 0.55,
    costMultiplier: 1.5,
    isGood: false,
    expiresAtRound: -1,
  },

  TECH_BOOM: {
    key: "TECH_BOOM",
    name: "Kỷ Nguyên Công Nghệ",
    description: "Công nghệ bùng nổ, nhu cầu điện tử tăng vọt.",
    customerMultiplier: 1.4,
    costMultiplier: 0.9,
    revenueCatMult: {
      ELECTRONICS: 2.0,
      AD_AGENCY: 1.5,
      CAFE: 1.0,
      CLOTHING: 1.0,
    },
    isGood: true,
    expiresAtRound: -1,
  },

  GOVT_AID: {
    key: "GOVT_AID",
    name: "Gói Thúc Đẩy (Trợ Cấp)",
    description: "Chính phủ hỗ trợ doanh nghiệp nhỏ.",
    customerMultiplier: 1.0,
    costMultiplier: 0.75,
    specialEffect: "GIVES_MONEY",
    moneyPerRound: 800,
    isGood: true,
    expiresAtRound: -1,
  },

  HOLIDAY: {
    key: "HOLIDAY",
    name: "Ngày Lễ / Tết",
    description: "Mùa lễ hội, người mua sắm tăng cao!",
    customerMultiplier: 1.5,
    costMultiplier: 1.1,
    revenueCatMult: {
      CAFE: 1.5,
      CLOTHING: 1.5,
      ELECTRONICS: 1.2,
      AD_AGENCY: 1.3,
    },
    isGood: true,
    expiresAtRound: -1,
  },

  TREND_VIRAL: {
    key: "TREND_VIRAL",
    name: "Trend Viral",
    description: "Một sản phẩm của bạn trending trên mạng xã hội!",
    customerMultiplier: 1.3,
    costMultiplier: 1.0,
    revenueCatMult: {
      AD_AGENCY: 2.0,
      CAFE: 1.3,
      CLOTHING: 1.4,
      ELECTRONICS: 1.1,
    },
    isGood: true,
    expiresAtRound: -1,
  },
};

export function getRandomEnvironment(): Environment {
  const rand = Math.random();
  if (rand < 0.6) {
    return ENVIRONMENT_DATA.NORMAL as Environment;
  }

  const badEnvs = [
    ENVIRONMENT_DATA.PANDEMIC,
    ENVIRONMENT_DATA.WAR,
    ENVIRONMENT_DATA.LOCUST_SWARM,
    ENVIRONMENT_DATA.RECESSION,
  ];
  const goodEnvs = [
    ENVIRONMENT_DATA.TECH_BOOM,
    ENVIRONMENT_DATA.GOVT_AID,
    ENVIRONMENT_DATA.HOLIDAY,
    ENVIRONMENT_DATA.TREND_VIRAL,
  ];

  const totalWeight = badEnvs.reduce((s, e) => s + (e!.hpDamagePerRound ?? 5), 0) +
    goodEnvs.length * 10;

  let r = Math.random() * totalWeight;

  for (const env of badEnvs) {
    const w = env!.hpDamagePerRound ?? 5;
    r -= w;
    if (r <= 0) return env as Environment;
  }
  for (const env of goodEnvs) {
    r -= 10;
    if (r <= 0) return env as Environment;
  }

  return ENVIRONMENT_DATA.NORMAL as Environment;
}

export const ENVIRONMENT_COLORS: Record<string, string> = {
  NORMAL: "#6C63FF",
  PANDEMIC: "#FF4757",
  WAR: "#8B0000",
  LOCUST_SWARM: "#A0522D",
  RECESSION: "#555555",
  TECH_BOOM: "#00D4AA",
  GOVT_AID: "#FFD700",
  HOLIDAY: "#FF6B9D",
  TREND_VIRAL: "#9B59B6",
};
