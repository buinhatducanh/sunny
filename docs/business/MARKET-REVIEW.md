# MARKET-REVIEW.md — Vietnam Mobile Market & Competitive Positioning

> Phân tích thị trường: Vietnam mobile gaming, đối thủ cạnh tranh, go-to-market strategy.

---

## 1. Vietnam Mobile Gaming Market

### 1.1. Market Overview

```
KEY STATS (2025-2026):
  - Market size:         ~$700M USD
  - Mobile gamers:       ~45 million (50% smartphone penetration)
  - Growth rate:        ~12% YoY
  - Average gamer age:   18-35 (core: 18-25)
  - Top genres:         RPG, Casino, Puzzle, Mobile MOBA, Hyper-casual

VIETNAM-SPECIFIC CONTEXT:
  - Mobile-first market:  95% of internet traffic is mobile
  - Payment:              MoMo, ZaloPay, ViettelPay dominant
  - App Store ranking:   Price-sensitive, reviews matter
  - Cultural:           "Game tử tế" (honest game) resonates
  - Social:              Strong group-buying, friend recommendation culture
  - Gaming time:         Peak 8-11 PM weekdays, all day weekends
```

### 1.2. Mobile Payment Landscape

```
PAYMENT METHODS IN VIETNAM:
  ┌──────────────────┬─────────────┬──────────────┐
  │  Method           │  Share      │  Notes        │
  ├──────────────────┼─────────────┼──────────────┤
  │  e-Wallet (MoMo) │  40%        │  #1 in VN    │
  │  Bank transfer    │  25%        │  Slow        │
  │  ZaloPay          │  15%        │  Rising      │
  │  Carrier billing  │  10%        │  Small tx    │
  │  Credit card      │   7%        │  Urban only  │
  │  Prepaid card     │   3%        │  Declining  │
  └──────────────────┴─────────────┴──────────────┘

CRITICAL REQUIREMENT:
  ⚠️  MUST integrate MoMo payment gateway
  ⚠️  MUST support carrier billing (Viettel, Vinaphone)
  ⚠️  MUST support ZaloPay (rising, especially Gen Z)

  In-app Purchase platforms:
  - Google Play Billing: Available, standard
  - App Store IAP: Available, standard
  - Third-party (MoMo IAP): Increases conversion 15-20%

PRICE ANCHORING:
  - VN users expect 9,000-49,000 VND for small IAP
  - "Quà tặng" (gift) framing increases conversion 30%
  - "Tiết kiệm 50%" framing is extremely effective
```

### 1.3. Platform Distribution

```
ANDROID vs IOS:
  ┌──────────────────┬─────────────┬──────────────────┐
  │  Platform         │  Share      │  Profile          │
  ├──────────────────┼─────────────┼──────────────────┤
  │  Android          │  72%        │  All segments     │
  │  iOS              │  28%        │  Urban, higher   │
  │                   │            │  spending power   │
  └──────────────────┴─────────────┴──────────────────┘

IMPLICATION:
  - Launch Android FIRST (Vercel + Expo APK)
  - iOS after 1-2 months (requires Mac for build)
  - Focus Play Store ASO over App Store initially
```

---

## 2. Competitive Landscape

### 2.1. Direct Competitors

```
CARD GAMES IN VIETNAM:

╔═══════════════════════╦═══════════╦═════════════╦═══════════╗
║  GAME                ║  TYPE     ║  DAILY USERS ║  RATING  ║
╠═══════════════════════╬═══════════╬═════════════╬═══════════╣
║  Uno (VNG)           ║  Card     ║  ~200K      ║  4.2     ║
║  Tiến Lên MN          ║  Card     ║  ~100K      ║  4.0     ║
║  Xì Tố Online         ║  Card     ║  ~80K       ║  3.9     ║
║  Co Tuong Online      ║  Board    ║  ~50K       ║  4.1     ║
║  Slay the Spire (iOS) ║  Roguelike ║  ~20K       ║  4.6     ║
║  Card Monsters        ║  TCG      ║  ~30K       ║  3.8     ║
╠═══════════════════════╬═══════════╬═════════════╬═══════════╣
║  PROJECT SUNNY (NEW)  ║  Co-op    ║  TARGET     ║  TARGET  ║
║                       ║  Strategy ║  5K DAU     ║  4.3+    ║
╚═══════════════════════╩═══════════╩═════════════╩═══════════╝

KEY FINDING: No co-op card-based business simulation exists in VN market.
This is a GENUINE first-mover opportunity.

INDIRECT COMPETITORS (time spent):
  - Coin Master:    ~500K DAU in VN
  - Monopoly Go:    ~200K DAU in VN
  - Hay Day:         ~50K DAU in VN
  - Township:        ~30K DAU in VN

→ These games capture "casual simulation" players.
→ Project Sunny can capture a portion of this audience
   with the "co-op" differentiation.
```

### 2.2. Competitive Positioning

```
MARKET POSITIONING MAP:

          High Social
              ▲
              │
              │     Monopoly Go
              │         ▲
    Co-op     │     Project Sunny (Target)
              │         │
──────────────┼─────────┼──────────────────► Solo / Competitive
              │         │
              │     Hay Day
              │         │
              │     Coin Master
              │
              ▼
          Low Social

          Low Business          High Business
                    Simulation

DIFFERENTIATION STATEMENT:
  "Game khởi nghiệp Việt Nam đầu tiên dạng thẻ bài.
   Chơi cùng bạn bè, xây dựng cửa hàng từ con số không."

TARGET AUDIENCE SEGMENTS:
  1. Primary: Casual strategy fans (Monopoly Go, Coin Master players)
     → Appeal: Co-op instead of solo, VN theme
  2. Secondary: Card game enthusiasts (UNO, Tiến Lên players)
     → Appeal: New mechanics, strategic depth
  3. Tertiary: Gen Z / Young adults (18-25)
     → Appeal: VN theme, startup story, shareable
```

### 2.3. Competitive Weakness Exploitation

```
EACH COMPETITOR'S WEAKNESS → OUR OPPORTUNITY:

MONOPOLY GO (King):
  Weakness: P2W, slot machine mechanics, no co-op
  Sunny: 100% strategy, no P2W, co-op multiplayer
  Message: "Chơi thật lòng, không cờ bạc"

COIN MASTER (Moonactive):
  Weakness: Spam invites, repetitive, isolated
  Sunny: Invite friends (real co-op), fresh content
  Message: "Xây cửa hàng cùng bạn bè, không spam"

HAY DAY (Supercell):
  Weakness: Solo only, outdated UI, no multiplayer
  Sunny: Real co-op, modern UI, vibrant community
  Message: "Quản lý cửa hàng cùng nhau"

UNO (VNG):
  Weakness: No progression, no collection, no economy
  Sunny: Full economy, card collection, progression
  Message: "Thẻ bài có chiến lược, có kinh tế, có cả hành trình"
```

---

## 3. Go-To-Market Strategy

### 3.1. Launch Phases

```
PHASE 1: Community Building (Month -2 to 0)
  Before launch:
  - Create Discord server (target: 500 members pre-launch)
  - Create Facebook page + group
  - Launch TikTok account (@project.sunny.game)
  - Post "making of" content: card designs, dev logs
  - Build waiting list: "Đăng ký sớm → Nhận Starter Pack"
  - Target: 1,000 email signups

PHASE 2: Soft Launch (Month 1)
  Limited release:
  - Release on Play Store (no App Store yet)
  - Target: 5,000 installs
  - Focus: Bug fixes, balance, early feedback
  - Release "Founder's Pack" IAP: $5 early supporter package
  - ASO: Optimize keywords "game khoi nghiep", "the bai"

PHASE 3: Full Launch (Month 2-3)
  Full marketing push:
  - Influencer outreach: 5-10 gaming YouTubers/TikTokers
    Budget: 10-30M VND ($400-1,200)
    Target: 20 videos, 500K combined views
  - App Store listing optimization
  - Featured by Google Play (if metrics are good)
  - Press release: Game VN developer card game

PHASE 4: Scale (Month 4-6)
  - Adjust based on data
  - If DAU < 5K: Improve retention, pivot messaging
  - If DAU > 10K: Invest in paid acquisition
  - Consider App Store launch
  - Season 1 launch with Battle Pass
```

### 3.2. App Store Optimization (ASO)

```
KEYWORDS (Vietnamese — Play Store):
  Primary:     game khởi nghiệp, game the bai, game doi thoai
  Secondary:   game kinh doanh, game co op, game online
  Long-tail:   game khoi nghiep viet nam, the bai chien thuat

APP ICON:
  - Sunny character face (mascot)
  - Bright, warm colors (cosmic purple + teal)
  - 3D effect, not flat
  - Readable at 48×48px

SCREENSHOTS (5 images):
  1. Gameplay screenshot: Card board with Sunny mascot
  2. "Chơi cùng bạn bè" — multiplayer co-op shot
  3. Card collection — vibrant cards
  4. "Khởi nghiệp từ con số không" — story shot
  5. Reviews / social proof

DESCRIPTION (first 80 chars visible):
  "Game khởi nghiệp Việt Nam đầu tiên. Thẻ bài + chiến lược.
   Chơi cùng bạn bè, xây dựng cửa hàng từ con số không!"

RATING TARGET:
  4.3+ stars within first week (critical for store ranking)
  → Respond to ALL reviews (even negative)
  → Push happy users to rate (in-game prompt after win)
```

### 3.3. Influencer Strategy

```
TARGET INFLUENCERS (Vietnam):

TIER 1 — Mega (1M+ followers):
  - KOL Gaming: Game Mộng, Độ Mixi Gaming, PewPew
  - Budget: $500-2,000 per video
  - Expected reach: 100K-500K views
  - Priority: LOW (expensive, likely won't cover indie game)

TIER 2 — Macro (100K-1M followers):
  - Gaming YouTubers: Phong Thần, Huy Byte, Trí Trình
  - TikTok gaming: @trochoivl, @gamevn.official
  - Budget: $100-500 per video
  - Expected reach: 20K-100K views
  - Priority: MEDIUM (reasonable reach, good engagement)

TIER 3 — Micro (10K-100K followers):
  - Indie game enthusiasts, mobile gamers
  - Budget: $50-150 per video or free product keys
  - Expected reach: 2K-20K views
  - Priority: HIGH (best ROI, authentic)

TIER 4 — Nano (1K-10K followers):
  - Discord/Facebook community members
  - Budget: Free product + "Founding Member" badge
  - Expected reach: 200-2K views
  - Priority: VERY HIGH (community building)

OUTREACH MESSAGE TEMPLATE:
  "Chào [Name], mình là dev của Project Sunny —
   game khởi nghiệp VN đầu tiên dạng thẻ bài co-op.
   Bạn có muốn thử trước và làm video không?
   [Free keys + exclusive interview]."
```

### 3.4. Community Building

```
DISCORD SERVER STRUCTURE:
  #welcome              — Rules, intro
  #announcements       — Dev updates, patch notes
  #general              — Player chat
  #gameplay-tips        — Strategy sharing
  #card-collection      — Showcase cards
  #bug-reports         — Bug reports (auto-ping dev)
  #feature-vote        — Community voting
  #lfg                 — Looking for group
  #screenshots          — Share your games
  #suggestions          — Feature requests
  #memes               — Community content

GROWTH TACTICS:
  - "Invite 3 friends → Unlock exclusive card back"
  - "Share your best round → Win free gems"
  - Weekly community challenges
  - Developer AMAs (monthly)

FACEBOOK STRATEGY:
  - Page: Brand, announcements, community highlights
  - Group: Player community, LFG, strategy
  - Content calendar:
    Mon: Dev update
    Wed: Card spotlight
    Fri: Community highlights
    Sat: Tips & tricks
    Sun: Fun content (memes, polls)
```

---

## 4. Localization Priorities

```
VIETNAMESE FIRST:
  ⚠️  CRITICAL: Full Vietnamese localization from Day 1
  - ALL UI text in Vietnamese
  - ALL card names in Vietnamese
  - ALL descriptions in Vietnamese
  - Vietnamese voice lines for key moments
  - Vietnamese in marketing materials

  Reason: VN players strongly prefer Vietnamese-language apps.
          English-only apps get lower ratings and retention.

CONTENT TRANSLATION QUALITY:
  Don't use Google Translate for:
  - Card names (creative, memorable)
  - Marketing copy (emotional, cultural)
  - Tutorial text (clear, simple)

  Use native speaker or professional translator.
  Card name examples:
  ❌ BAD: "He thong tu dong" (literal translation)
  ✅ GOOD: "Auto Deploy" — keep English for tech terms

CULTURAL LOCALIZATION:
  - VN holidays: Tết, Trung Thu, Quốc Khánh
  - VN humor: Self-deprecating, community-focused
  - VN values: "Tình bạn", "Đoàn kết", "Cần cù"
  - VN slang: "Cuộc", "Chất", "Xịn" — use sparingly
```

---

## 5. Regulatory & Legal (Vietnam)

```
GAME PUBLISHING IN VIETNAM:

OPTION 1: Self-publish (Google Play + App Store)
  Pros: Fastest, cheapest, full control
  Cons: No government distribution support
  Steps:
    1. Register business (LOOP Solutions)
    2. Game rating (PEGI or ESRB for self-assessment)
    3. Google Play Developer Account: $25 (one-time)
    4. App Store: $99/year
    5. Privacy Policy (required by both stores)

OPTION 2: Publish via VNG / Garena / One Entertainment
  Pros: Local distribution, payment support
  Cons: Revenue split (typically 30-50% to publisher)
  Steps:
    1. Pitch to publisher
    2. Negotiate terms
    3. Submit for review + adaptation

RECOMMENDATION:
  → Start with OPTION 1 (self-publish)
  → If Month 3 revenue > $10K/mo, consider Option 2 for scaling

PAYMENT COMPLIANCE:
  - Google/Apple IAP: Already compliant
  - Third-party IAP (MoMo): Requires additional approval
  - Card data: Must NOT store locally

AGE RATING:
  - Google Play: Content rating questionnaire → "Everyone 10+"
  - App Store: "12+" (includes in-app purchases)

PRIVACY POLICY REQUIREMENTS:
  - Must be in Vietnamese
  - Must disclose: data collected, how used, third parties
  - Must provide data deletion option
  - Required by: GDPR (EU users), PDPD (VN — in effect 2023)

GAMING LICENSE (if publishing in VN officially):
  - Currently: No mandatory license for app store distribution
  - Required: Business registration + tax compliance
  - Future: Monitor Viet Nam Game Association (VGG) regulations
```

---

## 6. Market Risk Assessment

```
╔════════════════════╦════════════╦═══════════════════════════╗
║  RISK             ║  PROBABILITY║  IMPACT & MITIGATION       ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Big studio clones║  HIGH      ║  MEDIUM — First-mover,     ║
║  before traction  ║           ║  community + speed          ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Low retention    ║  MEDIUM    ║  HIGH — Heavy investment   ║
║  (D7 < 10%)      ║           ║  in onboarding + polish     ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Payment issues  ║  LOW       ║  HIGH — Integrate MoMo     ║
║  (MoMo not ready)║           ║  + carrier billing early     ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Negative reviews║  MEDIUM    ║  MEDIUM — Respond fast,     ║
║  from bugs       ║           ║  soft launch to catch bugs  ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  App Store        ║  LOW       ║  LOW — Android-first       ║
║  rejection (iOS)  ║           ║  strategy                   ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Regulatory       ║  LOW       ║  MEDIUM — Legal review     ║
║  changes          ║           ║  before launch              ║
╠════════════════════╬════════════╬═══════════════════════════════╣
║  Developer burnout║  MEDIUM    ║  HIGH — AI-assisted dev,     ║
║  (solo/small team)║           ║  realistic scope             ║
╚════════════════════╩════════════╩═══════════════════════════════╝

CRITICAL SUCCESS FACTORS:
  1. D7 retention > 25% → Game is viable
  2. App rating > 4.3 stars → Store distribution
  3. Community > 500 Discord members → Word-of-mouth
  4. Revenue > 5M VND/month → Sustainable
```
