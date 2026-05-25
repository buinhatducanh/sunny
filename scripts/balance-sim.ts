// scripts/balance-sim.ts — v4: Matches actual game engine economy
// Run: npx tsx scripts/balance-sim.ts
//
// Real game engine formulas:
//   baseCustomers = BASE_CUSTOMERS + dipl*3 + intel*2
//   avgTicket    = BASE_AVG_TICKET + round * AVG_TICKET_ROUND_GROWTH
//   baseRevenue = baseCustomers * avgTicket * envMult * profMultRev
//   cost        = floor(BASE_OPERATING_COST * roundGrowth * staminaDiscount * profMultCost) + cardCosts
//   hpChange    = floor(profit / 50) capped at +20, or = profit if negative
//   streak      = consecutive profitable rounds → x1.05 per streak (max x1.5) applied to base revenue

// ── Test constant sets ─────────────────────────────────────────────────────────
type Consts = {
  name: string;
  STARTING_HP: number;
  STARTING_MONEY: number;
  STARTING_MAX_ENERGY: number;
  MAX_HP: number;
  BASE_CUSTOMERS: number;
  BASE_AVG_TICKET: number;
  AVG_TICKET_ROUND_GROWTH: number;
  BASE_OPERATING_COST: number;
  COST_GROWTH_RATE: number;
  ENERGY_RESTORE_PERCENT: number;
  multWeak: number;
  multAvg: number;
  multStrong: number;
};

const ALL_SETS: Consts[] = [
  {
    name: "V1 — CURRENT (all survive 20 rounds — BROKEN)",
    STARTING_HP: 100, STARTING_MONEY: 5000, STARTING_MAX_ENERGY: 100, MAX_HP: 100,
    BASE_CUSTOMERS: 50, BASE_AVG_TICKET: 100, AVG_TICKET_ROUND_GROWTH: 15,
    BASE_OPERATING_COST: 500, COST_GROWTH_RATE: 0.10, ENERGY_RESTORE_PERCENT: 50,
    multWeak: 0, multAvg: 0, multStrong: 0,
  },
  {
    name: "V51 — Hard: weak ~5, avg ~9, strong ~16",
    STARTING_HP: 100, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 80, MAX_HP: 100,
    BASE_CUSTOMERS: 4, BASE_AVG_TICKET: 8, AVG_TICKET_ROUND_GROWTH: 4,
    BASE_OPERATING_COST: 150, COST_GROWTH_RATE: 0.18, ENERGY_RESTORE_PERCENT: 35,
    multWeak: 0, multAvg: 0.20, multStrong: 0.70,
  },
  {
    name: "V52 — Medium: weak ~6, avg ~12, strong ~18",
    STARTING_HP: 100, STARTING_MONEY: 2500, STARTING_MAX_ENERGY: 80, MAX_HP: 100,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 8, AVG_TICKET_ROUND_GROWTH: 4,
    BASE_OPERATING_COST: 150, COST_GROWTH_RATE: 0.16, ENERGY_RESTORE_PERCENT: 38,
    multWeak: 0, multAvg: 0.20, multStrong: 0.80,
  },
  {
    name: "V53 — Balanced: weak ~8, avg ~13, strong ~20",
    STARTING_HP: 100, STARTING_MONEY: 3000, STARTING_MAX_ENERGY: 80, MAX_HP: 100,
    BASE_CUSTOMERS: 6, BASE_AVG_TICKET: 9, AVG_TICKET_ROUND_GROWTH: 4,
    BASE_OPERATING_COST: 160, COST_GROWTH_RATE: 0.15, ENERGY_RESTORE_PERCENT: 38,
    multWeak: 0, multAvg: 0.20, multStrong: 0.85,
  },
  {
    name: "V54 — Casual: weak ~10, avg ~16, strong ~20",
    STARTING_HP: 100, STARTING_MONEY: 3000, STARTING_MAX_ENERGY: 80, MAX_HP: 100,
    BASE_CUSTOMERS: 8, BASE_AVG_TICKET: 9, AVG_TICKET_ROUND_GROWTH: 4,
    BASE_OPERATING_COST: 180, COST_GROWTH_RATE: 0.14, ENERGY_RESTORE_PERCENT: 40,
    multWeak: 0, multAvg: 0.20, multStrong: 0.90,
  },
];

// ── Environments ───────────────────────────────────────────────────────────────
type Env = { name: string; short: string; custMult: number; costMult: number; hpDmg: number; specialRev?: number };

const ENVS: Env[] = [
  { name: "Bình Thường", short: "Norm", custMult: 1.0, costMult: 1.0, hpDmg: 0 },
  { name: "Đại Dịch", short: "Pand", custMult: 0.50, costMult: 1.35, hpDmg: 8 },
  { name: "Chiến Tranh", short: "War ", custMult: 0.60, costMult: 1.40, hpDmg: 10 },
  { name: "Suy Thoái", short: "Rec ", custMult: 0.45, costMult: 1.50, hpDmg: 12 },
  { name: "Bầy Quạ", short: "Locu", custMult: 0.70, costMult: 1.30, hpDmg: 5 },
  { name: "Kỷ Nguyên Công Nghệ", short: "Tech", custMult: 1.40, costMult: 0.85, hpDmg: 0 },
  { name: "Ngày Lễ", short: "Holi", custMult: 1.50, costMult: 1.10, hpDmg: 0 },
  { name: "Gói Trợ Cấp", short: "Gov ", custMult: 1.00, costMult: 0.70, hpDmg: 0, specialRev: 500 },
  { name: "Trend Viral", short: "Virl", custMult: 1.30, costMult: 1.00, hpDmg: 0 },
];

// Fixed env sequence for reproducible simulation
const ENV_SEQ = [2, 5, 0, 0, 0, 1, 0, 6, 3, 0, 0, 7, 0, 0, 4, 0, 0, 0, 2, 0];

// ── Card pools (5 cards/round) ─────────────────────────────────────────────────
// cardMult is set at Consts level, not per-card
type Card = { rev: number; costRed: number; hpBonus: number; hpDmg: number; energy: number; moneyCost: number };

const POOLS: Record<string, Card[]> = {
  weak: [
    { rev: 40, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 5, moneyCost: 0 },
    { rev: 40, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 5, moneyCost: 0 },
    { rev: 40, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 5, moneyCost: 0 },
    { rev: 40, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 5, moneyCost: 0 },
    { rev: 40, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 5, moneyCost: 0 },
  ],
  avg: [
    { rev: 150, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 10, moneyCost: 80 },
    { rev: 120, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 8, moneyCost: 60 },
    { rev: 100, costRed: 0, hpBonus: 5, hpDmg: 0, energy: 8, moneyCost: 50 },
    { rev: 0, costRed: 80, hpBonus: 0, hpDmg: 0, energy: 6, moneyCost: 0 },
    { rev: 80, costRed: 0, hpBonus: 5, hpDmg: 0, energy: 8, moneyCost: 60 },
  ],
  strong: [
    { rev: 400, costRed: 0, hpBonus: 0, hpDmg: 0, energy: 18, moneyCost: 150 },
    { rev: 350, costRed: 0, hpBonus: 5, hpDmg: 0, energy: 15, moneyCost: 120 },
    { rev: 300, costRed: 150, hpBonus: 0, hpDmg: 0, energy: 15, moneyCost: 100 },
    { rev: 450, costRed: 0, hpBonus: 8, hpDmg: 0, energy: 18, moneyCost: 150 },
    { rev: 250, costRed: 200, hpBonus: 5, hpDmg: 0, energy: 12, moneyCost: 80 },
  ],
};

// ── Simulation (matches real game engine) ────────────────────────────────────
const HP_GAIN_PER_PROFIT = 50;
const HP_GAIN_CAP = 20;
const STREAK_MAX_MULT = 1.2;  // max streak multiplier (was 1.5 in game, tuned down)
const STREAK_BONUS = 0.02;    // per consecutive profitable round (was 0.05 in game)

function simulate(
  c: Consts,
  pool: Card[],
  cardMult: number,
  dipl = 10,
  intel = 10,
  stam = 10,
  spir = 10,
  profMultRev = 1.0,
  profMultCost = 1.0,
): { survive: number; finalHP: number; finalMoney: number; alive: boolean; rounds: RoundRow[] } {
  let hp = c.STARTING_HP;
  let money = c.STARTING_MONEY;
  let energy = c.STARTING_MAX_ENERGY;
  let streak = 0;
  const rounds: RoundRow[] = [];

  for (let round = 1; round <= 20; round++) {
    const env = ENVS[ENV_SEQ[round - 1] ?? 0];

    // Base revenue (matches game engine: dipl*3 + intel*2)
    const baseCust = c.BASE_CUSTOMERS + dipl * 3 + Math.floor(intel * 2);
    const avgTick = c.BASE_AVG_TICKET + round * c.AVG_TICKET_ROUND_GROWTH;
    const envMult = env.custMult;
    const baseRevenueRaw = baseCust * avgTick * envMult * profMultRev;
    const baseRevenue = Math.floor(baseRevenueRaw);

    // Streak multiplier from PREVIOUS round's streak count (streak applies to base revenue)
    const prevStreakMult = Math.min(1 + streak * STREAK_BONUS, STREAK_MAX_MULT);

    // Card effects
    let cardRev = 0, cardCostRed = 0, hpBonus = 0, hpDmg = 0, energyUsed = 0, moneyUsed = 0;
    for (const card of pool) {
      if (energy >= card.energy && money >= card.moneyCost) {
        cardRev += card.rev;
        cardCostRed += card.costRed;
        hpBonus += card.hpBonus;
        hpDmg += card.hpDmg;
        energyUsed += card.energy;
        moneyUsed += card.moneyCost;
      }
    }

    // Revenue = (baseRevenue * prevStreakMult + cardRev) * (1 + cardMult) — matches game engine
    const totalRevenue = Math.floor((baseRevenue * prevStreakMult + cardRev) * (1 + cardMult));

    // Operating cost (matches game engine)
    const baseCost = c.BASE_OPERATING_COST;
    const roundGrowth = Math.pow(1 + c.COST_GROWTH_RATE, round - 1);
    const staminaDiscount = 1 - stam * 0.005;
    const operatingCost = Math.floor(baseCost * roundGrowth * staminaDiscount * profMultCost);
    const totalCost = Math.max(50, operatingCost + moneyUsed - cardCostRed);

    const profit = totalRevenue - totalCost;

    // Update streak for NEXT round based on current profit
    if (profit > 0) {
      streak++;
    } else {
      streak = 0;
    }

    // HP change: +floor(profit/50) capped at +20, or = profit if negative
    let hpChange = 0;
    if (profit >= 0) {
      hpChange = Math.min(Math.floor(profit / HP_GAIN_PER_PROFIT), HP_GAIN_CAP);
    } else {
      hpChange = profit; // full negative profit as HP loss
    }

    // Environment HP damage (spirit reduces it)
    if (env.hpDmg > 0) {
      const spiritRed = Math.floor(spir * 0.5);
      const envDmg = Math.max(-(env.hpDmg - spiritRed), -2);
      hpChange += envDmg;
    }

    // Card HP effects
    hpChange += hpBonus - hpDmg;

    hp = Math.max(0, Math.min(c.MAX_HP, hp + hpChange));
    money += profit;
    energy = Math.min(c.STARTING_MAX_ENERGY, energy - energyUsed + Math.floor(c.STARTING_MAX_ENERGY * c.ENERGY_RESTORE_PERCENT / 100));

    rounds.push({ round, env: env.short, revenue: totalRevenue, cost: totalCost, profit, hp, money: Math.floor(money), alive: hp > 0, streak: Math.floor(prevStreakMult * 100) });
    if (hp <= 0) break;
  }

  const last = rounds[rounds.length - 1];
  return {
    survive: rounds.length,
    finalHP: last?.hp ?? 0,
    finalMoney: Math.floor(last?.money ?? c.STARTING_MONEY),
    alive: last?.alive ?? false,
    rounds,
  };
}

interface RoundRow {
  round: number;
  env: string;
  revenue: number;
  cost: number;
  profit: number;
  hp: number;
  money: number;
  alive: boolean;
  streak: number;
}

function runSet(c: Consts): void {
  console.log(`\n${"-".repeat(72)}`);
  console.log(`  ${c.name}`);
  console.log(
    `  HP=${c.STARTING_HP} $${c.STARTING_MONEY} | Cust=${c.BASE_CUSTOMERS} Tick=${c.BASE_AVG_TICKET}+${c.AVG_TICKET_ROUND_GROWTH}/rnd | ` +
    `Cost=${c.BASE_OPERATING_COST}×${(c.COST_GROWTH_RATE * 100).toFixed(0)}%/rnd | mult: weak=${c.multWeak} avg=${c.multAvg} strong=${c.multStrong}`
  );
  console.log(`${"-".repeat(72)}`);

  // Weak = Lawyer (profRev=0.95, profCost=0.90), avg = Marketing (1.15, 1.05), strong = SW Eng (1.10, 1.00)
  const results = [
    ["⚠️ weak (basic)", simulate(c, POOLS.weak, c.multWeak, 10, 10, 10, 10, 0.95, 0.90)],
    ["✅ avg (standard)", simulate(c, POOLS.avg, c.multAvg, 10, 10, 10, 10, 1.15, 1.05)],
    ["🔥 strong (synergy)", simulate(c, POOLS.strong, c.multStrong, 10, 10, 10, 10, 1.10, 1.00)],
  ];

  for (const [label, r] of results) {
    const survive = r.alive ? `✓ ${r.survive}/20` : `✗ DIED@${r.survive}`;
    const money = r.finalMoney >= 1000 ? `${(r.finalMoney / 1000).toFixed(1)}K` : `${r.finalMoney}`;
    const avgProf = r.rounds.reduce((s, x) => s + x.profit, 0) / r.rounds.length;
    const avgP = avgProf >= 0 ? `+${(avgProf / 1000).toFixed(1)}K` : `${(avgProf / 1000).toFixed(1)}K`;
    const icon = r.survive < 8 ? "🔴" : r.survive < 12 ? "🟡" : r.survive < 20 ? "🟢" : "⭐";
    console.log(`  ${icon} ${label.padEnd(24)} | ${survive.padEnd(10)} | HP: ${String(r.finalHP).padStart(3)}/${c.STARTING_HP} | $: ${money.padEnd(9)} | avgProfit: ${avgP}`);
  }

  // Round-by-round for avg
  console.log(`\n  📊 Round-by-round (avg cards, dipl=intel=stam=spir=10, Marketing prof):`);
  const avg = simulate(c, POOLS.avg, c.multAvg, 10, 10, 10, 10, 1.15, 1.05);
  console.log(`  │ Rd│ Env │ Revenue  │ Cost    │ Profit  │ HP    │ $         │ Streak`);
  console.log(`  │${"-".repeat(3)}│${"-".repeat(5)}│${"-".repeat(10)}│${"-".repeat(10)}│${"-".repeat(10)}│${"-".repeat(7)}│${"-".repeat(11)}│${"-".repeat(7)}│`);
  for (const r of avg.rounds) {
    const fmtProfit = (n: number) => {
      const abs = Math.abs(n);
      const prefix = n >= 0 ? "+" : "-";
      const num = abs >= 1000 ? `${(abs / 1000).toFixed(1)}K` : `${abs}`;
      return `${prefix}${num.padStart(7)}`;
    };
    const rev = String(r.revenue).padStart(8);
    const cost = String(r.cost).padStart(8);
    const profit = fmtProfit(r.profit);
    const money = (r.money >= 1000 ? `${(r.money / 1000).toFixed(1)}K` : String(r.money)).padStart(9);
    const hp = String(r.hp).padStart(5);
    const alive = r.alive ? "✓" : "✗";
    const mult = (1 + r.streak * STREAK_BONUS).toFixed(2);
    console.log(`  │ ${String(r.round).padStart(2)}│ ${r.env} │ ${rev} │ ${cost} │ ${profit} │ ${hp} │ ${money} │ ${("x" + mult).padStart(6)} ${alive}`);
  }
}

// ── Run ────────────────────────────────────────────────────────────────────────
console.log("\n" + "=".repeat(72));
console.log("  PROJECT SUNNY — BALANCE SIMULATION v4 (real game engine)");
console.log("  Player: dipl=intel=stam=spir=10 | Prof: weak=Lawyer, avg=Marketing, strong=SW Eng");
console.log("  Env seq: War, Tech, Norm, Norm, Norm, Pand, Norm, Holi, Rec, Norm...");
console.log("  HP: +floor(profit/50) capped at +20, or = profit if negative");
console.log("  Streak: +2%/rnd, max x1.20 | Profit -> streak continues, Loss -> streak resets");
console.log("=".repeat(72));

for (const set of ALL_SETS) runSet(set);

console.log(`\n${"=".repeat(72)}`);
console.log("  LEGEND: ⭐ Survive 20 | 🟢 Survive 13-19 | 🟡 Survive 8-12 | 🔴 Survive <8");
console.log("  TARGET: weak ~5-8 | avg ~12-16 | strong ~18-20 rounds");
console.log("=".repeat(72));
