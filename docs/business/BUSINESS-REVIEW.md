# BUSINESS-REVIEW.md — Business Model & Unit Economics Deep Analysis

> Phân tích chiến lược kinh doanh: mô hình doanh thu, unit economics, funnel, retention, launch.

---

## 1. Revenue Model Analysis

### 1.1. Current Revenue Streams

```
┌──────────────────────────────────────────────────────────────────┐
│  REVENUE STREAM           │  PRICE (VND)  │  MARGIN  │  RISK  │
├───────────────────────────┼───────────────┼──────────┼────────┤
│  Card Pack Small          │     15,000    │   97%   │  Low   │
│  Card Pack Medium         │     49,000    │   97%   │  Low   │
│  Card Pack Large          │     99,000    │   97%   │  Low   │
│  Battle Pass (8 tuần)    │     49,000    │   97%   │  Medium│
│  Energy Refill            │      5,000    │   97%   │  Low   │
│  Remove Ads               │     25,000    │   97%   │  Low   │
│  Ad Revenue (Rewarded)    │   ~$0.02/play│   70%   │  Medium│
│  Ad Revenue (Interstitial)│   ~$0.01/show│   70%   │  Medium│
└───────────────────────────┴───────────────┴──────────┴────────┘
```

### 1.2. Unit Economics (Conservative Estimates)

```
ASSUMPTIONS:
  - Target market: Vietnam, 18-35 tuổi, mobile
  - Free-to-play, no forced P2W
  - Season: 8 weeks

LIFETIME VALUE (LTV) ESTIMATES:

Scenario A — Casual Player (70% of users):
  - Plays 2-3 games/week
  - Average session: 15 minutes
  - Lifetime: ~3 months
  - IAP conversion: 3% of casuals
  - Average IAP spend: 50,000 VND ($2)
  - Ad revenue: 0.5 ads/day × 90 days × $0.02 = $0.90
  - LTV (Casual) = $2.90 ≈ 72,500 VND

Scenario B — Committed Player (25% of users):
  - Plays daily
  - Average session: 25 minutes
  - Lifetime: ~6 months
  - IAP conversion: 15%
  - Average IAP spend: 200,000 VND ($8)
  - Battle Pass: 50% buy → 49,000 VND ($2)
  - Ad revenue: 3 ads/day × 180 days × $0.02 = $10.80
  - LTV (Committed) = $20.80 ≈ 520,000 VND

Scenario C — Whale (5% of users):
  - Plays daily, high engagement
  - Lifetime: ~12 months
  - IAP conversion: 100%
  - Average IAP spend: 500,000 VND ($20)
  - Battle Pass: 100% buy → 49,000 VND ($2)
  - Card Packs: 5 packs/month × 12 × 49,000 = 2,940,000 VND ($117)
  - LTV (Whale) = $139 ≈ 3,475,000 VND

BLENDED LTV:
  = (70% × 72,500) + (25% × 520,000) + (5% × 3,475,000)
  = 50,750 + 130,000 + 173,750
  = 354,500 VND ($14.2) average per user
```

### 1.3. Customer Acquisition Cost (CAC)

```
ORGANIC CHANNELS (Primary — Zero cost):
  - App Store/Play Store search optimization
  - Word-of-mouth (organic virality)
  - Community building (Discord, Facebook)
  - Content marketing (TikTok, YouTube)

PAID CHANNELS:
  - Google UAC:        $0.80-2.00 CPI (Cost Per Install)
  - Facebook/Meta Ads: $0.50-1.50 CPI
  - TikTok Ads:        $0.30-1.00 CPI
  - Influencer (VN):   $200-500/post

REALISTIC CAC (Vietnam market):
  - Organic:   0 VND (primary strategy)
  - Paid:     30,000-60,000 VND ($1.2-2.4) per install
  - Influencer: 500,000-2,000,000 VND per video

BREAKEVEN ANALYSIS:
  Blended LTV:    354,500 VND
  Breakeven CAC:  < 354,500 VND per user
  With 50% margin: < 177,250 VND

  → Organic-first strategy is ESSENTIAL
  → Paid ads only profitable if LTV/CAC > 3x
  → Target: 500K organic installs before paid spend
```

### 1.4. Monthly Revenue Projections

```
LAUNCH MONTH (Month 1):
  - Installs: 10,000 (organic burst)
  - DAU: 3,000 (30% of installs)
  - Paying users: 2% → 200
  - Revenue: (200 × 200K) + (10K × $0.5 ad rev)
  - Revenue: 40,000,000 + $5,000 = ~45,000,000 VND ($1,800)

GROWTH (Month 3):
  - Installs: 50,000 cumulative
  - DAU: 12,000
  - Paying users: 4% → 2,000
  - Revenue: (2,000 × 250K) + (12K DAU × $0.15/day × 30)
  - Revenue: 500,000,000 + $54,000 = ~1,850,000,000 VND ($74,000)

STEADY STATE (Month 12):
  - Installs: 200,000 cumulative
  - DAU: 40,000
  - Paying users: 6% → 12,000
  - Revenue: (12,000 × 350K) + (40K DAU × $0.15/day × 30)
  - Revenue: 4,200,000,000 + $180,000 = ~6,570,000,000 VND ($262,800)

⚠️  REALISTIC DOWNSIDE: These numbers assume strong retention.
   Industry average for VN mobile: 70% D1, 30% D7, 10% D30.
   Actual Month 3 DAU likely 3,000-5,000, not 12,000.
```

### 1.5. Revenue Model Weaknesses & Fixes

```
⚠️  WEAKNESS 1: Over-reliance on IAP
  Problem: 92% revenue from IAP, 8% from ads
  Risk:     Low conversion rate = near-zero revenue
  Fix:
    - Increase rewarded ad frequency (currently 5/day max)
    - Add interstitial after round ends (every 3 rounds)
    - Add banner-free but add a "Watch ad to skip" for busy rounds
    - IAP should be COMFORT, not NECESSITY

⚠️  WEAKNESS 2: Battle Pass Price Too High for VN Market
  Problem: 49,000 VND = ~$2.00 USD equivalent
           VN median income is $250/month → $2 is 0.8% of income
           For comparison, US $2 = 0.1% of $2,000 income
  Risk:     Battle Pass conversion will be low
  Fix:
    - Add 15,000 VND Battle Pass Lite (fewer rewards)
    - Or: 30-day Battle Pass at 25,000 VND
    - Track conversion vs price sensitivity

⚠️  WEAKNESS 3: No "Entry Point" IAP
  Problem: Smallest pack is 15,000 VND — too high for impulse buy
  Fix:
    - Add 5,000 VND "Starter Pack" (1 card + 100 coins)
    - Add 3,000 VND "Daily Gem" (50 coins/day for 7 days)
    - Impulse buy at checkout = high conversion

⚠️  WEAKNESS 4: No Seasonal Bundle
  Problem: Individual purchases only, no "deal" framing
  Fix:
    - Launch bundle: "Khởi Đầu Package" = 3 packs + BP + 500 coins = 99,000 VND
      (vs 149,000 VND bought separately = 33% saving)
```

---

## 2. User Funnel Analysis

### 2.1. Complete Funnel

```
DOWNLOAD → ONBOARDING → CORE LOOP → RETENTION → MONETIZATION

DOWNLOAD (Acquisition):
  Store listing → Install
  Conversion rate: ~30-40% (depends on icon, screenshots, rating)
  Key drop-off: Low rating (<4.0) kills installs

INSTALL → TUTORIAL:
  Open app → Complete onboarding (6 steps)
  Drop-off: ~15-20% abandon during tutorial
  Key friction: Forced 5-minute flow feels long

TUTORIAL → FIRST GAME:
  Complete tutorial → Start first real game
  Drop-off: ~5% abandon here
  Key friction: Tutorial vs "just let me play"

FIRST GAME → SECOND GAME:
  Play 1 game → Return next day
  Drop-off: ~40-50% don't return
  ⚠️  THIS IS THE BIGGEST PROBLEM IN MOBILE

RETURNING → RETAINED:
  D1 → D7: ~30% retained
  D7 → D30: ~33% of D7 → ~10% of DAU
  M30: ~5-10% of installs still playing

RETAINED → PAYING:
  Free → First purchase
  Conversion: 2-6% of retained users
  Average time to first purchase: 3-7 days

PAYING → WHALE:
  First purchase → Repeat purchase
  Repeat rate: 20-30% of first-time buyers
  Time to whale: 2-4 weeks
```

### 2.2. Funnel Optimization Priorities

```
╔══════════════════════════════════════════════════════════════╗
║  PRIORITY 1: REDUCE D1 → D2 DROP-OFF                       ║
║  (Currently 50-70% drop, target: <40%)                     ║
╠══════════════════════════════════════════════════════════════╣
║  Root causes:                                                ║
║  - Tutorial too long                                        ║
║  - First game too hard (bot feels unfair)                  ║
║  - No clear "what to do next" after first game             ║
║  - No push notification reminder                            ║
║                                                              ║
║  Fixes:                                                      ║
║  ✓ Shorten tutorial to 3 minutes max                        ║
║  ✓ Tutorial bot plays badly intentionally                   ║
║  ✓ Post-game: Show "Come back tomorrow for 50 bonus coins" ║
║  ✓ Push notification after 20 hours if not returned         ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  PRIORITY 2: IMPROVE FIRST PURCHASE CONVERSION              ║
║  (Currently 2-6%, target: 8-12%)                          ║
╠══════════════════════════════════════════════════════════════╣
║  Root causes:                                                ║
║  - No "pushed" IAP moment                                  ║
║  - Price anchoring missing                                 ║
║  - No limited-time offer framing                           ║
║                                                              ║
║  Fixes:                                                      ║
║  ✓ First purchase: Show "Starter Pack" popup on D3        ║
║  ✓ Price: 9,000 VND (0.99 USD equivalent) for first-time  ║
║  ✓ Timer: "Offer expires in 24 hours"                       ║
║  ✓ Social proof: "100+ players bought today"              ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  PRIORITY 3: EXTEND SESSION LENGTH                         ║
║  (Currently ~15 min, target: 25-30 min)                    ║
╠══════════════════════════════════════════════════════════════╣
║  Root causes:                                                ║
║  - No reason to stay longer                                ║
║  - Solo games end quickly (no multiplayer lobby wait)      ║
║  - Collection screen is flat                               ║
║                                                              ║
║  Fixes:                                                      ║
║  ✓ Add "Daily Challenge" — longer quest in solo mode       ║
║  ✓ Collection: Add card fusion/upgrade system              ║
║  ✓ Add idle mechanics: "Cửa hàng tự động kiếm tiền khi offline" ║
╚══════════════════════════════════════════════════════════════╝
```

### 2.3. Retention Hooks Matrix

```
╔════════════════════════════════════════════════════════════════════╗
║        RETENTION HOOK ARCHITECTURE                                ║
╠═══════════════╦═══════════════╦═══════════════╦════════════════╣
║  TIMEFRAME     ║  HOOK         ║  ANCHOR       ║  ADDICTION    ║
╠═══════════════╬═══════════════╬═══════════════╬════════════════╣
║  Minute 1     ║  Tutorial     ║  First card   ║  ★★☆☆☆       ║
║  Minute 5     ║  First win    ║  First game   ║  ★★★★☆       ║
║  Hour 1       ║  Daily quest  ║  First quest  ║  ★★★★☆       ║
║  Day 1        ║  First pack  ║  First IAP    ║  ★★★★★       ║
║  Day 2-7      ║  Streak      ║  Day streak   ║  ★★★★★       ║
║  Day 7        ║  Achievement ║  First badge  ║  ★★★☆☆       ║
║  Week 2       ║  Battle Pass ║  Season tier  ║  ★★★★★       ║
║  Week 4       ║  Guild       ║  Social bond  ║  ★★★★★       ║
║  Month 2+     ║  Collection  ║  Rarity chase ║  ★★★☆☆       ║
╚═══════════════╩═══════════════╩═══════════════╩════════════════╝
```

---

## 3. Operational Cost Analysis

### 3.1. Monthly Infrastructure Cost

```
SCENARIO A — SOFT LAUNCH (100 CCU):
  ┌────────────────────────┬────────────┬───────────┐
  │  Service               │  Usage      │  Cost/mo  │
  ├────────────────────────┼────────────┼───────────┤
  │  Neon PostgreSQL        │  0.5GB DB  │  Free     │
  │  Upstash Redis         │  Free tier  │  Free     │
  │  Railway (Backend)     │  Starter    │  $5       │
  │  Vercel (CDN)         │  ~50GB      │  $0       │
  │  Sentry               │  Free tier  │  Free     │
  │  Domain + SSL          │  .com       │  $15      │
  ├────────────────────────┼────────────┼───────────┤
  │  TOTAL MONTHLY         │             │  ~$20     │
  └────────────────────────┴────────────┴───────────┘

SCENARIO B — GROWTH (1,000 CCU):
  ┌────────────────────────┬────────────┬───────────┐
  │  Service               │  Usage      │  Cost/mo  │
  ├────────────────────────┼────────────┼───────────┤
  │  Neon PostgreSQL       │  5GB DB    │  $25      │
  │  Upstash Redis        │  1M cmd/mo  │  $10      │
  │  Railway (Backend)     │  Pro        │  $20      │
  │  Vercel (CDN)         │  ~500GB     │  $20      │
  │  Sentry               │  5K events  │  $0       │
  │  Domain + SSL          │             │  $15      │
  ├────────────────────────┼────────────┼───────────┤
  │  TOTAL MONTHLY         │             │  ~$90     │
  └────────────────────────┴────────────┴───────────┘

SCENARIO C — SCALE (10,000 CCU):
  ┌────────────────────────┬────────────┬───────────┐
  │  Service               │  Usage      │  Cost/mo  │
  ├────────────────────────┼────────────┼───────────┤
  │  Neon PostgreSQL       │  50GB DB   │  $150     │
  │  Upstash Redis        │  10M cmd/mo │  $50      │
  │  Railway (2x instances)│  Pro x2    │  $40      │
  │  Vercel (CDN)         │  ~5TB      │  $150     │
  │  Sentry               │  50K events│  $80      │
  │  Cloudflare Pro        │            │  $20      │
  │  Domain + SSL          │             │  $15      │
  ├────────────────────────┼────────────┼───────────┤
  │  TOTAL MONTHLY         │             │  ~$505    │
  └────────────────────────┴────────────┴───────────┘

BREAKEVEN:
  - At 100 CCU: Need $20/mo revenue → ~5 paying users/mo
  - At 1,000 CCU: Need $90/mo revenue → ~20 paying users/mo
  - At 10,000 CCU: Need $500/mo revenue → ~100 paying users/mo

  → Cost is NOT the bottleneck. User acquisition is.
```

### 3.2. Development Cost (One-time)

```
HUMAN RESOURCES (if hiring):
  - Junior dev:       $500-800/mo × 3 months = $4,500
  - Artist (contract): $500-1,000 one-time = $1,000
  - Audio (stock):     $200-500 = $500
  - QA:                ~$0 (community beta)

TOOLS & SERVICES:
  - Design tools:      $0 (Figma free tier)
  - Music:             $0 (royalty-free LoFi)
  - Audio production:  $0 (AI voice + stock SFX)
  - Asset generation:  $0 (AI-generated card art)

TOTAL OUT-OF-POCKET:  ~$0-5,000 (if solo dev)
                       ~$6,000-10,000 (if 1 hire)
```

---

## 4. Competitive Moat Analysis

### 4.1. How Defensible Is This Game?

```
MOAT FACTOR                  │  STRENGTH  │  DURATION  │
─────────────────────────────┼────────────┼────────────│
Card-based co-op VN theme    │  ★★★★☆     │  6-12 mo   │
First-mover in this niche    │  ★★★★☆     │  3-6 mo    │
Network effects (friends)     │  ★★★☆☆     │  Ongoing   │
Content depth (200+ cards)   │  ★★★★☆     │  Ongoing   │
Community & brand            │  ★★☆☆☆     │  Ongoing   │
Data & balance               │  ★★☆☆☆     │  3-6 mo    │
Monetization IP             │  ★☆☆☆☆     │  0 mo      │
Patent / IP protection       │  ★☆☆☆☆     │  0 mo      │
─────────────────────────────┼────────────┼────────────│
OVERALL MOAT                 │  ★★★☆☆     │  SHORT     │

⚠️  REALITY: This game is EASY to clone.
    A competitor with 2 devs could replicate in 3-4 months.
    MOAT IS NOT THE GAME — IT'S THE BRAND + COMMUNITY + TIMING.
```

### 4.2. Competitive Response Scenarios

```
SCENARIO 1: Clone by big studio (VNG, Garena, Voodoo)
  Timeline:  3-6 months after launch
  Threat:    HIGH (massive user base, distribution)
  Response:
    - Move fast: Establish brand before they copy
    - Build community loyalty (Discord, Facebook)
    - Focus on niche: "Original card co-op VN game"
    - Continuously add content faster than they can copy

SCENARIO 2: Clone by indie (smaller studio)
  Timeline:  2-4 months after launch
  Threat:    MEDIUM (quality likely lower)
  Response:
    - Quality difference is key (polish > clone)
    - First mover advantage in app stores
    - Better retention (fix our weaknesses fast)

SCENARIO 3: Similar game from existing card game studio
  Timeline:  6-12 months
  Threat:    MEDIUM (they have IP, players)
  Response:
    - Differentiate on VN theme + local culture
    - Fast content updates
    - Player-first monetization (our advantage)
```

### 4.3. Sustainable Competitive Advantage

```
THE ONLY DURABLE ADVANTAGE IS:
  1. Community — Players who love Sunny are harder to leave
  2. Brand — "Card co-op startup game from Vietnam"
  3. Speed — Release content 2x faster than competitors
  4. Data — Know your players better than anyone else

ACTION ITEMS:
  - Build Discord community in Month 1
  - Collect player feedback aggressively
  - A/B test everything (push, IAP price, game balance)
  - Ship content weekly/bi-weekly in first 3 months
```

---

## 5. Risk-Adjusted Business Plan

### 5.1. Scenario Analysis

```
╔════════════════╦═══════════╦═══════════╦═══════════════╗
║  METRIC       ║  PESSIMISTIC║ BASE    ║  OPTIMISTIC   ║
╠════════════════╬═══════════╬═══════════╬═══════════════╣
║  Installs (M1)║  2,000    ║  10,000  ║  50,000       ║
║  DAU (M3)     ║  500      ║  5,000   ║  20,000       ║
║  Revenue (M3)  ║  500K VND ║  8M VND  ║  50M VND      ║
║  Revenue (M12) ║  2M VND   ║  40M VND ║  300M VND     ║
║  Status (M12) ║  Pivot or  ║  Growing ║  Full team    ║
║               ║  shutdown   ║          ║  expansion     ║
╚════════════════╩═══════════╩═══════════╩═══════════════╝
```

### 5.2. Go / No-Go Decision Framework

```
GO CRITERIA (must meet ≥3 to proceed):
  □ D1 retention > 40%
  □ D7 retention > 20%
  □ First-month revenue > 5M VND
  □ App Store rating > 4.0 stars
  □ Player feedback score > 7/10

PIVOT TRIGGERS:
  □ D7 retention < 10% for 2 consecutive weeks
  □ Month 3 revenue < 1M VND
  □ Critical bugs causing > 20% crash rate

PIVOT OPTIONS:
  1. Pivot to web-based version (lower dev cost)
  2. Partner with publisher (VNG, Garena)
  3. Open-source core and monetize services
  4. License IP to other studios
```

---

## 6. Financial Summary

```
KEY METRICS TARGETS:

Month 1:     10K installs, D1 45%, D7 25%
Month 3:     50K installs, 5K DAU, $2K revenue
Month 6:     100K installs, 15K DAU, $6K revenue
Month 12:    200K installs, 30K DAU, $20K revenue

BURN RATE:
  Solo dev:  $0/mo (opportunity cost only)
  With 1 hire: $500-800/mo
  With 2 hires: $1,000-1,500/mo

RUNWAY:
  At 0 revenue:  12-24 months (if solo, minimal burn)
  At Month 3 rev: Self-sustaining at solo dev level
  At Month 6 rev: Can hire 1 part-time

KEY INSIGHT:
  The game doesn't need to be a massive hit.
  30K DAU at Month 12 = $20K/mo revenue.
  For a solo dev team in Vietnam, that's $2,000-3,000/mo income.
  That's VIABLE.
```
