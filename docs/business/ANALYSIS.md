# Expert Analysis — Project Sunny GDD

## Đánh Giá Tổng Quan

| Khía cạnh | Điểm | Ghi chú |
|---|---|---|
| Gameplay Core | ⭐⭐⭐ | Nền tảng tốt, thiếu depth và retention loop |
| Cân bằng & Chỉ số | ⭐⭐ | Không có công thức số, chỉ mô tả qualitative |
| Kỹ thuật | ⭐⭐⭐ | Stack hợp lý, thiếu mobile-specific concerns |
| Monetization | ❌ | Hoàn toàn chưa có — nghiêm trọng |
| Onboarding | ❭� | Không có — nguy cơ churn cao |
| Thị trường | ⭐⭐ | Theme tốt nhưng chưa rõ USP |

---

## 🔴 Critical Issues (Phải fix trước khi code)

### 1. Không có Monetization Model
- **Vấn đề:** Dù là F2P hay premium, phải định nghĩa ngay. Không có = không rõ định hướng thiết kế.
- **Giải pháp:** F2P với IAP cosmetic + Battle Pass. KHÔNG pay-to-win.
  - Card Back skins (cosmetic)
  - Battle Pass Season (rewards, exclusive cards visual)
  - Energy refills (comfort, not P2W)
  - Cosmetic card frames

### 2. Không có Tutorial / Onboarding
- **Vấn đề:** #1 nguyên nhân churn trên mobile. Người chơi mới rời trong 60 giây đầu nếu không hiểu.
- **Giải pháp:** 3-bước onboarding:
  1. Chọn nghề (giới thiệu stats)
  2. Đánh 1 vòng demo (AI đánh trước, người chơi đánh theo)
  3. Ghép phòng thật

### 3. Không có Công Thức Số cho Kinh Tế
- **Vấn đề:** Không thể code balance khi chỉ có mô tả qualitative.
- **Giải pháp:** Định nghĩa tất cả công thức dưới đây.

---

## 🟡 Gameplay Improvements

### 4. Thiếu Comeback Mechanic
- Người chơi đang thua sẽ quit nếu không có cơ hội quay lại.
- Thêm: **"Khó khăn → Cơ hội"** — Môi trường xấu mạnh hơn khi đang thua (scaling debuff).
- Thêm: **Rewarding Streak Break** — Boss card đặc biệt xuất hiện khi thua 3 vòng liên tiếp.

### 5. Thiếu Daily/Seasonal Loop
- Thêm **Daily Quest** (3 quest mỗi ngày, reset 00:00 UTC):
  - Đánh 1 vòng → 50 xu
  - Sử dụng 5 lá bài cùng ngành → 1 card pack
  - Kiếm 1000 profit → 10 energy
- Thêm **Season Pass** (8 tuần):
  - Free track: basic card backs, xu
  - Premium track ($4.99): exclusive card visuals, frame, avatar

### 6. Card Pool quá nông
- Hiện tại: ~4 loại cửa hàng × ~10 lá = ~40 lá.
- Cải thiện: Mỗi loại cửa hàng cần 3 tier (Early/Mid/Late game).
- Mỗi ngành nghề cần 8-12 lá đặc thù.
- Total card pool target: 200+ lá.

### 7. Thiếu Social Features
- Thêm **Guild System**: 10 người/guild, buff guild-wide.
- Thêm **Card Trading** (chỉ trade duplicate, không trade meta cards).
- Thêm **Leaderboard** (theo vòng sống sót cao nhất, theo tuần).

### 8. Thiếu Achievement System
- 30 achievements với milestones:
  - "Thất bại đầu tiên" (thua vòng đầu)
  - "Kiến trúc sư" (build 5 cửa hàng)
  - "Triệu phú" (đạt 100,000 vốn)
  - "Siêu sao" (sống sót vòng 50+)

---

## 🟡 Technical Improvements

### 9. Mobile-First Concerns
- Optimistic UI updates (người chơi thấy action ngay, server xác nhận sau)
- WebSocket reconnect với state resync
- Offline save/load game state
- Touch-optimized card drag (min 44px touch target)

### 10. Anti-Cheat
- Server-side validation tất cả card plays
- Rate limiting: tối đa 10 action/giây/người chơi
- Hash state + server snapshot để detect manipulation

### 11. CDN Strategy
- Card images → Cloudinary / Vercel Blob
- Lottie animations → self-hosted JSON
- Fonts → Google Fonts (preconnect)

---

## 🟢 Balancing — Công Thức Số Chi Tiết

### Kinh Tế Cơ Bản
```
Starting Capital  = 5000
Revenue/round    = customers × avgTicket × (1 + marketingBonus)
Customers        = floor((50 + diplomacy × 2) × envMod × cardMod)
avgTicket       = 100 + (vòng × 10)   // tăng theo vòng
Operating Cost  = floor(500 × 1.1^vòng)  // tăng 10%/vòng
Profit          = Revenue - Operating Cost - cardCosts

HP Business     = max(0, HP - costOverflow)
Death condition = HP <= 0  HOẶC  không trả được chi phí 2 vòng liên tiếp
```

### Card Stats
```
Base Damage     = card.basePower × (1 + statBonus/100) × professionMultiplier
  - Main profession: ×1.0
  - Secondary profession: ×0.4
  - Non-relevant: ×0.1

Crit Rate       = 5% + (card.critBonus%) + (relevantProfession × 5%)
Crit Damage     = 150% + (relevantProfession × 10%)

Card Cost       = baseCost × (1 - discount%)
  - Utility cards: 10-20 energy
  - Combat cards: 30-60 energy
```

### Rarity Distribution
```
Common    (50%):  basePower 10-30,   cost 50-150
Rare      (30%):  basePower 35-60,   cost 200-400
Epic      (15%):  basePower 65-100,  cost 500-900
Legendary (5%):   basePower 120-200, cost 1200-2000
```

### Environment Damage Scaling
```
Bad env damage = floor(20 × (1 + vòng/20))
  - Đại dịch: -30% customers, +20% cost
  - Chiến tranh: -40% specific category revenue
  - Bầy quạ: +30% cost

Good env bonus = floor(15 × (1 + vòng/30))
  - Kỷ nguyên Công nghệ: +50% electronics
  - Gói Thúc đẩy: +1000 capital, +500/month
  - Trend Truyền thông: +30% all marketing cards
```

### Turn Order
```
Speed = baseSpeed + cardSpeedBonus
Order = sorted descending by Speed
  (Nếu hòa: random tiebreak, ghi nhận để debug)
```

---

## 🟢 Tech Architecture

### Monorepo Structure
```
dgm/
├── apps/
│   ├── web/          # Next.js 15 (App Router)
│   └── api/          # NestJS + Prisma
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── constants/    # Game balance constants
│   └── utils/        # Shared utilities
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

### Database Schema Core Entities
```
User         → id, username, avatar, createdAt
Player       → id, userId, professions, stats, cosmetics
GameRoom     → id, hostId, status, config, currentRound
PlayerState  → roomId, userId, hand[], hp, money, position
Card         → id, type, rarity, cost, effects[], duration
CardInstance → id, cardId, ownerId, slot, active
Buff/Debuff  → id, type, value, duration, sourceCardId
EnvironmentalEvent → id, type, multiplier, duration, round
Transaction  → id, roomId, round, playerId, type, amount
Achievement   → id, userId, type, unlockedAt
```

### WebSocket Events
```
Client → Server:
  joinRoom(roomId)
  ready()
  playCard(cardInstanceId, slot)
  lockCard(cardInstanceId)
  chat(message)

Server → Client:
  roomState(state)
  roundStart(round, hands)
  cardResolved(playerId, cardId, result)
  roundEnded(results)
  envChanged(event)
  playerDied(playerId)
  gameOver(winner, stats)
```

### Security Layers
1. JWT auth + refresh token rotation
2. Room join requires valid invite code
3. All game logic in `calculateRound()` server-side
4. Client only sends card intent, server validates + executes
5. Rate limit: 10 events/socket/s
6. State hash (SHA-256) sent each round for tamper detection

---

## Roadmap Implementation Order

```
Phase 1 — Foundation (Week 1-2)
  ✅ Monorepo + NestJS + Prisma + Next.js skeleton
  ✅ Auth system (email + OAuth placeholder)
  ✅ Basic game room (create, join, lobby)
  ✅ Card system data model
  ✅ Card drawing & hand management

Phase 2 — Core Gameplay (Week 3-4)
  ✅ Game loop: Draw → Action → Resolution → Cleanup
  ✅ Profession system with multipliers
  ✅ 6 professions × 12 cards = 72 cards
  ✅ Environmental events
  ✅ Basic economy (money, HP, costs)

Phase 3 — Polish & Mobile (Week 5-6)
  ✅ Touch-optimized card drag/drop
  ✅ Animations (Framer Motion)
  ✅ Reconnection handling
  ✅ Tutorial onboarding
  ✅ First playable build (web)

Phase 4 — Multiplayer + Economy (Week 7-8)
  ✅ 5-player real-time sync
  ✅ Leaderboard
  ✅ Achievement system
  ✅ Daily quests
  ✅ Basic IAP (Battle Pass)

Phase 5 — Live Ops (Week 9+)
  □ Season system (8-week cycles)
  □ Guild system
  □ Card expansion packs
  □ Analytics + A/B testing
  □ Push notifications
```
