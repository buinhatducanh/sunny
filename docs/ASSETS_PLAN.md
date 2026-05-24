# Kế hoạch Assets - Demo Game Sunny

## Tổng quan

Tài liệu này liệt kê tất cả assets cần thiết để test demo game với người dùng thật.

---

## I. APP ICONS & BRANDING (Đã có - Cần verify)

| Asset | Kích thước | Format | Ghi chú |
|-------|------------|--------|---------|
| `icon.png` | 1024 x 1024 | PNG | App icon chính |
| `adaptive-icon.png` | 512 x 512 | PNG | Android adaptive |
| `favicon.png` | 32 x 32 | PNG | Web favicon |
| `splash.png` | 1284 x 2778 | PNG | Splash screen |

**Tình trạng**: Đã generate placeholder bằng Node.js (src/assets/generate-icons.js)
**Cần**: Thay bằng icon thật của game

---

## II. CARD IMAGES (Lá bài)

### Quy cách kỹ thuật

| Thuộc tính | Giá trị |
|------------|----------|
| Kích thước | 300 x 420 px |
| Tỉ lệ | 5:7 |
| Format | PNG có transparent |
| Dung lượng max | 100 KB/card |
| Font chữ | Bold, dễ đọc trên mobile |

### Số lượng cần thiết cho Demo

```
Tổng: 36 cards (12 cards × 4 store types)
```

#### Store: CAFE (12 cards)

| # | Tên card | Loại | Money | HP | Energy |
|---|----------|------|-------|-----|--------|
| 1 | Barista Trẻ | Staff | +150 | -10 | 1 |
| 2 | Barista Kinh Nghiệm | Staff | +300 | -20 | 2 |
| 3 | Máy Pha Cà Phê | Equipment | +250 | -15 | 2 |
| 4 | Quầy Bar | Infrastructure | +200 | -10 | 1 |
| 5 | Khuyến Mãi Buổi Sáng | Event | +400 | 0 | 2 |
| 6 | Khách VIP | Customer | +350 | 0 | 1 |
| 7 | Đối Thủ Mở Cửa | Threat | -100 | -30 | 0 |
| 8 | Cà Phê Đặc Biệt | Product | +500 | -25 | 3 |
| 9 | Nhân Viên Part-time | Staff | +100 | -5 | 1 |
| 10 | Trang Trí Quán | Upgrade | +200 | -10 | 1 |
| 11 | Thời Tiết Đẹp | Environment | +300 | 0 | 0 |
| 12 | Thẻ Thành Viên | Special | +800 | -30 | 4 |

#### Store: CLOTHING (12 cards)

| # | Tên card | Loại | Money | HP | Energy |
|---|----------|------|-------|-----|--------|
| 13 | Shop Thời Trang Nhí | Staff | +150 | -10 | 1 |
| 14 | Stylist Chuyên Nghiệp | Staff | +300 | -20 | 2 |
| 15 | Kệ Trưng Bày | Equipment | +200 | -10 | 1 |
| 16 | Mannequin Cao Cấp | Infrastructure | +250 | -15 | 2 |
| 17 | Mùa Mốt Mới | Event | +450 | 0 | 2 |
| 18 | Khách Hàng Fashionista | Customer | +350 | 0 | 1 |
| 19 | Đối Thủ Giảm Giá | Threat | -150 | -25 | 0 |
| 20 | BST Mùa Hè | Product | +550 | -25 | 3 |
| 21 | Shop Online | Upgrade | +400 | -20 | 2 |
| 22 | Influencer Check-in | Marketing | +600 | -30 | 3 |
| 23 | Thời Tiết Lạnh | Environment | +300 | 0 | 0 |
| 24 | Thẻ VIP Gold | Special | +900 | -35 | 4 |

#### Store: ELECTRONICS (12 cards)

| # | Tên card | Loại | Money | HP | Energy |
|---|----------|------|-------|-----|--------|
| 25 | Kỹ Thuật Viên Mới | Staff | +150 | -10 | 1 |
| 26 | Chuyên Gia Sửa Chữa | Staff | +350 | -25 | 2 |
| 27 | Quầy Trưng Bày | Equipment | +200 | -10 | 1 |
| 28 | Kho Hàng Tự Động | Infrastructure | +300 | -20 | 2 |
| 29 | Black Friday Sale | Event | +600 | 0 | 3 |
| 30 | Khách Công Nghệ | Customer | +400 | 0 | 1 |
| 31 | Đối Thủ Mở Cửa | Threat | -200 | -35 | 0 |
| 32 | Sản Phẩm Mới | Product | +700 | -30 | 3 |
| 33 | Fanpage Công Nghệ | Marketing | +500 | -25 | 2 |
| 34 | AI Chatbot | Upgrade | +400 | -20 | 2 |
| 35 | Xu Hướng Smart Home | Environment | +350 | 0 | 0 |
| 36 | Thẻ Bảo Hành Vip | Special | +1000 | -40 | 4 |

#### Store: AD_AGENCY (12 cards)

| # | Tên card | Loại | Money | HP | Energy |
|---|----------|------|-------|-----|--------|
| 37 | Intern Mới | Staff | +100 | -5 | 1 |
| 38 | Creative Director | Staff | +400 | -30 | 3 |
| 39 | Phòng Edit | Equipment | +250 | -15 | 2 |
| 40 | Studio Chụp Hình | Infrastructure | +200 | -10 | 1 |
| 41 | Viral Video | Event | +700 | 0 | 3 |
| 42 | Khách Hàng Doanh Nghiệp | Customer | +500 | 0 | 2 |
| 43 | Scandal PR | Threat | -250 | -40 | 0 |
| 44 | Chiến Dịch Lớn | Product | +800 | -35 | 4 |
| 45 | Influencer Deal | Marketing | +600 | -25 | 3 |
| 46 | Agency Branding | Upgrade | +300 | -15 | 2 |
| 47 | Xu Hướng TikTok | Environment | +400 | 0 | 0 |
| 48 | Hợp Đồng Triệu Đô | Special | +1200 | -50 | 5 |

---

## III. ENVIRONMENT BACKGROUNDS (4 backgrounds)

| # | Tên | Kích thước | Format | Priority |
|---|------|------------|--------|----------|
| 1 | Cafe Interior | 1080 x 1920 | PNG/JPG | HIGH |
| 2 | Clothing Store | 1080 x 1920 | PNG/JPG | HIGH |
| 3 | Electronics Shop | 1080 x 1920 | PNG/JPG | HIGH |
| 4 | Ad Agency Office | 1080 x 1920 | PNG/JPG | HIGH |

### Thêm 6 Environment Effects

| # | Effect | Màu sắc | Icon |
|---|--------|---------|------|
| 5 | Bình Thường | #6C63FF | ☀️ |
| 6 | Nắng Nóng | #FF6B35 | 🔥 |
| 7 | Mưa Gió | #4ECDC4 | 🌧️ |
| 8 | Giáng Sinh | #FF1744 | 🎄 |
| 9 | Tết Nguyên Đán | #FFD700 | 🏮 |
| 10 | Lễ Hội | #E040FB | 🎉 |

---

## IV. CHARACTER / AVATAR (6 avatars)

| # | Profession | Kích thước | Format | Priority |
|---|-----------|------------|--------|----------|
| 1 | Bartender | 256 x 256 | PNG transparent | HIGH |
| 2 | Fashion Designer | 256 x 256 | PNG transparent | HIGH |
| 3 | Tech Support | 256 x 256 | PNG transparent | HIGH |
| 4 | Ad Manager | 256 x 256 | PNG transparent | HIGH |
| 5 | Generic Male | 256 x 256 | PNG transparent | MEDIUM |
| 6 | Generic Female | 256 x 256 | PNG transparent | MEDIUM |

---

## V. UI ELEMENTS

### Priority 1 - Essential cho gameplay

| Asset | Kích thước | Số lượng | Ghi chú |
|-------|------------|----------|---------|
| Slot Frame | 80 x 120 px | 5 loại (empty, filled, locked, selected, highlighted) | Card slot trên bàn |
| HP Bar | 200 x 24 px | 1 (scalable) | Thanh máu |
| Gold Bar | 200 x 24 px | 1 (scalable) | Thanh tiền |
| Energy Bar | 200 x 20 px | 1 (scalable) | Thanh năng lượng |
| Timer Ring | 120 x 120 px | 1 | Vòng đếm ngược |
| Vote Button | 100 x 100 px | 4 | Nút vote store |

### Priority 2 - UI Flow

| Asset | Kích thước | Số lượng |
|-------|------------|----------|
| Tab Bar Icons | 48 x 48 px | 6 icons |
| Badge/Notification | 32 x 32 px | 3 loại |
| Loading Spinner | 64 x 64 px | 1 |

### Priority 3 - Nice to have

| Asset | Kích thước | Số lượng |
|-------|------------|----------|
| Particle Effects | 32 x 32 px | 5 loại (coin, spark, damage, heal, etc.) |
| Achievement Badge | 128 x 128 px | 10 badges |
| Season Rank Emblem | 256 x 256 px | 7 ranks |

---

## VI. SOUND & MUSIC (Optional cho demo)

| Asset | Loại | Dung lượng | Priority |
|-------|------|-----------|----------|
| BGM Menu | MP3 | ~2 MB | MEDIUM |
| BGM Gameplay | MP3 | ~2 MB | MEDIUM |
| SFX Card Play | WAV | ~50 KB | HIGH |
| SFX Vote | WAV | ~50 KB | HIGH |
| SFX Win | WAV | ~100 KB | MEDIUM |
| SFX Lose | WAV | ~100 KB | MEDIUM |

---

## VII. TỔNG KẾT SỐ LƯỢNG

### CHO DEMO (Cần thiết tối thiểu)

| Category | Số lượng | Priority | Thời gian tạo ước tính |
|----------|----------|----------|----------------------|
| Card Images | 36 cards | **CRITICAL** | 2-4h (Canva/AI) |
| Environment BG | 4 backgrounds | **CRITICAL** | 1-2h (AI) |
| App Icons | 4 icons | HIGH | 30ph |
| UI Elements (P1) | ~10 elements | HIGH | 1-2h |
| Avatars | 6 characters | MEDIUM | 2-3h |
| UI Elements (P2) | ~10 elements | LOW | 1h |
| Sounds | 6 tracks | LOW | 1-2h |

### Tổng: ~50-60 assets cho demo hoàn chỉnh

---

## VIII. WORKFLOW TẠO ASSETS

### Bước 1: Setup Canva (30 phút)
1. Tạo tài khoản Canva (free)
2. Tạo template card 300x420 px
3. Export 36 cards với data table ở Section II
4. Tạo template UI elements

### Bước 2: Generate Art (2-4 giờ)
1. Leonardo.ai hoặc Midjourney:
   - Prompt: "mobile game [store type] interior, top-down view, vibrant colors, game background"
   - Style consistency: dùng same seed/preset
2. Canva: thêm text, icons lên card
3. Resize về kích thước chuẩn

### Bước 3: Upload & Integrate (1 giờ)
1. Upload lên Cloudinary (free tier: 25GB)
2. Update card.data.ts với image URLs
3. Update env.data.ts với background URLs
4. Update các screen với image assets

### Bước 4: Testing (1 giờ)
1. Test tất cả 36 cards hiển thị đúng
2. Test 4 environment backgrounds
3. Test UI elements
4. Test trên Android (APK đã build)

---

## IX. PLACEHOLDER STRATEGY (Ngay bây giờ)

Trong khi chờ assets thật, app đang dùng:

```typescript
// Card: emoji "🎴" + rarity colors
emoji: "🎴"
rarityColor: "#6C63FF" | "#FFD700" | "#FF6B6B" | "#9B59B6"

// Environment: solid colors + emoji
color: "#6C63FF" | "#FF6B35" | "#4ECDC4" | "#E040FB"
emoji: "☕" | "👔" | "📱" | "📺"
```

**Đủ để test gameplay logic** — user không thấy graphics đẹp nhưng game hoạt động hoàn chỉnh.

---

## X. NEXT STEPS

- [ ] Bước 1: Bạn tạo tài khoản Canva + Leonardo.ai
- [ ] Bước 2: Tôi chuẩn bị data table + prompt templates
- [ ] Bước 3: Bạn generate assets
- [ ] Bước 4: Tôi integrate vào app
- [ ] Bước 5: Rebuild APK với assets mới
- [ ] Bước 6: Test trên máy thật
