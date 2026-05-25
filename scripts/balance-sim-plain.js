// balance-sim-plain.js — Matches actual game engine formulas
// Run: node scripts/balance-sim-plain.js
//
// Game engine formulas (from economy.engine.ts):
//   baseRevenue = floor(baseCustomers * avgTicket * envCustMult * profMultRev)
//   totalRevenue = floor(floor(baseRevenue * prevStreakMult) + cardBonus)
//   roundGrowth = pow(1 + COST_GROWTH_RATE, round-1)  ← progressive exponential
//   operatingCost = floor(baseCost * roundGrowth * staminaDiscount * envCostMult * profMultCost)
//   totalCost = operatingCost
//   hpChange = min(floor(profit/50), 20) if profit >= 0, else = profit
//   envDamage = floor(-hpDamagePerRound * resistanceMult) + spiritReduction
//   streak: +2%/consecutive profitable round, max x1.20
//   Prof: weak=Lawyer(0.95/0.90), avg=Marketing(1.15/1.05), strong=SW Eng(1.10/1.00)

const ENVS = [
  // idx 0: NORMAL
  { short: "Norm", custMult: 1.00, costMult: 1.00, hpDmg: 0 },
  // idx 1: PANDEMIC
  { short: "Pand", custMult: 0.60, costMult: 1.13, hpDmg: 10 },
  // idx 2: WAR
  { short: "War ", custMult: 0.75, costMult: 1.40, hpDmg: 8 },
  // idx 3: RECESSION
  { short: "Rec ", custMult: 0.55, costMult: 1.50, hpDmg: 0 },
  // idx 4: LOCUST
  { short: "Locu", custMult: 0.80, costMult: 1.35, hpDmg: 3 },
  // idx 5: TECH
  { short: "Tech", custMult: 1.40, costMult: 0.90, hpDmg: 0 },
  // idx 6: HOLIDAY
  { short: "Holi", custMult: 1.50, costMult: 1.10, hpDmg: 0 },
  // idx 7: GOVT_AID
  { short: "Gov ", custMult: 1.00, costMult: 0.75, hpDmg: 0, moneyBonus: 800 },
  // idx 8: TREND
  { short: "Virl", custMult: 1.30, costMult: 1.00, hpDmg: 0 },
];

// Fixed env sequence (matches actual game trigger logic)
const ENV_SEQ = [2, 5, 0, 0, 0, 1, 0, 6, 3, 0, 0, 7, 0, 0, 4, 0, 0, 0, 2, 0];

const STREAK_BONUS = 0.02;   // 2% per streak (game uses 0.05 but tuned down)
const STREAK_MAX_MULT = 1.20; // max streak multiplier (game uses 1.5 but tuned)

const ALL_SETS = [
  {
    name: "V1 — CURRENT (BROKEN: all survive 20, base revenue=8400 R1)",
    STARTING_HP: 100, STARTING_MONEY: 5000, STARTING_MAX_ENERGY: 100, MAX_HP: 100,
    BASE_CUSTOMERS: 50, BASE_AVG_TICKET: 100, AVG_TICKET_ROUND_GROWTH: 15,
    BASE_OPERATING_COST: 500, COST_GROWTH_RATE: 0.10, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 0, cardBonusAvg: 0, cardBonusStrong: 0,
  },
  // V116: Tuned — War R19 kills avg, strong survives, weak dies at Pand
  // Growth=0.135: War R19 cost ≈ 4515, avg rev≈3891 → avg dies, strong rev≈5291 → strong survives
  // Pand R6: cost≈1076, avg rev≈1084 → avg barely survives, weak rev≈584 → weak dies
  {
    name: "V116 — ★ BALANCED: weak=DIED@6, avg=DIED@19, strong=20 (g=0.135,card=0/420/1200)",
    STARTING_HP: 120, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 100, MAX_HP: 120,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 4, AVG_TICKET_ROUND_GROWTH: 3,
    BASE_OPERATING_COST: 320, COST_GROWTH_RATE: 0.135, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 0, cardBonusAvg: 420, cardBonusStrong: 1200,
  },
  // V117: Slightly softer (g=0.13) — avg survives longer
  {
    name: "V117 — Softer: weak=DIED@6, avg~17-18, strong=20 (g=0.13,card=0/430/1200)",
    STARTING_HP: 120, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 100, MAX_HP: 120,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 4, AVG_TICKET_ROUND_GROWTH: 3,
    BASE_OPERATING_COST: 320, COST_GROWTH_RATE: 0.13, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 0, cardBonusAvg: 430, cardBonusStrong: 1200,
  },
  // V118: Harder avg (g=0.14, lower card bonus)
  {
    name: "V118 — Harder avg: weak=DIED@6, avg=DIED@15-16, strong=20 (g=0.14,card=0/380/1200)",
    STARTING_HP: 120, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 100, MAX_HP: 120,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 4, AVG_TICKET_ROUND_GROWTH: 3,
    BASE_OPERATING_COST: 320, COST_GROWTH_RATE: 0.14, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 0, cardBonusAvg: 380, cardBonusStrong: 1200,
  },
  // V119: Weak playable (small bonus to survive R1, dies at Pand)
  {
    name: "V119 — Weak playable: weak~6-7, avg=DIED@19, strong=20 (g=0.135,card=130/420/1200)",
    STARTING_HP: 120, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 100, MAX_HP: 120,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 4, AVG_TICKET_ROUND_GROWTH: 3,
    BASE_OPERATING_COST: 320, COST_GROWTH_RATE: 0.135, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 130, cardBonusAvg: 420, cardBonusStrong: 1200,
  },
  // V120: Weak barely playable (dies ~R7-8)
  {
    name: "V120 — Weak ~R7-8: weak~7-8, avg=DIED@19, strong=20 (g=0.135,card=150/420/1200)",
    STARTING_HP: 120, STARTING_MONEY: 2000, STARTING_MAX_ENERGY: 100, MAX_HP: 120,
    BASE_CUSTOMERS: 5, BASE_AVG_TICKET: 4, AVG_TICKET_ROUND_GROWTH: 3,
    BASE_OPERATING_COST: 320, COST_GROWTH_RATE: 0.135, ENERGY_RESTORE_PERCENT: 50,
    cardBonusWeak: 150, cardBonusAvg: 420, cardBonusStrong: 1200,
  },
];

function simulate(c, cardBonus, dipl = 10, intel = 10, stam = 10, spir = 10, profMultRev = 1.0, profMultCost = 1.0) {
  let hp = c.STARTING_HP;
  let money = c.STARTING_MONEY;
  let streak = 0;
  const rounds = [];

  for (let round = 1; round <= 20; round++) {
    const env = ENVS[ENV_SEQ[round - 1] ?? 0];

    const baseCust = c.BASE_CUSTOMERS + dipl * 3 + Math.floor(intel * 2);
    const avgTick = c.BASE_AVG_TICKET + round * c.AVG_TICKET_ROUND_GROWTH;
    const baseRevenue = Math.floor(baseCust * avgTick * env.custMult * profMultRev);

    const prevStreakMult = Math.min(1 + streak * STREAK_BONUS, STREAK_MAX_MULT);
    // Correct formula: card bonus is FLAT, not scaled by envCustMult
    const totalRevenue = Math.floor(Math.floor(baseRevenue * prevStreakMult) + cardBonus);

    const roundGrowth = Math.pow(1 + c.COST_GROWTH_RATE, round - 1);
    const staminaDiscount = 1 - stam * 0.005;
    const operatingCost = Math.floor(
      c.BASE_OPERATING_COST * roundGrowth * staminaDiscount * env.costMult * profMultCost
    );
    const totalCost = Math.max(50, operatingCost);

    const profit = totalRevenue - totalCost;


    if (profit > 0) streak++; else streak = 0;

    let hpChange = 0;
    if (profit >= 0) hpChange = Math.min(Math.floor(profit / 50), 20);
    else hpChange = profit;

    // Environment HP damage
    if (env.hpDmg > 0) {
      const spiritRed = Math.floor(spir * 0.5);
      const envDmg = Math.min(-(env.hpDmg) + spiritRed, 0);
      hpChange += envDmg;
    }

    // Govt aid money bonus (not HP, just cash)
    if (env.moneyBonus) money += env.moneyBonus;

    hp = Math.max(0, Math.min(c.MAX_HP, hp + hpChange));
    money += profit;

    rounds.push({
      round, env: env.short, revenue: totalRevenue, cost: totalCost, profit,
      hp, money: Math.floor(money), alive: hp > 0, streak, prevStreakMult
    });
    if (hp <= 0) break;
  }

  const last = rounds[rounds.length - 1];
  return {
    survive: rounds.length,
    finalHP: last ? last.hp : 0,
    finalMoney: Math.floor(last ? last.money : c.STARTING_MONEY),
    alive: last ? last.alive : false,
    rounds,
  };
}

function runSet(c) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`  ${c.name}`);
  console.log(
    `  HP=${c.STARTING_HP} $${c.STARTING_MONEY} | Cust=${c.BASE_CUSTOMERS} Tick=${c.BASE_AVG_TICKET}+${c.AVG_TICKET_ROUND_GROWTH}/rnd | ` +
    `Cost=${c.BASE_OPERATING_COST}×${(c.COST_GROWTH_RATE * 100).toFixed(0)}%/rnd | cardBonus: weak=$${c.cardBonusWeak} avg=$${c.cardBonusAvg} strong=$${c.cardBonusStrong}`
  );

  const results = [
    ["⚠️ weak (basic)", simulate(c, c.cardBonusWeak, 10, 10, 10, 10, 0.95, 0.90)],
    ["✅ avg (standard)", simulate(c, c.cardBonusAvg, 10, 10, 10, 10, 1.15, 1.05)],
    ["🔥 strong (synergy)", simulate(c, c.cardBonusStrong, 10, 10, 10, 10, 1.10, 1.00)],
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
  const avg = simulate(c, c.cardBonusAvg, 10, 10, 10, 10, 1.15, 1.05);
  console.log(`  │ Rd│ Env │ Revenue │ Cost   │ Profit  │ HP    │ $          │ Streak│ Mult `);
  console.log(`  │${"-".repeat(3)}│${"-".repeat(5)}│${"-".repeat(9)}│${"-".repeat(7)}│${"-".repeat(9)}│${"-".repeat(7)}│${"-".repeat(11)}│${"-".repeat(7)}│${"-".repeat(5)}│`);
  for (const r of avg.rounds) {
    const fmtProfit = (n) => {
      const abs = Math.abs(n);
      const prefix = n >= 0 ? "+" : "-";
      const num = abs >= 1000 ? `${(abs / 1000).toFixed(1)}K` : `${abs}`;
      return `${prefix}${num.padStart(7)}`;
    };
    const rev = String(r.revenue).padStart(7);
    const cost = String(r.cost).padStart(7);
    const profit = fmtProfit(r.profit);
    const money = (r.money >= 1000 ? `${(r.money / 1000).toFixed(1)}K` : String(r.money)).padStart(9);
    const hp = String(r.hp).padStart(5);
    const alive = r.alive ? "✓" : "✗";
    const mult = r.prevStreakMult.toFixed(2);
    console.log(`  │ ${String(r.round).padStart(2)}│ ${r.env} │ ${rev} │ ${cost} │ ${profit} │ ${hp} │ ${money} │ ${String(r.streak).padStart(7)} │ ${("x" + mult).padStart(6)} ${alive}`);
  }
}

console.log("\n" + "=".repeat(72));
console.log("  PROJECT SUNNY — BALANCE SIMULATION (plain JS, engine-corrected)");
console.log("  Player: dipl=intel=stam=spir=10 | Prof: weak=Lawyer, avg=Marketing, strong=SW Eng");
console.log("  Env: War,Tech,Norm,Norm,Norm,Pand,Norm,Holi,Rec,Norm... (ENV_SEQ fixed)");
console.log("  Formula: revenue=floor(floor(baseRev*prevStreakMult)+cardBonus), profMult INSIDE baseRev");
console.log("  Cost: floor(baseCost*pow(1+rate,rnd-1)*staminaDisc*envCostMult*profMultCost)");
console.log("  HP: +floor(profit/50) capped at +20, or = profit if negative");
console.log("  Streak: +2%/rnd, max x1.20 | Profit -> streak continues, Loss -> streak resets");
console.log("=".repeat(72));

for (const set of ALL_SETS) runSet(set);

console.log(`\n${"=".repeat(72)}`);
console.log("  LEGEND: ⭐ Survive 20 | 🟢 Survive 13-19 | 🟡 Survive 8-12 | 🔴 Survive <8");
console.log("  TARGET: weak ~5-8 | avg ~12-16 | strong ~18-20 rounds");
console.log("=".repeat(72));
