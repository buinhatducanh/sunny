# Project Sunny — Startup Journey

Game khởi nghiệp Việt Nam đầu tiên dạng thẻ bài co-op. 5 người chơi cùng xây dựng cửa hàng, sử dụng thẻ bài để đối phó rủi ro thị trường, và cùng sống sót đến Vòng 20.

## Live

| Service | URL |
|---|---|
| **Backend API** | https://sunny-api-nejx.onrender.com |
| **Swagger Docs** | https://sunny-api-nejx.onrender.com/docs |
| **GitHub Repo** | https://github.com/buinhatducanh/sunny |

## Documentation

| File | Mục đích |
|---|---|
| [SPEC.md](SPEC.md) | System specification — đọc TRƯỚC TIÊN |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Phase-by-phase execution plan |
| [docs/STATUS.md](docs/STATUS.md) | Trạng thái hiện tại (done/next) |
| [docs/README.md](docs/README.md) | Index toàn bộ tài liệu |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/buinhatducanh/sunny.git
cd sunny

# 2. Cài dependencies
npm install

# 3. Setup env
cp .env.example apps/api/.env
# Edit DATABASE_URL trong apps/api/.env

# 4. Database
npm run db:push     # Push schema
npm run seed        # Seed cards, achievements, quests

# 5. Dev servers
npm run dev          # Tất cả (backend + mobile)
npm run dev:api      # Chỉ backend (port 3000)
npm run dev:mobile   # Chỉ mobile (Expo)
```

## Cấu Trúc

```
apps/
├── api/              # NestJS backend (57 TypeScript files)
│   ├── src/
│   │   ├── main.ts
│   │   ├── auth/           # JWT auth
│   │   ├── game/           # Game engine + WebSocket gateway
│   │   ├── modules/        # 10 feature modules
│   │   └── prisma/         # ORM + 21 models
│   └── prisma/schema.prisma
│
└── mobile/           # React Native (Expo)
    ├── app/                # 21 screens
    └── src/
        ├── api/            # Axios client
        ├── lib/            # Socket.io client
        └── store/          # Zustand stores

packages/
├── types/             # Shared TypeScript types
├── constants/         # Game balance, card data, profession data
└── utils/            # Random, math, validation
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL (Render free) |
| ORM | Prisma 5 |
| Realtime | Socket.io |
| State | Zustand |
| Auth | JWT + Passport |

## Scripts

```bash
npm run dev          # Dev all
npm run build        # Build all
npm run db:push      # Push Prisma schema
npm run db:studio    # Open Prisma Studio
npm run docker:up    # Start PostgreSQL + Redis
npm run docker:down  # Stop services
```
