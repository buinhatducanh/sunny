# AUDIO-SPEC.md — Sound Design & Music Specification

> Chi tiết về nhạc nền, hiệu ứng âm thanh, voice acting, và audio pipeline.

---

## 1. Audio Architecture

### 1.1. Audio Categories

| Category | Format | Sample Rate | Bitrate | Files |
|---|---|---|---|---|
| **Background Music** | OGG + AAC | 44.1kHz | 192kbps | ~15 tracks |
| **Sound Effects** | WAV → OGG | 44.1kHz | 128kbps | ~60 SFX |
| **UI Sounds** | WAV → OGG | 44.1kHz | 96kbps | ~30 sounds |
| **Voice Lines** | AAC | 44.1kHz | 64kbps | ~50 lines |

### 1.2. Audio Implementation

```typescript
// Audio Manager (React Native)
interface AudioManager {
  // Music
  playMusic(track: MusicTrack, fadeIn?: number): void;
  pauseMusic(): void;
  resumeMusic(): void;
  crossFadeTo(track: MusicTrack, duration: number): void;
  setMusicVolume(volume: number): void; // 0-1

  // SFX
  playSFX(sfx: SFXType, volume?: number): void;
  playSFX3D(sfx: SFXType, position: Vector2): void;

  // Voice
  playVoice(line: VoiceLine): void;

  // Master
  setMasterVolume(volume: number): void;
  mute(muted: boolean): void;
}

enum MusicTrack {
  // Lobby
  LOBBY_IDLE,        // Calm, welcoming
  LOBBY_COUNTDOWN,   // Tension building

  // Game
  GAME_EARLY_ROUNDS, // Light lofi, relaxed
  GAME_MID_ROUNDS,   // Tempo increases
  GAME_LATE_ROUNDS,  // Intense, urgent
  GAME_TENSION,      // Max tension, near-death

  // Events
  ENV_BAD,           // Ominous, dark
  ENV_GOOD,          // Uplifting
  BOSS_APPEAR,       // Dramatic

  // Results
  ROUND_WIN,
  ROUND_LOSS,
  GAME_OVER_WIN,
  GAME_OVER_LOSE,
}

enum SFXType {
  // Card actions
  CARD_DRAW,         // Shuffle + deal sound
  CARD_PLAY,         // Card placement on slot
  CARD_FLIP,         // Card flip reveal
  CARD_REJECT,       // Invalid placement
  CARD_LOCK,         // Lock card sound
  CARD_RESOLVE,      // Card effect activation

  // Economy
  MONEY_GAIN,        // Coin collection sound
  MONEY_LOSS,        // Money drain sound
  HP_GAIN,           // Heart fill / heal
  HP_LOSS,           // Heart break / damage
  HP_CRITICAL,       // Low HP warning beep
  HP_DEATH,          // Death sound

  // Environment
  ENV_CHANGE,        // Whoosh + transition
  ENV_PANDEMIC,      // Cough + alarm
  ENV_TECH_BOOM,     // Tech glitch + success
  ENV_VIRAL,         // Social media ping
  ENV_GOLDEN_AGE,    // Triumphant fanfare

  // Game flow
  ROUND_START,       // Bell / chime
  ROUND_END,         // Tick + fade
  COUNTDOWN_TICK,    // Timer tick
  READY_CONFIRM,     // Click / confirmation
  VOTING_OPEN,       // Door open sound

  // UI
  BUTTON_CLICK,      // Soft click
  BUTTON_LONG,       // Button hold
  TAB_SWITCH,        // Tab change
  MODAL_OPEN,        // Whoosh up
  MODAL_CLOSE,       // Whoosh down
  TOAST_IN,          // Notification pop
  TOAST_OUT,         // Notification dismiss
  ACHIEVEMENT_UNLOCK,// Achievement fanfare
  LEVEL_UP,          // Level up chime
  PACK_OPEN,         // Gift unwrap
  CARD_RARITY_LEGENDARY, // Legendary card reveal

  // Ambient
  AMBIENT_LOBBY,     // Lobby background hum
  AMBIENT_CAFE,      // Cafe ambient (clinking cups)
  AMBIENT_STORE,     // Store ambient (footsteps, door)
  AMBIENT_OFFICE,    // Office ambient (keyboard, chatter)
}
```

---

## 2. Music Specification

### 2.1. Track Definitions

```
┌────────────────────────────────────────────────────────────────┐
│ TRACK 1: LOBBY_IDLE                                            │
│ Genre:        LoFi / Chillhop                                   │
│ BPM:          80-90                                             │
│ Duration:     Loop 90s                                          │
│ Instruments:  Piano, bass, light drums, vinyl crackle          │
│ Mood:         Welcoming, warm, hopeful                          │
│ Layer:        Base (always plays) + Melody (adds after 30s)     │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 2: LOBBY_COUNTDOWN                                       │
│ Genre:        LoFi + Tension                                    │
│ BPM:          90-100 (building)                                │
│ Duration:     Loop 30s                                          │
│ Instruments:  Piano (increasing intensity), bass, drums         │
│ Mood:         Anticipation, ready to start                      │
│ Trigger:      When host clicks "Bắt đầu"                       │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 3: GAME_EARLY_ROUNDS (Round 1-5)                         │
│ Genre:        LoFi / Chillhop                                    │
│ BPM:          85-95                                             │
│ Duration:     Loop 120s                                         │
│ Instruments:  Piano, bass, drums, occasional synth             │
│ Mood:         Relaxed, strategic, pleasant                      │
│ Variation:    Subtle key change every 5 rounds                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 4: GAME_MID_ROUNDS (Round 6-12)                          │
│ Genre:        LoFi + Driving                                    │
│ BPM:          100-110 (faster)                                  │
│ Duration:     Loop 120s                                         │
│ Instruments:  Piano (more active), bass, drums, synth layers  │
│ Mood:         Focused, competitive, building tension            │
│ Trigger:      Automatically at Round 6                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 5: GAME_LATE_ROUNDS (Round 13-20)                        │
│ Genre:        LoFi + Intense                                    │
│ BPM:          115-125                                           │
│ Duration:     Loop 120s                                         │
│ Instruments:  Piano (urgent), bass, drums, strings, synth       │
│ Mood:         High stakes, decisive, climactic                  │
│ Trigger:      Automatically at Round 13                         │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 6: GAME_TENSION (HP < 30%)                               │
│ Genre:        LoFi + Ominous                                    │
│ BPM:          120-130, syncopated                               │
│ Duration:     Loop 60s                                          │
│ Instruments:  Low piano, bass drone, sparse drums               │
│ Mood:         Danger, desperation, last stand                   │
│ Trigger:      When any player HP < 30%                          │
│ Special:      Heartbeat SFX layer underneath                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 7: ENV_BAD                                               │
│ Overlay on current game track                                   │
│ Genre:        Dark ambient                                      │
│ BPM:          N/A (ambient)                                     │
│ Duration:     Continuous                                        │
│ Instruments:  Low drones, unsettling strings, distorted bass   │
│ Mood:         Threatening, uneasy                               │
│ Trigger:      When bad environment activates                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ TRACK 8: ENV_GOOD                                              │
│ Overlay on current game track                                  │
│ Genre:        Uplifting ambient                                 │
│ BPM:          N/A (ambient)                                     │
│ Duration:     Continuous                                        │
│ Instruments:  Bright synth, chime, major chord arpeggios       │
│ Mood:         Rewarding, positive, encouraging                  │
│ Trigger:      When good environment activates                   │
└────────────────────────────────────────────────────────────────┘
```

### 2.2. Music Crossfade Logic

```typescript
function onRoundChange(oldRound: number, newRound: number) {
  // Round 1-5: Early
  if (newRound <= 5) {
    if (currentTrack !== MUSIC.EARLY) crossFade(MUSIC.EARLY, 2000);
  }
  // Round 6-12: Mid
  else if (newRound <= 12) {
    if (currentTrack !== MUSIC.MID) crossFade(MUSIC.MID, 2000);
  }
  // Round 13-20: Late
  else {
    if (currentTrack !== MUSIC.LATE) crossFade(MUSIC.LATE, 2000);
  }

  // Tension overlay when HP low
  if (anyPlayerHPBelow(30)) {
    overlayMusic(MUSIC.TENSION, 0.4); // 40% volume underneath
  } else {
    removeOverlay(MUSIC.TENSION);
  }
}

function onEnvironmentChange(env: Environment) {
  if (env.isGood) {
    overlayMusic(MUSIC.ENV_GOOD, 0.3);
  } else {
    overlayMusic(MUSIC.ENV_BAD, 0.3);
  }
}
```

---

## 3. Sound Effects Specification

### 3.1. SFX Priority & Behavior

```
SFX VOLUME LEVELS:
  Card sounds:    0.7 (medium)
  Economy sounds: 0.8 (noticable)
  UI sounds:      0.5 (subtle)
  Ambient:        0.3 (background)

SFX POOLING:
  Max simultaneous SFX: 8
  If exceed: oldest SFX is cut
  Priority: Card sounds > Economy > UI

SFX VARIATION:
  Each SFX has 2-3 variations
  Randomly selected on play
  Prevents repetition fatigue
```

### 3.2. Critical SFX Descriptions

```
CARD_DRAW (3 variations):
  v1: Cards shuffling, one card slides out
  v2: Whoosh, card appears with flutter
  v3: Soft thud, card settles

CARD_FLIP:
  3D card flip sound — paper/fabric swish + impact
  Layer: Rarity-based pitch (Legendary = higher)

CARD_RESOLVE:
  Depends on effect type:
  - Revenue:  Coins clinking, cash register "cha-ching"
  - Cost:     Paper tearing, money being spent
  - Heal:     Soft chime, warmth swell
  - Damage:   Impact thud, crack
  - Buff:     Magical shimmer
  - Special:  Unique sparkle per effect

HP_CRITICAL:
  Heartbeat (low) + warning beep every 2 seconds
  Only plays when HP < 20%

MONEY_GAIN (4 variations):
  v1: Coins in a jar
  v2: Cash register
  v3: Bank transfer beep
  v4: Success chime

ENV_CHANGE:
  Wind whoosh + transition sweep
  Followed by environment-specific sound:
  - Pandemic:  Cough + alarm tone
  - War:       Siren + rumble
  - Tech Boom: Digital glitch + success
  - Govt Aid:  Official chime + announcement
  - Viral:     Social media notification flood
```

---

## 4. Voice Lines (Voice Acting)

### 4.1. Voice Line Triggers

```
PROFESSION VOICE LINES (on profession select):
  Software:    "Mã nguồn đã sẵn sàng. Deploy thôi!"
  Hardware:    "Thiết bị đã lắp ráp xong. Khởi động!"
  Marketing:   "Chiến dịch đã lên kế hoạch. Bắt đầu chạy!"
  Graphic:     "Thiết kế hoàn hảo rồi. Khách hàng sẽ mê đấy!"
  Lawyer:      "Hợp đồng đã ký. Mọi thứ trong tầm kiểm soát."
  Electrical:  "Dòng điện ổn định. Máy móc vận hành tốt."

ROUND ANNOUNCEMENTS:
  Round 1:   "Tháng 1 bắt đầu. Cửa hàng mở cửa!"
  Round 5:   "Nửa năm rồi! Chiến lược có hiệu quả không?"
  Round 10:  "Một năm! Chúng ta đã đi được một quãng đường dài."
  Round 15:  "Ba phần tư chặng đường. Áp lực đang tăng!"
  Round 19:  "Vòng áp chót! Một bước nữa thôi!"

ENVIRONMENT ANNOUNCEMENTS:
  Pandemic:  "Đại dịch ập đến! Khách hàng e ngại ra ngoài."
  War:       "Xung đột bùng phát. Thị trường chao đảo!"
  Tech Boom: "Công nghệ bùng nổ! Nhu cầu điện tử tăng vọt!"
  Govt Aid:  "Chính phủ công bố gói hỗ trợ. Tiết kiệm được rồi!"
  Viral:     "Trend viral! Mọi người đang nói về chúng ta!"

GAME OVER:
  Win:  "Chúng ta làm được! Từ con số không đến thành công!"
  Lose: "Lần này chưa được... Nhưng kinh nghiệm là bài học."

CRIT HIT:
  "Chí mạng!"
  "Tuyệt vời!"
  "X2 Revenue!"
```

---

## 5. Audio Settings

```
SETTINGS OPTIONS:
  Music Volume:     0-100 slider
  SFX Volume:       0-100 slider
  Voice Volume:     0-100 slider
  Master Volume:    0-100 slider

  Mute All:         Toggle switch

  Music Quality:    Low (96kbps) / High (192kbps)

  Pre-download:     Toggle for downloading all audio on WiFi
```

---

## 6. Audio Pipeline

```
PRODUCTION WORKFLOW:
  1. Compose music tracks (LMMS / FL Studio / Ableton)
  2. Export stems for each layer
  3. Generate OGG + AAC versions
  4. Compress SFX with OGG encoding
  5. Add to asset bundle (RN Async require)
  6. Total audio size target: < 50MB

STORAGE:
  Bundled:          ~30MB (core SFX, 1-2 music tracks)
  On-demand:         Downloaded per track on first play
  Total final:       ~50MB

RUNTIME:
  React Native:     expo-av for audio playback
  Preload:          Preload next track 5s before crossfade
  Memory:            Unload unused tracks after 30s
```
