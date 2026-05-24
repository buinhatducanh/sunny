# GAME-MECHANICS.md — Complete Mechanical Specification

> Tài liệu kỹ thuật chi tiết về CÁCH mọi cơ chế game hoạt động.
> Đọc song song với SPEC.md và IMPLEMENTATION.md.
>
> **Mục tiêu:** Một người chỉ đọc file này có thể code được toàn bộ game engine mà không cần hỏi thêm.

---

## Phần 1: Tổng Quan State Machine

### 1.1. Trạng thái game (Game State Machine)

```
┌──────────────────────────────────────────────────────────────────┐
│                     LOBBY STATE MACHINE                          │
│                                                                  │
│  ┌─────────┐   createRoom    ┌─────────┐   all ready  ┌───────┐ │
│  │  IDLE   │───────────────▶│ WAITING │─────────────▶│ VOTING │ │
│  └─────────┘                └────┬────┘              └───┬───┘ │
│       ▲                          │                        │     │
│       │ leave                    │ startGame              │     │
│       │                          ▼                        ▼     │
│       │                    ┌─────────┐             ┌─────────┐  │
│       └────────────────────│ ABORTED │◀────────────│ RUNNING │  │
│                            └─────────┘  gameOver   └────┬────┘  │
│                                                          │       │
│                            ┌─────────┐                   │       │
│                            │FINISHED │◀──────────────────┘       │
│                            └─────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2. Mô tả từng trạng thái

| Trạng thái | Điều kiện vào | Điều kiện ra | Ai quyết định |
|---|---|---|---|
| `IDLE` | Người chơi chưa vào phòng | Gọi `createRoom` hoặc `joinRoom` | Client |
| `WAITING` | Tạo phòng thành công | Host gọi `startGame` + đủ người (2-5) | Host |
| `VOTING` | Khi bắt đầu game, chọn store type | Tất cả vote xong | Server auto |
| `RUNNING` | Vote hoàn tất | HP tất cả = 0 hoặc Round = 20 | Server auto |
| `FINISHED` | Game kết thúc | — | Server auto |
| `ABORTED` | Host kick tất cả / timeout 5 phút | — | Server/Host |

---

## Phần 2: Game Loop — Từng Bước Chi Tiết

### 2.1. Round Execution Flow (Server-Side)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROUND EXECUTION (Server)                          │
│                                                                      │
│  1. ROUND_START                                                      │
│     ├─ increment round counter                                        │
│     ├─ check environment duration (tick)                              │
│     ├─ roll new environment if current expired                        │
│     ├─ refresh player energy (restore 50% maxEnergy)                 │
│     ├─ unlock expired buffs/debuffs                                   │
│     ├─ grant daily quest progress (if applicable)                     │
│     └─ broadcast roundStart(roundNum, env, hands)                    │
│                                                                      │
│  2. DRAW_PHASE (auto, ~5 giây)                                       │
│     ├─ server deals 5 cards to each player                           │
│     ├─ if deck < 5: reshuffle discard into deck                      │
│     ├─ if deck empty AND discard empty: no draw                      │
│     ├─ store hand state server-side (not client)                     │
│     └─ broadcast drawComplete()                                      │
│                                                                      │
│  3. ACTION_PHASE (30-60 giây, host-configurable)                   │
│     ├─ each player:                                                  │
│     │     ├─ receives hand (5 card instances)                        │
│     │     ├─ can drag cards to 5 slots                              │
│     │     ├─ can lock 1 card (flag: isLocked)                       │
│     │     ├─ can swap cards (if has enough agility)                 │
│     │     └─ clicks "Sẵn sàng" → server receives ready signal      │
│     ├─ host can kick AFK players (no action in 60s)                 │
│     ├─ if timer expires: auto-pass for non-ready players             │
│     └─ when ALL players ready → proceed to Resolution               │
│                                                                      │
│  4. RESOLUTION_PHASE (server-side, ~2 giây)                         │
│     │                                                               │
│     │  4a. DETERMINE TURN ORDER                                    │
│     │      ├─ sort players by totalSpeed (descending)                │
│     │      ├─ tiebreaker: random (but deterministic via seed)       │
│     │      └─ broadcast turnOrder(playerIds[])                      │
│     │                                                               │
│     │  4b. ENVIRONMENT APPLICATION                                   │
│     │      ├─ apply env effects to all players                      │
│     │      └─ broadcast envApplied(envState)                        │
│     │                                                               │
│     │  4c. CARD RESOLUTION (per player, per slot)                  │
│     │      ├─ for player in turnOrder:                              │
│     │      │     for slotIndex in [0..4]:                           │
│     │      │         ├─ get card in slot                            │
│     │      │         ├─ validate card can be played here            │
│     │      │         ├─ deduct card costs (energy, money)           │
│     │      │         ├─ calculate effect value                     │
│     │      │         ├─ apply effect to player state                │
│     │      │         ├─ check for crit (if applicable)             │
│     │      │         └─ emit cardResolved event                    │
│     │      │                                                         │
│     │  4d. ECONOMY CALCULATION                                      │
│     │      ├─ for each player:                                      │
│     │      │     ├─ calculateRevenue()                              │
│     │      │     ├─ calculateOperatingCost()                        │
│     │      │     ├─ apply card bonus/penalty                        │
│     │      │     ├─ calculateProfit()                               │
│     │      │     ├─ updateMoney()                                   │
│     │      │     ├─ updateHP()                                      │
│     │      │     └─ checkDeathCondition()                           │
│     │      │                                                         │
│     │  4e. DEATH CHECK                                              │
│     │      ├─ for each player where hp <= 0 OR money < 0 × 2rounds: │
│     │      │     ├─ mark player as DEAD                             │
│     │      │     ├─ emit playerDied() event                         │
│     │      │     └─ broadcast deathAnnouncement()                   │
│     │      │                                                         │
│     │  4f. CHECK WIN/LOSE CONDITION                                │
│     │      ├─ if allPlayersDead → Game Over (no winner)            │
│     │      ├─ if round >= 20 AND at least 1 player alive:          │
│     │      │     ├─ calculateFinalScores()                          │
│     │      │     ├─ determineMVP()                                   │
│     │      │     └─ Game Over (survivors win)                       │
│     │      └─ else → proceed to Cleanup                             │
│     │                                                               │
│  5. CLEANUP_PHASE                                                   │
│     ├─ remove INSTANT duration cards from play                      │
│     ├─ decrement duration of SHORT/LONG cards                       │
│     ├─ move unplayed cards to discard pile                         │
│     ├─ preserve LOCKED card (if any) in hand                        │
│     ├─ grant XP rewards                                             │
│     ├─ update daily quest progress                                 │
│     ├─ update leaderboard scores                                    │
│     └─ broadcast roundEnd(results)                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Client-Side Flow

```
┌─────────────────────────────────────────────┐
│            CLIENT (React Native)             │
│                                              │
│  [Lobby] → [Vote Store] → [Game Board]      │
│                                              │
│  GAME BOARD SCREEN:                          │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  TOP BAR: Round X | HP: 100 | $5000   │ │
│  │  ENV BANNER: [Kỷ nguyên Công nghệ]   │ │
│  │  ANIMATION AREA: Customer flow         │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐┌──────┐ │
│  │  │Slot 0│ │Slot 1│ │Slot 2│ │Slot 3││Slot 4│ │
│  │  │ REVEN│ │ BUFF │ │ COST │ │DEFENS││SPECIA│ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘└──────┘ │
│  │  PLAYER BOARDS (other players, read-only)│ │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │  │P1 💻│ │P2 📱│ │P3 📊│ │P4 ⚖️│   │
│  │  └────┘ └────┘ └────┘ └────┘          │
│  │                                        │
│  │  YOUR HAND:                            │
│  │  [C1] [C2] [C3] [C4] [C5]             │
│  │  Energy: ████████░░ 80/100            │
│  │  [🔒 Lock 1 card]  [✅ Sẵn Sàng]      │
│  └────────────────────────────────────────┘ │
│                                              │
│  TOUCH INTERACTIONS:                         │
│  - Tap card → Show card detail modal         │
│  - Drag card → Drop onto slot (44px target) │
│  - Long press → Full description tooltip    │
│  - Swipe up → View discard pile             │
│  - Haptic on drop → Feedback               │
└─────────────────────────────────────────────┘
```

---

## Phần 3: Thẻ Bài — Chi Tiết Hoàn Toàn

### 3.1. Cấu Trúc Dữ Liệu Thẻ Bài

```typescript
// packages/types/src/card.types.ts

interface Card {
  // Identity
  id: string;                    // VD: "card_sw_001"
  cardKey: string;               // VD: "SOFTWARE_ENGINEERING_001"
  name: string;                  // VD: "Deploy Hệ Thống"
  description: string;           // VD: "+200 revenue, -30 energy"
  type: CardType;
  rarity: Rarity;
  storeTypes: StoreType[];        // Cửa hàng nào được dùng
  professionKey: ProfessionKey;  // Ngành nghề chính liên quan

  // Costs (negative = gain)
  energyCost: number;             // Thể lực tiêu tốn (0-100)
  moneyCost: number;             // Tiền trả trước (0-1000)
  waterCost: number;             // Nước (0-50)
  powerCost: number;             // Điện (0-50)

  // Effects
  primaryEffect: CardEffect;
  secondaryEffect?: CardEffect;   // Một số lá có 2 effect

  // Timing & Duration
  duration: Duration;
  timing: SlotType;              // Slot nào lá bài này thuộc về

  // Visual
  imageKey: string;              // Key để lấy ảnh từ CDN
  color: string;                // Màu border theo rarity
  iconEmoji: string;            // Emoji đại diện

  // Gameplay metadata
  isPlayable: boolean;           // Có thể đánh được không
  minRound: number;              // Vòng tối thiểu để xuất hiện (1-20)
  maxRound: number;             // Vòng tối đa để xuất hiện (1=unlimited)
  upgradeFrom?: string;         // Có thể upgrade từ lá nào
  upgradeTo?: string;           // Có thể upgrade lên lá nào
}

interface CardEffect {
  type: EffectType;
  value: number;                 // Giá trị cơ số
  target: EffectTarget;          // Áp dụng cho ai
  condition?: EffectCondition;   // Điều kiện kích hoạt
  durationTicks?: number;        // Áp dụng trong bao nhiêu tick
  scaling?: EffectScaling;      // Có scale theo round không
}

type EffectType =
  // Revenue effects
  | "INSTANT_REVENUE"           // +N tiền ngay lập tức
  | "REVENUE_MULTIPLIER"        // ×N revenue round này
  | "CUSTOMER_BOOST"            // +N customers
  | "AVG_TICKET_BOOST"          // +N avg ticket price
  | "CRIT_REVENUE"             // N% chance ×2 revenue
  | "STREAK_REVENUE"           // +N% revenue khi có streak

  // Cost effects
  | "COST_REDUCTION"            // -N% operating cost
  | "OPERATING_COST_MULT"       // ×N operating cost (âm = giảm)
  | "FREEZE_COST"              // Cost không tăng 1 vòng
  | "DEFER_COST"               // Trì hoãn cost sang vòng sau

  // Defensive effects
  | "HP_HEAL"                   // +N HP
  | "HP_SHIELD"                // +N shield (absorbs damage)
  | "HP_MULT"                  // ×N HP gain/loss
  | "REVIVAL"                  // Auto revive 1 lần khi chết
  | "IMMUNITY"                 // Miễn 1 debuff type

  // Risk/Attack effects
  | "INSTANT_DAMAGE"           // -N HP (damage to others)
  | "STEAL_REVENUE"            // Lấy N% revenue từ người khác
  | "MARKET_STUNT"             // Giảm revenue người khác
  | "DEBUFF_INFLICT"           // Áp dụng debuff lên người khác

  // Utility effects
  | "ENERGY_GAIN"              // +N energy
  | "DRAW_CARD"               // +N cards vòng này
  | "LOCK_CARD_FREE"           // Khóa 1 lá miễn phí
  | "SWAP_CARD_FREE"           // Đổi 1 lá miễn phí
  | "RESHUFFLE"               // Reshuffle discard vào deck
  | "LOOK_DISCARD"             // Xem top 3 của discard

  // Environment effects
  | "ENV_RESISTANCE"           // -N% env damage
  | "ENV_BOOST"               // +N% env bonus
  | "CANCEL_ENV"              // Hủy env hiện tại
  | "FORCE_GOOD_ENV"          // Ép env tốt 1 vòng

  // Economy effects
  | "TAX_REFUND"               // Hoàn tiền thuế
  | "INSURANCE_PAYOUT"         // Nhận payout ngẫu nhiên
  | "LOAN"                    // Vay N tiền (phải trả +20% vòng sau)
  | "INVESTMENT"              // Đầu tư: -N tiền, +3N vòng sau
  ;

type EffectTarget =
  | "SELF"                      // Chính mình
  | "ALL_ALLIES"                // Tất cả người chơi trong lobby
  | "ALL_ENEMIES"               // Người chơi khác
  | "RANDOM_ENEMY"             // 1 người chơi ngẫu nhiên
  | "HIGHEST_HP"               // Người chơi HP cao nhất
  | "LOWEST_HP"                // Người chơi HP thấp nhất
  | "ROOM"                     // Cả phòng
  ;

type EffectCondition =
  | { type: "ROUND_ODD" }       // Chỉ vòng lẻ
  | { type: "ROUND_EVEN" }      // Chỉ vòng chẵn
  | { type: "HP_BELOW"; value: number }    // HP < N
  | { type: "HP_ABOVE"; value: number }    // HP > N
  | { type: "MONEY_BELOW"; value: number } // Tiền < N
  | { type: "ENVIROMENT"; env: EnvType }   // Đang có env X
  | { type: "FIRST_ROUND" }     // Vòng đầu tiên
  | { type: "LAST_STAND" }      // Người chơi cuối cùng còn sống
  | { type: "STREAK"; count: number }      // N vòng profit liên tiếp
  ;

type EffectScaling = {
  roundMultiplier: number;       // VD: 0.1 → mỗi vòng +10%
  cap?: number;                 // Giá trị tối đa
};

type SlotType = "REVENUE" | "COST" | "BUFF" | "DEFENSE" | "SPECIAL";

type Duration = "INSTANT" | "SHORT" | "LONG" | "PERMANENT";
  // INSTANT: Xóa sau khi resolution xong
  // SHORT: 6 vòng (tick -1 mỗi cleanup)
  // LONG: 12 vòng
  // PERMANENT: Xóa khi lá bài khác disable

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
```

### 3.2. Slot System

```
5 SLOT TRÊN BÀN:

┌──────────────────────────────────────────────────────┐
│  SLOT 0 (REVENUE)  │ SLOT 1 (BUFF)  │ SLOT 2 (COST) │
│  ──────────────────┼────────────────┼─────────────── │
│  Revenue cards      │ Buff cards     │ Cost cards     │
│  (hiếm khi FREE)   │ (thường FREE)  │ (thường có    │
│                     │                │  money cost)   │
├─────────────────────┼────────────────┼────────────────┤
│  SLOT 3 (DEFENSE)  │ SLOT 4 (SPECIAL)               │
│  ──────────────────┼────────────────                 │
│  HP/shield/heal     │ Any type, highest cost          │
│  + immunity cards   │ Special effects                 │
└─────────────────────┴────────────────────────────────┘

Quy tắc:
- Mỗi slot chỉ chứa 1 lá bài
- Slot rỗng = skip (không effect)
- Card type phải match với slot type (hoặc SPECIAL slot chấp nhận tất cả)
- Card có thể đặt sai slot → server reject với error code
```

### 3.3. Card Resolution Engine (Pseudocode)

```typescript
// apps/api/src/engine/card-resolver.ts

function resolveCard(
  card: Card,
  player: PlayerState,
  room: GameRoom,
  allPlayers: PlayerState[],
  round: number,
): CardResolutionResult {

  // Bước 1: Validate
  const canPlay = validateCardPlay(card, player, round);
  if (!canPlay.valid) return { success: false, error: canPlay.error };

  // Bước 2: Deduct costs
  const costs = deductCosts(card, player);
  if (costs.insufficient) return { success: false, error: "INSUFFICIENT_RESOURCES" };

  // Bước 3: Calculate base effect
  const baseValue = calculateBaseEffect(card.primaryEffect, player, round);

  // Bước 4: Apply profession multiplier
  const professionMult = getProfessionMultiplier(card.professionKey, player);
  const withProfession = baseValue * professionMult;

  // Bước 5: Apply stat bonus
  const statBonus = calculateStatBonus(card, player);
  const finalValue = withProfession + statBonus;

  // Bước 6: Check conditions
  if (!checkEffectConditions(card.primaryEffect.conditions, player, round, room)) {
    return { success: true, value: 0, effect: "CONDITION_NOT_MET" };
  }

  // Bước 7: Check for crit
  let finalWithCrit = finalValue;
  let isCrit = false;
  if (canCrit(card)) {
    const critRoll = random(0, 100);
    const critChance = calculateCritChance(card, player);
    if (critRoll < critChance) {
      const critMult = calculateCritMultiplier(card, player);
      finalWithCrit = finalValue * critMult;
      isCrit = true;
    }
  }

  // Bước 8: Apply effect to target(s)
  const affectedPlayers = resolveTargets(
    card.primaryEffect.target,
    player,
    allPlayers
  );

  const results = affectedPlayers.map(p => ({
    playerId: p.id,
    effectType: card.primaryEffect.type,
    value: finalWithCrit,
    isCrit,
    hpChange: calculateHPChange(card.primaryEffect.type, finalWithCrit),
    moneyChange: calculateMoneyChange(card.primaryEffect.type, finalWithCrit),
  }));

  // Bước 9: Handle duration
  if (card.duration !== "INSTANT") {
    applyBuffToPlayer(player, {
      cardId: card.id,
      type: card.primaryEffect.type,
      value: finalWithCrit,
      ticksRemaining: card.duration === "SHORT" ? 6 : 12,
      sourcePlayerId: player.id,
    });
  }

  return {
    success: true,
    results,
    isCrit,
    costsPaid: costs,
    logs: generatePlayLog(card, player, results),
  };
}

function validateCardPlay(card: Card, player: PlayerState, round: number): ValidationResult {
  // Check round range
  if (round < card.minRound) return { valid: false, error: "TOO_EARLY" };
  if (card.maxRound !== -1 && round > card.maxRound) return { valid: false, error: "TOO_LATE" };

  // Check store type
  if (!card.storeTypes.includes(room.storeType)) {
    return { valid: false, error: "WRONG_STORE_TYPE" };
  }

  // Check energy
  if (player.energy < card.energyCost) return { valid: false, error: "INSUFFICIENT_ENERGY" };

  // Check money
  if (player.money < card.moneyCost) return { valid: false, error: "INSUFFICIENT_MONEY" };

  // Check if card is already in play
  if (player.activeCards.includes(card.id)) return { valid: false, error: "ALREADY_PLAYED" };

  return { valid: true };
}
```

---

## Phần 4: Hệ Thống Kinh Tế — Công Thức Đầy Đủ

### 4.1. Revenue Calculation (Từng Bước)

```typescript
// apps/api/src/engine/economy-calculator.ts

interface RevenueInput {
  player: PlayerState;
  round: number;
  env: Environment;
  cardsPlayed: Card[];
  room: GameRoom;
}

function calculateRevenue(input: RevenueInput): RevenueBreakdown {
  const { player, round, env, cardsPlayed, room } = input;

  // ──────────────────────────────────────────
  // BƯỚC 1: Tính số lượng khách hàng
  // ──────────────────────────────────────────
  const baseCustomers = 50;
  const diplomacyBonus = player.stats.diplomacy * 3;
  const cardCustomers = sumCards(cardsPlayed, "CUSTOMER_BOOST");
  const envCustomerMod = env?.customerMultiplier ?? 1.0;
  const streakBonus = player.streak.consecutiveProfit * 5; // Max +25

  const totalCustomers = Math.floor(
    (baseCustomers + diplomacyBonus + cardCustomers + streakBonus) * envCustomerMod
  );

  // ──────────────────────────────────────────
  // BƯỚC 2: Tính giá trị trung bình mỗi khách
  // ──────────────────────────────────────────
  const baseAvgTicket = 100;
  const roundGrowth = round * 15;                    // +15 mỗi vòng
  const cardTicketBonus = sumCards(cardsPlayed, "AVG_TICKET_BOOST");
  const reputationBonus = calculateReputationBonus(player);

  const avgTicket = baseAvgTicket + roundGrowth + cardTicketBonus + reputationBonus;

  // ──────────────────────────────────────────
  // BƯỚC 3: Tính gross revenue
  // ──────────────────────────────────────────
  const baseRevenue = totalCustomers * avgTicket;

  // Multipliers
  const envMult = env?.revenueCatMult?.[room.storeType] ?? 1.0;
  const cardRevenueMult = multiplyCards(cardsPlayed, "REVENUE_MULTIPLIER");
  const professionMult = getProfessionRevenueMult(player);
  const streakMult = 1.0 + (player.streak.consecutiveProfit * 0.05); // Max 1.5x

  const grossRevenue = Math.floor(
    baseRevenue * envMult * cardRevenueMult * professionMult * streakMult
  );

  // ──────────────────────────────────────────
  // BƯỚC 4: Crit calculation
  // ──────────────────────────────────────────
  const critChance = calculateCritChance(player, cardsPlayed);
  const critDamage = calculateCritMultiplier(player, cardsPlayed);

  let totalRevenue = grossRevenue;
  let critCount = 0;

  // Crit rolls for revenue cards
  const revenueCards = cardsPlayed.filter(c => c.timing === "REVENUE");
  for (const card of revenueCards) {
    if (random() < critChance) {
      totalRevenue += grossRevenue * (critDamage - 1);
      critCount++;
    }
  }

  return {
    totalCustomers,
    avgTicket,
    grossRevenue,
    totalRevenue,
    critCount,
    breakdown: {
      baseCustomers,
      diplomacyBonus,
      cardCustomers,
      streakBonus,
      envCustomerMod,
      baseAvgTicket,
      roundGrowth,
      cardTicketBonus,
      envMult,
      cardRevenueMult,
      professionMult,
      streakMult,
      critChance,
      critDamage,
    },
  };
}
```

### 4.2. Operating Cost Calculation

```typescript
function calculateOperatingCost(input: CostInput): CostBreakdown {
  const { round, storeType, env, cardsPlayed, player } = input;

  const baseCost = 500;

  // Vòng tăng: 10% mỗi vòng, compound
  const roundMod = Math.pow(1.1, round - 1); // round 1 = 1.0, round 10 = 2.59

  // Store type modifier
  const storeMod: Record<StoreType, number> = {
    CAFE: 1.3,          // F&B có cost cao (thực phẩm, vệ sinh)
    CLOTHING: 1.0,      // Base
    ELECTRONICS: 1.2,   // Thiết bị, điện
    AD_AGENCY: 0.8,     // Agency ít cost vật chất
  };

  // Environment modifier
  const envMod = env?.costMultiplier ?? 1.0;

  // Card modifiers
  const cardCostReduction = multiplyCards(cardsPlayed, "COST_REDUCTION");
  const cardCostMult = multiplyCards(cardsPlayed, "OPERATING_COST_MULT");

  // Profession modifier
  const professionMod = getProfessionCostMod(player);

  // Tax
  const taxRate = 0.05 + (round * 0.005); // 5% base + 0.5%/vòng
  const taxReduction = sumCards(cardsPlayed, "TAX_REFUND");
  const effectiveTax = Math.max(0, taxRate - taxReduction);

  const beforeTax = Math.floor(
    baseCost * roundMod * storeMod[storeType] * envMod *
    cardCostReduction * cardCostMult * professionMod
  );

  const tax = Math.floor(beforeTax * effectiveTax);
  const totalCost = beforeTax + tax;

  return { beforeTax, tax, totalCost, breakdown: { roundMod, storeMod, envMod, effectiveTax } };
}
```

### 4.3. HP & Death System

```typescript
// apps/api/src/engine/round-engine.ts — HP Management

interface HPUpdate {
  playerId: string;
  previousHP: number;
  newHP: number;
  changeReason: "PROFIT" | "LOSS" | "DAMAGE" | "HEAL" | "ENVIRONMENT" | "CARD";
  details: string;
}

function updatePlayerHP(
  player: PlayerState,
  profit: number,
  round: number,
  env: Environment,
): HPUpdate {
  let change = 0;
  let reason: HPUpdate["changeReason"] = "PROFIT";
  let details = "";

  if (profit >= 0) {
    // Profitable → hồi HP nhẹ
    const hpGain = Math.floor(profit / 50); // 50 profit = +1 HP
    const hpShield = player.activeShield;
    const actualGain = Math.min(hpGain, hpShield); // Shield absorb trước

    change = actualGain;
    player.activeShield -= actualGain;
    player.hp = Math.min(100, player.hp + actualGain); // Max 100 HP
    reason = "PROFIT";
    details = `Profit ${profit} → +${actualGain} HP`;
  } else {
    // Loss → mất HP
    const loss = Math.abs(profit);
    const defenseCards = player.activeEffects.filter(e => e.type === "HP_MULT");
    const defenseMult = defenseCards.reduce((mult, e) => mult * e.value, 1.0);
    const effectiveLoss = Math.floor(loss * defenseMult);

    // Shield absorb
    const shieldAbsorb = Math.min(player.activeShield, effectiveLoss);
    const remainingLoss = effectiveLoss - shieldAbsorb;

    player.activeShield -= shieldAbsorb;
    player.hp -= remainingLoss;
    change = -effectiveLoss;
    reason = "LOSS";
    details = `Loss ${profit} → -${effectiveLoss} HP`;
  }

  // Apply environment damage (always on top of profit/loss)
  if (env && env.hpDamagePerRound) {
    const envDmg = calculateEnvHPDamage(env, player);
    player.hp -= envDmg;
    change -= envDmg;
    details += ` | Env damage: -${envDmg} HP`;
  }

  return {
    playerId: player.id,
    previousHP: player.hp + change,
    newHP: Math.max(0, player.hp),
    changeReason: reason,
    details,
  };
}

function checkDeath(player: PlayerState): DeathResult {
  // Điều kiện chết
  const hpDeath = player.hp <= 0;
  const moneyDeath = player.consecutiveRoundsCannotPay >= 2;

  if (!hpDeath && !moneyDeath) {
    return { isDead: false };
  }

  // Revival check (from cards)
  const hasRevival = player.activeEffects.some(e => e.type === "REVIVAL");
  if (hasRevival && hpDeath) {
    // Use revival
    removeEffect(player, "REVIVAL");
    player.hp = 30; // Revive to 30 HP
    return {
      isDead: false,
      revived: true,
      revivedFromHP: 0,
      revivedToHP: 30,
    };
  }

  return {
    isDead: true,
    reason: hpDeath ? "HP_ZERO" : "BANKRUPT",
    diedOnRound: player.currentRound,
  };
}
```

---

## Phần 5: Hệ Thống Môi Trường — Chi Tiết

### 5.1. Environment Data

```typescript
// packages/constants/src/env.data.ts

interface EnvironmentData {
  key: string;
  name: string;
  description: string;

  // Effects
  customerMultiplier: number;    // ×N customers (VD: 0.7 = -30%)
  costMultiplier: number;       // ×N operating cost (VD: 1.25 = +25%)
  revenueCatMult?: Record<StoreType, number>; // Per-store revenue modifier
  hpDamagePerRound?: number;    // Flat HP damage mỗi vòng
  specialEffect?: string;        // Mô tả effect đặc biệt

  // Rarity
  isGood: boolean;
  weight: number;               // Xác suất xuất hiện (bad env: 25%, good env: 15%)
}

export const ENVIRONMENT_DATA: Record<string, EnvironmentData> = {
  PANDEMIC: {
    key: "PANDEMIC",
    name: "Đại Dịch",
    description: "Đại dịch bùng phát, khách hàng e ngại ra ngoài",
    customerMultiplier: 0.6,    // -40% customers
    costMultiplier: 1.30,       // +30% operating cost
    revenueCatMult: { CAFE: 0.5, CLOTHING: 0.7, ELECTRONICS: 0.8, AD_AGENCY: 0.6 },
    hpDamagePerRound: 5,
    isGood: false,
    weight: 8,
  },

  WAR: {
    key: "WAR",
    name: "Chiến Tranh / Khủng Hoảng",
    description: "Xung đột quân sự, kinh tế suy thoái nghiêm trọng",
    customerMultiplier: 0.75,
    costMultiplier: 1.40,
    revenueCatMult: { CAFE: 0.6, CLOTHING: 0.3, ELECTRONICS: 0.4, AD_AGENCY: 0.5 },
    hpDamagePerRound: 8,
    isGood: false,
    weight: 7,
  },

  LOCUST_SWARM: {
    key: "LOCUST_SWARM",
    name: "Bầy Quạ (Dịch Bệnh Cục Bộ)",
    description: "Dịch bệnh cục bộ ảnh hưởng đến thực phẩm và đồ tiêu dùng",
    customerMultiplier: 0.80,
    costMultiplier: 1.35,
    revenueCatMult: { CAFE: 0.5, CLOTHING: 1.0, ELECTRONICS: 1.0, AD_AGENCY: 0.9 },
    hpDamagePerRound: 3,
    isGood: false,
    weight: 10,
  },

  RECESSION: {
    key: "RECESSION",
    name: "Suy Thoái Kinh Tế",
    description: "Suy thoái toàn cầu, người tiêu dùng thắt chặt chi tiêu",
    customerMultiplier: 0.55,
    costMultiplier: 1.50,
    isGood: false,
    weight: 5,
  },

  TECH_BOOM: {
    key: "TECH_BOOM",
    name: "Kỷ Nguyên Công Nghệ",
    description: "Công nghệ bùng nổ, nhu cầu điện tử tăng vọt",
    customerMultiplier: 1.40,
    costMultiplier: 0.90,
    revenueCatMult: { ELECTRONICS: 2.0, AD_AGENCY: 1.5, CAFE: 1.0, CLOTHING: 1.0 },
    isGood: true,
    weight: 10,
  },

  GOVT_AID: {
    key: "GOVT_AID",
    name: "Gói Thúc Đẩy (Trợ Cấp)",
    description: "Chính phủ hỗ trợ doanh nghiệp nhỏ",
    customerMultiplier: 1.0,
    costMultiplier: 0.75,
    isGood: true,
    specialEffect: "GIVES_MONEY",
    moneyPerRound: 800,
    isGood: true,
    weight: 8,
  },

  VIRAL_TREND: {
    key: "VIRAL_TREND",
    name: "Trend Truyền Thông",
    description: "Một sản phẩm/trend viral, marketing hiệu quả gấp 3",
    customerMultiplier: 1.25,
    costMultiplier: 1.05,
    revenueCatMult: { AD_AGENCY: 3.0, CLOTHING: 1.5, CAFE: 1.2, ELECTRONICS: 1.1 },
    isGood: true,
    weight: 9,
  },

  GOLDEN_AGE: {
    key: "GOLDEN_AGE",
    name: "Thời Kỳ Hoàng Kim",
    description: "Nền kinh tế phát triển mạnh, chi tiêu tự do",
    customerMultiplier: 1.35,
    costMultiplier: 1.05,
    isGood: true,
    weight: 6,
  },

  NORMAL: {
    key: "NORMAL",
    name: "Bình Thường",
    description: "Không có sự kiện đặc biệt",
    customerMultiplier: 1.0,
    costMultiplier: 1.0,
    isGood: true,
    weight: 40,  // 60% chance "no event"
  },
};
```

### 5.2. Environment Trigger Logic

```typescript
function rollEnvironment(round: number, previousEnv: Environment | null): EnvironmentRoll {
  // Nếu env cũ chưa hết duration → giữ nguyên
  if (previousEnv && previousEnv.remainingRounds > 0) {
    return {
      env: previousEnv,
      remainingRounds: previousEnv.remainingRounds - 1,
      isNew: false,
      triggeredBy: "DURATION_TICK",
    };
  }

  // 30% chance trigger environment mới
  if (Math.random() > 0.30) {
    return { env: null, isNew: false, triggeredBy: "NO_ENVIRONMENT" };
  }

  // Roll environment type
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [key, data] of Object.entries(ENVIRONMENT_DATA)) {
    if (key === "NORMAL") continue; // NORMAL không roll trực tiếp
    cumulative += data.weight;
    if (roll < cumulative) {
      const duration = Math.floor(Math.random() * 3) + 1; // 1-3 vòng
      return {
        env: { key, ...data, remainingRounds: duration },
        remainingRounds: duration,
        isNew: true,
        triggeredBy: "NEW_ROLL",
      };
    }
  }

  return { env: null, isNew: false, triggeredBy: "FALLBACK" };
}
```

---

## Phần 6: Hệ Thống Ngành Nghề — Chi Tiết

### 6.1. Profession Definitions

```typescript
// packages/constants/src/profession.data.ts

interface ProfessionData {
  key: ProfessionKey;
  name: string;
  emoji: string;

  // Multipliers (%)
  revenueMult: number;           // ×100% base revenue
  costMult: number;              // ×100% operating cost
  critChanceBonus: number;       // +N% crit chance
  critDamageBonus: number;       // +N% crit multiplier

  // Stat bonus
  relevantStat: StatKey;         // Stat nào được buff
  statBonus: number;             // +N base stat khi chọn profession này

  // Specific benefits
  benefits: {
    effectType: EffectType;
    value: number;
    description: string;
  }[];

  // Specific weaknesses
  weaknesses: {
    effectType: EffectType;
    penalty: number;
    description: string;
  }[];

  // Card keywords (những keyword card thuộc profession này)
  cardKeywords: string[];
}

export const PROFESSION_DATA: Record<ProfessionKey, ProfessionData> = {
  SOFTWARE_ENGINEERING: {
    key: "SOFTWARE_ENGINEERING",
    name: "Kỹ Thuật Phần Mềm",
    emoji: "💻",
    revenueMult: 1.10,           // +10% revenue
    costMult: 1.00,
    critChanceBonus: 8,          // +8% crit chance
    critDamageBonus: 15,         // +15% crit multiplier
    relevantStat: "intelligence",
    statBonus: 3,               // +3 INT khi chọn
    benefits: [
      { effectType: "REVENUE_MULTIPLIER", value: 0.05, description: "+5% revenue cho card tech" },
      { effectType: "ENERGY_GAIN", value: 10, description: "+10 energy mỗi vòng" },
      { effectType: "FREEZE_COST", value: 1, description: "Miễn tăng cost 1 vòng" },
    ],
    weaknesses: [
      { effectType: "COST_REDUCTION", penalty: -5, description: "-5% giảm cost" },
    ],
    cardKeywords: ["automation", "ai", "app", "cloud", "deploy", "system"],
  },

  HARDWARE_ENGINEERING: {
    key: "HARDWARE_ENGINEERING",
    name: "Kỹ Thuật Phần Cứng",
    emoji: "🔧",
    revenueMult: 1.05,
    costMult: 0.90,              // -10% operating cost
    critChanceBonus: 3,
    critDamageBonus: 5,
    relevantStat: "stamina",
    statBonus: 2,
    benefits: [
      { effectType: "COST_REDUCTION", value: 0.10, description: "-10% operating cost" },
      { effectType: "HP_SHIELD", value: 5, description: "+5 shield mỗi vòng" },
      { effectType: "DEBUFF_INFLICT", penalty: 0, description: "Reduced repair card costs" },
    ],
    weaknesses: [],
    cardKeywords: ["repair", "maintenance", "equipment", "parts"],
  },

  MARKETING: {
    key: "MARKETING",
    name: "Marketing",
    emoji: "📊",
    revenueMult: 1.15,           // +15% revenue (best for money)
    costMult: 1.05,             // +5% operating cost
    critChanceBonus: 5,
    critDamageBonus: 10,
    relevantStat: "diplomacy",
    statBonus: 3,
    benefits: [
      { effectType: "REVENUE_MULTIPLIER", value: 0.08, description: "+8% revenue" },
      { effectType: "CUSTOMER_BOOST", value: 15, description: "+15 base customers" },
      { effectType: "AVG_TICKET_BOOST", value: 20, description: "+20 avg ticket" },
    ],
    weaknesses: [
      { effectType: "HP_SHIELD", penalty: -3, description: "-3 shield mỗi vòng" },
    ],
    cardKeywords: ["campaign", "viral", "seo", "ads", "brand", "social"],
  },

  GRAPHIC_DESIGN: {
    key: "GRAPHIC_DESIGN",
    name: "Thiết Kế Đồ Họa",
    emoji: "🎨",
    revenueMult: 1.08,
    costMult: 1.00,
    critChanceBonus: 6,
    critDamageBonus: 12,
    relevantStat: "agility",
    statBonus: 2,
    benefits: [
      { effectType: "REVENUE_MULTIPLIER", value: 0.06, description: "+6% revenue" },
      { effectType: "REVIVAL", value: 1, description: "+1 chance revival" },
      { effectType: "FREE_CARD_SWAP", value: 2, description: "2 free card swaps mỗi vòng" },
    ],
    weaknesses: [
      { effectType: "CRIT_CHANCE", penalty: -2, description: "-2% crit chance" },
    ],
    cardKeywords: ["branding", "visual", "packaging", "launch", "rebrand"],
  },

  LAWYER: {
    key: "LAWYER",
    name: "Luật Sư",
    emoji: "⚖️",
    revenueMult: 1.00,
    costMult: 0.85,              // -15% operating cost (best cost reduction)
    critChanceBonus: 2,
    critDamageBonus: 5,
    relevantStat: "spirit",
    statBonus: 2,
    benefits: [
      { effectType: "COST_REDUCTION", value: 0.12, description: "-12% operating cost" },
      { effectType: "IMMUNITY", value: 1, description: "Miễn 1 debuff type" },
      { effectType: "TAX_REFUND", value: 0.03, description: "-3% tax rate" },
    ],
    weaknesses: [
      { effectType: "REVENUE_MULTIPLIER", penalty: -3, description: "-3% revenue" },
    ],
    cardKeywords: ["legal", "contract", "tax", "compliance", "crisis"],
  },

  ELECTRICAL_ENGINEER: {
    key: "ELECTRICAL_ENGINEER",
    name: "Kỹ Sư Điện",
    emoji: "⚡",
    revenueMult: 1.05,
    costMult: 0.80,              // -20% operating cost (electricity)
    critChanceBonus: 4,
    critDamageBonus: 8,
    relevantStat: "stamina",
    statBonus: 3,
    benefits: [
      { effectType: "COST_REDUCTION", value: 0.15, description: "-15% operating cost" },
      { effectType: "ENV_RESISTANCE", value: 0.20, description: "-20% env damage" },
      { effectType: "POWER_OUTAGE_PROTECT", value: 1, description: "Miễn mất điện" },
    ],
    weaknesses: [
      { effectType: "CUSTOMER_BOOST", penalty: -5, description: "-5 base customers" },
    ],
    cardKeywords: ["solar", "power", "wiring", "generator", "energy"],
  },
};
```

### 6.2. Profession Multiplier Calculation

```typescript
function getProfessionMultiplier(
  cardProfession: ProfessionKey,
  player: PlayerState,
): number {
  const main = player.mainProfession;
  const secondary = player.secondaryProfession;

  if (cardProfession === main) {
    return 1.0;   // Main profession: 100%
  } else if (cardProfession === secondary) {
    return 0.4;   // Secondary profession: 40%
  } else {
    return 0.1;   // Non-relevant: 10%
  }
}

function getProfessionStatBonus(player: PlayerState, stat: StatKey): number {
  const mainData = PROFESSION_DATA[player.mainProfession];
  const secData = PROFESSION_DATA[player.secondaryProfession];

  let bonus = player.stats[stat]; // Base stat

  // Profession gives +3 to relevant stat
  if (mainData.relevantStat === stat) bonus += mainData.statBonus;
  if (secData.relevantStat === stat) bonus += Math.floor(secData.statBonus * 0.4);

  // Level bonus: +1 stat every 2 levels
  bonus += Math.floor(player.level / 2);

  return Math.min(bonus, 100); // Cap at 100
}
```

---

## Phần 7: Card Gacha — Probability & Pity

### 7.1. Pack Opening

```typescript
// apps/api/src/modules/card/card.service.ts

interface PackOpeningResult {
  cards: CardInstance[];
  guaranteedRarity: Rarity;
  pityProgress: PityState;
  isPityTriggered: boolean;
}

function openPack(
  player: PlayerState,
  packType: "SMALL" | "MEDIUM" | "LARGE",
): PackOpeningResult {
  const packConfig = {
    SMALL: { cards: 3, cost: 15_000, guaranteed: "RARE" },
    MEDIUM: { cards: 5, cost: 49_000, guaranteed: "RARE" },
    LARGE: { cards: 10, cost: 99_000, guaranteed: "EPIC" },
  }[packType];

  // Get pity state
  const pity = getPityState(player);
  const isPityTriggered = pity.pityCounter >= 10;

  const cards: CardInstance[] = [];

  for (let i = 0; i < packConfig.cards; i++) {
    const isGuaranteedSlot = i === 0; // Slot đầu tiên luôn guaranteed

    const rarity = isGuaranteedSlot
      ? getGuaranteedRarity(packConfig.guaranteed, isPityTriggered)
      : rollRarity(pity);

    const card = selectCard(rarity, player);
    cards.push({
      ...card,
      instanceId: generateId(),
      obtainedAt: new Date(),
      isNew: true,
    });

    // Update pity counter
    if (rarity === "LEGENDARY") {
      pity.pityCounter = 0;
    } else {
      pity.pityCounter++;
    }
  }

  savePityState(player, pity);

  return { cards, guaranteedRarity: packConfig.guaranteed, pityProgress: pity, isPityTriggered };
}

function rollRarity(pity: PityState): Rarity {
  const roll = Math.random() * 100;

  if (roll < 5)  return "LEGENDARY";   // 5%
  if (roll < 20) return "EPIC";        // 15%  (5-20)
  if (roll < 50) return "RARE";        // 30%  (20-50)
  return "COMMON";                     // 50%  (50-100)
}

function getGuaranteedRarity(base: Rarity, isPity: boolean): Rarity {
  if (isPity) return "EPIC";

  const order: Rarity[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
  const minRarity = order.indexOf(base);

  const roll = Math.random() * 100;
  if (roll < 5 && minRarity <= 3) return "LEGENDARY";
  if (roll < 20 && minRarity <= 2) return "EPIC";
  if (roll < 50 && minRarity <= 1) return "RARE";
  return base;
}

function selectCard(rarity: Rarity, player: PlayerState): Card {
  const pool = ALL_CARDS.filter(c =>
    c.rarity === rarity &&
    !player.ownedCardIds.includes(c.id) // Chưa sở hữu → ưu tiên
  );

  // Fallback: đã sở hữu → vẫn cho duplicate
  const finalPool = pool.length > 0
    ? pool
    : ALL_CARDS.filter(c => c.rarity === rarity);

  return weightedRandom(finalPool);
}
```

---

## Phần 8: WebSocket Multiplayer — Chi Tiết

### 8.1. Connection & Authentication Flow

```
┌─────────────┐                           ┌──────────────┐
│   CLIENT    │                           │    SERVER    │
│  (Mobile)   │                           │   (NestJS)   │
└──────┬──────┘                           └──────┬───────┘
       │                                        │
       │  1. connect(socket, { token })        │
       │ ─────────────────────────────────────▶ │
       │                                        │ Validate JWT
       │                                        │ Create socket session
       │                                        │ Register in Redis
       │  2. connected({ playerId, socketId })  │
       │ ◀───────────────────────────────────── │
       │                                        │
       │  3. joinRoom({ roomId, inviteCode })   │
       │ ─────────────────────────────────────▶ │
       │                                        │ Check room exists
       │                                        │ Check room not full
       │                                        │ Check not already in room
       │                                        │ Add player to room
       │                                        │ Persist to DB
       │                                        │ Notify other players
       │  4. roomJoined({ roomState, playerId })│
       │  5. playerJoined({ playerId }) to others│
       │ ◀───────────────────────────────────── │
       │                                        │
       │  ... game plays ...                    │
       │                                        │
       │  6. disconnect()                       │
       │ ─────────────────────────────────────▶ │
       │                                        │ Mark isConnected=false
       │                                        │ Start 60s timeout
       │                                        │ (If no reconnect → kick)
       │                                        │
       │  7. reconnect(token) within 60s        │
       │ ─────────────────────────────────────▶ │
       │                                        │ Validate session
       │                                        │ Restore player state
       │                                        │ Clear timeout
       │  8. stateResync({ fullState })        │
       │ ◀───────────────────────────────────── │
       │                                        │
       │  9. continue playing...                │
```

### 8.2. Real-Time State Sync

```typescript
// Server emits state after EVERY change
// Client uses Zustand store with optimistic updates

interface RoomState {
  roomId: string;
  status: RoomStatus;
  currentRound: number;
  storeType: StoreType;
  environment: Environment | null;
  turnOrder: string[];            // playerIds in order
  currentPlayerIndex: number;     // Whose turn
  phase: "DRAW" | "ACTION" | "RESOLUTION" | "CLEANUP";

  players: Record<string, PlayerRoomState>;
  // Key by playerId for O(1) lookup
}

interface PlayerRoomState {
  playerId: string;
  displayName: string;
  avatarUrl: string;
  profession: { main: ProfessionKey; secondary: ProfessionKey };
  stats: BaseStats;

  // In-game
  hp: number;
  money: number;
  energy: number;
  maxEnergy: number;
  hand: CardInstance[];           // Chỉ visible cho owner
  handCount: number;             // Số lá trên tay (visible cho all)

  // Slots (only visible for owner, hidden for others)
  slots: (CardInstance | null)[]; // 5 slots
  lockedCardId: string | null;

  // Status
  isReady: boolean;
  isConnected: boolean;
  isDead: boolean;

  // Active effects
  activeEffects: ActiveEffect[];
  activeShield: number;

  // Round results (after resolution)
  lastRoundRevenue?: number;
  lastRoundCost?: number;
  lastRoundProfit?: number;
  lastRoundCrits?: number;
}

// Client subscribes to specific room
socket.on(`room:${roomId}`, (event: RoomEvent) => {
  switch (event.type) {
    case "ROOM_STATE_CHANGED":
      gameStore.setState(event.state);        // Full state replacement
      break;
    case "PLAYER_UPDATED":
      gameStore.updatePlayer(event.playerId, event.changes);
      break;
    case "HAND_DEALT":
      gameStore.dealHand(event.cards);        // Optimistic
      break;
    case "CARD_RESOLVED":
      gameStore.animateCard(event);          // Play animation
      break;
    case "ROUND_ENDED":
      gameStore.showRoundEnd(event.results);  // Summary screen
      break;
    case "PLAYER_DIED":
      gameStore.markPlayerDead(event.playerId);
      break;
    case "ENV_CHANGED":
      gameStore.setEnvironment(event.env);
      break;
  }
});
```

### 8.3. Optimistic Updates (Client)

```typescript
// Client-side optimistic update pattern
function playCard(cardInstanceId: string, slotIndex: number) {
  const card = gameStore.getCard(cardInstanceId);

  // 1. Optimistic update (UI immediately)
  gameStore.moveCardToSlot(cardInstanceId, slotIndex);
  gameStore.deductEnergy(card.energyCost);
  gameStore.setReady(true);

  // 2. Send to server
  socket.emit("playCards", { slotAssignments: [{ cardInstanceId, slotIndex }] });

  // 3. Server validates
  // 4. If server rejects:
  socket.once("cardRejected", (error) => {
    // 5. Rollback optimistic update
    gameStore.rollbackMove(cardInstanceId);
    gameStore.refundEnergy(card.energyCost);
    gameStore.setReady(false);

    // 6. Show error
    showToast(error.message);
  });
}
```

---

## Phần 9: Progression System

### 9.1. XP & Level Calculation

```typescript
// apps/api/src/modules/player/player.service.ts

function calculateXPForRound(result: RoundResult): XPBreakdown {
  const xpSources: XPEntry[] = [];

  // Base: survive
  xpSources.push({ source: "SURVIVE", amount: 20 });

  // Bonus: reach milestones
  if (result.round === 10) xpSources.push({ source: "ROUND_10", amount: 200 });
  if (result.round === 20) xpSources.push({ source: "ROUND_20", amount: 1000 });

  // Bonus: game outcome
  if (result.survivedAll) {
    xpSources.push({ source: "SURVIVED_ALL", amount: 500 });
  }

  // Bonus: MVP
  if (result.isMVP) {
    xpSources.push({ source: "MVP", amount: 100 });
  }

  // Bonus: performance
  if (result.profit > 5000) xpSources.push({ source: "HIGH_PROFIT", amount: 50 });
  if (result.critCount >= 3) xpSources.push({ source: "CRIT_STAR", amount: 30 });

  // Bonus: streak
  if (result.consecutiveProfit >= 5) {
    xpSources.push({ source: "STREAK_5", amount: 100 });
  }

  const total = xpSources.reduce((sum, e) => sum + e.amount, 0);

  return { total, breakdown: xpSources };
}

function calculateLevel(xp: number): LevelInfo {
  let level = 1;
  let remainingXP = xp;

  while (remainingXP >= xpNeededForLevel(level)) {
    remainingXP -= xpNeededForLevel(level);
    level++;
  }

  return {
    level,
    currentXP: remainingXP,
    xpToNextLevel: xpNeededForLevel(level),
    progress: remainingXP / xpNeededForLevel(level),
  };
}

function xpNeededForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
  // lv1: 100, lv2: 150, lv3: 225, lv4: 338, lv5: 506
  // lv10: 2887, lv20: 33252, lv30: 382072
}
```

---

## Phần 10: Daily Quest System

### 10.1. Quest Tracking (Server-Side)

```typescript
// apps/api/src/modules/quest/quest.service.ts

const DAILY_QUESTS = [
  {
    key: "PLAY_GAME",
    name: "Chơi 1 ván",
    description: "Hoàn thành 1 trận đấu",
    target: 1,
    reward: { type: "COIN", amount: 50 },
    trackEvent: "GAME_COMPLETED",
  },
  {
    key: "USE_5_CARDS",
    name: "Sử dụng 5 lá bài",
    description: "Đánh 5 lá bài trong 1 vòng",
    target: 5,
    reward: { type: "PACK_KEY", amount: 1 },
    trackEvent: "CARD_PLAYED",
    condition: (context) => context.cardsPlayed >= 5,
  },
  {
    key: "PROFIT_1000",
    name: "Lợi nhuận 1,000",
    description: "Đạt 1,000 profit trong 1 vòng",
    target: 1000,
    reward: { type: "ENERGY", amount: 10 },
    trackEvent: "ROUND_PROFIT",
    condition: (context) => context.profit >= 1000,
  },
];

function processQuestProgress(
  playerId: string,
  event: QuestEvent,
): QuestUpdate[] {
  const today = getTodayUTC();
  const quests = getDailyQuestsForPlayer(playerId, today);

  const updates: QuestUpdate[] = [];

  for (const quest of quests) {
    if (quest.completed) continue;

    // Find matching event type
    const matchingQuest = DAILY_QUESTS.find(q => q.key === quest.key);
    if (!matchingQuest || matchingQuest.trackEvent !== event.type) continue;

    // Check condition
    if (matchingQuest.condition && !matchingQuest.condition(event.context)) {
      continue;
    }

    // Increment progress
    quest.progress = Math.min(quest.progress + 1, matchingQuest.target);

    if (quest.progress >= matchingQuest.target) {
      quest.completed = true;
      quest.completedAt = new Date();
      updates.push({
        questKey: quest.key,
        progress: quest.progress,
        completed: true,
        reward: matchingQuest.reward,
        showRewardPopup: true,
      });
    } else {
      updates.push({
        questKey: quest.key,
        progress: quest.progress,
        completed: false,
        reward: null,
        showRewardPopup: false,
      });
    }
  }

  saveQuests(quests);
  return updates;
}
```

---

## Phần 11: Matchmaking & Room Management

### 11.1. Room Creation & Join Flow

```typescript
// apps/api/src/modules/room/room.service.ts

async function createRoom(hostId: string, config: CreateRoomConfig): Promise<GameRoom> {
  // Validate host
  const host = await getPlayer(hostId);

  // Generate unique invite code (6 chars)
  const inviteCode = generateInviteCode();

  const room = await prisma.gameRoom.create({
    data: {
      hostId,
      inviteCode,
      name: config.name ?? `${host.displayName}'s Room`,
      maxPlayers: config.maxPlayers ?? 5,
      status: "WAITING",
      config: {
        roundTimeLimit: config.roundTimeLimit ?? 60,
        storeTypes: config.storeTypes ?? ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"],
        votingTimeLimit: config.votingTimeLimit ?? 30,
      },
    },
  });

  // Add host as player
  await addPlayerToRoom(room.id, hostId, /* isHost */ true);

  return room;
}

async function joinRoom(
  playerId: string,
  roomIdOrCode: string,
): Promise<JoinResult> {
  // Find by ID or invite code
  const room = await prisma.gameRoom.findFirst({
    where: {
      OR: [
        { id: roomIdOrCode },
        { inviteCode: roomIdOrCode.toUpperCase() },
      ],
    },
  });

  if (!room) return { success: false, error: "ROOM_NOT_FOUND" };

  if (room.status !== "WAITING") {
    return { success: false, error: "ROOM_NOT_ACCEPTING_PLAYERS" };
  }

  const currentPlayers = await getPlayerCount(room.id);
  if (currentPlayers >= room.maxPlayers) {
    return { success: false, error: "ROOM_FULL" };
  }

  const existing = await getPlayerInRoom(room.id, playerId);
  if (existing) {
    return { success: false, error: "ALREADY_IN_ROOM" };
  }

  await addPlayerToRoom(room.id, playerId, /* isHost */ false);

  // Initialize player state
  const player = await getPlayer(playerId);
  await prisma.playerState.create({
    data: {
      roomId: room.id,
      playerId,
      hp: 100,
      money: 5000,
      energy: 100,
      maxEnergy: 100,
      hand: [],
      slots: [null, null, null, null, null],
      effects: [],
    },
  });

  return { success: true, room };
}

async function startGame(roomId: string, hostId: string): Promise<void> {
  const room = await getRoom(roomId);

  if (room.hostId !== hostId) {
    throw new ForbiddenException("Only host can start");
  }

  const playerCount = await getPlayerCount(roomId);
  if (playerCount < 2) {
    throw new BadRequestException("Need at least 2 players");
  }

  // Transition to VOTING
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: { status: "VOTING" },
  });

  // Broadcast voting phase
  const options = selectStoreTypeOptions(room.config.storeTypes);
  broadcastToRoom(roomId, { type: "VOTING_STARTED", options });

  // Wait for all votes
  await waitForAllVotes(roomId, room.config.votingTimeLimit);

  // Determine winning store type
  const winningStore = tallyVotes(roomId);
  await prisma.gameRoom.update({
    where: { id: roomId },
    data: {
      status: "RUNNING",
      storeType: winningStore,
      currentRound: 0,
      startedAt: new Date(),
    },
  });

  // Initialize all player decks
  await initializeDecks(roomId, winningStore);

  // Start first round
  await executeRound(roomId, /* round 1 */);
}
```

---

## Phần 12: Anti-Cheat & Security

### 12.1. Server-Side Validation Checklist

```typescript
// apps/api/src/common/guards/game-integrity.guard.ts

async function validateGameAction(
  playerId: string,
  action: GameAction,
): Promise<ValidationResult> {

  // 1. Rate limit check (10 actions/second)
  const rateKey = `ratelimit:${playerId}`;
  const rateCount = await redis.incr(rateKey);
  if (rateCount === 1) await redis.expire(rateKey, 1);
  if (rateCount > 10) return { valid: false, reason: "RATE_LIMITED" };

  // 2. Player is in a valid room
  const playerState = await getPlayerState(playerId);
  if (!playerState) return { valid: false, reason: "NOT_IN_GAME" };

  // 3. Game is in correct phase
  if (playerState.room.status !== "RUNNING") {
    return { valid: false, reason: "GAME_NOT_RUNNING" };
  }
  if (playerState.room.currentPhase !== "ACTION") {
    return { valid: false, reason: "NOT_ACTION_PHASE" };
  }

  // 4. Player hasn't already clicked ready
  if (playerState.isReady && action.type === "READY") {
    return { valid: false, reason: "ALREADY_READY" };
  }

  // 5. For card play actions:
  if (action.type === "PLAY_CARDS") {
    // 5a. Card belongs to player
    for (const assignment of action.slotAssignments) {
      const card = await getCardInstance(assignment.cardInstanceId);
      if (!card || card.ownerId !== playerId) {
        return { valid: false, reason: "CARD_NOT_OWNED", cardId: assignment.cardInstanceId };
      }

      // 5b. Card is in hand
      if (!playerState.hand.includes(assignment.cardInstanceId)) {
        return { valid: false, reason: "CARD_NOT_IN_HAND" };
      }

      // 5c. Valid slot
      if (assignment.slotIndex < 0 || assignment.slotIndex > 4) {
        return { valid: false, reason: "INVALID_SLOT" };
      }

      // 5d. Slot type matches card type (or is SPECIAL)
      const slotType = SLOT_TYPES[assignment.slotIndex];
      if (card.timing !== slotType && slotType !== "SPECIAL") {
        return { valid: false, reason: "WRONG_SLOT_TYPE" };
      }

      // 5e. Has enough resources
      if (playerState.energy < card.energyCost) {
        return { valid: false, reason: "INSUFFICIENT_ENERGY" };
      }
      if (playerState.money < card.moneyCost) {
        return { valid: false, reason: "INSUFFICIENT_MONEY" };
      }

      // 5f. Card is playable this round
      if (action.round < card.minRound) {
        return { valid: false, reason: "CARD_NOT_AVAILABLE_YET" };
      }
    }

    // 5g. Timestamp sanity check (can't play faster than human)
    const timeSinceLastAction = Date.now() - playerState.lastActionAt.getTime();
    if (timeSinceLastAction < 200) { // 200ms minimum between actions
      return { valid: false, reason: "ACTION_TOO_FAST" };
    }
  }

  return { valid: true };
}
```

### 12.2. State Hash Verification

```typescript
// Periodic state hash for tamper detection
function computeRoomStateHash(room: GameRoom, players: PlayerState[]): string {
  const data = {
    round: room.currentRound,
    storeType: room.storeType,
    envKey: room.environment?.key,
    players: players.map(p => ({
      id: p.playerId,
      hp: p.hp,
      money: p.money,
      energy: p.energy,
      handCount: p.hand.length,
    })),
    timestamp: Date.now(),
  };

  return crypto.createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

// Server stores hash after each round
await redis.set(`hash:${roomId}:${round}`, hash, "EX", 86400);
```

---

## Phần 13: Edge Cases & Error Handling

### 13.1. Full Deck & Discard

```
Deck exhaustion:
  IF drawPhase AND deck.length < cardsNeeded:
    IF discardPile.length > 0:
      shuffle discardPile → deck
      draw from deck
    ELSE:
      draw as much as possible from deck
      rest = cardsNeeded - drawn
      // No more cards → player gets fewer cards (disadvantage)

Discard pile:
  - All unplayed cards go to discard at cleanup
  - Locked card stays in hand (NOT in discard)
  - INSTANT duration cards go to discard
  - PERMANENT cards: stay in play (not in discard)
```

### 13.2. Simultaneous Death

```
If multiple players die in the same round:
  1. Check all deaths
  2. If ALL die → Game Over, no winner
  3. If some die, some survive → Survivors continue
  4. Dead players: their cards are discarded
  5. Dead players CANNOT affect surviving players (no steal, no damage)
  6. Dead players still pay operating cost (their business is closed)
  7. Dead players' locked cards are NOT preserved
```

### 13.3. AFK & Disconnection

```
AFK Detection (no action for 60s during ACTION phase):
  → Server auto-passes (leaves slots empty)
  → Counts as READY

Disconnection:
  → isConnected = false
  → 60-second reconnect window
  → During disconnect: player auto-passes each round
  → After 60s: player is kicked, slots left empty
  → Rejoining: restore state and continue

Host disconnection:
  → Host migrates to next player in turn order
  → If no one else → Room ABORTED
```

### 13.4. Tie-Breaking

```
Turn order tie (same speed):
  → Use deterministic random based on (roundSeed + playerId)
  → Log tie-breaking for debugging

Store vote tie:
  → Server picks randomly from tied options
  → Broadcast "TIE BREAKER: [storeType]"

Scoring tie (final score):
  → Tiebreaker 1: Higher HP
  → Tiebreaker 2: More rounds survived
  → Tiebreaker 3: Higher total revenue
  → Tiebreaker 4: Alphabetical playerId (deterministic)
```

### 13.5. Edge Case: Negative Money

```
If money goes negative in a round:
  1. Money = negative value (player is in debt)
  2. Mark consecutiveRoundsCannotPay++
  3. If consecutiveRoundsCannotPay >= 2 → DEATH (Bankrupt)
  4. Debt carries over to next round
  5. Loan card (LOAN effect): -1000 money now, -1200 next round
     → This is the ONLY way to go negative legitimately
     → Any other negative = bug or manipulation
```

---

## Phần 14: Summary — Constants Reference

```typescript
// packages/constants/src/game.constants.ts

export const GAME_CONSTANTS = {
  // Economy
  STARTING_CAPITAL: 5000,
  STARTING_HP: 100,
  MAX_HP: 100,
  STARTING_ENERGY: 100,
  MAX_ROUNDS: 20,
  ROUND_COST_GROWTH_RATE: 0.10,        // 10% mỗi vòng
  AVG_TICKET_GROWTH_PER_ROUND: 15,
  BASE_CUSTOMERS: 50,
  BASE_AVG_TICKET: 100,

  // Stats
  STAT_BASE: 10,
  STAT_MAX: 100,
  STAT_GAIN_PER_LEVEL: 1,

  // Cards
  HAND_SIZE: 5,
  SLOT_COUNT: 5,
  CARDS_PER_PACK_SMALL: 3,
  CARDS_PER_PACK_MEDIUM: 5,
  CARDS_PER_PACK_LARGE: 10,

  // Timing
  DRAW_PHASE_DURATION: 5,               // seconds
  ACTION_PHASE_DURATION: 60,            // seconds
  RESOLUTION_PHASE_DURATION: 3,         // seconds
  CLEANUP_PHASE_DURATION: 2,            // seconds
  VOTING_PHASE_DURATION: 30,            // seconds
  RECONNECT_TIMEOUT: 60,                 // seconds
  AFK_TIMEOUT: 60,                      // seconds

  // Progression
  XP_SURVIVE_ROUND: 20,
  XP_WIN_GAME: 500,
  XP_MVP: 100,
  XP_ROUND_10: 200,
  XP_ROUND_20: 1000,
  LEVEL_XP_BASE: 100,
  LEVEL_XP_EXPONENT: 1.5,

  // Multiplayer
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 5,

  // Rarity
  RARITY_COMMON_CHANCE: 50,            // %
  RARITY_RARE_CHANCE: 30,
  RARITY_EPIC_CHANCE: 15,
  RARITY_LEGENDARY_CHANCE: 5,

  // Crit
  BASE_CRIT_CHANCE: 5,                 // %
  BASE_CRIT_DAMAGE: 1.5,               // ×mult

  // Profession
  MAIN_MULT: 1.0,
  SECONDARY_MULT: 0.4,
  NON_RELEVANT_MULT: 0.1,

  // Energy
  ENERGY_RESTORE_PER_ROUND: 50,         // % of max
  ENERGY_RESTORE_FLAT: 50,              // flat amount

  // Environment
  ENV_TRIGGER_CHANCE: 0.30,            // 30% mỗi vòng
  ENV_DURATION_MIN: 1,
  ENV_DURATION_MAX: 3,

  // Safety
  MIN_ACTION_INTERVAL: 200,            // ms
  RATE_LIMIT_PER_SECOND: 10,
  MAX_LOCKED_CARDS: 1,
} as const;
```
