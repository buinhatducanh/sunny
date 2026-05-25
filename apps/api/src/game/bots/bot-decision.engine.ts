// apps/api/src/game/bots/bot-decision.engine.ts
// Decision engine for AI bot card placement and store voting

import type { Card } from "@sunny-game/types/card.types";
import type { CardItem, StoreType } from "@sunny-game/types/card.types";
import type { BotProfile } from "./bot.service.types";

export class BotDecisionEngine {
  /**
   * Choose the best store type based on hand composition.
   */
  static chooseStoreType(hand: CardItem[], bot: BotProfile): StoreType {
    const storeScores: Record<StoreType, number> = {
      CAFE: 0,
      CLOTHING: 0,
      ELECTRONICS: 0,
      AD_AGENCY: 0,
    };

    for (const card of hand) {
      for (const storeType of card.storeTypes ?? []) {
        if (
          storeType === "CAFE" ||
          storeType === "CLOTHING" ||
          storeType === "ELECTRONICS" ||
          storeType === "AD_AGENCY"
        ) {
          storeScores[storeType] += this.scoreCardPower(card);
        }
      }
    }

    // Profession synergy bonus
    const profBonus = getProfStoreBonus(bot.mainProfession);
    for (const [store, bonus] of Object.entries(profBonus)) {
      storeScores[store as StoreType] += bonus;
    }

    // Pick highest scoring store
    let best: StoreType = "CAFE";
    let bestScore = -Infinity;
    for (const [store, score] of Object.entries(storeScores)) {
      if (score > bestScore) {
        bestScore = score;
        best = store as StoreType;
      }
    }

    return best;
  }

  /**
   * Plan card placement for a round.
   * Returns array of { instanceId, slotIndex } placements.
   */
  static planCardPlacement(
    hand: Array<{ card: CardItem; instanceId: string; cardDef?: Card }>,
    currentSlots: (string | null)[],
    round: number,
    bot: BotProfile,
  ): Array<{ cardInstanceId: string; slotIndex: number }> {
    const placements: Array<{ cardInstanceId: string; slotIndex: number }> = [];

    // Find empty slot indices
    const emptySlots = currentSlots
      .map((s, i) => (s === null ? i : -1))
      .filter((i) => i !== -1);

    if (emptySlots.length === 0 || hand.length === 0) return placements;

    // Score and sort cards by power
    const scored = hand
      .map(({ card, instanceId }) => ({
        card,
        instanceId,
        score: this.scoreCardPower(card),
      }))
      .sort((a, b) => b.score - a.score);

    // Greedy: assign best cards to best matching empty slots
    for (const { card, instanceId } of scored) {
      if (emptySlots.length === 0) break;

      const bestSlot = this.findBestSlot(card, emptySlots, round, bot);
      if (bestSlot !== -1) {
        placements.push({ cardInstanceId: instanceId, slotIndex: bestSlot });
        const idx = emptySlots.indexOf(bestSlot);
        if (idx !== -1) emptySlots.splice(idx, 1);
      }
    }

    return placements;
  }

  // ─── Scoring ────────────────────────────────────────────────────────────────

  private static scoreCardPower(card: CardItem): number {
    let score = 0;
    const primary = card.primaryEffect;
    const secondary = card.secondaryEffect;

    if (!primary) return 0;

    switch (primary.type) {
      case "INSTANT_REVENUE":
        score += (primary.value ?? 0) * 0.08;
        break;
      case "CUSTOMER_BOOST":
        score += (primary.value ?? 0) * 2;
        break;
      case "AVG_TICKET_BOOST":
        score += (primary.value ?? 0) * 3;
        break;
      case "REVENUE_MULTIPLIER":
        score += (primary.value ?? 0) * 5;
        break;
      case "COST_REDUCTION":
      case "OPERATING_COST_MULT":
        score += (primary.value ?? 0) * 2;
        break;
      case "HP_HEAL":
      case "HP_SHIELD":
        score += (primary.value ?? 0) * 1.5;
        break;
      case "ENV_RESISTANCE":
        score += (primary.value ?? 0) * 10;
        break;
      case "INSTANT_DAMAGE":
        score -= (primary.value ?? 0) * 0.1;
        break;
      case "CRIT_REVENUE":
        score += (primary.value ?? 0) * 2;
        break;
      case "ENERGY_GAIN":
        score += (primary.value ?? 0) * 0.5;
        break;
      case "LOAN":
        score += 5;
        break;
      default:
        score += (primary.value ?? 0) * 0.5;
    }

    if (secondary) {
      switch (secondary.type) {
        case "INSTANT_REVENUE":
          score += (secondary.value ?? 0) * 0.08;
          break;
        case "CUSTOMER_BOOST":
          score += (secondary.value ?? 0) * 2;
          break;
        case "AVG_TICKET_BOOST":
          score += (secondary.value ?? 0) * 3;
          break;
        case "HP_SHIELD":
        case "HP_HEAL":
          score += (secondary.value ?? 0) * 1.5;
          break;
      }
    }

    // Penalties
    score -= (card.energyCost ?? 0) * 2;
    score -= (card.moneyCost ?? 0) * 0.01;

    return score;
  }

  private static scoreSlotMatch(
    card: CardItem,
    round: number,
    bot: BotProfile,
  ): number {
    const slotType = card.slotType ?? "REVENUE";
    let score = 0;

    // Phase-based priorities
    if (round <= 5) {
      if (slotType === "REVENUE") score += 20;
      if (slotType === "BUFF") score += 10;
      if (card.primaryEffect?.type === "CUSTOMER_BOOST") score += 15;
      if (card.primaryEffect?.type === "AVG_TICKET_BOOST") score += 15;
    } else if (round >= 6 && round <= 12) {
      if (slotType === "REVENUE") score += 15;
      if (slotType === "DEFENSE") score += 10;
      if (slotType === "COST") score += 10;
    } else {
      if (slotType === "REVENUE") score += 25;
      if (card.primaryEffect?.type === "REVENUE_MULTIPLIER") score += 20;
      if (card.primaryEffect?.type === "INSTANT_REVENUE") score += 15;
    }

    // Defensive cards always have base value
    if (slotType === "DEFENSE") score += 5;
    if (slotType === "SPECIAL") score += 8;

    // Profession synergy
    score += getProfCardBonus(bot.mainProfession, card);

    return score;
  }

  private static findBestSlot(
    card: CardItem,
    emptySlots: number[],
    round: number,
    bot: BotProfile,
  ): number {
    if (emptySlots.length === 0) return -1;

    const slotScores = emptySlots.map((slotIdx) => ({
      slotIdx,
      score:
        (card.slotType === getPreferredSlotType(slotIdx, round) ? 50 : 0) +
        this.scoreSlotMatch(card, round, bot),
    }));

    slotScores.sort((a, b) => b.score - a.score);
    return slotScores[0]?.slotIdx ?? -1;
  }
}

// Slot index to preferred type: 0=REVENUE, 1=COST, 2=BUFF, 3=DEFENSE, 4=SPECIAL
function getPreferredSlotType(slotIdx: number, _round: number): string {
  const PREFERRED = ["REVENUE", "COST", "BUFF", "DEFENSE", "SPECIAL"];
  return PREFERRED[slotIdx] ?? "REVENUE";
}

function getProfStoreBonus(profession: string): Record<string, number> {
  switch (profession) {
    case "SOFTWARE_ENGINEERING":
      return { ELECTRONICS: 15, CAFE: 5 };
    case "MARKETING":
      return { AD_AGENCY: 20, CAFE: 5, CLOTHING: 5 };
    case "GRAPHIC_DESIGN":
      return { AD_AGENCY: 15, CLOTHING: 15 };
    case "HARDWARE_ENGINEERING":
      return { ELECTRONICS: 20, AD_AGENCY: 5 };
    case "ELECTRICAL_ENGINEER":
      return { ELECTRONICS: 15, CAFE: 10 };
    case "LAWYER":
      return { AD_AGENCY: 10, CLOTHING: 10 };
    default:
      return {};
  }
}

function getProfCardBonus(profession: string, card: CardItem): number {
  const primary = card.primaryEffect?.type;
  switch (profession) {
    case "SOFTWARE_ENGINEERING":
      if (primary === "INSTANT_REVENUE") return 10;
      if (primary === "REVENUE_MULTIPLIER") return 15;
      break;
    case "MARKETING":
      if (primary === "CUSTOMER_BOOST") return 15;
      if (primary === "AVG_TICKET_BOOST") return 10;
      break;
    case "GRAPHIC_DESIGN":
      if (primary === "AVG_TICKET_BOOST") return 15;
      if (primary === "CUSTOMER_BOOST") return 10;
      break;
    case "HARDWARE_ENGINEERING":
      if (primary === "COST_REDUCTION") return 15;
      if (primary === "OPERATING_COST_MULT") return 10;
      break;
    case "ELECTRICAL_ENGINEER":
      if (primary === "HP_SHIELD") return 10;
      if (primary === "ENV_RESISTANCE") return 15;
      break;
    case "LAWYER":
      if (primary === "ENV_RESISTANCE") return 20;
      if (primary === "HP_SHIELD") return 10;
      break;
  }
  return 0;
}
