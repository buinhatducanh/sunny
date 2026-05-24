# Sunny Game - Release Guide

## Pre-Release Checklist

### Backend
```bash
cd apps/api
# Deploy to Railway
railway up

# Verify health
curl https://your-api.up.railway.app/health
```

### Mobile - Build & Test

```bash
cd apps/mobile

# 1. Prebuild native projects
pnpm prebuild

# 2. Build for local testing (Android)
pnpm build:android

# 3. Build for local testing (iOS)
pnpm build:ios
```

### EAS Build (Cloud)

```bash
# Development build (internal testing)
eas build --profile development --platform all

# Preview build (TestFlight / Internal)
eas build --profile preview --platform all

# Production build (App Store / Play Store)
eas build --profile production --platform all
```

## App Store Submission

### Google Play Store

1. Create account at [play.google.com/console](https://play.google.com/console)
2. Create app, fill store listing:
   - **Title**: Sunny Game
   - **Short description**: Game thẻ bài chiến thuật online
   - **Full description**: (see below)
   - **Category**: Games > Card
   - **Content rating**: Everyone 10+
3. Upload AAB from `android/app/build/outputs/bundle/release/`
4. Submit for review

**Full Description (Vietnamese)**:
```
☀️ SUNNY GAME - Game Thẻ Bài Chiến Thuật Online

Đặc điểm nổi bật:
🎴 200+ lá bài với hiệu ứng đa dạng
👥 Chơi multiplayer 5 người real-time
🏪 Hệ thống cửa hàng: Cafe, Thời trang, Điện tử, Quảng cáo
⚔️ Chiến đấu bằng chiến lược, không cần may mắn
🎖️ Battle Pass 50 hạng với phần thưởng hấp dẫn
🏆 Hệ thống thành tựu 30+ thử thách
📊 Bảng xếp hạng theo tuần

Cách chơi:
1. Chọn phòng hoặc tạo phòng mới
2. Bỏ phiếu chọn loại cửa hàng cho vòng đó
3. Chọn lá bài từ tay và đặt vào slot
4. Sống sót qua các vòng để chiến thắng!

Cập nhật Season 1: Khởi Đầu Rực Rỡ
```

### Apple App Store

1. Create account at [developer.apple.com](https://developer.apple.com)
2. Create app in App Store Connect
3. Fill metadata:
   - **Name**: Sunny Game
   - **Subtitle**: Game Thẻ Bài Chiến Thuật
   - **Category**: Games > Card
   - **Age Rating**: 10+
   - **Keywords**: game, card, multiplayer, strategy, battle
4. Upload IPA from EAS
5. Submit for review

## Secrets Required

### Google Play
- `google-play-service-account.json` - Service account key for automated submissions

### EAS
```bash
eas credentials --profile production --platform ios
eas credentials --profile production --platform android
```

## Post-Launch

1. Monitor crash reports in Play Store / App Store Connect
2. Check EAS Build reports for any build failures
3. Monitor API health dashboard
4. Track analytics events in database
5. Plan Season 2 content
