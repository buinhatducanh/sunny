# Project Status — 2026-05-25

> Trạng thái hiện tại của Project Sunny sau lần đánh giá mới nhất.

---

## Infrastructure

| Resource | Status | URL/Note |
|---|---|---|
| GitHub Repo | ✅ Done | https://github.com/buinhatducanh/sunny |
| Backend (NestJS) | ✅ Deployed | https://sunny-api-nejx.onrender.com |
| PostgreSQL (Render) | ✅ Deployed | sunny-db (free tier) |
| Swagger Docs | ✅ Live | https://sunny-api-nejx.onrender.com/docs |
| Mobile App | 🔄 In Progress | APK build tồn tại |

---

## Backend — 57 TypeScript files

### ✅ Hoàn thành
- `main.ts` + `app.module.ts` — Bootstrap, CORS, Swagger
- `prisma/` — PrismaModule, PrismaService (21 models)
- `auth/` — Controller, Service, JWT Strategy, DTOs
- `users/` — Controller, Service
- `health/` — HealthController (health + ready)
- `game/` — Engine, CardDraw, Economy, Matchmaking, GameGateway (WebSocket)
- `modules/` — Tất cả 10 modules: achievement, analytics, battlepass, card, friends, guild, leaderboard, quest, season, shop

### ❌ Chưa làm
- **Seed data** — cards (200+), achievements (50), quests (daily)
- **Database migration** — Prisma migrate chưa chạy trên Render DB
- **Prisma push/migrate** — schema chưa apply lên production DB

---

## Mobile — 21 screens

### ✅ Hoàn thành
- Auth: login, register, `_layout`
- Tab navigation: home, collection, friends, achievements, battlepass, shop, leaderboard, profile, settings
- Lobby: room list, create room, room detail
- Game board: basic structure
- Tutorial: onboarding flow
- API client + Socket client
- Zustand stores: auth, game, gameBoard, lobby

### ❌ Chưa làm
- Kết nối real API (đang dùng mock)
- WebSocket real-time sync
- Card drag-drop UI
- Game board animations
- In-game tutorial integration
- APK build production-ready

---

## Packages — 15 TypeScript files

### ✅ Hoàn thành
- `packages/types/` — card, player, economy types
- `packages/constants/` — game constants, card data, profession data, env data, quest data, achievement data
- `packages/utils/` — random, math, validation

---

## Tech Stack Hiện Tại

| Layer | Tech | Note |
|---|---|---|
| Mobile | React Native (Expo) | APK tồn tại tại `apps/mobile/SunnyGame-debug.apk` |
| Backend | NestJS + TypeScript | 57 files |
| Database | PostgreSQL | Render free tier |
| ORM | Prisma 5 | 21 models |
| Auth | JWT + Passport | Access + refresh tokens |
| Realtime | Socket.io | GameGateway tồn tại |
| Workspace | pnpm + npm | npm for production build |
| Deploy | Render Blueprint | `render.yaml` in repo |

---

## TODO — Priority Order

### P0 — Must Have (Game MVP)

1. **Seed database** — cards, achievements, quests lên Render PostgreSQL
2. **API → Mobile integration** — kết nối mobile với backend thật
3. **WebSocket integration** — mobile ↔ backend real-time
4. **Login/Register flow** — end-to-end test trên production
5. **Lobby → Game flow** — tạo phòng, join, bắt đầu game

### P1 — Core Gameplay

6. **Game board polish** — card drag-drop, animations
7. **Round engine integration** — kết nối mobile với game engine
8. **Card collection** — xem cards đã sở hữu
9. **Tutorial → real game** — nối tutorial với game thật
10. **Leaderboard** — hiển thị ranking

### P2 — Social & Progression

11. Friends system
12. Guild system
13. Battle Pass UI + logic
14. Daily quests
15. Achievements

### P3 — Polish & Launch

16. Card gacha animation
17. AdMob integration
18. IAP integration
19. Push notifications
20. APK production build
21. iOS build

---

## Đã Deploy

```
BE:     https://sunny-api-nejx.onrender.com
Swagger: https://sunny-api-nejx.onrender.com/docs
Health: https://sunny-api-nejx.onrender.com/api/v1/health
Ready:  https://sunny-api-nejx.onrender.com/api/v1/health/ready
```
