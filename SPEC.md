# SPEC.md — Project Sunny: Complete System Specification

> **Version:** 1.0 — Pre-Development
>
> **Author:** Bùi Nhật Đức Anh — CEO LOOP Solutions
>
> **Last Updated:** 2026-05-23
>
> **Status:** PLANNING — Not yet implemented

---

## Phần 0: Tóm Tắt Điều Hành

**Project Sunny** là tựa game mobile card-based strategy + business simulation lấy cảm hứng từ hành trình khởi nghiệp của người trẻ Việt Nam. Người chơi hợp tác trong nhóm 5 người, sử dụng hệ thống thẻ bài để điều khiển cửa hàng, đối phó rủi ro thị trường, và cùng nhau sống sót đến Vòng 20.

**Điểm khác biệt cốt lõi (USP):**
- Game khởi nghiệp Việt Nam đầu tiên dạng card-based co-op
- Thẻ bài AI-generated với hiệu ứng kinh doanh thực tế
- Không P2W — 100% dựa trên chiến thuật nhóm

---

## Phần 1: Phân Tích Thị Trường & Định Vị

### 1.1. Benchmark Games

| Game | Điểm mạnh | Điểm yếu | Bài học cho Sunny |
|---|---|---|---|
| **Slay the Spire** | Card combat hay, roguelike, replayability cao | Solo, không social | Hệ thống thẻ bài + chiến lược |
| **Monopoly Go** | Thu hút đại chúng, social, nhắc nhở liên tục | Pay-to-win nhẹ, lặp | Retention loop + social push |
| **Hay Day** | Sim kinh doanh nhẹ nhàng, hấp dẫn | Không multiplayer thời gian thực, chậm | Cảm giác quản lý cửa hàng |
| **Dawn of the Dragons** | Co-op multiplayer card game | Graphic nặng, server cũ | Luồng co-op card game |
| **Coin Master** | Daily loop cực mạnh, social farming | Spin-based, gambling feel | Daily engagement loop |

### 1.2. Thị Trường Đích

- **Primary:** Người chơi mobile 18-35 tuổi tại Việt Nam & Đông Nam Á
- **Secondary:** Người chơi casual strategy toàn cầu (Steam/Epic potential sau này)
- **Xu hướng:** Card game + simulation hybrid đang tăng trưởng mạnh (Slay the Spire 5M+, Wild Rift gần 10M)

### 1.3. Rủi Ro Thị Trường

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| Không đủ content giữ chân người chơi | Cao | Phase-based release, 200+ cards ngay launch |
| Server lag gây desync multiplayer | Rất cao | Room-based architecture, optimistic UI |
| Cheat/exploit trong multiplayer | Cao | Server-side validation, state hash |
| Khó scale từ 100 → 1000+ CCU | Trung bình | Horizontal scaling từ đầu |
| Người chơi hết energy → quit | Trung bình | Soft energy, not hard cap ban đầu |

---

## Phần 2: Gameplay System — Chi Tiết Đầy Đủ

### 2.1. Game Modes

#### 2.1.1. Survival Mode (Chế độ chính)
- **5 người chơi** cùng một lobby
- Mục tiêu: Sống sót đến **Vòng 20** (mỗi vòng = 1 tháng)
- Thắng: Toàn bộ team còn sống ở Vòng 20, hoặc HP cao nhất khi người cuối cùng chết
- Thua: Toàn bộ team chết trước Vòng 20

#### 2.1.2. Endless Mode (Post-launch)
- Không giới hạn vòng, chơi đến khi team chết hết
- Leaderboard riêng theo số vòng sống sót cao nhất

#### 2.1.3. Solo Practice (Post-launch)
- Chơi một mình với AI bot
- Không nhận thưởng, chỉ để luyện tập

### 2.2. Vòng Lặp Game (Game Loop)

```
┌─────────────────────────────────────────────────┐
│                    1 ROUND (1 Tháng)              │
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │   DRAW   │──▶│  ACTION  │──▶│RESOLUTION│     │
│  │  Phase   │   │  Phase   │   │  Phase   │     │
│  └──────────┘   └──────────┘   └──────────┘     │
│       │              │              │            │
│       │              │              ▼            │
│       │              │        ┌──────────┐       │
│       │              │        │ CLEAN UP │       │
│       │              │        │  Phase   │       │
│       │              │        └──────────┘       │
│       │              │              │            │
│       │              ▼              ▼            │
│  Server gửi     Player kéo/thả   Tính kết quả   │
│  5 lá bài       bài vào slots    + render       │
│                                                  │
└─────────────────────────────────────────────────┘
       ▲                                           │
       │           Next Round                      │
       └───────────────────────────────────────────┘
```

#### DRAW Phase (5-10 giây)
- Server phát **5 lá bài** cho mỗi người chơi
- Nếu hand < 5, bổ sung từ deck
- Nếu deck hết → reshuffle discard pile
- Người chơi xem hand, không action được

#### ACTION Phase (30-60 giây — configurable)
- Người chơi kéo/thả bài vào **5 Slot** trên bàn
- Mỗi Slot có loại: `revenue`, `cost`, `buff`, `defense`, `special`
- Nút **"Sẵn sàng"** chỉ bật khi tất cả slot đã điền HOẶC player chọn "pass"
- Người chơi có thể **khóa 1 lá** giữ lại cho vòng sau
- Energy bar hiển thị tổng phí kích hoạt

#### RESOLUTION Phase (Server xử lý)
- **Bước 1:** Xác định thứ tự người chơi (Speed stat)
- **Bước 2:** Môi trường hiện tại được áp dụng
- **Bước 3:** Từng người chơi lật bài theo thứ tự (Slot trái → phải)
- **Bước 4:** Tính revenue, costs, buffs, debuffs
- **Bước 5:** Kiểm tra HP, loại bỏ người chơi chết
- **Bước 6:** Gửi kết quả về tất cả client

#### CLEAN UP Phase (3 giây)
- Xóa bài tạm thời (duration ≠ permanent)
- Giảm duration buffs/debuffs đang active
- Tính XP thưởng
- Chuyển bài chưa dùng → discard pile
- Hiển thị animation "Tháng X kết thúc"

### 2.3. Hệ Thống Thẻ Bài — Chi Tiết

#### 2.3.1. Cấu Trúc Thẻ Bài

```
Card {
  id: string
  cardKey: string           // VD: "sw_001", "mk_003"
  name: string
  description: string
  type: CardType
  rarity: Rarity
  storeTypes: StoreType[]    // Loại hình cửa hàng áp dụng
  professionKey: string      // Ngành nghề chính liên quan

  // Stats
  baseRevenue: number         // Tiền base tạo ra
  baseCost: number           // Chi phí trả trước
  energyCost: number          // Thể lực tiêu tốn
  waterCost: number           // Nước tiêu tốn
  powerCost: number           // Điện tiêu tốn

  // Effects (nhiều effect có thể kết hợp)
  effects: CardEffect[]

  // Timing
  duration: Duration         // INSTANT | SHORT(6) | LONG(12) | PERMANENT
  timing: Timing             // REVENUE | COST | BUFF | DEFENSE | SPECIAL

  // Visual
  imageUrl: string
  color: string              // Màu theo rarity
  iconEmoji: string          // VD: 💻 🍜 📱
}

CardEffect {
  type: EffectType
  value: number
  condition?: EffectCondition // Trigger condition
}

EffectType =
  | "REVENUE_BOOST"         // +% revenue cho 1 category
  | "COST_REDUCTION"        // -% operating cost
  | "CUSTOMER_BOOST"        // +N customers
  | "CRIT_CHANCE"           // % chance nhân đôi revenue
  | "CRIT_DAMAGE"           // % nhân đôi damage
  | "DAMAGE_REDUCTION"       // Giảm debuff damage
  | "ENERGY_GAIN"           // +N energy
  | "INSTANT_REVENUE"        // +N tiền ngay lập tức
  | "INSTANT_DAMAGE"         // -N HP (thẻ tấn công/thị trường)
  | "DRAW_CARD"             // +N cards vòng này
  | "LOCK_CARD"             // Khóa 1 lá miễn phí
  | "REVIVAL"              // Hồi sinh 1 lần khi chết
  | "IMMUNITY"             // Miễn nhiễm 1 debuff type
  | "STEAL"                // Trộm revenue từ đối thủ
  | "TAX_SHIELD"           // Miễn thuế 1 vòng
  | "POWER_OUTAGE_PROTECT"  // Miễn mất điện 1 vòng
  | "ENV_RESISTANCE"        // -% environmental damage
  | "GUILD_DONATION"        // Chia sẻ revenue cho guild
  | "MARKETING_STUNT"       // Giảm revenue đối thủ gần

Rarity {
  COMMON    = 50% drop rate
  RARE      = 30% drop rate
  EPIC      = 15% drop rate
  LEGENDARY = 5% drop rate
}
```

#### 2.3.2. Card Pool Design (200+ Cards)

**Theo Store Type (loại hình cửa hàng):**

| Store Type | Tổng lá | Đặc thù |
|---|---|---|
| Cafe / Quán ăn | 50 | Thực phẩm, vệ sinh, không gian |
| Cửa hàng Quần áo | 50 | Thời trang, mùa vụ, sizing |
| Điện thoại / Điện tử | 50 | Công nghệ, bảo hành, phụ kiện |
| Agency Quảng cáo | 50 | Marketing, content, PR |

**Theo Profession (ngành nghề):**

| Profession | Tổng lá đặc thù | Đặc thù |
|---|---|---|
| Kỹ thuật phần mềm | 12 | System, app, automation, AI |
| Kỹ thuật phần cứng | 12 | Repair, maintenance, equipment |
| Marketing | 12 | Campaign, social, SEO, viral |
| Thiết kế đồ họa | 12 | Branding, visual, packaging |
| Luật sư | 12 | Legal, tax, contract, crisis |
| Kỹ sư điện | 12 | Power, solar, safety, wiring |

**Universal Cards (40 lá):** Áp dụng cho mọi store type
- Emergency fund, Insurance, Staff training, Renovation, Grand opening...

**Theo Game Phase:**

| Phase | Vòng | Card Power | Avg Revenue/Cost |
|---|---|---|---|
| Early | 1-5 | 10-50 | 100-300 |
| Mid | 6-12 | 40-120 | 300-800 |
| Late | 13-20 | 80-250 | 600-2000 |
| Endless | 21+ | 150-400 | 1000-5000 |

#### 2.3.3. Card Gacha System

- **Card Pack:** Mở bằng key (kiếm được từ quest) hoặc mua IAP
- Mỗi pack: 3 lá bài
- Guaranteed: 1 Rare trở lên mỗi pack
- Pity system: 10 pack liên tiếp không có Epic → pack thứ 11 guaranteed Epic

### 2.4. Hệ Thống Kinh Tế — Công Thức Đầy Đủ

#### 2.4.1. Core Economy Loop

```
ROUND_START:
  revenue      = calculateRevenue(players)
  operatingCost = calculateOperatingCost(round)
  cardCosts    = sum(card.energyCost + card.baseCost)
  envDamage    = calculateEnvDamage(envType, round)

  totalCost    = operatingCost + cardCosts + envDamage
  profit       = revenue - totalCost

  IF profit >= 0:
    money += profit
    hp    += profit / 100   // Kiếm profit = hồi HP nhẹ
  ELSE:
    money -= abs(profit)
    hp    -= abs(profit)

  IF money < 0 FOR 2 consecutive rounds:
    player dies
  IF hp <= 0:
    player dies
```

#### 2.4.2. Revenue Calculation

```
calculateRevenue(player, round, env):
  baseCustomers = 50 + (diplomacy × 3)
  cardCustomers = sum(effect.type === "CUSTOMER_BOOST" ? effect.value : 0)

  envMod = env.customerMultiplier     // Đại dịch: 0.7, Bình thường: 1.0
  professionMod = 1.0 + (relevantStat / 200)  // VD: marketing = +15% ở 10 stat
  cardMod = 1.0 + sumBuffs(REVENUE_BOOST)
  streakMod = 1.0 + (consecutiveProfitRounds × 0.05) // Max 1.5

  customers = floor((baseCustomers + cardCustomers) × envMod)
  avgTicket = 100 + (round × 15) + cardRevenueBonus

  grossRevenue = customers × avgTicket × cardMod × professionMod × streakMod

  // Crit calculation
  critChance = 5% + (relevantCritBonus / 100) + (profession × 3%)
  IF random() < critChance:
    critMult = 1.5 + (relevantCritDmg / 100)
    grossRevenue *= critMult

  RETURN floor(grossRevenue)
```

#### 2.4.3. Operating Cost

```
calculateOperatingCost(round, storeType, env):
  baseCost = 500

  roundMod = 1.1 ^ (round - 1)         // Tăng 10%/vòng
  storeMod = STORE_COST_MODIFIER[storeType]  // Cafe: 1.2, Clothing: 1.0, ...
  envMod   = env.costMultiplier            // Đại dịch: 1.3, Bầy quạ: 1.25
  taxMod   = 1.0 + (taxCardPenalty / 100)

  totalCost = floor(baseCost × roundMod × storeMod × envMod × taxMod)

  RETURN totalCost
```

#### 2.4.4. Environment Damage

```
ENV_EFFECTS = {
  PANDEMIC:     { customerMod: 0.65, costMod: 1.25, revenueCat: ["offline", "food"] }
  WAR:          { customerMod: 0.80, costMod: 1.15, revenueCat: ["clothing", "electronics"] }
  LOCUST_SWARM: { customerMod: 0.75, costMod: 1.30, revenueCat: ["food", "daily"] }
  TECH_BOOM:    { customerMod: 1.50, costMod: 0.90, revenueCat: ["electronics"] }
  GOVT_AID:     { customerMod: 1.00, costMod: 0.80, bonusMoney: 800, monthlyBonus: 400 }
  VIRAL_TREND:  { customerMod: 1.20, costMod: 1.00, marketingMult: 2.0 }
  RECESSION:    { customerMod: 0.50, costMod: 1.50, allCat: true }
  GOLDEN_AGE:   { customerMod: 1.30, costMod: 1.00, allCat: true }
}

Env trigger: Mỗi vòng có 30% chance kích hoạt env mới
- 60% chance: environment trung lập (không gì xảy ra)
- 25% chance: bad environment
- 15% chance: good environment
- Env duration: 1-3 vòng ngẫu nhiên
- Env stacking: Không — 1 env active tại mỗi thời điểm
```

### 2.5. Hệ Thống Chỉ Số & Progression

#### 2.5.1. Base Stats (0-100)

| Stat | Base | Max | Per Level Up | Hiệu ứng gameplay |
|---|---|---|---|---|
| **Trí lực** (Intelligence) | 10 | 100 | +1 | Mở khóa lá bài tier cao; +2% REVENUE_BOOST effect |
| **Thể lực** (Stamina) | 10 | 100 | +2 | Max energy = 100 + (stamina × 2); +1 max energy/lv |
| **Tốc độ** (Speed) | 10 | 100 | +1 | Thứ tự đánh bài ưu tiên; +1 speed priority/round |
| **Tinh thần** (Spirit) | 10 | 100 | +1 | -1% debuff damage nhận; +5% immunity chance |
| **Linh hoạt** (Agility) | 10 | 100 | +1 | Miễn phí 1 card swap/vòng; +3% lock card efficiency |
| **Ngoại giao** (Diplomacy) | 10 | 100 | +1 | +3 base customers; +1% customer retention |

#### 2.5.2. Level Progression

```
Level Threshold:
  XPneeded(lv) = floor(100 × 1.5^lv)  // lv 1: 100, lv 5: 506, lv 10: 2887

XP Sources:
  - Survive 1 round:     +20 XP
  - Reach Round 10:      +200 XP bonus
  - Reach Round 20:      +1000 XP bonus
  - Win (survive all):   +500 XP
  - MVP (highest HP):    +100 XP
  - Daily quest done:    +30-80 XP
  - Achievement unlock:  +50-500 XP
```

#### 2.5.3. Meta Progression (Ngoài trận đấu)

- **Card Back Collection:** Unlock bằng achievement + IAP
- **Avatar Frames:** Unlock bằng season rank
- **Titles:** Unlock bằng win count, survival rounds
- **Stat Boosts:** Mua bằng in-game currency (không ảnh hưởng gameplay trong trận)

### 2.6. Hệ Thống Phần Thưởng & Thất Bại

#### 2.6.1. Comeback Mechanics

```
COMEBAĆK TRIGGERS = {
  "Near Death":       HP < 20%       → Unlock "Desperation Mode": +20% card effects
  "Losing Streak":    3 loss rounds  → Boss Card appears (high risk, high reward)
  "Outnumbered":      < 3 players    → +30% all revenue
  "Last Stand":       Final player   → Final player gets "Hero Bonus": +50% revenue
}
```

#### 2.6.2. Scoring System

```
FINAL_SCORE = (
  baseScore × 100                          // Mỗi vòng sống = 100 điểm
  + totalRevenue                            // Tổng doanh thu
  + totalProfit                             // Tổng lợi nhuận
  + (survivingPlayers × 500)               // Bonus đồng đội sống sót
  + (cardsPlayed × 10)                    // Bonus sử dụng nhiều bài
  - (deaths × 1000)                        // Phạt chết
  - (roundsFailedToPay × 200)             // Phạt không trả được chi phí
)

MVP = Player với điểm cao nhất trong lobby
```

---

## Phần 3: Retention & Live Operations

### 3.1. Daily Loop

| Hoạt động | Tần suất | Phần thưởng |
|---|---|---|
| Đăng nhập hàng ngày | 1x/ngày | Day 1-7: xu → Day 7: Card Pack |
| Daily Quest × 3 | Mỗi ngày | 50-200 xu + Card Pack key fragment |
| Lượt chơi đầu tiên | Mỗi ngày | +50% XP cho trận đầu tiên |
| Daily login streak | Liên tục | Streak bonus: ×1.1 → ×2.0 |

### 3.2. Weekly Loop

| Hoạt động | Tần suất | Phần thưởng |
|---|---|---|
| Weekly Quest × 5 | Mỗi tuần | 500-2000 xu + Title unlocks |
| Leaderboard reset | Chủ nhật | Top 10 nhận Card Pack đặc biệt |
| Weekly challenge | Mỗi tuần | "Thắng 5 trận với Cafe" → Cosmetic |

### 3.3. Seasonal Loop (8 tuần)

```
SEASON_STRUCTURE:
  Week 1-2:   New content drop (cards, events)
  Week 3-4:   Mid-season challenge
  Week 5-6:   Balance patch + cosmetic drop
  Week 7-8:   Season finale event + reset

BATTLE PASS TIERS (50 tiers):
  Free Track:  50 tiers × cosmetic (card backs, avatars)
  Premium:     50 tiers × premium cosmetic + exclusive card visual
  Price:       49,000 VND (~$1.99)

SEASON_EXCLUSIVE:
  - 20 seasonal cards (không bao giờ xoay về standard pool)
  - 5 cosmetic card backs
  - 3 avatar frames
  - 1 title
```

### 3.4. Achievement System (50 Achievements)

```
TIERS:
  Bronze  (1-15):   Beginner milestones
  Silver  (16-30):  Intermediate milestones
  Gold    (31-45):  Advanced milestones
  Diamond (46-50):  Legendary milestones

EXAMPLES:
  "Khởi nghiệp lần đầu"      → Thắng trận đầu tiên           (Bronze)
  "Doanh nhân 10X"           → Đạt 10,000 vốn trong 1 trận   (Silver)
  "Kẻ nghiện công việc"      → Chơi 100 trận                 (Silver)
  "Bậc thầy Marketing"       → Sử dụng 50 lá Marketing       (Silver)
  "Triệu phú"               → Đạt 100,000 vốn              (Gold)
  "Siêu sao"                → Sống sót Vòng 50+             (Gold)
  "Huyền thoại khởi nghiệp"  → Thắng 1000 trận              (Diamond)
```

---

## Phần 4: Social System

### 4.1. Guild System (Post-launch Phase 5)

```
GUILD:
  - Tối đa 10 người/guild
  - Guild name + tag (3 ký tự)
  - Guild level (1-20): tăng bằng collective XP
  - Guild chat riêng

GUILD BUFFS (cộng dồn theo guild level):
  lv1:  +5% revenue cho tất cả thành viên
  lv5:  +1 free energy refill/ngày
  lv10: +10% XP bonus
  lv15: +1 guaranteed Rare card mỗi pack
  lv20: Guild skin đặc biệt

GUILD ACTIVITIES:
  - Guild Quest: Hoàn thành 50 trận/tuần → Guild box
  - Guild Tournament: Top guild nhận exclusive frame
```

### 4.2. Friend System

- Thêm bạn bè qua username hoặc QR code in-app
- Gift energy: Gửi/tặng 5 energy/ngày cho bạn bè
- Private room: Chơi với bạn bè riêng tư

### 4.3. Leaderboard

| Type | Scope | Reset |
|---|---|---|
| Survival Rounds | Global | Weekly |
| Total Wins | Global | Monthly |
| Guild Ranking | Global | Monthly |
| Country Ranking | By country | Weekly |

---

## Phần 5: Monetization

### 5.1. Nguyên Tắc

> **KHÔNG pay-to-win.** Mọi IAP chỉ ảnh hưởng cosmetic hoặc comfort. Người chơi free có thể thắng 100% game content.

### 5.2. Revenue Streams

| Item | Giá (VND) | Mô tả |
|---|---|---|
| **Starter Pack** | 29,000 | 3 Card Packs + 500 xu + Card Back đặc biệt |
| **Card Pack (5 lá)** | 15,000 | 5 lá bài, guaranteed 1 Rare |
| **Card Pack (10 lá)** | 49,000 | 10 lá bài, guaranteed 1 Epic |
| **Battle Pass** | 49,000 | 50 tier rewards, 8 tuần |
| **Energy Refill** | 5,000 | +50 energy (không spam — max 3x/ngày) |
| **Coin Bundle (500)** | 15,000 | 500 xu |
| **Coin Bundle (2000)** | 49,000 | 2000 xu |
| **Coin Bundle (5000)** | 99,000 | 5000 xu (best value) |
| **Card Back Bundle** | 25,000 | 3 card back skins |
| **Remove Ads** | 25,000 | Không quảng cáo |

### 5.3. Ad Integration

- **Rewarded Video:** Xem quảng cáo để nhận 10 energy (max 5x/ngày)
- **Interstitial:** Hiển thị giữa các round trong lobby (non-intrusive)
- **No banner ads** — không ảnh hưởng gameplay

### 5.4. Conversion Funnel

```
Landing → Tutorial → First Game → Daily Retention → Week 1 Retention → Week 4 Retention
   ↓          ↓           ↓              ↓                  ↓
Free    ← IAP hint   ← Soft IAP     ← Battle Pass    ← Premium Friend
                                                   ← Guild Pressure
```

---

## Phần 6: Technical Architecture

### 6.1. Tech Stack

```
FRONTEND (Mobile):
  Framework:     React Native 0.76+ via Expo SDK 52
  Language:      TypeScript 5.x
  State:         Zustand v5 (lightweight, mobile-optimized)
  Navigation:    React Navigation v7
  Networking:    Axios (REST) + Socket.io-client (WebSocket)
  Animation:    Reanimated 3 + Moti
  Storage:      AsyncStorage (local) + MMKV (game cache)
  Push:         Expo Notifications
  Ads:          AdMob via expo-ads-admob
  IAP:          expo-in-app-purchases

BACKEND:
  Framework:     NestJS 11 + TypeScript
  Runtime:       Node.js 22 LTS
  WebSocket:     Socket.io v4 (@nestjs/websockets)
  ORM:           Prisma 6
  Database:      PostgreSQL 16
  Cache:         Redis 8 (session, game state cache)
  Auth:          Passport.js + JWT (access + refresh token)
  Rate Limit:   @nestjs/throttler

INFRASTRUCTURE:
  Backend:       Railway (Node.js) hoặc AWS ECS
  Database:      Neon (PostgreSQL serverless)
  Cache:         Upstash Redis
  CDN:           Vercel Blob (card images) hoặc Cloudinary
  CI/CD:         GitHub Actions
  Monitoring:    Sentry (error tracking)
```

### 6.2. Monorepo Structure

```
project-sunny/
├── apps/
│   ├── mobile/            # React Native (Expo)
│   │   ├── src/
│   │   │   ├── app/           # Navigation screens
│   │   │   ├── components/    # Reusable UI
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── game/
│   │   │   │   ├── lobby/
│   │   │   │   ├── card/
│   │   │   │   ├── shop/
│   │   │   │   ├── achievement/
│   │   │   │   └── battle-pass/
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # API client, socket, utils
│   │   │   ├── store/         # Zustand stores
│   │   │   └── types/         # Shared types
│   │   └── app.json
│   │
│   └── api/               # NestJS
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── prisma/
│           ├── modules/
│           │   ├── auth/
│           │   ├── user/
│           │   ├── player/
│           │   ├── game/
│           │   ├── room/
│           │   ├── card/
│           │   ├── round/
│           │   ├── quest/
│           │   ├── achievement/
│           │   ├── battle-pass/
│           │   ├── leaderboard/
│           │   └── guild/
│           ├── gateway/         # Socket.io gateways
│           │   ├── game.gateway.ts
│           │   └── lobby.gateway.ts
│           ├── engine/          # Game engine (pure logic)
│           │   ├── round-engine.ts
│           │   ├── card-resolver.ts
│           │   ├── economy-calculator.ts
│           │   ├── env-system.ts
│           │   └── match-maker.ts
│           ├── dto/             # Data Transfer Objects
│           └── common/          # Guards, decorators, filters
│
├── packages/
│   ├── types/              # @project-sunny/types
│   │   └── src/
│   │       ├── card.types.ts
│   │       ├── game.types.ts
│   │       ├── player.types.ts
│   │       └── economy.types.ts
│   ├── constants/          # @project-sunny/constants
│   │   └── src/
│   │       ├── game.constants.ts
│   │       ├── card.data.ts      # All 200+ cards data
│   │       ├── profession.data.ts
│   │       └── env.data.ts
│   └── utils/              # @project-sunny/utils
│       └── src/
│           ├── random.ts
│           ├── math.ts
│           └── validation.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed/
│       ├── cards.seed.ts
│       ├── achievements.seed.ts
│       └── quests.seed.ts
│
├── .env.example
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

### 6.3. API Design

#### REST Endpoints

```
AUTH:
  POST   /api/auth/register          → { email, username, password }
  POST   /api/auth/login             → { accessToken, refreshToken }
  POST   /api/auth/refresh           → { accessToken }
  POST   /api/auth/logout            → { void }

USER:
  GET    /api/users/me               → UserProfile
  PATCH  /api/users/me               → { displayName, avatarUrl }
  GET    /api/users/:id/stats         → PlayerStats

GAME:
  POST   /api/game/rooms             → { roomId } (create room)
  GET    /api/game/rooms             → RoomList (public rooms)
  GET    /api/game/rooms/:id         → RoomDetail
  POST   /api/game/rooms/:id/join    → { inviteCode }

CARDS:
  GET    /api/cards                  → CardList (with filters)
  GET    /api/cards/pack             → CardPack (open pack)

PROGRESSION:
  GET    /api/player/stats           → PlayerStats
  GET    /api/player/achievements    → AchievementList
  GET    /api/player/quests/daily    → DailyQuest[]
  POST   /api/player/quests/:id/claim → { reward }
  GET    /api/leaderboard            → LeaderboardEntry[]
  GET    /api/battle-pass            → BattlePassState
```

#### WebSocket Events

```
CONNECTION:
  connect(token)                     → { socketId, playerId }
  disconnect()                       → cleanup

LOBBY:
  → joinRoom(roomId, playerId)
  ← roomJoined(roomState)
  → leaveRoom()
  → kickPlayer(playerId)             // host only
  → startGame()
  ← gameStarting()
  → voteStore(storeType)
  ← votingComplete(storeType)

GAME:
  → ready()
  ← allPlayersReady()
  ← roundStart(roundNum, hand[])
  → playCards(slotAssignments[])
  ← cardsLocked()
  ← roundResolved(results[])
  ← playerDied(playerId, cause)
  ← gameOver(winner, scores[])

CHAT:
  → lobbyChat(message)
  ← lobbyChat(senderId, message)
  → gameChat(message)
  ← gameChat(senderId, message)
```

### 6.4. Database Schema (Prisma Entities)

```
User           → Auth, profile, email, settings
Session        → JWT refresh tokens
Player         → Stats, professions, cosmetics, level, XP
Achievement    → Player achievements, unlock progress
DailyQuest     → Daily quests with progress tracking
BattlePass     → Season definitions
BattlePassEntry → Player season progress
GameRoom       → Room state, config, status
PlayerState    → In-game state per room
RoomBuff       → Active buffs/debuffs in a room
RoundHistory   → Complete round-by-round log
CardPool       → All card definitions
CardOwned      → Cards owned by each player
GameEvent      → Event log for a room
Guild          → Guild definitions
GuildMember    → Guild membership
```

### 6.5. Game Engine (Server-Side)

```
GameEngine (Pure TypeScript — no framework dependency):
  ├── RoundEngine
  │     ├── resolveDraw(playerId) → Card[]
  │     ├── validateSlotPlacement(cards, slots) → boolean
  │     ├── resolveRound(playerCards[], env) → RoundResult
  │     └── checkDeath(playerState) → boolean
  │
  ├── CardResolver
  │     ├── calculateCardEffect(card, player, env) → EffectResult
  │     ├── applyProfessionMultiplier(effect, profession) → number
  │     └── checkCrit(effect) → boolean
  │
  ├── EconomyCalculator
  │     ├── calculateRevenue(player, round, env) → number
  │     ├── calculateCost(round, store, env) → number
  │     ├── calculateProfit(rev, cost, cards) → number
  │     └── updateHP(player, profit) → newHP
  │
  ├── EnvironmentSystem
  │     ├── rollEnvironment(round) → Environment | null
  │     ├── applyEnvironment(env, players) → void
  │     └── tickEnvironment(env) → { stillActive, newEffects }
  │
  └── MatchMaker
        ├── findRoom(config) → Room | null
        ├── createRoom(hostId, config) → Room
        └── validateGameEnd(room) → GameResult
```

### 6.6. Mobile-Specific Concerns

```
1. SOCKET RECONNECTION:
   - Auto-reconnect với exponential backoff (1s, 2s, 4s, 8s, max 30s)
   - Gửi lại pending actions sau khi reconnect
   - Sync state từ server nếu state lệch

2. OFFLINE MODE:
   - Lưu pending actions vào AsyncStorage khi offline
   - Sync lên server khi online
   - Không cho phép chơi full game offline (multiplayer)

3. TOUCH OPTIMIZATION:
   - Minimum touch target: 44×44pt (Apple guideline)
   - Card drag: sử dụng PanResponder + Reanimated
   - Haptic feedback khi đặt bài vào slot
   - Long-press để xem chi tiết lá bài

4. PERFORMANCE:
   - Lazy load card images (placeholder → full quality)
   - Virtual list cho card collection (FlatList optimized)
   - Reduce bundle size: dynamic import cho features không cần thiết
   - 60 FPS target cho animations

5. PUSH NOTIFICATIONS:
   - Daily reminder (configurable time)
   - Guild activity
   - Friend gift available
   - Season ending reminder
   - Achievement unlocked
```

### 6.7. Security

```
1. AUTHENTICATION:
   - JWT access token (15 phút expiry)
   - Refresh token rotation (7 ngày expiry)
   - Password hashed với bcrypt (cost factor 12)

2. GAME SECURITY:
   - Tất cả game logic chạy server-side
   - Client chỉ gửi intent (cardId + slot), server validate + execute
   - State hash (SHA-256) sau mỗi round để detect manipulation
   - Rate limit: 10 WebSocket events/giây/người chơi
   - Room join: valid invite code hoặc password

3. DATA SECURITY:
   - HTTPS everywhere
   - Input validation với class-validator
   - SQL injection prevented via Prisma ORM
   - XSS prevented: sanitize all user inputs

4. ANTI-CHEAT:
   - Timestamp validation (reject action nếu quá nhanh)
   - Pattern detection cho automated plays
   - Anomaly flagging trong analytics
```

---

## Phần 7: Implementation Roadmap

### Phase 1 — Foundation (Tuần 1-3)

**Mục tiêu:** Setup infrastructure + chạy được game loop cơ bản

```
□ Monorepo setup (pnpm workspace + turbo)
□ NestJS backend skeleton + Prisma + PostgreSQL
□ React Native (Expo) mobile skeleton
□ Shared packages (types, constants, utils)
□ Auth system (register, login, JWT)
□ Basic room system (create, join, lobby)
□ Card data model + 50 cards đầu tiên
□ Basic game loop (Draw → Action → Resolution → Cleanup)
□ Simple economy (revenue, cost, HP)
□ WebSocket connection mobile ↔ server
□ Basic UI: Login, Lobby, Card Hand, Game Board
□ Tutorial 3-bước (onboarding)
```

### Phase 2 — Core Gameplay (Tuần 4-6)

**Mục tiêu:** Full gameplay systems + profession + environment

```
□ 6 profession system với multipliers
□ Remaining 150 cards (total 200+)
□ Environment system (8 events với effects)
□ Profession-specific cards (12 lá × 6 profession)
□ Store type system (4 loại cửa hàng)
□ Card Gacha (pack opening)
□ Server-side game engine refactor
□ Complete economy formulas
□ Animations (card flip, revenue popup, HP change)
□ Player progression (XP, level, stats)
□ Daily quests (3 quests + rewards)
□ Soft IAP integration (coins, packs)
```

### Phase 3 — Polish & Mobile (Tuần 7-9)

**Mục tiêu:** Mobile polish + reconnection + performance

```
□ Touch-optimized card drag/drop
□ Reconnection với state resync
□ Haptic feedback
□ Optimistic UI cho card placement
□ Card collection screen với filters/search
□ Leaderboard screen
□ Achievement screen với progress
□ Battle Pass UI (full track display)
□ AdMob integration (rewarded + interstitial)
□ Push notification setup
□ Sentry error tracking
□ Performance optimization (60 FPS target)
□ APK build test (Android) + TestFlight (iOS)
```

### Phase 4 — Multiplayer & Social (Tuần 10-12)

**Mục tiêu:** Full multiplayer + social features

```
□ 5-player real-time sync hoàn chỉnh
□ Vote system cho store type
□ Comeback mechanics
□ Scoring + MVP system
□ Game over screen + stats
□ Friend system (add, remove, invite)
□ Guild system (create, join, buffs)
□ Guild chat + guild quest
□ Guild leaderboard
□ Share results to social media
□ Season system (8-week cycle)
□ Battle Pass purchase flow
```

### Phase 5 — Live Ops (Tuần 13+)

**Mục tiêu:** Launch + live operations

```
□ Analytics dashboard (who plays, where churns)
□ A/B testing framework
□ Season 1 launch
□ Content drops (new cards, new cosmetics)
□ Card balance patches
□ Community feedback loop
□ Guild tournament
□ Card trading (post-launch)
□ Scale infrastructure (100 → 1000+ CCU)
□ Localization (EN, VI initial)
□ Android release (Google Play)
□ iOS release (App Store)
```

---

## Phần 8: Dependencies & External Services

| Service | Sử dụng | Chi phí | Alternative |
|---|---|---|---|
| Neon (PostgreSQL) | Database | Free tier: 0.5GB | Supabase, Railway DB |
| Upstash Redis | Cache, session | Free: 10K commands/day | Redis Cloud |
| Railway | Backend hosting | Free: $5 credit/tháng | Render, Fly.io |
| Expo | Mobile dev/build | Free | React Native CLI |
| Vercel Blob | Card images CDN | Pay-as-you-go | Cloudinary (free tier) |
| Cloudinary | Card image generation/storage | Free tier: 25 credits | Self-hosted |
| Sentry | Error tracking | Free: 5K events/tháng | LogRocket |
| AdMob | Mobile ads | Revenue share | Appodeal, ironSource |
| Expo IAP | In-app purchases | 3% per transaction | RevenueCat |

---

## Phần 9: Rủi Ro & Mitigation

| Rủi ro | Xác suất | Tác động | Mitigation |
|---|---|---|---|
| Multiplayer desync nghiêm trọng | Cao | Rất cao | Robust reconciliation, optimistic UI, timeout detection |
| Card balance quá mạnh/yếu | Cao | Cao | A/B testing, fast hotfix, player feedback loop |
| Server lag khi scale | Trung bình | Cao | Redis cache, connection pooling, horizontal scaling |
| App Store rejection (IAP) | Trung bình | Trung bình | Test kỹ sandbox IAP, follow guidelines |
| Cheat/exploit trong multiplayer | Trung bình | Cao | Server-side validation, anomaly detection |
| Người chơi hết content quá sớm | Trung bình | Trung bình | 200+ cards launch, content pipeline sẵn sàng |
| Burnout developer (team nhỏ) | Trung bình | Rất cao | AI agent hỗ trợ, MVP-first approach |
| Không đủ người chơi multiplayer | Cao | Rất cao | Solo practice mode, bot matchmaking, community building |
