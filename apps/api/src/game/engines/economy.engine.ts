// apps/api/src/game/engines/economy.engine.ts

import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";
import { ENVIRONMENT_DATA } from "@sunny-game/constants/env.data";
import type { Environment } from "@sunny-game/types/player.types";
import type { Card, CardEffect, StoreType, EffectType } from "@sunny-game/types/card.types";

export interface PlayerStats {
  intelligence: number;
  stamina: number;
  speed: number;
  spirit: number;
  agility: number;
  diplomacy: number;
}

export interface PlayerRoundContext {
  playerId: string;
  professionKey?: string;
  stats: PlayerStats;
  streak: number;
  buffs: BuffEffect[];
  storeType: StoreType;
  money: number;
  hp: number;
  energy: number;
}

export interface BuffEffect {
  type: EffectType;
  value: number;
  remainingTicks: number;
}

export interface SlotCard {
  card: Card;
  instanceId: string;
}

export interface CardEffectResult {
  type: EffectType;
  revenueBonus: number;
  costBonus: number;
  hpBonus: number;
  energyBonus: number;
  hpDamage: number;
  revenueStolen: number;
  multiplier: number;
  isApplied: boolean;
  log: string;
}

export interface RoundEconomyResult {
  playerId: string;
  revenue: number;
  operatingCost: number;
  cardCosts: number;
  profit: number;
  hpChange: number;
  newHP: number;
  newMoney: number;
  newEnergy: number;
  isCrit: boolean;
  critBonus: number;
  streakBonus: number;
  environmentDamage: number;
  cardEffects: CardEffectResult[];
  logs: string[];
  isDead: boolean;
  deathReason?: string;
  damageDealt: number;
  revenueStolen: number;
}

export class EconomyEngine {
  /**
   * Calculate full round economy for a player.
   */
  calculateRound(
    ctx: PlayerRoundContext,
    slots: (SlotCard | null)[],
    environment: Environment,
    round: number,
  ): RoundEconomyResult {
    const logs: string[] = [];
    const cardEffects: CardEffectResult[] = [];

    // 1. Base revenue calculation
    const baseRevenue = this.calculateBaseRevenue(ctx, round, environment);
    logs.push(`Doanh thu gốc: ${this.fmt(baseRevenue)}`);

    // 2. Apply card effects
    let revenueBonus = 0;
    let costBonus = 0;
    let hpBonus = 0;
    let hpDamage = 0;
    let energyBonus = 0;
    let revenueStolen = 0;
    let revenueMultiplier = 1.0;
    let costMultiplier = 1.0;
    let hasInstantRevenue = false;
    let instantRevenueAmount = 0;

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot) continue;

      const result = this.resolveCardEffect(slot.card, ctx, round, environment, i);
      cardEffects.push(result);

      if (!result.isApplied) {
        logs.push(`[Slot ${i}] ${slot.card.name}: Không đủ điều kiện`);
      } else {
        logs.push(`[Slot ${i}] ${slot.card.name}: +${this.fmt(result.revenueBonus)} doanh thu, x${result.multiplier.toFixed(2)}`);
      }

      // Resolve secondary effect
      if (slot.card.secondaryEffect) {
        const cardWithSecondary: Card = {
          ...slot.card,
          primaryEffect: slot.card.secondaryEffect,
        };
        const secResult = this.resolveCardEffect(cardWithSecondary, ctx, round, environment, i);
        cardEffects.push(secResult);

        if (secResult.isApplied && secResult.revenueBonus !== 0) {
          revenueBonus += secResult.revenueBonus;
          logs.push(`  [Phụ] ${slot.card.name}: +${this.fmt(secResult.revenueBonus)} doanh thu`);
        }
      }

      if (!result.isApplied) continue;

      revenueBonus += result.revenueBonus;
      costBonus += result.costBonus;
      hpBonus += result.hpBonus;
      hpDamage += result.hpDamage;
      energyBonus += result.energyBonus;
      revenueStolen += result.revenueStolen;
      revenueMultiplier *= result.multiplier;

      if (result.type === "INSTANT_REVENUE") {
        hasInstantRevenue = true;
        instantRevenueAmount += result.revenueBonus;
      }
    }

    // 3. Streak bonus
    const streakMultiplier = this.calculateStreakMultiplier(ctx.streak);
    const streakBonus = hasInstantRevenue ? 0 : Math.floor(baseRevenue * (streakMultiplier - 1));
    logs.push(`Streak x${ctx.streak}: +${this.fmt(streakBonus)} doanh thu`);

    // 4. Total revenue
    const totalRevenue = Math.floor(
      (baseRevenue + revenueBonus + streakBonus) * revenueMultiplier,
    ) + instantRevenueAmount;
    logs.push(`Tổng doanh thu: ${this.fmt(totalRevenue)}`);

    // 5. Operating cost
    const operatingCost = this.calculateOperatingCost(round, ctx.storeType, ctx, costMultiplier);
    logs.push(`Chi phí vận hành: ${this.fmt(operatingCost)}`);

    // 6. Card-specific costs (money, water, power)
    const cardCosts = this.calculateCardCosts(slots, ctx);
    logs.push(`Chi phí thẻ bài: ${this.fmt(cardCosts)}`);

    // 7. Total costs
    const totalCost = Math.floor(operatingCost * costMultiplier) + cardCosts;
    const profit = totalRevenue - totalCost;
    logs.push(`Lợi nhuận: ${this.fmt(profit)}`);

    // 8. Crit check
    const { isCrit, critBonus } = this.calculateCrit(ctx.stats, round);
    if (isCrit) {
      logs.push(`CRIT! x${GAME_CONSTANTS.BASE_CRIT_MULTIPLIER}: +${this.fmt(critBonus)}`);
    }

    // 9. HP change
    const finalProfit = profit + critBonus;
    let hpChange = 0;
    let deathReason: string | undefined;

    if (finalProfit >= 0) {
      hpChange = Math.min(
        Math.floor(finalProfit / GAME_CONSTANTS.HP_GAIN_PER_PROFIT),
        GAME_CONSTANTS.HP_GAIN_CAP,
      );
      logs.push(`HP: +${hpChange} (lợi nhuận ${this.fmt(finalProfit)})`);
    } else {
      hpChange = finalProfit;
      logs.push(`HP: ${hpChange} (lỗ ${this.fmt(Math.abs(finalProfit))})`);
    }

    // 10. Environment HP damage
    const envDamage = this.calculateEnvironmentDamage(environment, ctx);
    if (envDamage < 0) {
      hpChange += envDamage;
      logs.push(`Môi trường: ${envDamage} HP`);
    }

    // 11. HP bonus from cards
    hpChange += hpBonus;
    if (hpBonus !== 0) {
      logs.push(`Thẻ bài: ${hpBonus > 0 ? "+" : ""}${hpBonus} HP`);
    }

    // 12. HP damage from cards (e.g. self-damage risk cards)
    if (hpDamage > 0) {
      hpChange -= hpDamage;
      logs.push(`Rủi ro thẻ: -${hpDamage} HP`);
    }

    // 13. Revenue stolen
    if (revenueStolen > 0) {
      logs.push(`Trộm doanh thu: +${this.fmt(revenueStolen)}`);
    }

    // 12. New HP
    const newHP = Math.max(0, Math.min(GAME_CONSTANTS.MAX_HP, ctx.hp + hpChange));
    const isDead = newHP <= 0;
    if (isDead) {
      deathReason = newHP <= 0 ? "HP về 0" : undefined;
      logs.push("NGƯỜI CHƠI BỊ LOẠI!");
    }

    // 13. New money (includes stolen revenue)
    const newMoney = ctx.money + finalProfit + (isCrit ? critBonus : 0) + revenueStolen;

    // 14. New energy
    const energyUsed = slots.reduce((sum, s) => sum + (s?.card.energyCost ?? 0), 0);
    const energyRestore = Math.floor(GAME_CONSTANTS.STARTING_MAX_ENERGY * GAME_CONSTANTS.ENERGY_RESTORE_PERCENT / 100);
    const newEnergy = Math.min(GAME_CONSTANTS.STARTING_MAX_ENERGY, ctx.energy - energyUsed + energyRestore);

    return {
      playerId: ctx.playerId,
      revenue: totalRevenue,
      operatingCost,
      cardCosts,
      profit: finalProfit,
      hpChange,
      newHP,
      newMoney,
      newEnergy,
      isCrit,
      critBonus,
      streakBonus,
      environmentDamage: envDamage,
      cardEffects,
      logs,
      isDead,
      deathReason,
      damageDealt: hpDamage,
      revenueStolen,
    };
  }

  private calculateBaseRevenue(
    ctx: PlayerRoundContext,
    round: number,
    env: Environment,
  ): number {
    const diplomacyBonus = ctx.stats.diplomacy * 3;
    const intelligenceBonus = Math.floor(ctx.stats.intelligence * 2);
    const baseCustomers = GAME_CONSTANTS.BASE_CUSTOMERS + diplomacyBonus + intelligenceBonus;

    const avgTicket =
      GAME_CONSTANTS.BASE_AVG_TICKET +
      round * GAME_CONSTANTS.AVG_TICKET_ROUND_GROWTH;

    // Environment global modifier
    let envMult = env.customerMultiplier ?? 1.0;

    // Environment store-type specific modifier
    const storeMult = env.revenueCatMult?.[ctx.storeType] ?? 1.0;
    envMult *= storeMult;

    // Profession revenue multiplier
    const profMult =
      ctx.professionKey
        ? GAME_CONSTANTS.PROFESSION_REVENUE_MULT[ctx.professionKey as keyof typeof GAME_CONSTANTS.PROFESSION_REVENUE_MULT] ?? 1.0
        : 1.0;

    return Math.floor(baseCustomers * avgTicket * envMult * profMult);
  }

  private calculateOperatingCost(
    round: number,
    storeType: StoreType,
    ctx: PlayerRoundContext,
    cardCostMult: number,
  ): number {
    const baseCost = GAME_CONSTANTS.BASE_OPERATING_COST;
    const roundGrowth = Math.pow(1 + GAME_CONSTANTS.COST_GROWTH_RATE, round - 1);
    const storeMult = GAME_CONSTANTS.STORE_COST_MULT[storeType] ?? 1.0;

    // Stamina reduces operating cost slightly
    const staminaDiscount = 1 - (ctx.stats.stamina * 0.005);
    const profMult =
      ctx.professionKey
        ? GAME_CONSTANTS.PROFESSION_COST_MULT[ctx.professionKey as keyof typeof GAME_CONSTANTS.PROFESSION_COST_MULT] ?? 1.0
        : 1.0;

    return Math.floor(baseCost * roundGrowth * storeMult * staminaDiscount * profMult * cardCostMult);
  }

  private calculateCardCosts(slots: (SlotCard | null)[], ctx: PlayerRoundContext): number {
    let total = 0;
    for (const slot of slots) {
      if (!slot) continue;
      const card = slot.card;
      total += card.moneyCost;
      // Water and power are tracked separately but contribute to operational load
    }
    return total;
  }

  private resolveCardEffect(
    card: Card,
    ctx: PlayerRoundContext,
    round: number,
    env: Environment,
    slotIndex: number,
  ): CardEffectResult {
    const result: CardEffectResult = {
      type: card.primaryEffect.type,
      revenueBonus: 0,
      costBonus: 0,
      hpBonus: 0,
      hpDamage: 0,
      revenueStolen: 0,
      energyBonus: 0,
      multiplier: 1.0,
      isApplied: false,
      log: "",
    };

    // Check conditions
    if (!this.checkConditions(card.primaryEffect.condition, ctx, round, env)) {
      return result;
    }

    // Check resource requirements
    if (ctx.energy < card.energyCost) return result;
    if (ctx.money < card.moneyCost) return result;

    result.isApplied = true;
    const v = card.primaryEffect.value;
    const intelligenceBonus = 1 + ctx.stats.intelligence * 0.02;
    const scaledValue = Math.floor(v * intelligenceBonus);

    switch (card.primaryEffect.type) {
      case "INSTANT_REVENUE":
        result.revenueBonus = scaledValue;
        break;

      case "REVENUE_MULTIPLIER":
        result.multiplier = 1 + scaledValue / 100;
        break;

      case "CUSTOMER_BOOST":
        result.revenueBonus = Math.floor(scaledValue * GAME_CONSTANTS.BASE_AVG_TICKET);
        break;

      case "AVG_TICKET_BOOST":
        result.revenueBonus = Math.floor(scaledValue * 10 * GAME_CONSTANTS.BASE_CUSTOMERS);
        break;

      case "CRIT_REVENUE":
        result.revenueBonus = scaledValue;
        break;

      case "COST_REDUCTION":
        result.costBonus = -scaledValue;
        break;

      case "OPERATING_COST_MULT":
        result.costBonus = -Math.floor(scaledValue / 100);
        break;

      case "HP_HEAL":
        result.hpBonus = Math.min(scaledValue, GAME_CONSTANTS.MAX_HP - ctx.hp);
        break;

      case "HP_SHIELD":
        result.hpBonus = Math.floor(scaledValue / 2);
        break;

      case "ENERGY_GAIN":
        result.energyBonus = scaledValue;
        break;

      case "ENV_RESISTANCE":
        // Handled in environment damage calculation
        result.multiplier = 1.0;
        break;

      case "STREAK_REVENUE":
        result.revenueBonus = Math.floor(scaledValue * (ctx.streak > 0 ? ctx.streak : 1));
        break;

      case "STEAL_REVENUE":
        // Steal from pot (simplified: no target in single-player)
        result.revenueStolen = scaledValue;
        break;

      case "LOAN":
        // Loan adds money (negative cost, i.e. revenue)
        result.revenueBonus = scaledValue;
        break;

      case "INVESTMENT":
        // Investment pays back next round (small revenue now, big later)
        result.revenueBonus = Math.floor(scaledValue * 0.3);
        break;

      case "TAX_REFUND":
        result.revenueBonus = Math.floor(scaledValue * 50);
        break;

      case "INSURANCE_PAYOUT":
        result.hpBonus = Math.floor(scaledValue);
        break;

      case "HP_MULT":
        // Multiply HP by percentage
        result.hpBonus = Math.floor(ctx.hp * scaledValue / 100);
        break;

      case "REVIVAL":
        // Revival: if dead, restore HP
        result.hpBonus = ctx.hp <= 0 ? GAME_CONSTANTS.REVIVAL_HP : 0;
        break;

      case "IMMUNITY":
        // Tracked via buffs; grants protection from damage
        result.log = "Immunity active";
        break;

      case "INSTANT_DAMAGE":
        // Deal damage to self (strategic risk)
        result.hpDamage = scaledValue;
        break;

      case "MARKET_STUNT":
        // Reduce opponent revenue (tracked, no multiplayer impact yet)
        result.log = "Market stunted";
        break;

      case "DEBUFF_INFLICT":
        result.log = "Debuff applied";
        break;

      case "FREEZE_COST":
      case "DEFER_COST":
        // Cost modification tracked via buffs
        result.log = `Cost ${card.primaryEffect.type.replace("_", " ").toLowerCase()} applied`;
        break;

      case "ENV_BOOST":
        // Good environment boost
        result.revenueBonus = Math.floor(scaledValue * 20);
        break;

      case "CANCEL_ENV":
        // Nullify bad environment - tracked via buffs
        result.log = "Environment effect cancelled";
        break;

      case "FORCE_GOOD_ENV":
        // Force good environment - tracked via buffs
        result.revenueBonus = Math.floor(scaledValue * 30);
        break;

      case "DRAW_CARD":
        // Draw extra card next round - tracked via buffs
        result.log = `Draw ${scaledValue} card(s) next round`;
        break;

      case "LOCK_CARD_FREE":
      case "SWAP_CARD_FREE":
      case "RESHUFFLE":
      case "LOOK_DISCARD":
        // Utility effects tracked
        result.log = `${card.primaryEffect.type.replace(/_/g, " ").toLowerCase()} effect`;
        break;

      default:
        result.revenueBonus = Math.floor(scaledValue * 0.5);
        break;
    }

    return result;
  }

  private checkConditions(
    condition: CardEffect["condition"],
    ctx: PlayerRoundContext,
    round: number,
    env: Environment,
  ): boolean {
    if (!condition) return true;

    switch (condition.type) {
      case "ROUND_ODD":
        return round % 2 === 1;
      case "ROUND_EVEN":
        return round % 2 === 0;
      case "HP_BELOW":
        return ctx.hp <= condition.value;
      case "HP_ABOVE":
        return ctx.hp >= condition.value;
      case "MONEY_BELOW":
        return ctx.money <= condition.value;
      case "ENVIRONMENT":
        return env.key === condition.env;
      case "FIRST_ROUND":
        return round === 1;
      case "LAST_STAND":
        return ctx.hp <= 10;
      case "STREAK":
        return ctx.streak >= (condition.count ?? 3);
    }
    return true;
  }

  private calculateStreakMultiplier(streak: number): number {
    if (streak <= 0) return 1.0;
    return Math.min(
      1 + streak * GAME_CONSTANTS.STREAK_REVENUE_MULTIPLIER,
      GAME_CONSTANTS.STREAK_MAX_MULTIPLIER,
    );
  }

  private calculateCrit(stats: PlayerStats, round: number): { isCrit: boolean; critBonus: number } {
    // Intelligence and agility increase crit chance
    const bonusChance = Math.floor((stats.intelligence + stats.agility) / 10);
    const critChance = Math.min(GAME_CONSTANTS.BASE_CRIT_CHANCE + bonusChance, 40);
    const roll = Math.floor(Math.random() * 100);

    if (roll < critChance) {
      // Crit applies to revenue
      const base = GAME_CONSTANTS.BASE_AVG_TICKET * GAME_CONSTANTS.BASE_CUSTOMERS;
      const critBonus = Math.floor(base * (GAME_CONSTANTS.BASE_CRIT_MULTIPLIER - 1));
      return { isCrit: true, critBonus };
    }

    return { isCrit: false, critBonus: 0 };
  }

  private calculateEnvironmentDamage(env: Environment, ctx: PlayerRoundContext): number {
    if (!env.hpDamagePerRound || env.hpDamagePerRound === 0) return 0;

    // Buffs reduce env damage
    const hasResistance = ctx.buffs.some((b) => b.type === "ENV_RESISTANCE");
    const resistanceMult = hasResistance ? 0.3 : 1.0;

    // Spirit gives natural resistance
    const spiritReduction = Math.floor(ctx.stats.spirit * 0.5);
    const damage = Math.floor(-(env.hpDamagePerRound * resistanceMult)) + spiritReduction;

    return Math.min(damage, 0);
  }

  private fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  }
}
