# TUTORIAL-SPEC.md — Onboarding & Tutorial Design

> Chi tiết toàn bộ tutorial: onboarding, in-game guide, tooltip system, và learning curve.

---

## 1. Tutorial Design Philosophy

```
PRINCIPLES:
  1. Learn by doing — không có wall of text
  2. Zero friction — không có bài kiểm tra, không có quiz
  3. Gradual complexity — mỗi bước chỉ dạy 1 concept mới
  4. Skip available — người chơi có thể skip bất cứ lúc nào
  5. Never block — không có mechanic mới nào block progression
  6. Forgiving — sai lầm không có hậu quả trong tutorial

TUTORIAL FLOW:
  Tutorial → Onboarding → In-Game Tips → Advanced Guide

TUTORIAL BUDGET:
  Max 5 phút cho toàn bộ tutorial
  Max 3 clicks cho mỗi bước
```

---

## 2. Onboarding Flow (First Launch)

### Step 1: Splash + Skip

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│              [GAME LOGO]                    │
│        Project Sunny                        │
│        Startup Journey                      │
│                                             │
│         [Cosmic Background]                 │
│                                             │
│                                             │
│                    [ Bỏ qua >> ]            │
│                                             │
└─────────────────────────────────────────────┘

Skip Button: Top right, ghost button, --text-muted
On tap: Go directly to Main Menu
Timer: Skip button appears after 1.5s logo animation
```

### Step 2: Story Intro (Auto-play, skippable)

```
┌─────────────────────────────────────────────┐
│  [Backdrop: City skyline at night]           │
│  [Sunny character illustration, center]    │
│                                             │
│  [VOICE LINE: "Sau khi tốt nghiệp..."]    │
│                                             │
│  Text: Sau nhiều lần bị từ chối chỉ vì   │
│  xuất thân từ trường nghề...              │
│                                             │
│  [VOICE LINE: "...tôi quyết định..."]      │
│                                             │
│  Text: Tôi quyết định không ngồi đợi.     │
│  Tôi sẽ tự tạo ra cơ hội của mình.       │
│                                             │
│  [VOICE LINE: "Cùng bắt đầu nhé!"]        │
│                                             │
│  [ Tiếp tục >> ]                          │
│                                             │
└─────────────────────────────────────────────┘

Auto-advance: Next text after voice line ends
Tap anywhere: Advance immediately
Total duration: ~15 seconds
Background music: Quiet, emotional piano
```

### Step 3: Choose Main Profession

```
┌─────────────────────────────────────────────┐
│  Chọn Ngành Nghề Chính                     │
│  (Đây sẽ ảnh hưởng đến hiệu quả thẻ bài) │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │ 💻 Kỹ Thuật Phần Mềm              │  │
│  │ "Lập trình viên fullstack"          │  │
│  │ +8% Crit | +10% Revenue             │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ 🔧 Kỹ Thuật Phần Cứng              │  │
│  │ "Kỹ sư hardware"                    │  │
│  │ -10% Cost | +5 Shield/round         │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ 📊 Marketing                        │  │
│  │ "Chuyên gia truyền thông"           │  │
│  │ +15% Revenue | +15 Customers        │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ 🎨 Thiết Kế Đồ Họa                 │  │
│  │ "Designer chuyên nghiệp"            │  │
│  │ +6% Revenue | +1 Revival            │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ ⚖️ Luật Sư                          │  │
│  │ "Chuyên gia pháp lý"               │  │
│  │ -15% Cost | Miễn 1 debuff           │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ ⚡ Kỹ Sư Điện                       │  │
│  │ "Kỹ sư điện tử"                    │  │
│  │ -20% Cost | -20% Env damage         │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  Tap profession → Highlight → [ Tiếp >> ] │
└─────────────────────────────────────────────┘

Behavior:
  - Tap card → Card glows with profession color
  - Benefits highlighted below card
  - [Tiếp] only enables after selection
  - Default selection: none (force choice)
```

### Step 4: Choose Secondary Profession

```
┌─────────────────────────────────────────────┐
│  Chọn Ngành Nghề Phụ                      │
│  (Hiệu suất 40%, bổ sung cho ngành chính) │
│                                             │
│  [Display selected main profession]          │
│  "💻 Kỹ Thuật Phần Mềm (Chính: 100%)"     │
│                                             │
│  [Select secondary - same 6 options]        │
│  ...                                        │
│                                             │
│  Note: "Có thể thay đổi sau trong Profile" │
│                                             │
│  [ Bắt Đầu Tutorial >> ]                  │
└─────────────────────────────────────────────┘
```

---

## 3. In-Game Tutorial (Demo Round)

### 3.1. Tutorial: Game Board Introduction

```
SCREEN: Demo Game Board (vs AI Bot)

[Speech bubble from Sunny]
"Chào bạn! Mình là Sunny. Để bắt đầu,
 bạn cần hiểu cách thẻ bài hoạt động.
 Hãy theo dõi mình nhé!"

[HIGHLIGHT: Your Hand Area]

Step 1: Giới thiệu Hand
"Đây là bài trên tay bạn. Mỗi vòng,
 bạn nhận 5 lá bài ngẫu nhiên."

[Auto-scroll to first card]
[Speech bubble]
"Lần lượt kéo thẻ vào các ô bên dưới."

[HIGHLIGHT: Card Slots]
```

### 3.2. Tutorial: Card Slot System

```
Step 2: Giới thiệu Slots

[Speech bubble]
"Có 5 ô bài, mỗi ô có chức năng khác nhau:"

[Highlight each slot one by one]

Slot 0 (REVENUE): "Ô thu nhập — đặt thẻ tạo tiền vào đây"
  → Place a REVENUE card here
  → Show +$100 animation

Slot 1 (BUFF): "Ô buff — đặt thẻ tăng cường"
  → Place a BUFF card here
  → Show buff icon appears

Slot 2 (COST): "Ô chi phí — thẻ giảm chi phí vào đây"
  → Place a COST card here
  → Show cost reduction

Slot 3 (DEFENSE): "Ô phòng thủ — thẻ hồi HP, shield"
  → Place a DEFENSE card here
  → Show +HP animation

Slot 4 (SPECIAL): "Ô đặc biệt — đặt bất kỳ thẻ nào"

[Highlight all slots]
"Hoàn thành rồi? Nhấn Sẵn sàng!"
```

### 3.3. Tutorial: Energy System

```
Step 3: Giới thiệu Energy

[Speech bubble]
"Thể lực là năng lượng để đánh bài.
 Mỗi thẻ tiêu tốn một lượng nhất định."

[HIGHLIGHT: Energy Bar]

[Show energy bar]
"Thanh này cho thấy bạn còn bao nhiêu thể lực.
 Mỗi vòng, bạn hồi lại 50% thể lực tối đa."

[Show energy restoration animation]
```

### 3.4. Tutorial: HP & Economy

```
Step 4: Giới thiệu HP & Money

[Speech bubble]
"HP là sức khỏe của cửa hàng.
 Money là tiền trong tài khoản."

[HIGHLIGHT: HP Bar]
[Highlight: Money Counter]

"Kiếm được profit → hồi HP nhẹ.
 Thua lỗ → mất HP. HP = 0 → cửa hàng đóng cửa!"

[Show profit → HP gain animation]
[Show loss → HP loss animation]

"Nhấn Sẵn sàng để xem kết quả vòng!"
```

### 3.5. Tutorial: Demo Round Execution

```
Step 5: Watch AI Play (Demonstration)

[AI Bot auto-plays first]
[Speech bubble]
"Mình đánh trước nhé. Theo dõi kỹ..."

[AI bot's cards flip one by one]
[Show revenue calculation]
[Show cost deduction]
[Show HP change]

"Kết quả: +$200 doanh thu, -$80 chi phí,
 +$120 profit → +2 HP!"

[Speech bubble]
"Giờ đến lượt bạn!"
```

### 3.6. Tutorial: Player's Turn

```
Step 6: Player's First Action

[Player is given 3 easy cards]
[Speech bubble]
"Đặt 2 thẻ đầu vào ô REVENUE và BUFF.
 Thẻ thứ 3 để trống cũng được."

[VALIDATION: Player must place at least 1 card]

[If placed correctly]
"Tuyệt vời! Nhấn Sẵn sàng để xem kết quả."

[PLAYER's cards flip]
[Show calculation]
[Show result]

[Speech bubble]
"Bạn làm được! Đây là cách trò chơi hoạt động.
 Giờ thử chơi thật nhé!"
```

### 3.7. Tutorial Completion

```
┌─────────────────────────────────────────────┐
│                                             │
│           [SUNNY CELEBRATING]               │
│                                             │
│     "Bạn đã sẵn sàng rồi!                │
│      Hành trình khởi nghiệp đang chờ!"     │
│                                             │
│  +200 XP                                    │
│  [ Tiếp tục vào Game >> ]                  │
│                                             │
└─────────────────────────────────────────────┘

Post-tutorial:
  → Set tutorial_completed = true
  → Skip all tutorials in future sessions
  → Track that player has seen each tutorial step
```

---

## 4. In-Game Tooltip System

### 4.1. Contextual Tooltips

```
RULE: Tooltips xuất hiện khi:
  1. Lần đầu thấy element (tag: "first_see_X")
  2. Người chơi hover/tap ? icon
  3. Sau khi fail một action

TOOLTIP STYLE:
  Background:     --bg-surface
  Border:        1px solid --color-primary
  Padding:       8px 12px
  Radius:        --radius-md
  Max width:     240px
  Arrow:         Points to triggering element
  Dismiss:       Tap anywhere outside
```

### 4.2. Tooltip Content Map

| Element | Tooltip |
|---|---|
| Card | "Kéo vào slot để đánh bài" |
| Slot 0 | "Thu nhập: Tạo tiền cho cửa hàng" |
| Slot 1 | "Buff: Tăng cường hiệu quả vòng này" |
| Slot 2 | "Chi phí: Giảm chi phí vận hành" |
| Slot 3 | "Phòng thủ: Hồi HP hoặc shield" |
| Slot 4 | "Đặc biệt: Chấp nhận mọi loại thẻ" |
| Lock button | "Khóa 1 lá bài để giữ lại vòng sau" |
| Ready button | "Xác nhận bài đã chọn. Không thể thay đổi." |
| Energy bar | "Thể lực: Tiêu tốn khi đánh bài. Hồi 50%/vòng" |
| HP bar | "HP: Sức khỏe cửa hàng. HP=0 → đóng cửa" |
| Env banner | "Sự kiện thị trường ảnh hưởng đến tất cả" |

### 4.3. First-Time Experience Tips

```
FIRST TIME EXPERIENCE:
  Play 1: Show "How to play" overlay on game board
  Play 2: Remind about Lock card feature
  Play 3: Remind about Combo system
  Play 5: Remind about Quest system
  Play 10: Show Leaderboard feature

RATE POPUPS:
  After Play 5:   "Bạn thích game không? [⭐⭐⭐⭐⭐]"
  After Play 10: App Store rating prompt (if positive)

CONTEXTUAL TIPS (shown once):
  "Pro tip: Lock thẻ Rare để giữ cho vòng sau"
  "Pro tip: Combo nhiều thẻ cùng ngành để tăng hiệu quả"
  "Pro tip: Để ý môi trường để chọn bài phù hợp"
```

---

## 5. Learning Curve

### 5.1. Content Unlocking

```
ROUND GATED CONTENT:
  Round 1:   Tutorial, basic cards only
  Round 3:   All early phase cards unlocked
  Round 6:   Mid phase cards + Environment system explained
  Round 10:  Late phase cards + Combo system
  Round 13:  Endgame mechanics + Boss cards
  Round 20:  Endless mode unlocked

FEATURE UNLOCKING:
  First game:      Lobby, game board, basic collection
  After 3 games:  Daily quests visible
  After 5 games:  Shop / Card Packs visible
  After 10 games: Achievements tab visible
  After 20 games: Battle Pass visible
  After 30 games: Guild system visible
  After 50 games: Leaderboard competitive mode
```

### 5.2. Difficulty Progression

```
BOT DIFFICULTY (Solo Practice):
  Games 1-3:    Bot plays suboptimally (70% of optimal)
  Games 4-10:   Bot plays moderately (85% of optimal)
  Games 11+:    Bot plays well (95% of optimal)

RANDOM FACTORS:
  Early game:    Low variance in outcomes
  Late game:     Higher variance (more dramatic turns)
```

---

## 6. Help & Support

```
IN-GAME HELP:
  [?] Button:      Opens Help Center
  Card "?" tap:   Shows card detail + effect explanation
  Error message:  Includes "Tìm hiểu thêm" link

HELP CENTER SECTIONS:
  - Hướng dẫn cơ bản
  - Giải thích thẻ bài
  - Cách kiếm tiền
  - Chiến lược nâng cao
  - Câu hỏi thường gặp (FAQ)
  - Liên hệ hỗ trợ
  - Báo lỗi

COMMUNITY:
  Discord:  Link in Settings
  Facebook: Link in Settings
  In-game: "Hỏi bạn bè" — share guide
```
