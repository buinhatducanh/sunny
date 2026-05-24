# UI-SPEC.md — Visual Design & User Interface Specification

> Chi tiết về màu sắc, typography, spacing, component, animation, và layout cho toàn bộ game.
> Thiết kế theo **mobile-first**, hỗ trợ 375px → 428px width (iPhone SE → iPhone 15 Pro Max).

---

## 1. Design System Foundation

### 1.1. Color Palette

```
PRIMARY COLORS (Cosmic Tech / Galaxy):
  --color-primary:       #6C63FF   // Cosmic Purple — nút chính, highlights
  --color-primary-dark:   #4B44CC   // Darker purple — pressed state
  --color-primary-light:  #8B84FF   // Lighter purple — hover, glow

  --color-secondary:      #00D4AA   // Cyan/Teal — accent, revenue
  --color-secondary-dark: #00A080   // Darker teal
  --color-secondary-light:#00FFCC   // Light teal — glow effects

  --color-accent:         #FF6B6B   // Coral Red — danger, damage, HP loss
  --color-accent-warm:    #FFB347   // Warm Orange — warnings, costs
  --color-accent-gold:    #FFD700   // Gold — legendary, premium

BACKGROUND COLORS:
  --bg-deep:              #0A0A1A   // Deep space black — main background
  --bg-card:             #12122A   // Card surface
  --bg-card-hover:        #1A1A3A   // Card hover
  --bg-surface:           #1E1E3F   // Modal, bottom sheet
  --bg-overlay:           rgba(10,10,26,0.85)  // Modal overlay

TEXT COLORS:
  --text-primary:         #FFFFFF   // Primary text
  --text-secondary:       #A0A0C0   // Secondary text
  --text-muted:          #6060A0   // Disabled, placeholder
  --text-inverse:         #0A0A1A   // Text on light background

RARITY COLORS:
  --rarity-common:        #8B8B9E   // Grey
  --rarity-rare:          #4A9EFF   // Blue
  --rarity-epic:          #B44FFF   // Purple
  --rarity-legendary:     #FFD700   // Gold (with glow animation)

PROFESSION COLORS:
  --prof-software:        #00BFFF   // Deep Sky Blue
  --prof-hardware:        #FF8C00   // Dark Orange
  --prof-marketing:       #FF1493   // Deep Pink
  --prof-graphic:         #ADFF2F   // Green Yellow
  --prof-lawyer:          #8B0000   // Dark Red
  --prof-electrical:      #00FF7F   // Spring Green

STORE COLORS:
  --store-cafe:           #D2691E   // Chocolate
  --store-clothing:       #FF69B4   // Hot Pink
  --store-electronics:    #00CED1   // Dark Turquoise
  --store-adagency:       #9370DB   // Medium Purple

ENVIRONMENT COLORS:
  --env-pandemic:          #8B0000   // Dark Red
  --env-war:              #4A4A4A   // Dark Grey
  --env-techboom:          #00FF00   // Neon Green
  --env-govertaid:        #32CD32   // Lime Green
  --env-viraltrend:       #FF4500   // Orange Red
  --env-goldenage:        #FFD700   // Gold
  --env-normal:           #404060   // Neutral Grey
```

### 1.2. Typography

```
FONT FAMILIES:
  --font-primary:          "Be Vietnam Pro", sans-serif      // UI text, headings
  --font-display:          "Orbitron", sans-serif            // Round numbers, scores, counters
  --font-card:             "Be Vietnam Pro", sans-serif      // Card names, descriptions

  (Both loaded via Google Fonts)

FONT SIZES (mobile — 8pt grid):
  --text-xs:               10px    // Badge, caption
  --text-sm:               12px    // Secondary info
  --text-base:             14px    // Body text, card descriptions
  --text-lg:               16px    // Primary body
  --text-xl:               18px    // Subheadings
  --text-2xl:              22px    // Section headers
  --text-3xl:             28px    // Screen titles
  --text-4xl:             36px    // Large numbers (HP, money)
  --text-5xl:             48px    // Round counter (center screen)

FONT WEIGHTS:
  --font-regular:          400
  --font-medium:           500
  --font-semibold:         600
  --font-bold:             700
  --font-black:            900     // Display numbers only

LINE HEIGHTS:
  --leading-tight:         1.2     // Headings, card names
  --leading-normal:         1.5     // Body text
  --leading-relaxed:        1.75    // Card descriptions

LETTER SPACING:
  --tracking-tight:         -0.02em  // Large headings
  --tracking-normal:         0        // Body
  --tracking-wide:           0.05em   // Badges, labels
  --tracking-widest:        0.15em   // ALL CAPS labels
```

### 1.3. Spacing System (8pt Grid)

```
SPACING TOKENS:
  --space-0:               0px
  --space-1:               4px     // Tight gaps
  --space-2:               8px     // Inner padding small
  --space-3:               12px    // Standard inner padding
  --space-4:               16px    // Card padding, section gaps
  --space-5:               20px    // Screen padding horizontal
  --space-6:               24px    // Section gaps
  --space-8:               32px    // Large section gaps
  --space-10:              40px    // Screen padding vertical
  --space-12:              48px    // Between major sections
  --space-16:              64px    // Top/bottom safe areas

SCREEN PADDING:
  --screen-h-padding:       16px    // Left/right edge padding
  --screen-v-padding:       24px    // Top (below notch) / Bottom (above nav)

BORDER RADIUS:
  --radius-sm:              4px     // Small buttons, badges
  --radius-md:              8px     // Cards, inputs
  --radius-lg:              12px    // Modals, sheets
  --radius-xl:              16px    // Large cards
  --radius-2xl:             24px    // Bottom sheets
  --radius-full:            9999px  // Pills, avatars, circles
```

### 1.4. Shadows & Elevation

```
SHADOW TOKENS:
  --shadow-card:            0 2px 8px rgba(108,99,255,0.15), 0 1px 2px rgba(0,0,0,0.3)
  --shadow-card-hover:      0 8px 24px rgba(108,99,255,0.3), 0 2px 8px rgba(0,0,0,0.4)
  --shadow-card-legendary: 0 0 20px rgba(255,215,0,0.4), 0 4px 16px rgba(0,0,0,0.5)
  --shadow-modal:           0 -4px 32px rgba(0,0,0,0.6)
  --shadow-button:          0 4px 12px rgba(108,99,255,0.4)
  --shadow-button-pressed:  inset 0 2px 4px rgba(0,0,0,0.3)

GLOW EFFECTS:
  --glow-primary:           0 0 20px rgba(108,99,255,0.5)
  --glow-secondary:         0 0 20px rgba(0,212,170,0.5)
  --glow-gold:              0 0 30px rgba(255,215,0,0.6)
  --glow-epic:              0 0 25px rgba(180,79,255,0.5)
  --glow-danger:            0 0 15px rgba(255,107,107,0.5)
```

### 1.5. Safe Areas & Notch Handling

```
NOTCH / DYNAMIC ISLAND:
  --safe-area-top:          env(safe-area-inset-top)     // Should be 44-59px on notch
  --safe-area-bottom:        env(safe-area-inset-bottom) // Should be 34px on home indicator

LAYOUT RULES:
  - Top bar: fixed, starts at safe-area-top + 8px
  - Bottom nav: fixed, ends at safe-area-bottom + 8px
  - Game board: scrollable in middle, never behind nav
  - Modal: full screen overlay, respects safe areas
  - Card hand: fixed at bottom, above nav bar
```

---

## 2. Screen Layouts

### 2.1. Screen Structure

```
FULL APP SCREEN HIERARCHY:

├── Splash Screen
├── Auth Flow
│   ├── Login Screen
│   └── Register Screen
├── Main Tab Navigator (Bottom Tabs)
│   ├── Home Tab
│   │   ├── Home Screen (Daily quests, continue, new game)
│   │   └── News/Announcements Banner
│   ├── Play Tab
│   │   ├── Lobby List Screen
│   │   ├── Create Room Screen
│   │   └── Room Screen (Pre-game lobby)
│   ├── Collection Tab
│   │   ├── Card Collection Screen
│   │   ├── Card Detail Modal
│   │   └── Filter/Sort Sheet
│   ├── Shop Tab
│   │   ├── Shop Screen
│   │   ├── Card Pack Opening Screen
│   │   └── Purchase Confirmation Modal
│   └── Profile Tab
│       ├── Profile Screen
│       ├── Stats Screen
│       ├── Achievements Screen
│       ├── Battle Pass Screen
│       └── Settings Screen
└── Game Overlay Stack
    ├── Tutorial Overlay
    ├── Game Board Screen (Full screen)
    ├── Voting Screen
    ├── Round End Summary Modal
    ├── Game Over Screen
    └── Error/Toast Notifications
```

### 2.2. Bottom Tab Navigation

```
┌─────────────────────────────────────────────────────────────┐
│ [Safe Area Top]                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │  App Logo / Back Button          Notifications │ Profile ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│                    SCREEN CONTENT                           │
│                                                             │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┐       │
│ │  HOME   │  PLAY   │ COLLECT │  SHOP   │ PROFILE │       │
│ │   🏠    │   🎮    │   📚    │   🛒    │    👤    │       │
│ └─────────┴─────────┴─────────┴─────────┴─────────┘       │
│ [Safe Area Bottom]                                          │
└─────────────────────────────────────────────────────────────┘

Tab Bar Specs:
  Height:        56px + safe-area-bottom
  Icon size:     24px
  Active color:  --color-primary
  Inactive:      --text-muted
  Background:    --bg-surface (blur effect)
  Badge:         Red dot for notifications
```

### 2.3. Game Board Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Round 5          ☀️ Tech Boom          [⚙️] [📤]         │  ← Top Bar (48px)
│  HP ████████░░ 80    $12,450     ⚡ 85/100                │  ← Stats Bar (36px)
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐ │
│  │          ENVIRONMENT BANNER (if active)               │ │  ← Env Banner (44px)
│  │    ⚡ Kỷ Nguyên Công Nghệ — Electronics +100%        │ │
│  └──────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │  ← Card Slots (120px)
│  │REVENUE│  │ BUFF │  │ COST │  │DEFENS│  │SPECIA│        │
│  │Slot 0│  │Slot 1│  │Slot 2│  │Slot 3│  │Slot 4│        │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘        │
│                                                              │
│  ─────────── Other Players ───────────                       │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                            │  ← Player HUDs (64px)
│  │P1💻│  │P2📱│  │P3📊│  │P4⚖️│                            │
│  │HP80│  │HP65│  │HP45│  │HP10│                            │
│  └────┘  └────┘  └────┘  └────┘                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  YOUR HAND (Draggable)                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │  ← Hand Area (140px)
│  │ Card │ │ Card │ │ Card │ │ Card │ │ Card │            │
│  │  1   │ │  2   │ │  3   │ │  4   │ │  5   │            │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                              │
│  Energy: ████████░░ 85/100                                 │  ← Energy Bar (8px)
│  [🔒 Lock 1 card]                    [✅ Sẵn Sàng]         │  ← Action Bar (56px)
└─────────────────────────────────────────────────────────────┘

Card Slot Specs:
  Width:          (screenWidth - 40) / 5 - 8 = ~63px
  Height:         100px
  Border:         2px dashed (empty) / solid (filled)
  Active state:   Scale 1.05, glow

Card in Hand Specs:
  Width:          70px
  Height:         100px
  Touch target:   44px min
  Drag shadow:    elevation 8
```

### 2.4. Card Component Design

```
┌─────────────────────────────────┐
│  [Rarity Border Glow]           │
│  ┌───────────────────────────┐  │
│  │  [Icon]  [Rarity Badge]  │  │  ← Header (28px)
│  │        Card Name           │  │  ← Name (text-sm, bold)
│  ├───────────────────────────┤  │
│  │                           │  │
│  │    [Card Illustration]    │  │  ← Image Area (flex)
│  │                           │  │
│  ├───────────────────────────┤  │
│  │  +200 Revenue            │  │  ← Effect (text-xs)
│  │  -20 Energy              │  │  ← Cost (text-xs, red)
│  │  [Emoji Icon]            │  │
│  ├───────────────────────────┤  │
│  │  💻 Software Eng          │  │  ← Profession Tag (text-xs)
│  └───────────────────────────┘  │
└─────────────────────────────────┘

CARD STATES:
  Normal:         Standard shadow, normal colors
  Hover/Press:    Scale 1.05, enhanced shadow, border glow
  Dragging:       Scale 1.1, rotation ±5°, deep shadow
  Disabled:       Grayscale 100%, opacity 0.5
  Locked:         Lock icon overlay, gold border
  New (just got): "NEW" badge, shimmer animation for 3 seconds

CARD SIZE IN HAND:
  Width:   68px (5 cards fit with 4px gaps × 4 = 320px + 32px padding)
  Height:  96px
  Border:  2px solid (rarity color)
  Radius:  8px

CARD SIZE IN SLOT:
  Width:   60px
  Height:  90px
  Scale:   0.85x normal card
  Border:  2px solid (slot type color)

CARD SIZE IN COLLECTION:
  Width:   80px
  Height:  112px
  Grid:    4 columns, 8px gap
```

### 2.5. Component Library

#### Buttons

```
PRIMARY BUTTON:
  Background:   --color-primary
  Text:        white, --text-lg, font-semibold
  Padding:     12px 24px
  Border:      none
  Radius:      --radius-md
  Shadow:      --shadow-button
  Pressed:     --color-primary-dark, inset shadow
  Disabled:    opacity 0.5

SECONDARY BUTTON:
  Background:  transparent
  Border:      2px solid --color-primary
  Text:        --color-primary, --text-lg, font-semibold
  Padding:     12px 24px
  Radius:      --radius-md

GHOST BUTTON:
  Background:  transparent
  Text:       --text-secondary, --text-base
  No border
  Hover:      background rgba(255,255,255,0.05)

ROUND ACTION BUTTON (Game board):
  Width:       120px
  Height:      48px
  Background:  --color-primary (ready) / --color-accent (cancel)
  Text:        white, --text-lg, font-bold
  Radius:      --radius-lg
  Glow:        --glow-primary
  Pressed:     Scale 0.95
```

#### Progress Bars

```
HP BAR:
  Width:       100% of parent
  Height:      8px
  Background:  rgba(255,255,255,0.1)
  Fill:        gradient from --color-accent-warm to --color-accent (HP high)
                gradient from --color-accent to --color-accent-red (HP low)
  Radius:      --radius-full
  Animation:   300ms ease-out on value change

ENERGY BAR:
  Width:       100%
  Height:      6px
  Background:  rgba(255,255,255,0.1)
  Fill:        --color-secondary (available) / rgba(255,255,255,0.3) (depleted)
  Radius:      --radius-full

XP BAR:
  Width:       100%
  Height:      4px
  Background:  rgba(108,99,255,0.2)
  Fill:        --color-primary
  Radius:      --radius-full

BATTLE PASS TRACK:
  Width:       100%
  Height:      60px (per tier)
  Free track:  left side, greyed when unclaimed
  Premium:     right side, gold when unclaimed
  Claimed:    checkmark overlay
```

#### Modals & Sheets

```
BOTTOM SHEET (Card Detail):
  Background:     --bg-surface
  Border radius:  --radius-2xl (top corners)
  Handle:         40px × 4px, --text-muted, centered, 8px from top
  Padding:        --space-4
  Max height:     80vh
  Animation:      slide up 300ms spring

FULL MODAL (Game Over):
  Background:     --bg-deep
  Full screen
  Padding:        --space-5
  Animation:      fade in 200ms

TOAST NOTIFICATION:
  Position:       top center, below safe area
  Background:     --bg-surface
  Border:         1px solid rgba(255,255,255,0.1)
  Padding:        12px 20px
  Radius:         --radius-lg
  Duration:       3 seconds
  Animation:      slide down + fade in, auto dismiss
```

---

## 3. Animation Specifications

### 3.1. Animation Tokens

```
DURATIONS:
  --duration-instant:      100ms    // Immediate feedback
  --duration-fast:         150ms    // Hover, press
  --duration-normal:       300ms    // Standard transitions
  --duration-slow:         500ms    // Modal, screen transitions
  --duration-slower:       800ms    // Special effects
  --duration-cinematic:    1200ms   // Game over, victory

EASINGS:
  --ease-default:          cubic-bezier(0.4, 0, 0.2, 1)    // Standard
  --ease-in:               cubic-bezier(0.4, 0, 1, 1)      // Enter
  --ease-out:              cubic-bezier(0, 0, 0.2, 1)      // Exit
  --ease-spring:           cubic-bezier(0.34, 1.56, 0.64, 1) // Bouncy
  --ease-bounce:           cubic-bezier(0.68, -0.55, 0.265, 1.55) // Extreme bounce
```

### 3.2. Core Animations

```
CARD DRAW (Dealing cards):
  Trigger:      Round starts, Draw Phase
  Animation:    Card flies from deck (top center) to hand position
  Duration:     400ms per card, 80ms stagger between cards
  Easing:      --ease-spring
  Effect:      Scale 0 → 1, rotate random -10° → 0°

CARD PLAY (Drag to slot):
  Trigger:      User drops card on slot
  Animation:    Card snaps to slot center, settles
  Duration:     200ms
  Easing:       --ease-spring
  Effect:       Scale 1.05 → 1, haptic feedback

CARD FLIP (Resolution):
  Trigger:      Card is resolved
  Animation:    Card flips (Y-axis rotation 0° → 180°)
  Duration:     300ms
  Easing:       --ease-in-out
  At midpoint:  Switch card face from back to front
  Effect:       Glow pulse on card

CARD REJECT (Invalid play):
  Trigger:      Card dropped on invalid slot
  Animation:    Card shakes, returns to hand
  Duration:     300ms
  Effect:       translateX ±8px × 3 oscillations

CARD GLOW (Effect activation):
  Trigger:      Card effect resolves
  Animation:    Card border glows with rarity color
  Duration:     500ms
  Effect:       box-shadow pulse (0 → max → 0)
```

### 3.3. Game State Animations

```
HP CHANGE:
  Increase:   Green pulse from card to HP bar, bar fills green
  Decrease:   Red shake on HP bar, number ticks down
  Critical:   Red flash + shake when HP < 20
  Duration:   600ms

MONEY CHANGE:
  Increase:   Gold + number flies up from card to money counter
  Decrease:   Red - number drops down
  Number:     Animated counter (count up/down effect)
  Duration:   500ms

CUSTOMER COUNT:
  Animation:  Customer icons (👤) walk in/out across screen
  Duration:   800ms

ROUND TRANSITION:
  Screen:     Fade to dark, "Round X" text scales in large
  Duration:   1000ms total
  Music:      Beat drop at text appearance

ENVIRONMENT CHANGE:
  Banner:     Slides in from top, background color shift
  Screen:     Subtle vignette effect (purple = bad, gold = good)
  Duration:   600ms

DEATH:
  Player:     Grayscale + opacity fade to 0.3
  Effect:     Skull icon appears, HP bar shatters
  Duration:   800ms

VICTORY:
  Screen:     Particle burst, gold confetti rain
  Text:       "VICTORY" scales in with bounce
  Duration:   2000ms
```

### 3.4. Screen Transitions

```
Screen Push:     Slide left, new screen from right
Screen Pop:     Slide right, old screen returns
Modal Open:     Slide up from bottom
Modal Close:    Slide down, dismiss
Tab Switch:     Fade cross-dissolve (150ms)
Toast:          Slide down from top, auto-dismiss slide up
```

---

## 4. Responsive Design

### 4.1. Device Breakpoints

```
iPhone SE (1st gen):    320px   → Compact card sizes, smaller fonts
iPhone 12/13/14:        375px   → Standard reference
iPhone 14 Plus:         414px   → Slightly larger cards
iPhone 15 Pro Max:      430px   → Maximum size

Card sizes scale proportionally:
  SE:   card=60px, hand=300px total
  Std:  card=68px, hand=340px total
  Max:  card=76px, hand=380px total
```

### 4.2. Orientation

```
PORTRAIT ONLY:  (Recommended, enforced for game board)
  - Full vertical layout
  - Landscape: show "Vui lòng xoay thiết bị" overlay

LANDSCAPE SUPPORT: (Collection, Shop, Profile screens)
  - 2-column layouts where appropriate
  - Maintain minimum 44px touch targets
```

---

## 5. Accessibility

```
COLOR CONTRAST:
  Text on background:  minimum 4.5:1 (WCAG AA)
  Large text (18px+): minimum 3:1
  Interactive elements: minimum 3:1

TOUCH TARGETS:
  Minimum:              44 × 44px (Apple HIG)
  Recommended:           48 × 48px
  Cards:                68 × 96px (exceeds minimum)
  Buttons:              min 44px height

COLOR BLIND MODES:
  - Deuteranopia (green weak): Use patterns + icons, not just color
  - Protanopia (red weak):     Use blue/orange alternatives
  - Achromatopsia (no color):  Grayscale mode available in settings

FONT SCALING:
  System font scale respected (iOS Dynamic Type)
  Min:   12px (not smaller for readability)
  Max:   1.5x base size

MOTION REDUCTION:
  Respect iOS "Reduce Motion" setting:
  - Disable particle effects
  - Disable card flip animations
  - Instant transitions instead of slides
  - Keep functional animations (loading spinners)

SCREEN READER:
  All interactive elements have accessibilityLabel
  Card descriptions are readable
  Game state changes announced
```

---

## 6. Loading & Empty States

```
LOADING SCREEN:
  Background:  --bg-deep
  Logo:        Fade in + gentle float animation
  Progress:    Thin progress bar at bottom

SKELETON LOADING (Card Collection):
  Cards:       Grey rounded rectangles with shimmer
  Text:        Grey bars with shimmer

EMPTY STATE (No cards owned):
  Illustration: Empty card box image
  Text:        "Bạn chưa có thẻ bài nào"
  CTA:         "Mở gói đầu tiên" button

EMPTY LOBBY LIST:
  Illustration: Empty chair illustration
  Text:        "Không có phòng nào"
  CTA:         "Tạo phòng mới" button
```

---

## 7. Notification System

```
TOAST TYPES:
  Success:   Green left border, checkmark icon
  Error:     Red left border, X icon
  Warning:   Orange left border, warning icon
  Info:      Blue left border, info icon
  Reward:    Gold left border, gift icon

IN-APP NOTIFICATIONS:
  New card obtained:    "Bạn nhận được [Card Name]!"
  Achievement:          "🏆 [Achievement Name] đã mở khóa!"
  Daily quest:          "📋 Nhiệm vụ '[Quest]' hoàn thành!"
  Energy refill:        "⚡ Năng lượng đã được nạp đầy!"
  Friend request:       "[Username] đã gửi lời mời kết bạn"
  Guild invite:         "[GuildName] mời bạn gia nhập"
```

---

## 8. Haptic Feedback Map

```
TOUCH INTERACTIONS:
  Card tap:                Light impact
  Card drag start:        Medium impact
  Card drop (valid):      Light impact
  Card drop (invalid):    Error notification
  Button press:           Light impact
  Button confirm:         Success notification

GAME EVENTS:
  Crit hit:               Heavy impact + success
  HP damage:              Error notification
  Card combo:             Medium impact × 2
  Round win:              Success × 3
  Game over (win):        Heavy impact × 3
  Game over (lose):       Error notification × 2
```
