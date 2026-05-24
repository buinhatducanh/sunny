# TECH-REVIEW.md — Technology Architecture Review & Risk Assessment

> Đánh giá kiến trúc kỹ thuật: tech stack, technical debt, scaling, failure modes, security, performance.

---

## 1. Tech Stack Decision Analysis

### 1.1. Frontend: React Native (Expo) — Decision Quality: ⭐⭐⭐⭐

```
✅ STRENGTHS:
  - Cross-platform: iOS + Android from single codebase
  - Fast iteration: Hot reload during development
  - Large ecosystem: 50K+ packages
  - Expo managed workflow: No native code needed initially
  - AI-assisted development: Claude Code can write RN code easily
  - Zustand: Perfect for game state (simpler than Redux)
  - Reanimated 3: 60 FPS animations

⚠️  CONCERNS:
  - WebSocket performance on mobile: Needs careful implementation
  - Real-time multiplayer: React Native + Socket.io can lag
  - Battery drain: Always-on socket connection
  - Memory: Card images can be memory-heavy

MITIGATIONS:
  - Use optimistic UI updates (don't wait for server)
  - Lazy load card images with progressive JPEG
  - Minimize socket events (batch where possible)
  - Use MMKV instead of AsyncStorage for game cache
  - Test on low-end devices (Samsung A13, Redmi 9C)
```

### 1.2. Backend: NestJS — Decision Quality: ⭐⭐⭐⭐

```
✅ STRENGTHS:
  - TypeScript-first: Consistent with mobile codebase
  - Modular architecture: Easy to add features
  - Socket.io first-class support: WebSocket gateways
  - Swagger: Auto-generated API docs
  - Prisma: Type-safe database queries
  - Guards/Decorators: Clean auth + validation

⚠️  CONCERNS:
  - Memory footprint: NestJS heavier than Fastify
  - Cold start on serverless: Railway has ~3s cold start
  - Socket.io overhead: Protocol is verbose

MITIGATIONS:
  - Use @nestjs/platform-fastify for REST, NestJS for WebSocket
  - Railway: Keep-alive ping to prevent cold start
  - Socket.io: Use binary protocol where possible
```

### 1.3. Database: PostgreSQL (Neon) — Decision Quality: ⭐⭐⭐⭐⭐

```
✅ STRENGTHS:
  - Relational: Perfect for game data (users, rooms, history)
  - Neon: Serverless, auto-scaling, generous free tier
  - Prisma: Type-safe, migrations, easy schema changes
  - JSON fields: Store dynamic data (hand, slots, effects)

⚠️  CONCERNS:
  - Complex queries: Round history can be heavy
  - Neon cold starts: Serverless = occasional latency spike

MITIGATIONS:
  - Add indexes on: (roomId, round), (userId, createdAt)
  - Cache hot data in Redis (room state, player state)
  - Use connection pooling (Neon handles this)
  - Archive old round history (older than 30 days → cold storage)
```

### 1.4. Real-time: Socket.io — Decision Quality: ⭐⭐⭐

```
✅ STRENGTHS:
  - Battle-tested: Used by many games
  - Auto-reconnection: Built-in
  - Fallback: HTTP long-polling if WebSocket fails
  - Rooms: Native room concept matches our game

⚠️  CONCERNS:
  - Protocol overhead: JSON over WebSocket = more bandwidth
  - No binary: Faster protocols available (uWebSockets, raw WebSocket)
  - Scaling: Sticky sessions needed for Socket.io

MITIGATIONS:
  - Use Socket.io v4 with binary support
  - Use Redis adapter for horizontal scaling
  - Implement custom binary protocol for critical paths (card play)
  - Consider migrating to raw WebSocket post-launch if needed
```

### 1.5. Infrastructure: Railway + Neon + Upstash — Decision Quality: ⭐⭐⭐⭐

```
✅ STRENGTHS:
  - Railway: Simple deployment, reasonable pricing
  - Neon: Serverless PostgreSQL, no ops
  - Upstash: Serverless Redis, pay-per-use
  - All three: Free tiers available

⚠️  CONCERNS:
  - Three services = three points of failure
  - Railway: Can have cold starts
  - Upstash: Rate limits on free tier

MITIGATIONS:
  - Health check endpoints for all services
  - Circuit breaker pattern for DB calls
  - Cache aggressively to reduce DB pressure
```

---

## 2. Technical Debt Assessment

### 2.1. Current Technical Debt Items

```
┌─────────────────────────────────────────────────────────────────┐
│  TECHNICAL DEBT INVENTORY                                       │
├──────────────┬──────────┬────────────┬──────────────────────────┤
│  Item        │  Severity│  Effort    │  When to Fix             │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  No offline  │  HIGH   │  3 days    │  Phase 3               │
│  mode        │          │            │  (required for mobile)   │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  Socket.io   │  MEDIUM  │  2 days    │  Phase 4               │
│  binary proto│          │            │  (if performance issues) │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  No E2E      │  MEDIUM  │  5 days    │  Before soft launch     │
│  tests       │          │            │  (critical path only)   │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  Card images │  LOW    │  1 week    │  Phase 2               │
│  not CDN'd   │          │            │  (use placeholders)     │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  No API      │  LOW    │  2 days    │  Phase 3               │
│  versioning  │          │            │  (v1 is fine for now)  │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  No DB       │  MEDIUM  │  3 days    │  Before 100+ CCU       │
│  read replicas│          │            │                        │
├──────────────┼──────────┼────────────┼──────────────────────────┤
│  Hardcoded   │  LOW    │  1 day    │  Before Phase 3        │
│  constants   │          │            │  (already in constants)│
└──────────────┴──────────┴────────────┴──────────────────────────┘
```

### 2.2. Architecture Risks

```
⚠️  RISK 1: Single-Server Bottleneck
  Problem: All WebSocket connections go to 1 Railway instance
  Impact: 100 CCU fine, 500+ CCU = lag
  Fix:
    - Add Redis adapter for Socket.io
    - Scale Railway to 2+ instances
    - Use Railway auto-scaling

⚠️  RISK 2: Database Connection Pool Exhaustion
  Problem: Many concurrent players = many DB connections
  Impact: "Too many connections" error
  Fix:
    - Prisma connection pool: 10 connections
    - Use Redis for hot data (room state, session)
    - Add PgBouncer if needed (Neon has built-in)

⚠️  RISK 3: Long Game Sessions = Long WebSocket
  Problem: 20-round game = 20 min = open socket for 20 min
  Impact: Memory leaks, connection drops
  Fix:
    - Implement heartbeat every 30s
    - Auto-reconnect with state resync
    - Memory profiling in staging

⚠️  RISK 4: State Synchronization
  Problem: Client state can drift from server
  Impact: Desync, visual bugs
  Fix:
    - Server is authoritative
    - Client sends intents, server validates + executes
    - State hash verification after each round
```

---

## 3. Performance Budget

### 3.1. Mobile Performance Targets

```
┌──────────────────────────┬────────────┬────────────┬────────────┐
│  Metric                  │  Target    │  Warning   │  Critical  │
├──────────────────────────┼────────────┼────────────┼────────────┤
│  App cold start         │  < 3s      │  3-5s      │  > 5s     │
│  Game board load        │  < 1s      │  1-2s      │  > 2s     │
│  Card draw animation    │  60 FPS    │  40-50 FPS│  < 40 FPS │
│  WebSocket latency      │  < 100ms   │  100-300ms │  > 300ms  │
│  API response (p95)     │  < 200ms   │  200-500ms │  > 500ms  │
│  Memory usage (Android)  │  < 200MB   │  200-300MB │  > 300MB  │
│  APK size               │  < 50MB    │  50-80MB   │  > 80MB   │
│  Battery (per session) │  < 5%      │  5-10%     │  > 10%    │
└──────────────────────────┴────────────┴────────────┴────────────┘

COLD START OPTIMIZATION:
  - Bundle splitting: Lazy load non-critical screens
  - Font preloading: Load fonts early
  - Image caching: Cache card images aggressively
  - Hermes JS engine: Enabled by default in RN 0.70+
```

### 3.2. Network Payload Optimization

```
CURRENT ESTIMATES:
  Room state sync:     ~5 KB per event
  Card deal (5 cards): ~3 KB per deal
  Round resolution:    ~10 KB per round
  Total per game:      ~300 KB per player

OPTIMIZATION STRATEGIES:
  1. Card data:        Load from local cache, not server
     → Only send cardKeys, not full card objects
     → Client has full card data from constants package

  2. Compress WebSocket:  Enable compression
     → socket.io compress: true

  3. Batch events:       Don't send each card individually
     → Send hand as single array, not 5 events

  4. Delta updates:       Only send changed state
     → Full state on reconnect, delta on each action

TARGET:
  - WebSocket data:  < 50KB per round per player
  - Total bandwidth: < 1MB per 30-minute session
```

---

## 4. Security Review

### 4.1. Threat Model

```
THREAT ACTORS:
  1. Casual cheater: Wants to win more, modifies client
  2. Script kiddie: Uses automation tools
  3. Data scraper: Extracts game data
  4. Griefers: Harms other players' experience
  5. Competitor: Industrial espionage

ATTACK SURFACE:
  - REST API: Auth, data endpoints
  - WebSocket: Game actions, state
  - Client: Game logic, card data
  - Database: Player data, game history
```

### 4.2. Security Controls

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1: AUTHENTICATION                                        │
├──────────────────────────────────────────────────────────────────┤
│  ✓ JWT access token (15min expiry) + refresh token (7d)          │
│  ✓ Password hashed with bcrypt (cost 12)                        │
│  ✓ Rate limiting on auth endpoints (10/min)                     │
│  ✓ Account lockout after 10 failed attempts                     │
│  ✓ Password requirements: 8+ chars, mixed case                  │
│                                                                  │
│  GAP: No 2FA / OTP → MEDIUM risk for user accounts              │
│  GAP: No device fingerprinting → account sharing hard to detect│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  LAYER 2: API SECURITY                                          │
├──────────────────────────────────────────────────────────────────┤
│  ✓ HTTPS everywhere (TLS 1.2+)                                  │
│  ✓ Input validation with class-validator                        │
│  ✓ SQL injection prevented (Prisma ORM)                         │
│  ✓ XSS prevented (React handles escaping)                     │
│  ✓ Rate limiting (nestjs/throttler)                            │
│  ✓ CORS configured (allowlist)                                 │
│                                                                  │
│  GAP: No API versioning yet → MEDIUM risk                     │
│  GAP: No request signing → MODERATE risk                      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  LAYER 3: GAME SECURITY                                         │
├──────────────────────────────────────────────────────────────────┤
│  ✓ ALL game logic server-side                                   │
│  ✓ Client only sends card intent (cardId + slot)               │
│  ✓ Server validates card play + executes                        │
│  ✓ Rate limit: 10 WebSocket events/s/player                   │
│  ✓ Timestamp validation (reject fast actions <200ms)           │
│  ✓ State hash after each round                                 │
│                                                                  │
│  CRITICAL: This is the most important layer                   │
│  If ANY game logic is client-side → game is compromised        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  LAYER 4: DATA SECURITY                                         │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Database credentials in environment variables                 │
│  ✓ No secrets in code                                          │
│  ✓ Prisma $transaction for critical writes                     │
│  ✓ Soft delete for users (GDPR compliance)                     │
│  ✓ Database backups (Neon auto-backup)                         │
│                                                                  │
│  GAP: No encryption at rest for PII → LOW risk (Neon handles) │
│  GAP: No field-level encryption → LOW risk                     │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3. Anti-Cheat Specific

```
GAMEPLAY ANTI-CHEAT:
  1. Action timing:   Reject if < 200ms between actions
  2. Card selection:  Server validates slot type match
  3. Energy check:    Server validates energy before card play
  4. State hash:      Server sends hash, client can verify
  5. Bot detection:  Flag accounts with perfect timing

BOT/SCRIPT DETECTION:
  1. Same action timing across games (automation)
  2. Always optimal plays (pattern matching)
  3. Session patterns (24/7 activity = bot)
  4. IP/device clustering (same bot = same IP range)

RESPONSE PROTOCOL:
  - Flag:   Watch, gather evidence
  - Warning: Email player, disable rewards
  - Ban:     Permanent, no appeal
  - Refund:  No refund for banned accounts
```

---

## 5. Scalability Architecture

### 5.1. Scaling Triggers

```
TRIGGER            │  ACTION                          │  COST IMPACT
───────────────────┼─────────────────────────────────┼───────────────
100 CCU            │  Current setup (baseline)      │  $5-20/mo
200 CCU            │  Add Redis cache layer          │  +$10/mo
500 CCU            │  Railway 2x instances           │  +$20/mo
1,000 CCU         │  + DB read replica             │  +$25/mo
2,000 CCU         │  + Optimizations               │  +$50/mo
5,000 CCU         │  + Dedicated hosting           │  +$200/mo
10,000 CCU         │  + Full infrastructure rebuild│  +$500+/mo
```

### 5.2. Horizontal Scaling for WebSocket

```
CURRENT (Single Instance):
  Railway 1x instance
  All socket connections → same process
  ✅ 100 CCU = fine
  ⚠️  500+ CCU = bottleneck

TARGET (Horizontally Scalable):
  ┌──────────────────────────────────────────────┐
  │  Load Balancer (Cloudflare / Railway)       │
  └──────────────────┬───────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
  Railway-1     Railway-2     Railway-3
     │               │               │
  ┌──┴──────┐  ┌──┴──────┐  ┌──┴──────┐
  │ Socket.io │  │ Socket.io│  │ Socket.io│
  │ Adapter   │  │ Adapter  │  │ Adapter  │
  └─────┬────┘  └─────┬────┘  └─────┬────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                 ┌──────┴──────┐
                 │   Upstash    │
                 │    Redis     │
                 │  (Cluster)   │
                 └─────────────┘

MIGRATION PATH:
  1. Current: Single Railway + Redis (for cache only)
  2. 500 CCU: Redis Adapter + 2 Railway instances
  3. 1,000 CCU: Redis Adapter + 3 Railway instances
  4. 5,000 CCU: Consider managed WebSocket service (Ably, Pusher)
```

---

## 6. Failure Mode Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│  FAILURE MODE & RECOVERY PLAYBOOKS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FAILURE: Railway backend crashes                              │
│  Impact:     All players disconnected                          │
│  Detection:  Health check fails                                │
│  Recovery:   Railway auto-restarts (30-60s)                   │
│  Player:     Reconnect → resync state from DB                  │
│  Mitigation: Keepalive ping, graceful reconnect                 │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: Neon database connection drops                      │
│  Impact:     Game hangs, new games can't start               │
│  Detection:  Health check on /api/health                       │
│  Recovery:   Auto-reconnect (Neon handles)                     │
│  Player:     See "Connection issue" toast, retry              │
│  Mitigation: Circuit breaker, Redis cache for critical data    │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: Upstash Redis rate-limited                          │
│  Impact:     Rate limit errors, slow cache                    │
│  Detection:  429 response from Redis                           │
│  Recovery:   Fall back to direct DB (slower but works)        │
│  Player:     Slightly slower load times                        │
│  Mitigation: Upgrade Redis plan early                          │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: Game logic bug crashes round                       │
│  Impact:     Round stuck, game can't progress               │
│  Detection:  Server error logs + player reports               │
│  Recovery:   Admin force-ends round via dashboard             │
│  Player:     See "Round reset" message, resume               │
│  Mitigation: Comprehensive unit tests for game engine           │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: Card data corrupted in constants                    │
│  Impact:     Wrong card stats, balance broken                │
│  Detection:  Pre-commit validation, lint checks              │
│  Recovery:   Hotfix constants, redeploy (5 min)             │
│  Player:     See "Patch applied" message                    │
│  Mitigation: Type-safe card data, Zod validation            │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: Memory leak in mobile app                          │
│  Impact:     App crashes after 30+ min                     │
│  Detection:   Crash reporting (Sentry)                        │
│  Recovery:   Force close, reopen                            │
│  Mitigation:  Profiling, cleanup timers, image cache limit  │
│                                                                  │
│  ─────────────────────────────────────────────────────────── │
│                                                                  │
│  FAILURE: DDoS attack                                         │
│  Impact:     Service unavailable                              │
│  Detection:   Traffic spike > 10x normal                     │
│  Recovery:    Cloudflare rate limiting + IP block           │
│  Player:     See "Server busy" message                        │
│  Mitigation:  Cloudflare Pro ($20/mo)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Testing Strategy

### 7.1. Testing Pyramid

```
                    ▲
                   /│\
                  / │ \         E2E Tests (Playwright)
                 /  │  \        - Critical paths only
                /───┼---\       - Login → Create → Play → End
               /    │    \      - ~10 tests
              /─────┼────-\
             /      │      \     Integration Tests (Jest + Supertest)
            /       │       \   - API endpoints
           /────────┼────────\  - WebSocket flows
          /         │         \ - ~30 tests
         /──────────┼──────────\
        /           │           \  Unit Tests (Jest)
       /            │            \ - Game engine functions
      ▼            │             ▼- Economy calculations
   GAME ENGINE     │             - Card resolution
   (Pure TS)       │             - ~100 tests
```

### 7.2. Critical Path E2E Tests

```
TEST 1: Complete Game Flow
  1. Register → Login
  2. Create room
  3. Join room (second account)
  4. Start game
  5. Vote store type
  6. Play full 20 rounds (or until game over)
  7. Verify winner, XP awarded
  Time: ~20-30 minutes

TEST 2: Disconnect & Reconnect
  1. Join game
  2. Start playing
  3. Disconnect (simulate)
  4. Reconnect within 60s
  5. Verify state restored correctly

TEST 3: Card System Integrity
  1. Open card pack
  2. Verify card rarity distribution
  3. Verify pity system
  4. Verify no duplicate cards (preferentially)

TEST 4: Economy Balance
  1. Run 10K simulation games
  2. Verify win rate ~50% at round 20 (no cards)
  3. Alert if deviation > 10%
```

---

## 8. Technology Recommendations

```
╔══════════════════════════════════════════════════════════════╗
║  CONFIRMED — KEEP THESE DECISIONS                          ║
╠══════════════════════════════════════════════════════════════╣
║  ✓ React Native + Expo: Best for cross-platform mobile    ║
║  ✓ NestJS: Solid backend framework                        ║
║  ✓ Prisma + PostgreSQL: Type-safe, relational            ║
║  ✓ Socket.io: Battle-tested real-time                   ║
║  ✓ Railway + Neon + Upstash: Cost-effective combo       ║
║  ✓ Zustand: Simple, game-appropriate state              ║
║  ✓ Reanimated 3: 60 FPS animations                       ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  RECOMMENDED CHANGES                                        ║
╠══════════════════════════════════════════════════════════════╣
║  ⚠️  Add Redis Adapter for Socket.io NOW (not later)     ║
║     Reason: Harder to migrate under load                  ║
║                                                              ║
║  ⚠️  Use Zod for ALL API validation (not just DTO)       ║
║     Reason: Validate incoming WebSocket messages too        ║
║                                                              ║
║  ⚠️  Add error boundary to every screen                  ║
║     Reason: Mobile apps crash on errors without boundaries ║
║                                                              ║
║  ⚠️  Store card images as base64 locally (not URL)       ║
║     Reason: No CDN needed at launch, simplifies caching   ║
╚══════════════════════════════════════════════════════════════╝
```
