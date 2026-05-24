# UX-REVIEW.md — Player Journey, Friction Analysis & Retention Strategy

> Phân tích UX toàn bộ player journey: từ lần đầu mở app đến thói quen hàng ngày. Tập trung vào friction points, retention hooks, và trải nghiệm người dùng Việt Nam.

---

## 1. Player Journey Map

### 1.1. Full Journey Stages

```
STAGE 1: DISCOVERY (Day 0)
  Touchpoint:    App Store, TikTok, YouTube, friend recommendation
  Action:       See store listing → Read reviews → Install
  Drop-off:      60-70% never install after seeing listing
  Key factor:   Icon + Screenshots + First 3 reviews

STAGE 2: ONBOARDING (Day 0, Minutes 0-5)
  Touchpoint:    Splash → Story → Profession select → Tutorial game
  Action:       Complete tutorial → Understand core loop
  Drop-off:     15-20% abandon during tutorial
  Key factor:   Tutorial length, complexity

STAGE 3: FIRST EXPERIENCE (Day 0-1)
  Touchpoint:    First real game → Win/Lose → Post-game
  Action:       Play first game, feel good or frustrated
  Drop-off:     40-50% don't return Day 1 → Day 2
  Key factor:   First game outcome + "what now?"

STAGE 4: RETURNING PLAYER (Day 2-7)
  Touchpoint:    Daily quest, push notification, streak
  Action:       Daily login → Complete quests → Play games
  Drop-off:     30-40% don't return Day 7
  Key factor:   Habit formation

STAGE 5: COMMITTED PLAYER (Week 2-4)
  Touchpoint:    Battle Pass, achievements, collection
  Action:       Grind progression, compete, collect
  Drop-off:     20-30% don't reach Month 1
  Key factor:   Content depth, social features

STAGE 6: LOYAL PLAYER (Month 2+)
  Touchpoint:    Community, seasons, competitive
  Action:       Long-term engagement, spending
  Drop-off:     5-10% monthly churn
  Key factor:   Community, seasons, new content
```

### 1.2. Friction Points by Stage

```
╔══════════════════════════════════════════════════════════════╗
║  STAGE 1: DISCOVERY                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Friction: "App Store listing doesn't convey co-op"        ║
║  Fix:     Screenshot 2: "Chơi cùng bạn bè" → Show       ║
║           multiplayer screenshot                             ║
║                                                              ║
║  Friction: "Rating is low"                                 ║
║  Fix:     Push "Rate us" after first win (not after loss) ║
║           Respond to all negative reviews quickly            ║
║                                                              ║
║  Friction: "Game too big to download"                     ║
║  Fix:     Target APK < 50MB, lazy load assets             ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  STAGE 2: ONBOARDING                                        ║
╠══════════════════════════════════════════════════════════════╣
║  Friction: "Story is too long"                            ║
║  Fix:     Skip button appears after 1s (currently 1.5s)    ║
║           Total onboarding: 3 minutes max (currently ~5min)║
║                                                              ║
║  Friction: "Can't change profession after tutorial"        ║
║  Fix:     Add "Change Profession" in Settings (3-day CD)   ║
║                                                              ║
║  Friction: "Tutorial bot plays before me, confusing"        ║
║  Fix:     Add step: "Watch me play first, then you try"    ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  STAGE 3: FIRST EXPERIENCE                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Friction: "Lost my first game, felt bad"                  ║
║  Fix:     First 3 games: bot plays suboptimally (Tier 1)║
║           First game should feel achievable                 ║
║                                                              ║
║  Friction: "Won but don't know what to do next"           ║
║  Fix:     Post-game screen:                                 ║
║           - "Bạn đã thắng! XP +50"                      ║
║           - "Chơi lại để nhận thêm thưởng"               ║
║           - "Khám phá bộ sưu tập" CTA                    ║
║                                                              ║
║  Friction: "Don't know about daily quests"                 ║
║  Fix:     After first game: "Bạn có 3 nhiệm vụ hôm nay!"║
║           Highlight with pulsing arrow                      ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  STAGE 4: RETURNING PLAYER                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Friction: "Forgot why I should play today"               ║
║  Fix:     Daily quest banner: "3/3 nhiệm vụ đợi bạn"    ║
║           Show streak: "Ngày 5 liên tiếp! +50% XP"       ║
║                                                              ║
║  Friction: "Game takes too long per session"               ║
║  Fix:     Solo Practice mode: 1-2 quick rounds (5 min)     ║
║           Don't force multiplayer for all content           ║
║                                                              ║
║  Friction: "Push notifications annoying"                   ║
║  Fix:     Let user customize: OFF / Soft / Daily / All   ║
║           Default: Soft (reminder once if no return in 24h)║
╚══════════════════════════════════════════════════════════════╝
```

---

## 2. Onboarding Redesign

### 2.1. Optimized Onboarding Flow (3 minutes)

```
STEP 1: Instant Play (30 giây)
┌─────────────────────────────────────────────┐
│                                              │
│           [Animated Logo]                    │
│        "Project Sunny"                      │
│                                              │
│     "Khởi nghiệp từ con số không..."      │
│                                              │
│   [ Bắt đầu ngay >> ]                     │
│   [ Hoặc đăng nhập ]                      │
│                                              │
└─────────────────────────────────────────────┘
Skip: After 1s (not 1.5s)

STEP 2: Quick Story (15 giây)
  - 3 quick text slides, auto-advance
  - Or tap to skip
  - Total: 15s max

STEP 3: Choose Main Profession (30 giây)
  - Horizontal scroll, tap to select
  - Show only: Icon + Name + Key benefit
  - "Tiếp tục" button activates after tap
  - Shows profession benefits inline

STEP 4: Choose Secondary Profession (20 giây)
  - Same UI as Step 3
  - "Bắt đầu chơi!" button

STEP 5: Demo Game (90 giây)
  - 3-round mini game (not 1 full round)
  - Bot plays first (watch), then player
  - Simplified UI, no distractions
  - "Hoàn thành! +100 XP"

STEP 6: Home Screen Introduction (30 giây)
  - Highlight tabs: "Chơi", "Bộ sưu tập", "Nhiệm vụ"
  - Tooltip on each
  - "Bạn đã sẵn sàng! Đi thôi!"
```

### 2.2. Onboarding Metrics

```
TARGET METRICS:
  Tutorial completion rate:   > 85%
  Time to first game:         < 3 minutes
  Tutorial abandonment:        < 15%
  Confusion reports:           < 5%

HOW TO MEASURE:
  - Event: tutorial_started → tutorial_completed
  - Event: tutorial_step_skipped
  - Event: tutorial_abandoned_at_step
  - Session recording: First 3 sessions (with consent)
```

---

## 3. Core Loop Redesign

### 3.1. Current Core Loop

```
CURRENT (from GAME-MECHANICS.md):

  Lobby → Vote → Game Loop (20 rounds) → Results → Lobby
         ↑                                          │
         └──────────────────────────────────────────┘

PROBLEM: Long sessions required. If you only have 10 minutes,
         you can't finish a game. You quit frustrated.
```

### 3.2. Redesigned Core Loop

```
┌─────────────────────────────────────────────────────────────────┐
│  REDESIGNED CORE LOOPS (Multiple entry points)                  │
│                                                                  │
│  ┌─────────────────┐                                          │
│  │  QUICK LOOP     │  ← Solo Practice (3-5 min)              │
│  │  Solo + AI bot  │     3-round games                        │
│  │  Daily quest    │     Available anytime                      │
│  │  Fast rewards   │     For casual players                     │
│  └────────┬────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                          │
│  │  SOCIAL LOOP    │  ← Multiplayer (15-20 min)             │
│  │  5 players      │     Full 20-round game                   │
│  │  Lobby + Game   │     Co-op experience                      │
│  │  Weekly ranked  │     For engaged players                   │
│  └────────┬────────┘                                          │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                          │
│  │  GRIND LOOP     │  ← Collection + Progression              │
│  │  Card hunting   │     Open packs, collect cards             │
│  │  Level up      │     Complete achievements                   │
│  │  Battle Pass   │     Grind for cosmetics                   │
│  └─────────────────┘     For hardcore players                  │
│                                                                  │
│  ┌─────────────────┐                                          │
│  │  SOCIAL LOOP    │  ← Community + Guilds                    │
│  │  Guild quests   │     Leaderboards                           │
│  │  Tournaments    │     Competitive seasons                    │
│  │  Trading        │     For top players                      │
│  └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3. "Quick Win" Loop (Critical for Retention)

```
PROBLEM: Players need a WIN within 5 minutes or they quit.

SOLUTION: Implement "Quick Win" mode:

┌─────────────────────────────────────────────┐
│  QUICK MODE (Solo Practice, 3 rounds)       │
│                                              │
│  - Faster animations (skip card flip)        │
│  - Instant resolution                        │
│  - Bot plays aggressively (fun to beat)     │
│  - Win reward: +50 XP + streak point        │
│  - Complete in 5 minutes                     │
│                                              │
│  CTA on home screen:                        │
│  "Thắng nhanh? Chơi Quick Mode!"          │
│                                              │
│  After win:                                 │
│  "Bạn thắng! Tiếp tục để +50% XP?"      │
│  [ Chơi lại ]  [ Về nhà ]                  │
└─────────────────────────────────────────────┘

KEY INSIGHT:
  - First-time wins create habit
  - Win → Dopamine → Return
  - This is why Candy Crush dominates
```

---

## 4. Session Design

### 4.1. "What to do now?" Framework

```
Every screen must answer: "What should I do next?"

┌─────────────────────────────────────────────┐
│  HOME SCREEN — Priority Hierarchy          │
│                                              │
│  If (unclaimed daily quest rewards):        │
│    → "Bạn có 3 phần thưởng đợi!"          │
│    → Highlight quest tab with badge         │
│                                              │
│  If (Battle Pass active, tier available):   │
│    → "Battle Pass: Tặng đợi ở cấp 15!"    │
│                                              │
│  If (streak ≥ 3 days):                    │
│    → "Chuỗi ngày: 5 ⚡ +50% XP"          │
│                                              │
│  If (none of above):                       │
│    → "Bắt đầu một trận mới?"             │
│    → [Quick Mode]  [Multiplayer]          │
└─────────────────────────────────────────────┘

RULE: The MOST important action should be the MOST visible.
      Never show empty state on home screen.
```

### 4.2. Game Session Pacing

```
IDEAL 20-ROUND SESSION (20 minutes):

  Minutes 0-2:    Lobby (find players, chat)
    → Progress bar: "Waiting for players... 3/5"

  Minutes 2-3:    Store voting (30 seconds)
    → Voting UI with countdown

  Minutes 3-4:    Round 1-2 setup
    → Draw phase, excitement building
    → LOFI music: calm, anticipation

  Minutes 4-12:  Rounds 3-14 (core gameplay)
    → Increasing tension
    → Music tempo increases
    → Cards get more complex

  Minutes 12-16: Rounds 15-18 (high stakes)
    → Max tension music
    → HP bars getting low
    → Countdown pressure

  Minutes 16-18: Rounds 19-20 (climax)
    → Dramatic music
    → Big number animations
    → Near-death moments

  Minutes 18-20: Results
    → Win: Celebration, confetti, XP popup
    → Lose: "Don't give up" + retry CTA
    → Shared results screen

PAUSE POINTS:
  - After every 5 rounds: 2-second "Intermission"
  - After Round 10: "Nửa năm đã qua!" milestone
  - Player can pause anytime (solo only)
```

### 4.3. Between-Round Dead Time

```
PROBLEM: Between rounds, players wait. This is dead time.

CURRENT: 5-second resolution → Clean up → Next draw
FIX: Overlap animations with next round's prep

┌─────────────────────────────────────────────┐
│  BETWEEN ROUNDS (3 seconds)                   │
│                                              │
│  Left side:  Round result animation          │
│              (+$1,200, +5 HP)               │
│                                              │
│  Right side: Next round setup (preview)     │
│              "Vòng 5: Bắt đầu trong 3s"  │
│                                              │
│  → Player is ALWAYS engaged                  │
│  → No pure "waiting" state                  │
└─────────────────────────────────────────────┘
```

---

## 5. Mobile-Specific UX

### 5.1. One-Hand Operation

```
PRINCIPLE: 96% of users play one-handed
            64% play with thumb only

DESIGN RULES:
  ✅ Primary actions in bottom 60% of screen
  ✅ Card hand: Bottom of screen (thumb reach)
  ✅ Ready button: Bottom-right (right thumb)
  ✅ Lock button: Bottom-left (left thumb)
  ✅ Menu/Back: Top corners only (stretch if needed)

  ❌ Never put critical actions at top-center
  ❌ Never require two hands for core actions
  ❌ Never require precision tapping (>44px target min)

SCREEN ZONES (bottom-up):
  ┌─────────────────────────────────┐
  │  [Safe Area Top]                │ ← System UI only
  ├─────────────────────────────────┤
  │  Stats bar (HP, Money, Energy) │ ← 48px, tappable
  ├─────────────────────────────────┤
  │  Game board + Slots             │ ← Center: 44% of screen
  ├─────────────────────────────────┤
  │  Other player HUDs              │ ← 15% of screen
  ├─────────────────────────────────┤
  │  Card hand (horizontal scroll) │ ← 30% of screen
  ├─────────────────────────────────┤
  │  Action buttons                 │ ← 52px height
  └─────────────────────────────────┘
```

### 5.2. Gesture Design

```
LONG PRESS:   Card detail (full description)
TAP:          Select card
DOUBLE TAP:  Quick lock card
SWIPE LEFT:  Cycle card preview
SWIPE UP:    View discard pile
SWIPE DOWN:  Minimize card detail modal
PINCH:        Zoom card collection
DRAG:        Place card in slot (primary interaction)

⚠️  AVOID:
  - Two-finger gestures
  - Three-finger gestures
  - Complex multi-step gestures
  - Edge swipes (conflict with system navigation)
```

### 5.3. Haptic Feedback Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│  HAPTIC FEEDBACK MAP                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LIGHT IMPACT (selection):                                       │
│    - Card tap (not dragging)                                   │
│    - Tab switch                                                 │
│    - Button tap                                                 │
│    - Quest claim                                                │
│                                                                  │
│  MEDIUM IMPACT (action confirmed):                             │
│    - Card drop in slot (valid)                                 │
│    - Ready button pressed                                        │
│    - Profession selected                                         │
│                                                                  │
│  SUCCESS NOTIFICATION (achievement):                            │
│    - Round won                                                   │
│    - XP gained                                                  │
│    - Card obtained                                               │
│                                                                  │
│  ERROR NOTIFICATION (problem):                                  │
│    - Card drop rejected                                          │
│    - Insufficient energy                                         │
│    - Invalid slot placement                                      │
│                                                                  │
│  WARNING (caution):                                             │
│    - HP below 30% (pulse every 5s)                             │
│    - Timer < 10 seconds                                         │
│    - Environment warning                                         │
│                                                                  │
│  NO HAPTIC:                                                     │
│    - Card hover/scroll                                          │
│    - Menu open/close                                            │
│    - Pull-to-refresh                                            │
└──────────────────────────────────────────────────────────────────┘
```

### 5.4. Offline UX

```
IMMEDIATE (Phase 3):
  - Save pending actions to AsyncStorage
  - Show "Offline mode" indicator
  - Queue actions, sync when online
  - Game lobby: "Reconnecting..." banner

SHORT-TERM (Phase 4):
  - Save full game state locally
  - If disconnected: Can continue vs AI solo
  - Sync results when online
  - Pre-download card images on WiFi

LONG-TERM (Post-launch):
  - "Idle earnings": Cửa hàng tự động kiếm 10% revenue khi offline
  - Max 8 hours idle earnings
  - "Welcome back! Bạn đã kiếm được $500 khi offline!"
  → Keeps players returning even if they can't play
```

---

## 6. Retention Hooks Deep Dive

### 6.1. Day-1 Retention (Target: 50%)

```
DAY 1 HOOKS:
  ┌──────────────────────────────────────────────────────┐
  │  H1: First-win dopamine                             │
  │  → Quick Mode ensures first win within 10 min      │
  │  → Win → +XP → immediate progression                │
  ├──────────────────────────────────────────────────────┤
  │  H2: Daily quest teaser                            │
  │  → After first game: "3 quests đợi bạn!"         │
  │  → Streak countdown starts                         │
  ├──────────────────────────────────────────────────────┤
  │  H3: Collection tease                              │
  │  → "Mở gói đầu tiên để nhận thẻ hiếm!"         │
  │  → Show pack opening animation                     │
  ├──────────────────────────────────────────────────────┤
  │  H4: Friend invitation                            │
  │  → "Mời bạn chơi cùng → Nhận thẻ bài đặc biệt" │
  │  → Deep link sharing                               │
  └──────────────────────────────────────────────────────┘
```

### 6.2. Day-7 Retention (Target: 25%)

```
DAY 7 HOOKS:
  ┌──────────────────────────────────────────────────────┐
  │  H5: Streak reward                                 │
  │  → 7-day streak: Unlock "7-Day Challenger" title │
  │  → Visual: Fire icon + streak counter             │
  ├──────────────────────────────────────────────────────┤
  │  H6: First Battle Pass                            │
  │  → Day 5: "Season đang diễn ra! Tham gia?"    │
  │  → Show premium track teaser                      │
  ├──────────────────────────────────────────────────────┤
  │  H7: Collection completion                        │
  │  → "Bạn có X/Y thẻ Common. 3 Rare còn thiếu!"  │
  │  → Missing cards highlighted                      │
  ├──────────────────────────────────────────────────────┤
  │  H8: Achievement progress                          │
  │  → "Gần đạt 'Khởi nghiệp lần đầu'!"           │
  │  → Progress bar to completion                     │
  └──────────────────────────────────────────────────────┘
```

### 6.3. Month-1 Retention (Target: 10%)

```
MONTH 1 HOOKS:
  ┌──────────────────────────────────────────────────────┐
  │  H9: Season finale                                 │
  │  → Week 7: "Season kết thúc trong 7 ngày!"      │
  │  → Rush to complete Battle Pass                    │
  ├──────────────────────────────────────────────────────┤
  │  H10: Social proof                                  │
  │  → "5 bạn bè của bạn đang chơi!"               │
  │  → Friend activity feed                            │
  ├──────────────────────────────────────────────────────┤
  │  H11: Competitive ladder                          │
  │  → Weekly leaderboard reset                        │
  │  → "Bạn đang xếp hạng #47. Cố lên!"            │
  ├──────────────────────────────────────────────────────┤
  │  H12: Collection pride                            │
  │  → "Bộ sưu tập: 78/180 thẻ"                    │
  │  → Rarity gaps highlighted                        │
  └──────────────────────────────────────────────────────┘
```

---

## 7. Vietnamese-Specific UX

### 7.1. Language & Tone

```
TONE: Friendly, encouraging, never condescending
      Vietnamese players respond well to warmth + community

GOOD EXAMPLES:
  "Chúc mừng! Bạn đã thắng vòng này! 🎉"
  "Cửa hàng gặp khó khăn, nhưng đừng nản! Còn nhiều vòng phía trước."
  "Bạn cần gì? Đội ngũ Sunny luôn sẵn sàng hỗ trợ!"

BAD EXAMPLES:
  "You died." (harsh, no encouragement)
  "You lost. Try again." (no emotional hook)
  "Error 404: Something went wrong" (technical, scary)

VOICE GUIDELINES:
  - Use "bạn" not "người chơi" (warmer)
  - Use "chúng ta" for co-op ("Cùng nhau chiến thắng!")
  - Use "Sunny" as mascot voice
  - Avoid negative framing: "Thất bại" → "Chưa thắng"
  - Avoid technical jargon in UI
```

### 7.2. Cultural Moments

```
VIETNAMESE CALENDAR INTEGRATION:
  Tết Nguyên Đán (Jan/Feb):
    - Special "Tết" card backs
    - "Xuân ơi! Chơi game nhận lì xì!"
    - New Year quest chain with bonus rewards

  Trung Thu (Sep/Oct):
    - Lantern-themed cosmetic items
    - "Trung thu vui vẻ! Nhận bánh trung thu trong game"

  2/9 Vietnam Independence Day:
    - "Quốc khánh" event with VN-themed cards
    - Community challenge: "Cùng nhau xây dựng"

  Year-end (Dec):
    - Year review stats: "Năm nay bạn đã chơi X trận"
    - "2026 Resolution" achievements

SOCIAL CUSTOMS:
  - Gift sending (tặng quà): Add "Tặng thẻ cho bạn" feature
  - Group motivation: "Cả team đang chờ bạn!"
  - Humble achievement: "Mình may mắn thôi!" (not "I'm the best")
```

---

## 8. UX Quality Checklist

```
╔══════════════════════════════════════════════════════════════╗
║  PRE-LAUNCH UX CHECKLIST                                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ACCESSIBILITY                                               ║
║  □ Color contrast ratio ≥ 4.5:1 (WCAG AA)                 ║
║  □ Touch targets ≥ 44×44pt                                 ║
║  □ Color blind mode available                                ║
║  □ Reduce motion setting respected                           ║
║  □ Font sizes scalable via system settings                  ║
║  □ Screen reader labels on all interactive elements          ║
║                                                              ║
║  PERFORMANCE                                                 ║
║  □ First contentful paint < 2s                              ║
║  □ Time to interactive < 5s                                 ║
║  □ 60 FPS during card drag                                   ║
║  □ APK size < 50MB                                          ║
║  □ Memory usage < 200MB under normal gameplay               ║
║                                                              ║
║  RELIABILITY                                                 ║
║  □ No crash on: Airplane mode toggle                        ║
║  □ No crash on: App background → foreground                 ║
║  □ No crash on: Incoming call during game                   ║
║  □ No crash on: Low battery warning                         ║
║  □ No crash on: Notification during gameplay                ║
║  □ Graceful handling of network interruption                ║
║                                                              ║
║  LOCALIZATION                                                 ║
║  □ All UI text in Vietnamese                                 ║
║  □ All error messages in Vietnamese                         ║
║  □ No truncated text on any device (320px-430px width)    ║
║  □ Currency formatted as VND (1.000đ not $0.04)           ║
║                                                              ║
║  RETENTION                                                   ║
║  □ Onboarding < 3 minutes                                   ║
║  □ Post-game CTA always visible                             ║
║  □ Daily quest visible on home screen                        ║
║  □ Streak counter prominent                                 ║
║  □ No empty states (always show what to do next)           ║
║                                                              ║
║  TRUST                                                       ║
║  □ No deceptive IAP (clear pricing)                        ║
║  □ No ads disguised as IAP                                   ║
║  □ Privacy policy link in settings                           ║
║  □ Contact/support easily accessible                         ║
║  □ "Báo cáo lỗi" (Report bug) in settings                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```
