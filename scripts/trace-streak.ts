// Debug streak calculation
const ENVS = [
  { short: "Norm", custMult: 1.0, costMult: 1.0, hpDmg: 0 },
  { short: "Pand", custMult: 0.50, costMult: 1.35, hpDmg: 8 },
  { short: "War ", custMult: 0.60, costMult: 1.40, hpDmg: 10 },
  { short: "Rec ", custMult: 0.45, costMult: 1.50, hpDmg: 12 },
  { short: "Locu", custMult: 0.70, costMult: 1.30, hpDmg: 5 },
  { short: "Tech", custMult: 1.40, costMult: 0.85, hpDmg: 0 },
  { short: "Holi", custMult: 1.50, costMult: 1.10, hpDmg: 0 },
  { short: "Gov ", custMult: 1.00, costMult: 0.70, hpDmg: 0 },
  { short: "Virl", custMult: 1.30, costMult: 1.00, hpDmg: 0 },
];
const ENV_SEQ = [2, 5, 0, 0, 0, 1, 0, 6, 3, 0, 0, 7, 0, 0, 4, 0, 0, 0, 2, 0];
const STREAK_BONUS = 0.02;
const STREAK_MAX = 1.2;

const V51 = {
  BASE_CUSTOMERS: 4, BASE_AVG_TICKET: 8, AVG_TICKET_ROUND_GROWTH: 4,
  BASE_OPERATING_COST: 150, COST_GROWTH_RATE: 0.18,
};

let streak = 0;
const dipl = 10, intel = 10, stam = 10, spir = 10;
const profMultRev = 1.15, profMultCost = 1.05;
const cardMult = 0.20;
const cardRev = 430;

console.log("Tracing V51 avg player (rounds 1-6):");
for (let round = 1; round <= 6; round++) {
  const env = ENVS[ENV_SEQ[round - 1]];
  const baseCust = V51.BASE_CUSTOMERS + dipl * 3 + Math.floor(intel * 2);
  const avgTick = V51.BASE_AVG_TICKET + round * V51.AVG_TICKET_ROUND_GROWTH;
  const baseRevenueRaw = baseCust * avgTick * env.custMult * profMultRev;
  const baseRevenue = Math.floor(baseRevenueRaw);

  const prevStreakMult = Math.min(1 + streak * STREAK_BONUS, STREAK_MAX);
  const totalRevenue = Math.floor((baseRevenue * prevStreakMult + cardRev) * (1 + cardMult));

  const roundGrowth = Math.pow(1 + V51.COST_GROWTH_RATE, round - 1);
  const staminaDiscount = 1 - stam * 0.005;
  const operatingCost = Math.floor(V51.BASE_OPERATING_COST * roundGrowth * staminaDiscount * profMultCost);
  const totalCost = Math.max(50, operatingCost);

  const profit = totalRevenue - totalCost;

  const prevStreak = streak;
  if (profit > 0) streak++; else streak = 0;

  console.log(`R${round} ${env.short}: baseCust=${baseCust} avgTick=${avgTick} baseRev=${baseRevenue} prevStreak=${prevStreak} prevMult=${prevStreakMult.toFixed(4)} totalRev=${totalRevenue} cost=${totalCost} profit=${profit} streakAfter=${streak}`);
}
