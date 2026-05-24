# AI-BOT-SPEC.md — Solo Practice AI & Bot Behavior

> Chi tiết về AI bot, difficulty scaling, decision-making, và solo practice mode.

---

## 1. Bot Architecture

### 1.1. Bot Types

```
BOT_TIER_1 (Tutorial Bot):
  Difficulty:   Very Easy
  Win rate:    20-30% (player should always win)
  Used for:   Tutorial, first solo games
  Behavior:   Suboptimal, predictable

BOT_TIER_2 (Easy Bot):
  Difficulty:   Easy
  Win rate:    35-45%
  Used for:   Casual practice
  Behavior:   Makes obvious mistakes

BOT_TIER_3 (Medium Bot):
  Difficulty:   Medium
  Win rate:    45-55%
  Used for:   Standard solo practice
  Behavior:   Reasonable decisions, occasional errors

BOT_TIER_4 (Hard Bot):
  Difficulty:   Hard
  Win rate:    55-65%
  Used for:   Competitive practice
  Behavior:   Near-optimal, slight delays

BOT_TIER_5 (Expert Bot):
  Difficulty:   Expert
  Win rate:    65-75%
  Used for:   Endgame practice
  Behavior:   Optimal or near-optimal
```

### 1.2. Bot Selection Algorithm

```typescript
function selectBotDifficulty(playerHistory: PlayerHistory): BotTier {
  const gamesPlayed = playerHistory.totalGames;
  const winRate = playerHistory.wins / gamesPlayed;
  const avgRound = playerHistory.avgRoundReached;

  if (gamesPlayed < 3) return BOT_TIER_1;
  if (gamesPlayed < 10) {
    if (winRate < 0.3) return BOT_TIER_1;
    if (winRate < 0.5) return BOT_TIER_2;
    return BOT_TIER_3;
  }
  if (gamesPlayed < 30) {
    if (avgRound < 8) return BOT_TIER_2;
    if (avgRound < 14) return BOT_TIER_3;
    return BOT_TIER_4;
  }
  // Veteran player
  if (winRate < 0.4) return BOT_TIER_3;
  if (winRate < 0.6) return BOT_TIER_4;
  return BOT_TIER_5;
}
```

---

## 2. Decision-Making Engine

### 2.1. Card Evaluation Function

```typescript
// Core card value evaluation
function evaluateCard(card: Card, context: DecisionContext): number {
  let score = 0;

  // Revenue potential
  if (card.primaryEffect?.type === "INSTANT_REVENUE") {
    score += card.primaryEffect.value * context.revenueWeight;
  }
  if (card.primaryEffect?.type === "REVENUE_MULTIPLIER") {
    score += card.primaryEffect.value * context.avgRevenue * 10;
  }

  // Cost efficiency
  const energyCost = card.energyCost;
  const moneyCost = card.moneyCost;
  const revenueValue = estimateRevenueValue(card);
  const efficiency = revenueValue / (energyCost + 1);
  score += efficiency * context.efficiencyWeight;

  // Defensive value
  if (card.primaryEffect?.type === "HP_HEAL") {
    const hpDeficit = 100 - context.currentHP;
    score += Math.min(card.primaryEffect.value, hpDeficit) * context.hpWeight;
  }
  if (card.primaryEffect?.type === "HP_SHIELD") {
    score += card.primaryEffect.value * context.hpWeight * 0.5;
  }

  // Economy value
  if (card.primaryEffect?.type === "COST_REDUCTION") {
    const costSaving = context.operatingCost * card.primaryEffect.value;
    score += costSaving * context.costWeight;
  }

  // Synergy bonus
  const synergy = calculateSynergy(card, context);
  score += synergy * context.synergyWeight;

  // Round scaling
  if (card.minRound > context.currentRound) {
    score *= 0.1; // Too early
  }

  // Environment adjustment
  if (context.env) {
    const envAdj = evaluateAgainstEnv(card, context.env);
    score *= envAdj;
  }

  return score;
}

function calculateSynergy(card: Card, context: DecisionContext): number {
  let synergy = 0;

  // Same profession combo
  const sameProfPlayed = context.cardsPlayedThisRound
    .filter(c => c.professionKey === card.professionKey)
    .length;
  if (sameProfPlayed >= 2) {
    synergy += 50 * sameProfPlayed; // Combo bonus
  }

  // Economy engine
  if (card.primaryEffect?.type === "REVENUE_MULTIPLIER" &&
      context.hasRevenueCard) {
    synergy += 100;
  }

  // Defensive synergy
  if ((card.primaryEffect?.type === "HP_SHIELD" ||
       card.primaryEffect?.type === "IMMUNITY") &&
      context.currentHP < 40) {
    synergy += 80;
  }

  return synergy;
}
```

### 2.2. Slot Assignment Algorithm

```typescript
// Greedy slot assignment with randomization
function assignSlots(
  hand: Card[],
  context: DecisionContext,
  tier: BotTier
): SlotAssignment[] {
  const assignments: SlotAssignment[] = [];
  const remainingCards = [...hand];
  const slotTypes: SlotType[] = ["REVENUE", "BUFF", "COST", "DEFENSE", "SPECIAL"];

  // Sort cards by evaluation score
  remainingCards.sort((a, b) =>
    evaluateCard(b, context) - evaluateCard(a, context)
  );

  // Tier-based randomization
  const randomFactor = getRandomFactor(tier);

  for (let slotIndex = 0; slotIndex < 5; slotIndex++) {
    const slotType = slotTypes[slotIndex];
    const eligibleCards = remainingCards.filter(c =>
      canFitInSlot(c, slotType)
    );

    if (eligibleCards.length === 0) {
      assignments.push({ slotIndex, card: null });
      continue;
    }

    // Sort eligible cards by score
    eligibleCards.sort((a, b) =>
      evaluateCard(b, context) - evaluateCard(a, context)
    );

    // Pick with randomization factor
    const pickIndex = applyRandomization(
      0, // best choice
      eligibleCards.length - 1,
      randomFactor
    );

    const selectedCard = eligibleCards[pickIndex];
    assignments.push({ slotIndex, card: selectedCard });
    remainingCards.splice(remainingCards.indexOf(selectedCard), 1);
  }

  // Fill remaining with null (empty slot)
  for (let i = 0; i < 5; i++) {
    if (!assignments.find(a => a.slotIndex === i)) {
      assignments.push({ slotIndex: i, card: null });
    }
  }

  return assignments;
}

function getRandomFactor(tier: BotTier): number {
  switch (tier) {
    case BOT_TIER_1: return 0.8;  // Almost random
    case BOT_TIER_2: return 0.5;  // Often random
    case BOT_TIER_3: return 0.2;  // Occasionally random
    case BOT_TIER_4: return 0.05; // Almost never random
    case BOT_TIER_5: return 0.0;  // Always optimal
  }
}
```

### 2.3. Energy Management

```typescript
function shouldPlayCard(card: Card, context: DecisionContext): boolean {
  const energyAfterPlay = context.currentEnergy - card.energyCost;
  const futureEnergyGain = Math.floor(context.maxEnergy * 0.5); // 50% restore

  // Always play if energy abundant
  if (energyAfterPlay > context.maxEnergy * 0.3) {
    return true;
  }

  // Calculate if card is worth the energy
  const cardValue = evaluateCard(card, context);
  const energyValueRatio = cardValue / (card.energyCost + 1);

  // Threshold by difficulty
  const threshold = getEnergyThreshold(context.botTier);

  return energyValueRatio > threshold;
}

function getEnergyThreshold(tier: BotTier): number {
  switch (tier) {
    case BOT_TIER_1: return 3;   // Only play very efficient cards
    case BOT_TIER_2: return 5;   // Play decent cards
    case BOT_TIER_3: return 8;   // Play reasonable cards
    case BOT_TIER_4: return 12;  // Play good cards
    case BOT_TIER_5: return 15;  // Play anything useful
  }
}
```

### 2.4. Lock Card Decision

```typescript
function shouldLockCard(card: Card, context: DecisionContext): boolean {
  // Only lock 1 card per round
  if (context.alreadyLocked) return false;

  const cardValue = evaluateCard(card, context);

  // Lock criteria by tier
  switch (context.botTier) {
    case BOT_TIER_1:
      return cardValue > 200 && card.rarity === "LEGENDARY";
    case BOT_TIER_2:
      return cardValue > 150 && ["LEGENDARY", "EPIC"].includes(card.rarity);
    case BOT_TIER_3:
      return cardValue > 100 && card.rarity !== "COMMON";
    case BOT_TIER_4:
      return cardValue > 80; // Lock any useful card
    case BOT_TIER_5:
      return cardValue > 60; // Lock nearly anything
  }

  return false;
}
```

---

## 3. Solo Practice Mode

### 3.1. Solo Mode Configuration

```typescript
interface SoloPracticeConfig {
  difficulty: BotTier | "ADAPTIVE";
  botCount: 1 | 2 | 3 | 4;  // Replace missing players with bots
  storeType: StoreType | "RANDOM";
  playerPosition: number;        // 1-5 position
}

const SOLO_MODES = {
  TUTORIAL: {
    difficulty: "BOT_TIER_1",
    botCount: 4,
    storeType: "RANDOM",
    rewards: { xp: 0.5, coins: 0.5 }, // 50% of normal rewards
    canEarnAchievements: false,
    canProgressQuests: false,
  },
  CASUAL: {
    difficulty: "BOT_TIER_3",
    botCount: 4,
    storeType: "RANDOM",
    rewards: { xp: 1.0, coins: 1.0 },
    canEarnAchievements: true,
    canProgressQuests: true,
  },
  CHALLENGE: {
    difficulty: "BOT_TIER_4",
    botCount: 4,
    storeType: "RANDOM",
    rewards: { xp: 1.5, coins: 1.5 },
    canEarnAchievements: true,
    canProgressQuests: true,
    weeklyChallenge: true,
  },
  CUSTOM: {
    difficulty: "ADAPTIVE",
    botCount: 2, // 2 bots + 2 real players
    storeType: "PLAYER_CHOICE",
    rewards: { xp: 1.0, coins: 1.0 },
    canEarnAchievements: true,
    canProgressQuests: true,
  },
};
```

### 3.2. Bot Personality System

```typescript
// Each bot has a "personality" that affects decisions
interface BotPersonality {
  aggression: number;     // 0-1: prefers offense vs defense
  riskTolerance: number;  // 0-1: prefers safe vs risky plays
  greedLevel: number;     // 0-1: prefers immediate vs delayed gain
  loyalty: number;         // 0-1: prefers protecting HP vs going all-in
}

const BOT_PERSONALITIES: BotPersonality[] = [
  { aggression: 0.8, riskTolerance: 0.7, greedLevel: 0.8, loyalty: 0.3 }, // Aggressive
  { aggression: 0.3, riskTolerance: 0.2, greedLevel: 0.4, loyalty: 0.9 }, // Defensive
  { aggression: 0.5, riskTolerance: 0.5, greedLevel: 0.6, loyalty: 0.5 }, // Balanced
  { aggression: 0.6, riskTolerance: 0.8, greedLevel: 0.9, loyalty: 0.2 }, // Gambler
];

function adjustForPersonality(
  cardScore: number,
  card: Card,
  personality: BotPersonality,
  context: DecisionContext
): number {
  let adjustedScore = cardScore;

  // Aggression
  if (card.primaryEffect?.type === "INSTANT_DAMAGE") {
    adjustedScore *= 1 + personality.aggression;
  }

  // Risk tolerance
  if (card.rarity === "LEGENDARY") {
    adjustedScore *= personality.riskTolerance > 0.5 ? 1.2 : 0.8;
  }

  // Greed
  if (card.duration !== "INSTANT") {
    adjustedScore *= personality.greedLevel > 0.5 ? 1.1 : 0.9;
  }

  // Loyalty (HP protection)
  if (context.currentHP < 30) {
    if (card.primaryEffect?.type === "HP_HEAL" ||
        card.primaryEffect?.type === "HP_SHIELD") {
      adjustedScore *= 1 + personality.loyalty;
    }
  }

  return adjustedScore;
}
```

### 3.3. Bot Chat Lines

```typescript
const BOT_CHAT_LINES = {
  // Round comments
  roundStart: [
    "Bắt đầu vòng {round} nào!",
    "Chuẩn bị chiến lược...",
    "Hy vọng vòng này may mắn!",
  ],
  cardPlayed: [
    "Đánh lá {cardName}!",
    "Lá này chắc ăn rồi!",
    "Chiến thuật của mình đấy!",
  ],
  critHit: [
    "CHÍ MẠNG!",
    "X2 revenue nha!",
    "Tuyệt vời!",
  ],
  hpLoss: [
    "Óa... mất HP rồi",
    "Đau quá!",
    "Cần hồi phục gấp!",
  ],
  envGood: [
    "Môi trường thuận lợi!",
    "Đây là cơ hội!",
    "Tăng tốc thôi!",
  ],
  envBad: [
    "Ôi không, môi trường xấu...",
    "Cẩn thận vòng này!",
    "Cố gắng vượt qua!",
  ],
  victory: [
    "Chiến thắng!",
    "Chúng ta làm được!",
    "Từ con số không đến thành công!",
  ],
  defeat: [
    "Lần sau sẽ tốt hơn...",
    "Kinh nghiệm là bài học.",
    "Thất bại là mẹ thành công!",
  ],
};
```

---

## 4. Difficulty-Specific Behaviors

### 4.1. Tier 1 (Tutorial) — Predictable AI

```
Behavior Rules:
  - Always plays highest revenue card regardless of cost
  - Never locks cards
  - Plays cards even with low energy (often overextends)
  - Ignores environment effects
  - Makes 1-2 obvious mistakes per game
  - Always uses slot for its intended type (no creative use)
  - Says encouraging things regardless of game state

Example Decision:
  Hand: [REVENUE 50cost10, BUFF 20cost5, DEFENSE 30cost8]
  Energy: 30
  HP: 100
  → Plays: REVENUE card (overpays), exhausted, no defense
  → Result: Sometimes dies round 3-5 to teach player
```

### 4.2. Tier 3 (Medium) — Learning AI

```
Behavior Rules:
  - Evaluates cards based on current HP and round
  - Uses environment information to adjust
  - Sometimes makes suboptimal plays (5-10% of the time)
  - Will lock good cards occasionally
  - Energy management is reasonable
  - Can combo cards if obvious
  - Occasionally takes calculated risks

Example Decision:
  Hand: [LEGENDARY 500rev 80cost, EPIC 200rev 40cost, COMMON 80rev 15cost]
  Energy: 85
  HP: 70
  → Plays: EPIC + COMMON (efficient, saves energy for next round)
  → Rational: "I need HP more than max revenue"
```

### 4.3. Tier 5 (Expert) — Near-Optimal AI

```
Behavior Rules:
  - Evaluates ALL cards with full context
  - Models future rounds
  - Considers opponent positions
  - Maximizes expected value per round
  - Energy efficiency is paramount
  - Locks optimal cards
  - Adapts strategy based on HP/round/money
  - Finds non-obvious synergies
  - Occasionally "sandbags" (intentionally suboptimal
    to avoid appearing too strong)

Example Decision:
  Hand: [LEGENDARY 800rev 70cost, EPIC 400rev 35cost, COMMON 150rev 20cost]
  Energy: 80
  HP: 85
  Round: 15
  Env: Pandemic
  → Plays: LEGENDARY + COMMON
  → Rational: "Legendary is worth the energy, common fills
     remaining slot for near-free revenue, pandemic means
     I need all the revenue I can get, HP is fine"
```

---

## 5. Performance & Simulation

### 5.1. Bot Response Time

```
Bot thinking time = baseDelay + random(0, variance)

Tier 1:  baseDelay=200ms, variance=300ms   (0.2-0.5s total)
Tier 2:  baseDelay=300ms, variance=400ms   (0.3-0.7s)
Tier 3:  baseDelay=400ms, variance=500ms   (0.4-0.9s)
Tier 4:  baseDelay=500ms, variance=600ms   (0.5-1.1s)
Tier 5:  baseDelay=800ms, variance=800ms   (0.8-1.6s)

Human delay baseline: 1-3 seconds per round
→ Bots feel faster but not instant
```

### 5.2. Monte Carlo Simulation

```typescript
// Used to validate balance before launch
function runSimulation(
  iterations: number,
  config: SimulationConfig
): SimulationResult {
  const results = [];
  const wins = { [BOT_TIER_1]: 0, [BOT_TIER_2]: 0, ... };
  const roundDistribution = new Map<number, number>();

  for (let i = 0; i < iterations; i++) {
    const game = simulateGame(config);
    results.push(game);
    roundDistribution.set(
      game.finalRound,
      (roundDistribution.get(game.finalRound) ?? 0) + 1
    );

    if (game.winner === "PLAYER") wins.player++;
  }

  return {
    playerWinRate: wins.player / iterations,
    avgRoundReached: calculateMean([...roundDistribution]),
    roundDistribution: Object.fromEntries(roundDistribution),
    percentile25: calculatePercentile(results, 25),
    percentile75: calculatePercentile(results, 75),
  };
}

// Run before every patch to check balance
const SIMULATION_CONFIG = {
  iterations: 10000,
  players: 5,
  storeType: "RANDOM",
  professions: "RANDOM",
  bots: BOT_TIER_3,
};
```
