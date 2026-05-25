# IMPLEMENTATION.md — Phase-by-Phase Execution Plan

> Kế hoạch triển khai chi tiết từng bước cho Project Sunny.
>
> **Prerequisite:** Đọc SPEC.md trước khi bắt đầu.

---

## Setup chung

```bash
# 1. Cài đặt tool
node --version   # >= 20.0.0
pnpm --version   # >= 9.0.0
git --version

# 2. Clone hoặc tạo repo
cd d:/DGM
git init
git add .
git commit -m "Initial: Planning docs"

# 3. Cài dependencies global
pnpm add -g pnpm turbo

# 4. Install project deps
pnpm install
```

---

## Phase 1 — Foundation (Tuần 1-3)

### Bước 1.1: Monorepo Setup

```bash
# Tạo cấu trúc thư mục
mkdir -p apps/mobile apps/api packages/{types,constants,utils}/src prisma/seed
```

**Files cần tạo:**
- [ ] `package.json` (root)
- [ ] `pnpm-workspace.yaml`
- [ ] `turbo.json`
- [ ] `tsconfig.base.json`
- [ ] `.env.example`
- [ ] `docker-compose.yml` (PostgreSQL + Redis)

### Bước 1.2: Shared Packages

**`packages/types/src/`** — Tạo TypeScript types dùng chung:
- `card.types.ts` — Card, CardEffect, Rarity, Duration, EffectType
- `game.types.ts` — GameRoom, RoomStatus, RoundResult, GameState
- `player.types.ts` — Player, PlayerState, ProfessionType
- `economy.types.ts` — Revenue, Cost, Environment, Buff

**`packages/constants/src/`** — Game balance constants:
- `game.constants.ts` — Starting capital, max rounds, timing constants
- `card.data.ts` — Tất cả 200+ cards (JSON-like structure)
- `profession.data.ts` — Profession bonuses, multipliers
- `env.data.ts` — Environment definitions, multipliers

**`packages/utils/src/`** — Shared utilities:
- `random.ts` — Weighted random, shuffle
- `math.ts` — Floor, clamp, percentage calculations
- `validation.ts` — Card placement validation, slot validation

### Bước 1.3: Backend — NestJS

**Setup:**
```bash
cd apps/api
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express \
  @nestjs/config @nestjs/jwt @nestjs/passport \
  @nestjs/platform-socket.io @nestjs/websockets \
  @nestjs/swagger @nestjs/throttler \
  @prisma/client \
  passport passport-jwt bcrypt class-transformer class-validator \
  reflect-metadata rxjs socket.io
pnpm add -D @nestjs/cli @nestjs/schematics typescript prisma \
  @types/node @types/express @types/bcrypt @types/passport-jwt
```

**Files cần tạo:**
- [ ] `src/main.ts` — Bootstrap NestJS + CORS + Swagger
- [ ] `src/app.module.ts` — Root module
- [ ] `src/prisma/prisma.service.ts` + `prisma.module.ts`
- [ ] `src/modules/auth/` — AuthController + AuthService + JWT strategy
- [ ] `src/modules/user/` — UserController + UserService
- [ ] `src/modules/game/` — GameController + GameService
- [ ] `src/modules/room/` — RoomController + RoomService
- [ ] `src/modules/card/` — CardController + CardService
- [ ] `src/gateway/game.gateway.ts` — Socket.io WebSocket gateway
- [ ] `src/engine/` — GameEngine, RoundEngine, EconomyCalculator, CardResolver, EnvironmentSystem

### Bước 1.4: Database — Prisma

**Files cần tạo:**
- [ ] `prisma/schema.prisma` — Full schema (User, Player, GameRoom, PlayerState, Card, Achievement, DailyQuest, BattlePass, Guild...)
- [ ] `prisma/seed/cards.seed.ts` — Seed 200+ cards
- [ ] `prisma/seed/achievements.seed.ts` — Seed 50 achievements
- [ ] `prisma/seed/quests.seed.ts` — Seed daily quests

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed data
pnpm seed
```

### Bước 1.5: Mobile — React Native (Expo)

**Setup:**
```bash
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript
pnpm add @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  zustand axios socket.io-client \
  react-native-reanimated \
  @react-native-async-storage/async-storage \
  expo-haptics expo-notifications \
  react-native-gesture-handler
pnpm add -D @types/react-native
```

**Files cần tạo:**
- [ ] `app.json` — Expo config (name, slug, icon, splash)
- [ ] `src/lib/api.ts` — Axios instance
- [ ] `src/lib/socket.ts` — Socket.io client singleton
- [ ] `src/store/authStore.ts` — Zustand auth store
- [ ] `src/store/gameStore.ts` — Zustand game state store
- [ ] `src/types/` — Import từ `@project-sunny/types`
- [ ] `src/app/` — Navigation screens

**Screen structure:**
```
app/
├── _layout.tsx              # Root layout + auth provider
├── index.tsx                # Splash / Loading
├── auth/
│   ├── login.tsx
│   └── register.tsx
├── main.tsx                 # Tab navigator sau login
├── game/
│   ├── lobby/
│   │   ├── index.tsx        # Room list
│   │   └── create.tsx       # Create room
│   ├── room/[id].tsx        # In-room lobby
│   └── play.tsx             # Game board screen
├── profile/
│   └── index.tsx
├── collection/
│   └── index.tsx            # Card collection
├── shop/
│   └── index.tsx            # Card packs, IAP
└── settings/
    └── index.tsx
```

### Bước 1.6: Game Loop — MVP

**Backend Engine (`src/engine/round-engine.ts`):**
```typescript
// Pseudocode — actual implementation in code
function executeRound(round: Round): RoundResult {
  // 1. Check environment
  // 2. Sort players by speed
  // 3. For each player:
  //    a. Calculate revenue
  //    b. Apply card effects
  //    c. Apply environment
  //    d. Calculate costs
  //    e. Update HP/money
  //    f. Check death
  // 4. Broadcast results via WebSocket
  // 5. Save round history
  // 6. Return results
}
```

**Mobile Game Board (`src/features/game/GameBoard.tsx`):**
- 5 card slots (horizontal)
- Hand of 5 cards (bottom)
- HP bar, Money counter, Energy bar
- "Sẵn sàng" button
- Card drag-and-drop với Reanimated
- Real-time sync via WebSocket

### Bước 1.7: Tutorial Onboarding

```
Step 1: Welcome Screen
  → Giới thiệu SunnyHolleyLight story
  → "Bắt đầu hành trình"

Step 2: Chọn Nghề
  → Chọn Main Profession + Secondary Profession
  → Giải thích stats tương ứng

Step 3: Demo Round (vs AI)
  → AI đánh trước, hiệu ứng được highlight
  → Người chơi đánh theo với guide
  → Thắng demo → "Chơi thật thôi!"
```

---

## Phase 2 — Core Gameplay (Tuần 4-6)

### Bước 2.1: Profession System

- [ ] Implement profession multipliers trong CardResolver
- [ ] Profession-specific card effects
- [ ] UI: Stat display với profession icons
- [ ] Card filtering by profession

### Bước 2.2: Full Card Pool (200+ cards)

- [ ] Implement 200+ cards trong `card.data.ts`
- [ ] Card Gacha system (pack opening animation)
- [ ] Card collection screen với search/filter/sort
- [ ] Rarity colors + glow effects

### Bước 2.3: Environment System

- [ ] 8 environment events trong `env.data.ts`
- [ ] Environment trigger logic (30% chance/round)
- [ ] Environment display UI (banner + effects)
- [ ] Comeback mechanics integration

### Bước 2.4: Store Type System

- [ ] 4 store types với unique card pools
- [ ] Voting system (3 options, 5 votes)
- [ ] Store-specific UI theme

### Bước 2.5: Economy Full Implementation

- [ ] Revenue calculation với all modifiers
- [ ] Operating cost scaling (10%/round)
- [ ] Crit system (rate + damage)
- [ ] HP management + death conditions

### Bước 2.6: Player Progression

- [ ] XP calculation + level-up
- [ ] Stat point allocation
- [ ] Meta progression (cosmetic unlocks)

### Bước 2.7: Daily Quests

- [ ] 3 daily quests + reward claims
- [ ] Quest progress tracking
- [ ] Daily reset logic (00:00 UTC)

---

## Phase 3 — Polish & Mobile (Tuần 7-9)

### Bước 3.1: Touch & Animation

- [ ] Card drag-and-drop với Reanimated (60 FPS)
- [ ] Haptic feedback on card placement
- [ ] Card flip animation (3D)
- [ ] Revenue/cost pop-up animations
- [ ] HP bar animation

### Bước 3.2: Reconnection

- [ ] Socket reconnect với exponential backoff
- [ ] Pending actions queue
- [ ] State resync protocol

### Bước 3.3: IAP Integration

- [ ] Expo IAP setup (Android + iOS sandbox)
- [ ] Coin purchase flow
- [ ] Card pack purchase
- [ ] Battle Pass purchase

### Bước 3.3: Screens

- [ ] Card collection với FlatList optimization
- [ ] Achievement screen với progress bars
- [ ] Battle Pass track UI
- [ ] Leaderboard screen
- [ ] Settings (sound, notification, account)

### Bước 3.4: AdMob

- [ ] Rewarded video (energy refill)
- [ ] Interstitial (between rounds)
- [ ] Ad removal IAP

### Bước 3.5: Build & Test

```bash
# Android
cd apps/mobile
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug

# iOS (Mac only)
npx expo prebuild --platform ios
xcodebuild -workspace ios/*.xcworkspace -scheme project-sunny
```

---

## Phase 4 — Multiplayer & Social (Tuần 10-12)

### Bước 4.1: Full Multiplayer

- [ ] 5-player sync (all WebSocket events)
- [ ] Real-time card animations cho all players
- [ ] Vote system hoàn chỉnh
- [ ] Scoring + MVP calculation
- [ ] Game over screen với breakdown

### Bước 4.2: Social

- [ ] Friend system (add/remove/invite)
- [ ] Guild system (create/join/leave)
- [ ] Guild chat
- [ ] Guild buffs
- [ ] Guild quest

### Bước 4.3: Battle Pass

- [ ] Season data model
- [ ] 50-tier Battle Pass UI
- [ ] Claim rewards flow
- [ ] Premium track + purchase

### Bước 4.4: Share & Community

- [ ] Share to Facebook/Messenger
- [ ] Share results as image (canvas generation)
- [ ] In-app chat (lobby + guild)

---

## Phase 5 — Live Ops (Tuần 13+)

### Bước 5.1: Analytics

- [ ] Sentry error tracking
- [ ] Custom event tracking (game starts, round survived, etc.)
- [ ] Dashboard xem retention, funnel, engagement

### Bước 5.2: Season 1 Launch

- [ ] 20 seasonal exclusive cards
- [ ] Season cosmetic set
- [ ] Season leaderboard
- [ ] Push notification campaign

### Bước 5.3: Release

- [ ] Google Play Console setup + APK/AAB
- [ ] App Store Connect setup + TestFlight + App Store
- [ ] Privacy policy + Terms of service
- [ ] App Store listing (screenshots, description, keywords)

---

## File Priority Order (để code theo thứ tự)

### Backend (API) — 25 files
```
1.  apps/api/src/main.ts
2.  apps/api/src/app.module.ts
3.  apps/api/src/prisma/prisma.service.ts
4.  apps/api/src/prisma/prisma.module.ts
5.  apps/api/src/modules/auth/auth.controller.ts
6.  apps/api/src/modules/auth/auth.service.ts
7.  apps/api/src/modules/auth/jwt.strategy.ts
8.  apps/api/src/modules/game/game.service.ts
9.  apps/api/src/modules/room/room.service.ts
10. apps/api/src/modules/card/card.service.ts
11. apps/api/src/gateway/game.gateway.ts
12. apps/api/src/engine/round-engine.ts
13. apps/api/src/engine/card-resolver.ts
14. apps/api/src/engine/economy-calculator.ts
15. apps/api/src/engine/env-system.ts
16. apps/api/src/engine/match-maker.ts
17. apps/api/src/modules/quest/quest.service.ts
18. apps/api/src/modules/achievement/achievement.service.ts
19. apps/api/src/modules/leaderboard/leaderboard.service.ts
20. apps/api/src/common/guards/jwt-auth.guard.ts
21. apps/api/src/common/decorators/current-user.decorator.ts
22. apps/api/src/common/interceptors/transform.interceptor.ts
23. apps/api/src/common/filters/http-exception.filter.ts
24. prisma/schema.prisma
25. prisma/seed/cards.seed.ts
```

### Mobile (React Native) — 20 files
```
1.  apps/mobile/src/lib/api.ts
2.  apps/mobile/src/lib/socket.ts
3.  apps/mobile/src/store/authStore.ts
4.  apps/mobile/src/store/gameStore.ts
5.  apps/mobile/src/app/_layout.tsx
6.  apps/mobile/src/app/index.tsx
7.  apps/mobile/src/app/auth/login.tsx
8.  apps/mobile/src/app/auth/register.tsx
9.  apps/mobile/src/app/main.tsx
10. apps/mobile/src/app/game/lobby/index.tsx
11. apps/mobile/src/app/game/lobby/create.tsx
12. apps/mobile/src/app/game/room/[id].tsx
13. apps/mobile/src/app/game/play.tsx
14. apps/mobile/src/features/game/Card.tsx
15. apps/mobile/src/features/game/CardSlot.tsx
16. apps/mobile/src/features/game/GameBoard.tsx
17. apps/mobile/src/features/game/PlayerHUD.tsx
18. apps/mobile/src/features/game/EnvBanner.tsx
19. apps/mobile/src/features/onboarding/Tutorial.tsx
20. apps/mobile/src/features/lobby/VotingPanel.tsx
```

### Shared Packages — 10 files
```
1.  packages/types/src/card.types.ts
2.  packages/types/src/game.types.ts
3.  packages/types/src/player.types.ts
4.  packages/types/src/economy.types.ts
5.  packages/constants/src/game.constants.ts
6.  packages/constants/src/card.data.ts
7.  packages/constants/src/profession.data.ts
8.  packages/constants/src/env.data.ts
9.  packages/utils/src/random.ts
10. packages/utils/src/math.ts
```
