# BACKEND-SPEC.md — Backend Architecture & Infrastructure

> Chi tiết API, database, caching, rate limiting, security, và infrastructure deployment.

---

## 1. API Design

### 1.1. REST API — Full Endpoints

```
BASE URL: https://api.project-sunny.com/api
VERSIONED: /v1/

═══════════════════════════════════════════════
AUTH
═══════════════════════════════════════════════

POST /v1/auth/register
  Body:   { email, username, password }
  Returns: { user, accessToken, refreshToken }
  Errors: 400 (validation), 409 (email/username exists)

POST /v1/auth/login
  Body:   { email, password }
  Returns: { user, accessToken, refreshToken }
  Errors: 401 (invalid credentials)

POST /v1/auth/refresh
  Body:   { refreshToken }
  Returns: { accessToken, refreshToken }
  Errors: 401 (invalid/expired token)

POST /v1/auth/logout
  Headers: Authorization: Bearer {accessToken}
  Returns: { success: true }

═══════════════════════════════════════════════
USER / PROFILE
═══════════════════════════════════════════════

GET /v1/users/me
  Headers: Authorization: Bearer {accessToken}
  Returns: { user, player }
  Includes: stats, level, xp, cosmetics, professions

PATCH /v1/users/me
  Headers: Authorization: Bearer {accessToken}
  Body:   { displayName?, avatarUrl?, cardBackSkin?, cardFrame?, title? }
  Returns: { player }

GET /v1/users/me/stats
  Headers: Authorization: Bearer {accessToken}
  Returns: {
    totalGames, wins, losses, winRate,
    avgRoundReached, highestRound,
    totalRevenue, totalProfit,
    cardsPlayed, critsLanded,
    achievementsUnlocked, questsCompleted
  }

═══════════════════════════════════════════════
PLAYER PROGRESSION
═══════════════════════════════════════════════

GET /v1/player/stats
  Headers: Authorization: Bearer {accessToken}
  Returns: { level, xp, stats, professions, cosmetics }

POST /v1/player/professions
  Headers: Authorization: Bearer {accessToken}
  Body:   { mainProfession, secondaryProfession }
  Returns: { player }
  Rule:   Can change once per 7 days

GET /v1/player/achievements
  Headers: Authorization: Bearer {accessToken}
  Returns: { achievements: Achievement[], unlockedCount, totalCount }

GET /v1/player/quests/daily
  Headers: Authorization: Bearer {accessToken}
  Returns: { quests: DailyQuest[], resetAt: ISO8601 }
  Rule:   3 quests, resets at 00:00 UTC

POST /v1/player/quests/:questId/claim
  Headers: Authorization: Bearer {accessToken}
  Returns: { reward, newBalance }
  Errors: 400 (not completed), 400 (already claimed)

GET /v1/player/battle-pass
  Headers: Authorization: Bearer {accessToken}
  Returns: { season, tier, xp, purchased, claimedTiers[] }

POST /v1/player/battle-pass/claim/:tier
  Headers: Authorization: Bearer {accessToken}
  Returns: { reward }
  Errors: 400 (tier not reached), 400 (already claimed)

═══════════════════════════════════════════════
GAME ROOMS
═══════════════════════════════════════════════

POST /v1/game/rooms
  Headers: Authorization: Bearer {accessToken}
  Body:   {
    name?, maxPlayers?, roundTimeLimit?,
    votingTimeLimit?, storeTypes?
  }
  Returns: { room: GameRoom, inviteCode }
  Errors: 400 (validation)

GET /v1/game/rooms
  Query:   { status?, page?, limit? }
  Headers: Authorization: Bearer {accessToken}
  Returns: { rooms: GameRoom[], total, page }
  Public rooms only (status = WAITING)

GET /v1/game/rooms/:roomId
  Headers: Authorization: Bearer {accessToken}
  Returns: { room, players: PlayerInRoom[] }
  Errors: 404 (not found)

POST /v1/game/rooms/:roomId/join
  Headers: Authorization: Bearer {accessToken}
  Body:   { inviteCode? }  // Required if room is private
  Returns: { room }
  Errors: 404, 403 (wrong code), 410 (room full/not waiting)

DELETE /v1/game/rooms/:roomId/leave
  Headers: Authorization: Bearer {accessToken}
  Returns: { success: true }

POST /v1/game/rooms/:roomId/start
  Headers: Authorization: Bearer {accessToken} (host only)
  Returns: { room }  // Status → VOTING
  Errors: 403, 400 (not enough players)

DELETE /v1/game/rooms/:roomId/player/:playerId
  Headers: Authorization: Bearer {accessToken} (host only)
  Returns: { room }
  Errors: 403, 404

═══════════════════════════════════════════════
CARDS & COLLECTION
═══════════════════════════════════════════════

GET /v1/cards
  Query:   { storeType?, profession?, rarity?, search?, page?, limit? }
  Headers: Authorization: Bearer {accessToken}
  Returns: { cards: Card[], total, page }
  Note:    Returns ALL card definitions (not owned cards)

GET /v1/player/collection
  Query:   { storeType?, rarity?, page?, limit? }
  Headers: Authorization: Bearer {accessToken}
  Returns: { cards: OwnedCard[], total, count: { COMMON, RARE, EPIC, LEGENDARY } }

GET /v1/cards/:cardId
  Returns: { card: Card, owned: boolean, count: number }

POST /v1/cards/pack/open
  Headers: Authorization: Bearer {accessToken}
  Body:   { packType: "SMALL" | "MEDIUM" | "LARGE" }
  Returns: { cards: CardInstance[], pityProgress }
  Errors: 400 (not enough coins), 402 (IAP payment failed)

═══════════════════════════════════════════════
LEADERBOARD
═══════════════════════════════════════════════

GET /v1/leaderboard
  Query:   { type: "survival" | "wins" | "guild", period: "weekly" | "monthly" | "all", page?, limit? }
  Headers: Authorization: Bearer {accessToken}
  Returns: { entries: LeaderboardEntry[], myRank: number, total }

═══════════════════════════════════════════════
SOCIAL
═══════════════════════════════════════════════

POST /v1/friends/request
  Body:   { username }
  Returns: { friendRequest }

GET /v1/friends
  Returns: { friends: Friend[], pending: FriendRequest[] }

DELETE /v1/friends/:friendId
  Returns: { success: true }

POST /v1/friends/gift
  Body:   { friendId, type: "energy" | "coin" }
  Returns: { giftSent: true }
  Rule:   Max 5 gifts/day, 5 energy or 100 coins each

═══════════════════════════════════════════════
GUILD
═══════════════════════════════════════════════

POST /v1/guilds
  Body:   { name, tag }
  Returns: { guild }
  Errors: 400 (name taken), 400 (need 3+ friends)

GET /v1/guilds/:guildId
  Returns: { guild, members: GuildMember[] }

POST /v1/guilds/:guildId/join
  Returns: { guild }
  Errors: 400 (guild full), 400 (not invited)

GET /v1/guilds/:guildId/quest
  Returns: { questProgress, guildBuffLevel }
```

---

## 2. Database Schema (Prisma — Full)

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── USER & AUTH ──────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime?

  player    Player?
  sessions  Session[]
  achievements Achievement[]
  dailyQuests  DailyQuest[]
  battlePass  BattlePassEntry?
  friendsAsrequester  Friend[]  @relation("FriendRequester")
  friendsAsreceiver   Friend[]  @relation("FriendReceiver")
  friendRequestsSent   FriendRequest[] @relation("RequestSender")
  friendRequestsReceived FriendRequest[] @relation("RequestReceiver")
  guildMember GuildMember?
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ── PLAYER PROGRESSION ────────────────────────────────

model Player {
  id           String @id @default(cuid())
  userId       String @unique
  displayName  String

  level         Int    @default(1)
  xp            Int    @default(0)

  // Base Stats
  intelligence  Int    @default(10)  // Trí lực
  stamina       Int    @default(10)  // Thể lực
  speed         Int    @default(10)  // Tốc độ
  spirit        Int    @default(10)  // Tinh thần
  agility       Int    @default(10)  // Linh hoạt
  diplomacy     Int    @default(10)  // Ngoại giao

  mainProfession     ProfessionType @default(SOFTWARE_ENGINEERING)
  secondaryProfession ProfessionType @default(MARKETING)

  cardBackSkin  String  @default("default")
  cardFrame     String  @default("default")
  title         String  @default("Tân Binh")

  totalGames      Int @default(0)
  totalWins       Int @default(0)
  totalRevenue    Int @default(0)
  highestRound    Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievements Achievement[]
  dailyQuests  DailyQuest[]
  battlePass   BattlePassEntry?
  roomStates   PlayerState[]
  cardOwnership CardOwnership[]
  guildMember  GuildMember?
}

enum ProfessionType {
  SOFTWARE_ENGINEERING
  HARDWARE_ENGINEERING
  MARKETING
  GRAPHIC_DESIGN
  LAWYER
  ELECTRICAL_ENGINEER
}

// ── PROGRESSION ─────────────────────────────────────

model Achievement {
  id          String   @id @default(cuid())
  playerId    String
  userId      String
  achievementType String
  unlockedAt   DateTime @default(now())
  progress     Int      @default(1)

  player Player? @relation(fields: [playerId], references: [id])
  user   User?   @relation(fields: [userId], references: [id])

  @@unique([playerId, achievementType])
}

model DailyQuest {
  id        String   @id @default(cuid())
  userId    String
  playerId  String
  questType String
  progress  Int      @default(0)
  target    Int
  reward    Json
  completed Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  user   User?   @relation(fields: [userId], references: [id])
  player Player? @relation(fields: [playerId], references: [id])

  @@index([userId, expiresAt])
}

model BattlePassEntry {
  id            String   @id @default(cuid())
  userId        String   @unique
  playerId      String   @unique
  seasonId      String
  xp            Int      @default(0)
  tier          Int      @default(1)
  purchased     Boolean  @default(false)
  claimedTiers  Int[]    @default([])
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user   User?   @relation(fields: [userId], references: [id])
  player Player? @relation(fields: [playerId], references: [id])
}

// ── GAME ROOM ────────────────────────────────────────

model GameRoom {
  id           String     @id @default(cuid())
  hostId       String
  inviteCode   String     @unique @default(cuid())
  name         String     @default("Phòng của tôi")
  status       RoomStatus @default(WAITING)
  storeType    StoreType?
  maxPlayers   Int        @default(5)
  currentRound Int        @default(0)
  maxRounds    Int        @default(20)
  config       Json       @default("{}")
  winnerId     String?
  createdAt    DateTime   @default(now())
  startedAt    DateTime?
  endedAt      DateTime?

  players  PlayerState[]
  events  GameEvent[]
  history RoundHistory[]

  @@index([inviteCode])
  @@index([status])
}

enum RoomStatus { WAITING VOTING RUNNING FINISHED ABANDONED }
enum StoreType  { CAFE CLOTHING ELECTRONICS AD_AGENCY }

model PlayerState {
  id           String   @id @default(cuid())
  roomId       String
  playerId     String
  orderIndex   Int
  hp           Int      @default(100)
  money        Int      @default(5000)
  energy       Int      @default(100)
  maxEnergy    Int      @default(100)
  isReady      Boolean  @default(false)
  isConnected  Boolean  @default(true)
  hand         Json     @default("[]")
  handCount    Int      @default(0)
  lockedCardId String?
  slots        Json     @default("[]")
  effects      Json     @default("[]")
  consecutiveRoundsCannotPay Int @default(0)
  lastActionAt DateTime @default(now())

  room   GameRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
  player Player   @relation(fields: [playerId], references: [id])

  history RoundHistory[]
  votes   Vote[]

  @@unique([roomId, playerId])
  @@index([roomId])
}

model Vote {
  id        String     @id @default(cuid())
  roomId    String
  playerId  String
  storeType StoreType
  createdAt DateTime   @default(now())

  playerState PlayerState @relation(fields: [playerId], references: [id])

  @@unique([roomId, playerId])
}

model GameEvent {
  id        String   @id @default(cuid())
  roomId    String
  type      String
  data      Json
  round     Int?
  playerId  String?
  createdAt DateTime @default(now())

  room GameRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId, round])
}

model RoundHistory {
  id            String   @id @default(cuid())
  roomId        String
  playerId      String
  playerStateId String
  round         Int
  hand          Json
  slots         Json
  moneyBefore   Int
  moneyAfter    Int
  hpBefore      Int
  hpAfter       Int
  revenue       Int      @default(0)
  costs         Int      @default(0)
  profit        Int      @default(0)
  customers     Int      @default(0)
  state         String   @default("alive")
  createdAt     DateTime @default(now())

  room       GameRoom    @relation(fields: [roomId], references: [id], onDelete: Cascade)
  player    PlayerState @relation(fields: [playerStateId], references: [id])

  @@index([roomId, round])
}

// ── CARDS ─────────────────────────────────────────────

model CardOwnership {
  id         String   @id @default(cuid())
  playerId   String
  cardKey    String   // Reference to card in card.data.ts
  count      Int      @default(1)
  obtainedAt DateTime @default(now())

  player Player @relation(fields: [playerId], references: [id])

  @@unique([playerId, cardKey])
  @@index([playerId])
}

// ── SOCIAL ────────────────────────────────────────────

model Friend {
  id          String   @id @default(cuid())
  requesterId String
  receiverId  String
  status      String   @default("ACCEPTED")
  createdAt   DateTime @default(now())

  requester User @relation("FriendRequester", fields: [requesterId], references: [id])
  receiver  User @relation("FriendReceiver", fields: [receiverId], references: [id])

  @@unique([requesterId, receiverId])
}

model FriendRequest {
  id          String   @id @default(cuid())
  senderId    String
  receiverId  String
  createdAt   DateTime @default(now())

  sender   User @relation("RequestSender", fields: [senderId], references: [id])
  receiver User @relation("RequestReceiver", fields: [receiverId], references: [id])

  @@unique([senderId, receiverId])
}

// ── GUILD ─────────────────────────────────────────────

model Guild {
  id          String   @id @default(cuid())
  name        String   @unique
  tag         String   @unique  // 3-char tag
  level       Int      @default(1)
  totalXP     Int      @default(0)
  createdAt   DateTime @default(now())

  members GuildMember[]
}

model GuildMember {
  id       String   @id @default(cuid())
  guildId  String
  playerId String  @unique
  userId   String  @unique
  role     String  @default("MEMBER")  // OWNER, OFFICER, MEMBER
  joinedAt DateTime @default(now())

  guild  Guild  @relation(fields: [guildId], references: [id])
  player Player @relation(fields: [playerId], references: [id])
  user   User   @relation(fields: [userId], references: [id])
}
```

---

## 3. Caching Strategy

### 3.1. Redis Cache Keys

```typescript
const REDIS_KEYS = {
  // Session
  session: (userId: string) => `session:${userId}`,
  refreshToken: (token: string) => `refresh:${token}`,

  // Game state
  roomState: (roomId: string) => `room:${roomId}:state`,
  roomPhase: (roomId: string) => `room:${roomId}:phase`,
  roomPlayers: (roomId: string) => `room:${roomId}:players`,
  playerReady: (roomId: string, playerId: string) => `room:${roomId}:ready:${playerId}`,

  // Rate limiting
  rateLimit: (playerId: string) => `ratelimit:${playerId}`,
  wsRateLimit: (socketId: string) => `wsratelimit:${socketId}`,

  // Cache game engine
  gameState: (roomId: string) => `game:${roomId}:state`,
  turnOrder: (roomId: string) => `game:${roomId}:turnOrder`,
  envState: (roomId: string) => `game:${roomId}:env`,
  stateHash: (roomId: string, round: number) => `hash:${roomId}:${round}`,

  // User
  userProfile: (userId: string) => `user:${userId}:profile`,
  playerStats: (playerId: string) => `player:${playerId}:stats`,
  dailyQuests: (userId: string, date: string) => `quests:${userId}:${date}`,

  // Leaderboard
  leaderboard: (type: string, period: string) => `lb:${type}:${period}`,

  // Pity
  pity: (playerId: string) => `pity:${playerId}`,
};

const CACHE_TTL = {
  session: 60 * 60 * 24 * 7,     // 7 days
  roomState: 60 * 60,             // 1 hour
  userProfile: 60 * 5,            // 5 minutes
  playerStats: 60 * 5,           // 5 minutes
  dailyQuests: 60 * 60 * 20,     // 20 hours (resets at 00:00 UTC)
  leaderboard: 60 * 15,          // 15 minutes
  pity: 60 * 60 * 24 * 30,      // 30 days
};
```

### 3.2. Cache Invalidation

```
Room State Cache:
  - Invalidate: On every card play, ready, round change
  - TTL: None (manual invalidation only)
  - Pattern: Write-through (update cache on write, not read)

User Profile Cache:
  - Invalidate: On profile update
  - TTL: 5 minutes
  - Pattern: Cache-aside

Leaderboard Cache:
  - Invalidate: On game end (update specific entries)
  - TTL: 15 minutes
  - Pattern: Refresh-ahead (background refresh before TTL)
```

---

## 4. Rate Limiting

```typescript
const RATE_LIMITS = {
  // HTTP API
  auth: { windowMs: 60 * 1000, max: 10 },           // Auth endpoints
  game: { windowMs: 60 * 1000, max: 60 },         // Game creation/join
  quests: { windowMs: 60 * 1000, max: 10 },       // Quest claims
  cards: { windowMs: 60 * 1000, max: 5 },         // Pack opening
  leaderboard: { windowMs: 60 * 1000, max: 30 },  // LB reads

  // WebSocket (per socket)
  ws: { windowMs: 1000, max: 10 },               // 10 events/second
  wsRound: { windowMs: 60000, max: 200 },         // 200 events/round

  // Burst
  wsBurst: { windowMs: 5000, max: 30 },           // 30 events/5s max
};

// HTTP: Return 429 Too Many Requests
// WS: Disconnect socket, emit error event
```

---

## 5. Deployment Architecture

### 5.1. Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE                           │
│              (CDN + DDoS Protection)                  │
└──────────────────────┬────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐                ┌────▼─────┐
    │  Vercel │                │  Railway  │
    │ (Mobile │                │  (Backend │
    │  Assets)│                │   Server) │
    └────┬────┘                └──────┬────┘
         │                           │
    ┌────▼────┐                ┌──────▼──────┐
    │ Vercel  │                │   Neon DB   │
    │  Blob   │                │ (PostgreSQL) │
    │  (CDN)  │                └─────────────┘
    └─────────┘
                        ┌─────────────┐
                        │  Upstash    │
                        │   Redis     │
                        └─────────────┘
```

### 5.2. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/project_sunny"

# Redis
REDIS_URL="redis://user:pass@host:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OAuth (future)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# AWS S3 (for card images)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="project-sunny-assets"
AWS_REGION="ap-southeast-1"

# AdMob
ADMOB_APP_ID_ANDROID=""
ADMOB_APP_ID_IOS=""

# IAP
APPLE_SHARED_SECRET=""
GOOGLE_SERVICE_ACCOUNT=""

# Sentry
SENTRY_DSN=""

# External APIs
CLOUDFLARE_API_TOKEN=""
```

### 5.3. Deployment Scripts

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  # ── Backend ──────────────────────────────────────────
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm db:generate
      - run: pnpm build --filter=@project-sunny/api
      - run: pnpm test --filter=@project-sunny/api
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  # ── Database Migration ───────────────────────────────
  migrate-db:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - run: pnpm db:push --force-reset
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  # ── Mobile Build ──────────────────────────────────────
  build-android:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: cd apps/mobile && npx expo prebuild --platform android
      - run: cd apps/mobile/android && ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: apps/mobile/android/app/build/outputs/apk/release/*.apk

  build-ios:
    runs-on: macos-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: cd apps/mobile && npx expo prebuild --platform ios
      - run: |
          cd apps/mobile/ios
          xcodebuild -workspace *.xcworkspace \
            -scheme project-sunny \
            -configuration Release \
            -archivePath build/ProjectSunny.xcarchive \
            archive
      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: apps/mobile/ios/build/ProjectSunny.xcarchive
```

---

## 6. Monitoring & Observability

### 6.1. Metrics (Custom)

```typescript
// Key metrics to track
const METRICS = {
  // Business
  "game.created": Counter,          // Games created per minute
  "game.round_completed": Counter, // Rounds completed
  "game.completed": Counter,        // Games finished
  "user.registered": Counter,      // New registrations
  "iap.purchase": Counter,         // IAP purchases
  "ads.watched": Counter,         // Rewarded ads watched

  // Performance
  "api.latency": Histogram,        // API response time
  "ws.latency": Histogram,         // WebSocket round resolution time
  "db.query_latency": Histogram,   // DB query time
  "cache.hit_rate": Gauge,         // Redis cache hit rate

  // Health
  "room.active_count": Gauge,     // Active rooms
  "player.online_count": Gauge,    // Online players
  "socket.connected": Gauge,       // WebSocket connections
  "error.count": Counter,          // Errors by type
};

// Custom events
trackEvent("game_start", { roomId, playerCount, storeType });
trackEvent("round_end", { roomId, round, deaths, avgHP });
trackEvent("card_played", { cardKey, rarity, slot, playerId });
trackEvent("purchase", { packType, amount, currency });
```

### 6.2. Alerting Rules

```
CRITICAL:
  - Error rate > 5% for 5 minutes → PagerDuty
  - API latency p99 > 2s for 5 minutes → PagerDuty
  - Room resolution time > 5s → PagerDuty
  - Database connection errors → PagerDuty

WARNING:
  - Error rate > 1% for 10 minutes → Slack alert
  - Online players < 5 for 1 hour → Slack alert
  - Cache hit rate < 70% → Slack alert

INFO:
  - Daily report: registrations, retention, revenue
  - Weekly: player cohort analysis
```
