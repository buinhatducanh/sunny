// Debug: trace exact V31 weak and avg HP changes
// Run: npx tsx scripts/debug-sim.ts

const ENVS = [
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

const ENV_SEQ = [2, 5, 0, 0, 0, 1, 0, 6, 3, 0, 0, 7, 0, 0, 4, 0, 0, 0, 2, 0];

const V31 = { STARTING_HP: 100, STARTING_MONEY: 3000, STARTING_MAX_ENERGY: 80, MAX_HP: 100, BASE_CUSTOMERS: 12, BASE_AVG_TICKET: 7, AVG_TICKET_ROUND_GROWTH: 4, BASE_OPERATING_COST: 250, COST_GROWTH_RATE: 0.26, HP_LOSS_PER_ROUND: 12, ENERGY_RESTORE_PERCENT: 38 };

const CARD_REV = 450;
const CARD_COST_RED = 80;
const CARD_MONEY_COST = 250;
const ENERGY_USED = 44; // sum of all card energy costs

function trace(c: typeof V31, cardMult: number, label: string) {
  let hp = c.STARTING_HP;
  let money = c.STARTING_MONEY;
  let energy = c.STARTING_MAX_ENERGY;
  let bankrupt = false;
  const dipl = 10, stam = 10, spir = 10;

  console.log(`\n=== ${label} (mult=${cardMult}) ===`);
  for (let round = 1; round <= 20; round++) {
    const env = ENVS[ENV_SEQ[round - 1] ?? 0];

    const baseCust = c.BASE_CUSTOMERS + dipl * 2;
    const avgTick = c.BASE_AVG_TICKET + (round - 1) * c.AVG_TICKET_ROUND_GROWTH;
    let revenue = Math.floor(baseCust * avgTick * env.custMult);
    if (env.specialRev) revenue += env.specialRev;

    const cardRev = CARD_REV;
    revenue = Math.floor((revenue + cardRev) * (1 + cardMult));

    const baseCost = c.BASE_OPERATING_COST * Math.pow(1 + c.COST_GROWTH_RATE, round - 1);
    const stamDisc = 1 - stam * 0.003;
    let cost = Math.floor(baseCost * env.costMult * stamDisc) - CARD_COST_RED + CARD_MONEY_COST;
    cost = Math.max(50, cost);
    const profit = revenue - cost;

    let hpChange = 0;
    if (profit >= 0) hpChange = 0;
    else hpChange = -c.HP_LOSS_PER_ROUND;

    if (env.hpDmg > 0) {
      const spiritRed = Math.floor(spir * 0.3);
      hpChange += Math.max(-(env.hpDmg - spiritRed), -2);
    }

    const hpBefore = hp;
    const moneyBefore = money;

    if (!bankrupt && money + profit < -5000) {
      hpChange -= 25;
      bankrupt = true;
    }

    hp = Math.max(0, Math.min(c.MAX_HP, hp + hpChange));
    money += profit;
    energy = Math.min(c.STARTING_MAX_ENERGY, energy - ENERGY_USED + Math.floor(c.STARTING_MAX_ENERGY * c.ENERGY_RESTORE_PERCENT / 100));

    if (round <= 10 || round >= 15) {
      const bmark = bankrupt && moneyBefore + profit < -5000 ? " ⚡" : "";
      console.log(`  R${String(round).padStart(2)} ${env.short}: baseCust=${baseCust} avgTick=${avgTick} baseRev=${Math.floor(baseCust*avgTick*env.custMult)} rev=${revenue} cost=${cost} profit=${profit} hpChange=${hpChange} hp=${hpBefore}→${hp} money=${Math.floor(moneyBefore)}→${Math.floor(money)}${bmark}`);
    }
    if (hp <= 0) { console.log(`  → DIED at round ${round}`); break; }
  }
  console.log(`  FINAL: hp=${hp} money=${Math.floor(money)} survive=${round > 20 ? 20 : round}`);
}

trace(V31, 0, "V31 weak");
trace(V31, 0.10, "V31 avg");
trace(V31, 0.80, "V31 strong");
