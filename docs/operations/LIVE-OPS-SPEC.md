# LIVE-OPS-SPEC.md — Live Operations & Content Pipeline

> Chi tiết về analytics, content pipeline, season management, hotfix, và community.

---

## 1. Analytics & Telemetry

### 1.1. Event Tracking Schema

```typescript
// Every tracked event has this base structure
interface AnalyticsEvent {
  event: string;
  timestamp: number;      // Unix ms
  sessionId: string;       // Anonymous session ID
  userId?: string;         // If logged in
  platform: "android" | "ios";
  appVersion: string;
  buildNumber: number;
  deviceId: string;
  properties: Record<string, unknown>;
}

// SESSION EVENTS
track("session.start", { platform, source });
track("session.end", { duration, endReason });
track("session.error", { errorType, errorMessage });

// TUTORIAL EVENTS
track("tutorial.started", { step: 1 });
track("tutorial.step_completed", { step: 1, duration });
track("tutorial.skipped", { atStep: 3 });
track("tutorial.completed", { totalDuration });

// GAME EVENTS
track("game.created", { mode, playerCount });
track("game.joined", { roomId, isHost, mode });
track("game.started", { roomId, storeType, professions });
track("game.round_started", { roomId, round, env });
track("game.round_resolved", { roomId, round, deaths, avgHP });
track("game.ended", {
  roomId,
  outcome,           // "won" | "lost"
  finalRound,
  finalHP,
  finalMoney,
  rank,              // 1-5
  score,
  mvpId,
  survivingPlayers,
});

// CARD EVENTS
track("card.dealt", { roomId, round, cardKey, rarity });
track("card.played", { roomId, round, cardKey, rarity, slot });
track("card.locked", { roomId, round, cardKey });
track("card.resolved", {
  roomId, round, cardKey,
  effectType, value,
  isCrit, wasCombo
});
track("card.pack_opened", {
  packType, cards[], rarities[], duplicates
});
track("card.gained", { cardKey, source });  // source: "pack" | "achievement" | "quest"

// PROGRESSION EVENTS
track("xp.gained", { source, amount, newLevel, levelChanged });
track("level.up", { newLevel, totalXP });
track("quest.completed", { questType, reward });
track("quest.claimed", { questType, rewardType, amount });
track("achievement.unlocked", { achievementType, progress });
track("stat.milestone", { statType, value });

// IAP EVENTS
track("purchase.started", { productId, price, currency });
track("purchase.completed", { productId, price, currency, transactionId });
track("purchase.failed", { productId, reason, errorCode });

// AD EVENTS
track("ad.loaded", { adUnitId, type });
track("ad.watched", { adUnitId, duration, completed });
track("ad.skipped", { adUnitId });
track("ad.reward_claimed", { rewardType, amount });

// RETENTION EVENTS
track("dau", { activePlayers: number });           // Daily
track("wau", { activePlayers: number });           // Weekly
track("mau", { activePlayers: number });           // Monthly
track("session.count", { count });                 // Sessions per day per user

// ECONOMY EVENTS
track("economy.revenue_total", { amount, source });
track("economy.spent", { amount, currency, destination });
track("economy.earned", { amount, source });

// SOCIAL EVENTS
track("friend.added", { method });                  // "invite" | "code" | "search"
track("guild.created", { name });
track("guild.joined", { guildId });
```

### 1.2. Analytics Dashboard (Metrics)

```
REAL-TIME DASHBOARD (refresh 30s):
  ┌──────────────────────────────────────────────────────────┐
  │  TODAY                                                │
  │  Active Users:  1,247  ↑12%                          │
  │  DAU:          3,891  ↑8%                            │
  │  Sessions:      8,234  ↑15%                          │
  │  Revenue:       $342   ↑5%                            │
  │  Avg Session:   12m 34s                              │
  └──────────────────────────────────────────────────────────┘

  GAME METRICS:
  Games Created Today:  2,341
  Avg Round Reached:    14.7
  Win Rate (all):      47%
  Most Popular Store:   Ad Agency (32%)
  Most Popular Profession: Marketing (28%)

  CARD METRICS:
  Packs Opened Today:   1,247
  Legendary Rate (actual): 4.8%  ← compare to 5% spec
  Most Played Card:     MK_SPECIAL_007 (Viral Loop)
  Most Combo:           SW+MK combo (23% of games)

  IAP METRICS:
  Conversion Rate:     3.2%
  ARPPU:              $2.14
  Top Product:         Battle Pass (52% of revenue)
  Refund Rate:         0.8%

  RETENTION:
  D1:  68%  ← Day 1 retention
  D7:  34%
  D30: 18%
```

### 1.3. Cohort Analysis

```
WEEKLY COHORT RETENTION GRID:

         Week 0    W1     W2     W3     W4     W5
Nov-17   10,000   42%    22%    15%    11%     8%
Nov-24    9,200   41%    21%    14%    10%     —
Dec-01    8,500   40%    20%    13%     —      —
Dec-08    8,100   39%    19%     —      —      —
Dec-15    7,800   38%     —      —      —      —
```

---

## 2. Season Management

### 2.1. Season Structure

```typescript
interface Season {
  id: string;
  number: number;
  name: string;
  theme: string;                    // "Tet 2026", "Summer 2026"
  startDate: Date;
  endDate: Date;
  durationWeeks: 8;

  // Battle Pass
  battlePassPriceVND: 49000;
  tierCount: 50;

  // Content
  exclusiveCards: CardKey[];       // 20 seasonal cards
  exclusiveCosmetics: CosmeticKey[];
  exclusiveTitle: string;

  // Events
  seasonEvents: SeasonEvent[];
  balancePatch: Date;              // Mid-season (week 4)

  // Migration
  previousSeasonId: string;
}

const SEASON_1: Season = {
  id: "season_1",
  number: 1,
  name: "Khởi Đầu",
  theme: "The Beginning",
  startDate: "2026-06-01",
  endDate: "2026-07-26",          // 8 weeks
  durationWeeks: 8,
  battlePassPriceVND: 49000,
  tierCount: 50,
  exclusiveCards: [
    "SEAS_S1_001", "SEAS_S1_002", "SEAS_S1_003",
    // ... 20 total
  ],
  exclusiveCosmetics: [
    "card_back_galaxy_01",
    "frame_ruby_01",
    "avatar_sunny_v2",
  ],
  exclusiveTitle: "Người Khởi Nghiệp",
  seasonEvents: [
    { week: 1, event: "LAUNCH_EVENT", bonus: "2x XP" },
    { week: 4, event: "MID_SEASON", bonus: "NEW_CARDS" },
    { week: 7, event: "COUNTDOWN", bonus: "1.5x Coins" },
    { week: 8, event: "GRAND_FINALE", bonus: "3x Rewards" },
  ],
  balancePatch: "2026-06-22",       // 3 weeks in
};
```

### 2.2. Battle Pass Reward Structure

```
TIER  REWARD (Free)                    REWARD (Premium)
─────────────────────────────────────────────────────────
1     100 Coins                        + Card Back: "Starter"
5     50 Gems                         + Frame: "Bronze"
10    Common Card Pack                 + Card Back: "Sunrise"
15    200 Coins                       + Avatar: "Sunny V2"
20    Rare Card Pack                   + Card Back: "Cosmic"
25    100 Gems                         + Title: "Người Khởi Đầu"
30    Epic Card Pack                   + Card Back: "Galaxy"
35    200 Gems                         + Frame: "Silver"
40    Legendary Card (Season Exclusive) + Card Back: "Nebula"
45    500 Coins                       + Card Back: "Aurora"
50    Ultimate Card Pack (5 cards)    + Full Cosmetic Set + Title

XP REQUIRED PER TIER:
  Tier 1-10:   100 XP each
  Tier 11-25:  150 XP each
  Tier 26-40:  200 XP each
  Tier 41-50:  300 XP each
  Total: 8,500 XP (achievable in 8 weeks)

XP SOURCES:
  - Playing games:     20-100 XP per game
  - Daily quests:      30-80 XP per quest
  - Achievements:      50-500 XP
  - Season events:     Bonus XP multipliers
```

---

## 3. Content Pipeline

### 3.1. Card Rotation Strategy

```
STANDARD POOL:  ~180 cards (always available)
SEASONAL POOL:   ~20 cards (season exclusive)
EVENT CARDS:      ~5 cards (limited time events)

CARD ROTATION RULES:
  1. New standard cards added every 2 seasons
  2. No card removed from standard pool (ever)
     → Once available, always available
  3. Seasonal cards return to standard pool
     after 2 seasons (e.g., S1 cards in S3+)
  4. Event cards are temporary (1-2 weeks)
  5. Balance changes only via stat adjustments
     (never remove a card's effect)

SEASONAL CONTENT DROPS:
  Week 1:   Season launch + 20 new cards
  Week 4:   Mid-season mini-expansion (5 cards)
  Week 7:   Countdown cards (5 cards)
  Week 8:   Finale event cards
```

### 3.2. Hotfix Process

```
BALANCE HOTFIX TYPES:

TYPE 1 — Emergency (0-24h deployment):
  Trigger:   Game-breaking bug or exploit
  Review:    Internal only
  Deploy:    Immediate
  Examples:  Server crash, infinite loop, infinite money exploit

TYPE 2 — Balance Patch (3-7 days):
  Trigger:   Card/feature clearly unbalanced
  Review:    Internal + Community vote
  Deploy:    Staggered (warning → deploy)
  Examples:  Card 500% stronger than intended
             Profession win rate 60%+ / 40%-

TYPE 3 — Content Update (2-4 weeks):
  Trigger:   Planned content release
  Review:    Full QA + beta testing
  Deploy:    Scheduled maintenance window
  Examples:  New cards, new features, UI updates

HOTFIX NOTIFICATION:
  In-game banner:    48h before (Type 2/3)
  Patch notes:       Full changelog in app
  Community:         Discord + Facebook announcement
```

### 3.3. A/B Testing Framework

```typescript
// A/B Test definitions
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "draft" | "running" | "paused" | "concluded";
  startDate: Date;
  endDate?: Date;

  variants: {
    name: string;
    weight: number;    // 0-100, must sum to 100
    config: Record<string, unknown>;
  }[];

  target: {
    platform?: ("android" | "ios")[];
    minGames?: number;
    minLevel?: number;
    countries?: string[];
  };

  metrics: {
    primary: string;    // Metric to optimize
    secondary: string[];
  };

  results?: {
    winner: string;
    confidence: number;
    lift: number;
    pValue: number;
  };
}

// Example A/B Tests

const AB_TEST_1: ABTest = {
  id: "test_energy_regen",
  name: "Energy Regeneration Rate",
  description: "Test 50% vs 60% energy regen per round",
  status: "running",
  variants: [
    { name: "control", weight: 50, config: { energyRegenPercent: 50 } },
    { name: "variant", weight: 50, config: { energyRegenPercent: 60 } },
  ],
  target: { minGames: 3 },
  metrics: {
    primary: "avg_rounds_per_game",
    secondary: ["win_rate", "cards_played_per_game"],
  },
};
```

---

## 4. Community Management

### 4.1. Communication Channels

```
OFFICIAL CHANNELS:
  Discord:     https://discord.gg/project-sunny     (Primary)
  Facebook:   https://facebook.com/project.sunny    (Community)
  TikTok:     @project.sunny.game                  (Content)
  Website:    https://project-sunny.com            (Info)

IN-GAME:
  In-app news banner:    For major announcements
  In-game mail:          For personal rewards, events
  In-game chat:          Lobby + Guild chat
  Rate/review prompt:    After game 5, 15, 30

COMMUNITY MANAGER RESPONSIBILITIES:
  - Daily:    Monitor Discord, respond to urgent issues
  - Weekly:   Community roundup post (highlights, feedback)
  - Monthly:  Developer diary / changelog summary
  - Event:    AMA sessions, community tournaments
```

### 4.2. Bug Report & Feedback Flow

```
USER REPORTS BUG:
  In-game:  Settings → Report Bug
    → Auto-attached: game logs, device info, screenshot
    → User describes issue
    → Submitted → ticket created

TICKET FLOW:
  New → Triage (1h) → Priority assigned
    → P1 (game-breaking): Dev hotfix
    → P2 (significant): Next patch
    → P3 (minor): Backlog
    → P4 (cosmetic): Future consideration

FEEDBACK LOOP:
  User submits feedback → Reviewed weekly
  Popular feedback → Vote on Discord
  Top voted → Roadmap consideration
  Implemented → Announced with credit
```

### 4.3. Community Events Calendar

```
JANUARY:
  - New Year Event (2 weeks)

FEBRUARY:
  - Tet / Lunar New Year Event (3 weeks)
  - Valentine's Day Mini-event

MARCH:
  - Anniversary Month (Season 1 Finale)

APRIL:
  - Spring Festival Event

MAY:
  - Summer Preview Event

JUNE:
  - Season 2 Launch + Summer Event

JULY:
  - Mid-Year Tournament

AUGUST:
  - Season 3 Launch

[... ongoing ...]

EVENT TYPES:
  - Login bonus:   Free rewards for consecutive days
  - Double XP:     2x progression
  - Double Coins:   2x in-game currency
  - Special Packs:  Event-exclusive card packs
  - Community Goal:  Collective milestone rewards
  - Tournaments:    Competitive events with prizes
```

---

## 5. Localization (i18n)

### 5.1. Supported Languages

```
LAUNCH:
  - Vietnamese (vi)     ← Primary market
  - English (en)        ← Secondary

FUTURE:
  - Thai (th)
  - Indonesian (id)
  - Malay (ms)

LOCALIZATION PRIORITY:
  1. All UI text (strings)
  2. Card names and descriptions
  3. Tutorial text
  4. Sound/voice (Vietnamese voice lines)
  5. Marketing materials
```

### 5.2. i18n Implementation

```typescript
// packages/i18n/src/

// Structure:
i18n/
├── vi.json          // Vietnamese (primary)
├── en.json          // English
├── index.ts
└── useTranslation.ts

// Usage in React Native:
import { useTranslation } from "@project-sunny/i18n";

function CardName({ card }) {
  const { t } = useTranslation();
  return <Text>{t(`cards.${card.cardKey}.name`)}</Text>;
}

// Card name example:
{
  "cards": {
    "MK_SPECIAL_001": {
      "name": "Chiến Dịch Bất Ngờ",
      "description": "+{value} doanh thu, +{customers} khách hàng"
    }
  }
}
```

---

## 6. Compliance & Legal

### 6.1. Privacy & Data

```
DATA COLLECTED:
  - Email, username, avatar (account)
  - Game stats, card collection (gameplay)
  - Device ID, platform, app version (technical)
  - IP address, approximate location (technical)
  - In-app purchases (billing)

DATA NOT COLLECTED:
  - Real name (optional)
  - Phone number
  - Payment info (handled by Google/Apple)
  - Precise location
  - Contacts
  - Browsing history

COMPLIANCE:
  - GDPR (EU): Data export, deletion on request
  - COPPA (US): No data from users < 13
  - PDPD (Vietnam): Privacy policy in Vietnamese
  - App Store / Play Store guidelines

REQUIRED DOCUMENTS:
  - Privacy Policy (published URL)
  - Terms of Service (published URL)
  - Age Rating: 12+ (App Store), Everyone (Play Store)
```

### 6.2. Content Moderation

```
CHAT MODERATION:
  - Real-time filter for profanity (Vietnamese + English)
  - Auto-block: Spam, personal info, hate speech
  - Manual review queue for flagged messages
  - 3-strike system: Warning → Mute 1 day → Ban

UGC (User Generated Content):
  - Guild names: Filtered for profanity + length limit (20 chars)
  - Custom card backs (future): Pre-approved templates only
  - Profile bio: Max 100 chars, profanity filter
```
