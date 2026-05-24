// packages/constants/src/profession.data.ts

import type { ProfessionType } from "@sunny-game/types/player.types";

export interface ProfessionData {
  key: ProfessionType;
  name: string;
  nameVi: string;
  description: string;
  stats: {
    intelligence: number;
    stamina: number;
    speed: number;
    spirit: number;
    agility: number;
    diplomacy: number;
  };
  revenueMult: number;
  costMult: number;
  critChanceBonus: number;
  critMultBonus: number;
  energyBonus: number;
  specialAbility: string;
  recommendedStore: string;
  weakness: string;
  bestPairing: ProfessionType;
  winRateRank: number;
}

export const PROFESSION_DATA: Record<ProfessionType, ProfessionData> = {
  SOFTWARE_ENGINEERING: {
    key: "SOFTWARE_ENGINEERING",
    name: "Software Engineering",
    nameVi: "Kỹ Sư Phần Mềm",
    description: "Thành thạo automation và AI. Giảm chi phí vận hành, tăng hiệu suất.",
    stats: {
      intelligence: 15,
      stamina: 13,
      speed: 12,
      spirit: 10,
      agility: 10,
      diplomacy: 10,
    },
    revenueMult: 1.1,
    costMult: 1.0,
    critChanceBonus: 5,
    critMultBonus: 0.1,
    energyBonus: 10,
    specialAbility: "Auto Deploy: Giảm 5% chi phí mỗi round.",
    recommendedStore: "CAFE, ELECTRONICS",
    weakness: "Không có lợi thế revenue trực tiếp.",
    bestPairing: "MARKETING",
    winRateRank: 2,
  },

  HARDWARE_ENGINEERING: {
    key: "HARDWARE_ENGINEERING",
    name: "Hardware Engineering",
    nameVi: "Kỹ Sư Phần Cứng",
    description: "Chuyên gia về thiết bị và vật liệu. An toàn và ổn định.",
    stats: {
      intelligence: 13,
      stamina: 15,
      speed: 10,
      spirit: 10,
      agility: 10,
      diplomacy: 12,
    },
    revenueMult: 1.05,
    costMult: 0.95,
    critChanceBonus: 0,
    critMultBonus: 0.05,
    energyBonus: 5,
    specialAbility: "Hardware Expert: Giảm 10% chi phí nguyên liệu.",
    recommendedStore: "CAFE, CLOTHING",
    weakness: "Growth chậm hơn các ngành khác.",
    bestPairing: "SOFTWARE_ENGINEERING",
    winRateRank: 4,
  },

  MARKETING: {
    key: "MARKETING",
    name: "Marketing",
    nameVi: "Marketing",
    description: "Master of brand và viral. Revenue multiplier cao nhất.",
    stats: {
      intelligence: 12,
      stamina: 10,
      speed: 10,
      spirit: 13,
      agility: 10,
      diplomacy: 15,
    },
    revenueMult: 1.15,
    costMult: 1.05,
    critChanceBonus: 10,
    critMultBonus: 0.2,
    energyBonus: 0,
    specialAbility: "Viral Marketing: +15% revenue, +10% crit chance.",
    recommendedStore: "AD_AGENCY, CLOTHING",
    weakness: "Chi phí vận hành cao hơn.",
    bestPairing: "LAWYER",
    winRateRank: 1,
  },

  GRAPHIC_DESIGN: {
    key: "GRAPHIC_DESIGN",
    name: "Graphic Design",
    nameVi: "Thiết Kế Đồ Họa",
    description: "Sáng tạo và thẩm mỹ. Khả năng combo cards cao.",
    stats: {
      intelligence: 12,
      stamina: 10,
      speed: 12,
      spirit: 15,
      agility: 13,
      diplomacy: 8,
    },
    revenueMult: 1.0,
    costMult: 1.0,
    critChanceBonus: 5,
    critMultBonus: 0.15,
    energyBonus: 0,
    specialAbility: "Creative Boost: Cards combo hiệu quả hơn 20%.",
    recommendedStore: "CLOTHING, AD_AGENCY",
    weakness: "Không có lợi thế revenue hoặc cost rõ ràng.",
    bestPairing: "MARKETING",
    winRateRank: 5,
  },

  LAWYER: {
    key: "LAWYER",
    name: "Lawyer",
    nameVi: "Luật Sư",
    description: "Phòng thủ và tuân thủ. Giảm thiểu rủi ro pháp lý và chi phí.",
    stats: {
      intelligence: 13,
      stamina: 10,
      speed: 10,
      spirit: 12,
      agility: 10,
      diplomacy: 15,
    },
    revenueMult: 0.95,
    costMult: 0.9,
    critChanceBonus: 0,
    critMultBonus: 0.0,
    energyBonus: 5,
    specialAbility: "Legal Shield: Miễn 10% sát thương từ environment.",
    recommendedStore: "CAFE, AD_AGENCY",
    weakness: "Revenue multiplier thấp nhất.",
    bestPairing: "MARKETING",
    winRateRank: 6,
  },

  ELECTRICAL_ENGINEER: {
    key: "ELECTRICAL_ENGINEER",
    name: "Electrical Engineering",
    nameVi: "Kỹ Sư Điện",
    description: "Tối ưu năng lượng và thiết bị. Giảm chi phí vận hành mạnh nhất.",
    stats: {
      intelligence: 14,
      stamina: 14,
      speed: 10,
      spirit: 10,
      agility: 10,
      diplomacy: 12,
    },
    revenueMult: 1.0,
    costMult: 0.85,
    critChanceBonus: 0,
    critMultBonus: 0.1,
    energyBonus: 15,
    specialAbility: "Power Save: Giảm 15% chi phí điện/nước.",
    recommendedStore: "ELECTRONICS, CAFE",
    weakness: "Revenue không tăng.",
    bestPairing: "MARKETING",
    winRateRank: 3,
  },
};

export const PROFESSION_COLORS: Record<ProfessionType, string> = {
  SOFTWARE_ENGINEERING: "#3B82F6",
  HARDWARE_ENGINEERING: "#F97316",
  MARKETING: "#EC4899",
  GRAPHIC_DESIGN: "#8B5CF6",
  LAWYER: "#1F2937",
  ELECTRICAL_ENGINEER: "#EAB308",
};

export const PROFESSION_ICONS: Record<ProfessionType, string> = {
  SOFTWARE_ENGINEERING: "💻",
  HARDWARE_ENGINEERING: "🔧",
  MARKETING: "📢",
  GRAPHIC_DESIGN: "🎨",
  LAWYER: "⚖️",
  ELECTRICAL_ENGINEER: "⚡",
};
