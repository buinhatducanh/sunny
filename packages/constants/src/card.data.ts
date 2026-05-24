// packages/constants/src/card.data.ts
// 200+ cards across all store types, rarities, and phases

import type { Card, Rarity, SlotType, StoreType, Duration, Phase, CardEffect, EffectType } from "@sunny-game/types/card.types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ce(
  type: EffectType,
  value: number,
  target: "SELF" | "ROOM" | "ALL_ALLIES" | "ALL_ENEMIES" = "SELF",
  condition?: CardEffect["condition"],
  durationTicks?: number,
): CardEffect {
  return { type, value, target, condition, durationTicks };
}

function card(
  id: string,
  name: string,
  description: string,
  rarity: Rarity,
  storeTypes: StoreType[],
  slotType: SlotType,
  phase: Phase,
  energyCost: number,
  moneyCost: number,
  primaryEffect: CardEffect,
  secondaryEffect?: CardEffect,
  duration: Duration = "INSTANT",
  professionKey = undefined as string | undefined,
  minRound = 1,
  maxRound = 20,
): Card {
  return {
    id,
    cardKey: id,
    name,
    description,
    rarity,
    storeTypes,
    professionKey,
    energyCost,
    moneyCost,
    waterCost: 0,
    powerCost: 0,
    primaryEffect,
    secondaryEffect,
    duration,
    slotType,
    phase,
    imageKey: id,
    color: rarityColor(rarity),
    iconEmoji: emojiForSlot(slotType),
    isPlayable: true,
    minRound,
    maxRound,
  };
}

function rarityColor(r: Rarity): string {
  return { COMMON: "#AAAAAA", RARE: "#3B82F6", EPIC: "#8B5CF6", LEGENDARY: "#F59E0B" }[r]!;
}

function emojiForSlot(s: SlotType): string {
  return { REVENUE: "💰", COST: "📉", BUFF: "✨", DEFENSE: "🛡️", SPECIAL: "🌟" }[s]!;
}

// ── CAFE CARDS ───────────────────────────────────────────────────────────────

export const CAFE_CARDS: Card[] = [
  // COMMON - Revenue
  card("cafe_001", "Mở Cửa Sớm", "Bắt đầu ngày sớm hơn, thu thêm khách.", "COMMON", ["CAFE"], "REVENUE", "EARLY", 10, 0,
    ce("INSTANT_REVENUE", 500, "SELF")),
  card("cafe_002", "Thực Đơn Mới", "Món mới hấp dẫn khách hàng.", "COMMON", ["CAFE"], "REVENUE", "MID", 15, 100,
    ce("INSTANT_REVENUE", 800, "SELF")),
  card("cafe_003", "Khuyến Mãi Buổi Sáng", "Giảm giá buổi sáng, tăng lượng khách.", "COMMON", ["CAFE"], "REVENUE", "EARLY", 5, 50,
    ce("CUSTOMER_BOOST", 15, "SELF")),
  card("cafe_004", "Combo Bữa Sáng", "Bán kèm tăng doanh thu trung bình.", "COMMON", ["CAFE"], "REVENUE", "MID", 8, 80,
    ce("AVG_TICKET_BOOST", 12, "SELF")),
  card("cafe_005", "Cà Phê Đặc Biệt", "Món signature mang lại doanh thu cao.", "COMMON", ["CAFE"], "REVENUE", "LATE", 20, 200,
    ce("INSTANT_REVENUE", 1200, "SELF")),
  card("cafe_006", "Phục Vụ Thêm", "Thuê thêm nhân viên phục vụ.", "COMMON", ["CAFE"], "REVENUE", "EARLY", 12, 150,
    ce("CUSTOMER_BOOST", 20, "SELF")),
  card("cafe_007", "Bánh Ngọt Kèm", "Bánh tráng miệng tăng doanh thu.", "COMMON", ["CAFE"], "REVENUE", "MID", 7, 60,
    ce("AVG_TICKET_BOOST", 8, "SELF")),
  card("cafe_008", "Không Gian Ấm Áp", "Cải thiện trải nghiệm khách hàng.", "COMMON", ["CAFE"], "BUFF", "EARLY", 5, 30,
    ce("CUSTOMER_BOOST", 10, "SELF")),

  // RARE - Revenue
  card("cafe_r01", "KOL Review", "Review từ KOL nổi tiếng.", "RARE", ["CAFE"], "REVENUE", "MID", 25, 300,
    ce("INSTANT_REVENUE", 2500, "SELF")),
  card("cafe_r02", "Hammer Time", "Thời điểm vàng, khách đông nhất.", "RARE", ["CAFE"], "REVENUE", "LATE", 30, 400,
    ce("INSTANT_REVENUE", 3000, "SELF")),
  card("cafe_r03", "TikTok Viral", "Video viral trên TikTok.", "RARE", ["CAFE"], "REVENUE", "MID", 20, 250,
    ce("CUSTOMER_BOOST", 40, "SELF")),
  card("cafe_r04", "Đối Tác Ship", "Hợp tác với app giao hàng.", "RARE", ["CAFE"], "REVENUE", "EARLY", 15, 200,
    ce("CUSTOMER_BOOST", 25, "SELF")),
  card("cafe_r05", "Món Mới Trending", "Món trending trên mạng xã hội.", "RARE", ["CAFE"], "REVENUE", "MID", 18, 220,
    ce("AVG_TICKET_BOOST", 30, "SELF")),

  // EPIC - Revenue
  card("cafe_e01", "Địa Điểm Check-in", "Quán trở thành điểm check-in nổi tiếng.", "EPIC", ["CAFE"], "REVENUE", "MID", 35, 500,
    ce("INSTANT_REVENUE", 5000, "SELF")),
  card("cafe_e02", "Flash Sale", "Giảm giá cực mạnh thu hút đông đảo.", "EPIC", ["CAFE"], "REVENUE", "EARLY", 30, 450,
    ce("CUSTOMER_BOOST", 60, "SELF")),
  card("cafe_e03", "Thẻ Thành Viên VIP", "Khách VIP mua nhiều hơn.", "EPIC", ["CAFE"], "REVENUE", "LATE", 25, 350,
    ce("AVG_TICKET_BOOST", 50, "SELF")),
  card("cafe_e04", "Hậu Kỳ Marketing", "Chiến dịch marketing hiệu quả cao.", "EPIC", ["CAFE"], "BUFF", "EARLY", 20, 300,
    ce("CUSTOMER_BOOST", 45, "SELF"), undefined, "LONG"),

  // LEGENDARY - Revenue
  card("cafe_l01", "Chuỗi Quán Mở Rộng", "Mở rộng chuỗi quán cafe.", "LEGENDARY", ["CAFE"], "REVENUE", "LATE", 50, 1000,
    ce("INSTANT_REVENUE", 12000, "SELF")),
  card("cafe_l02", "Hệ Thống Franchise", "Bán franchise, doanh thu tăng vọt.", "LEGENDARY", ["CAFE"], "REVENUE", "LATE", 45, 900,
    ce("REVENUE_MULTIPLIER", 30, "SELF"), undefined, "LONG"),

  // COMMON - Cost
  card("cafe_c01", "Dọn Dẹp Nhanh", "Giảm chi phí vệ sinh.", "COMMON", ["CAFE"], "COST", "EARLY", 5, 0,
    ce("COST_REDUCTION", 150, "SELF")),
  card("cafe_c02", "Nhân Viên Part-time", "Thuê part-time giảm chi phí.", "COMMON", ["CAFE"], "COST", "MID", 8, 50,
    ce("COST_REDUCTION", 200, "SELF")),
  card("cafe_c03", "Mua Sỉ Nguyên Liệu", "Mua sỉ giảm giá nguyên liệu.", "COMMON", ["CAFE"], "COST", "EARLY", 10, 100,
    ce("OPERATING_COST_MULT", 10, "SELF")),

  // RARE - Cost
  card("cafe_cr01", "Tự Đóng Gói", "Tự đóng gói sản phẩm giảm chi phí.", "RARE", ["CAFE"], "COST", "MID", 15, 150,
    ce("COST_REDUCTION", 400, "SELF")),

  // COMMON - Defense
  card("cafe_d01", "Thay Đổi Thực Đơn", "Thay đổi thực đơn tránh lãng phí.", "COMMON", ["CAFE"], "DEFENSE", "MID", 10, 50,
    ce("FREEZE_COST", 1, "SELF")),
  card("cafe_d02", "Dự Phòng Thực Phẩm", "Dự trữ thực phẩm cho mùa kém.", "COMMON", ["CAFE"], "DEFENSE", "EARLY", 12, 100,
    ce("HP_SHIELD", 15, "SELF")),

  // BUFF
  card("cafe_b01", "Khách Quen", "Khách quen quay lại nhiều hơn.", "COMMON", ["CAFE"], "BUFF", "MID", 8, 50,
    ce("CUSTOMER_BOOST", 8, "SELF")),
  card("cafe_b02", "Giờ Vàng", "Tận dụng giờ cao điểm.", "COMMON", ["CAFE"], "BUFF", "MID", 15, 100,
    ce("INSTANT_REVENUE", 600, "SELF")),

  // SPECIAL
  card("cafe_s01", "Cà Phê Sáng Tạo", "Kết hợp menu độc đáo.", "COMMON", ["CAFE"], "SPECIAL", "MID", 20, 200,
    ce("INSTANT_REVENUE", 900, "SELF"), ce("AVG_TICKET_BOOST", 10, "SELF")),
];

// ── CLOTHING CARDS ──────────────────────────────────────────────────────────

export const CLOTHING_CARDS: Card[] = [
  // COMMON - Revenue
  card("clo_001", "Bộ Sưu Tập Mới", "Ra mắt bộ sưu tập mới.", "COMMON", ["CLOTHING"], "REVENUE", "MID", 10, 100,
    ce("INSTANT_REVENUE", 600, "SELF")),
  card("clo_002", "Sale Đầu Mùa", "Khuyến mãi đầu mùa thu hút khách.", "COMMON", ["CLOTHING"], "REVENUE", "EARLY", 8, 80,
    ce("CUSTOMER_BOOST", 18, "SELF")),
  card("clo_003", "Màn Hình Trưng Bày", "Trưng bày sản phẩm nổi bật.", "COMMON", ["CLOTHING"], "REVENUE", "MID", 12, 120,
    ce("AVG_TICKET_BOOST", 15, "SELF")),
  card("clo_004", "Khách VIP", "Khách hàng chi tiêu cao.", "COMMON", ["CLOTHING"], "REVENUE", "LATE", 15, 150,
    ce("AVG_TICKET_BOOST", 20, "SELF")),
  card("clo_005", "Cross-selling", "Bán kèm phụ kiện tăng doanh thu.", "COMMON", ["CLOTHING"], "REVENUE", "MID", 6, 60,
    ce("AVG_TICKET_BOOST", 10, "SELF")),
  card("clo_006", "Order Trước", "Khách đặt hàng trước.", "COMMON", ["CLOTHING"], "REVENUE", "EARLY", 5, 40,
    ce("INSTANT_REVENUE", 400, "SELF")),

  // RARE - Revenue
  card("clo_r01", "Fashion Week", "Tham gia Fashion Week.", "RARE", ["CLOTHING"], "REVENUE", "LATE", 25, 350,
    ce("INSTANT_REVENUE", 3000, "SELF")),
  card("clo_r02", "Influencer Mặc", "Influencer nổi tiếng mặc thương hiệu.", "RARE", ["CLOTHING"], "REVENUE", "MID", 20, 280,
    ce("CUSTOMER_BOOST", 45, "SELF")),
  card("clo_r03", "Online Store", "Mở cửa hàng online.", "RARE", ["CLOTHING"], "REVENUE", "EARLY", 18, 220,
    ce("CUSTOMER_BOOST", 30, "SELF")),
  card("clo_r04", "Limited Edition", "Phát hành phiên bản giới hạn.", "RARE", ["CLOTHING"], "REVENUE", "MID", 22, 300,
    ce("AVG_TICKET_BOOST", 40, "SELF")),

  // EPIC - Revenue
  card("clo_e01", "Flagship Store", "Mở cửa hàng flagship.", "EPIC", ["CLOTHING"], "REVENUE", "LATE", 35, 600,
    ce("INSTANT_REVENUE", 6000, "SELF")),
  card("clo_e02", "Celebrity Collab", "Hợp tác với ngôi sao.", "EPIC", ["CLOTHING"], "REVENUE", "MID", 30, 500,
    ce("CUSTOMER_BOOST", 70, "SELF")),

  // LEGENDARY
  card("clo_l01", "Thương Hiệu Quốc Tế", "Mở rộng ra thị trường quốc tế.", "LEGENDARY", ["CLOTHING"], "REVENUE", "LATE", 50, 1200,
    ce("INSTANT_REVENUE", 15000, "SELF")),

  // COMMON - Cost
  card("clo_c01", "Sản Xuất Sỉ", "Sản xuất số lượng lớn giảm giá.", "COMMON", ["CLOTHING"], "COST", "EARLY", 10, 80,
    ce("COST_REDUCTION", 250, "SELF")),
  card("clo_c02", "Nhân Công Tự Động", "Máy móc tự động hóa.", "COMMON", ["CLOTHING"], "COST", "MID", 15, 200,
    ce("OPERATING_COST_MULT", 8, "SELF")),

  // BUFF
  card("clo_b01", "Trang Trí Cửa Hàng", "Cửa hàng đẹp hơn, khách nhiều hơn.", "COMMON", ["CLOTHING"], "BUFF", "EARLY", 8, 60,
    ce("CUSTOMER_BOOST", 12, "SELF")),

  // DEFENSE
  card("clo_d01", "Hàng Tồn Kho", "Giảm tồn kho không bán được.", "COMMON", ["CLOTHING"], "DEFENSE", "LATE", 12, 100,
    ce("FREEZE_COST", 1, "SELF")),
  card("clo_d02", "Bảo Hành Dài Hạn", "Tăng uy tín, giảm rủi ro.", "COMMON", ["CLOTHING"], "DEFENSE", "MID", 10, 80,
    ce("HP_SHIELD", 10, "SELF")),

  // SPECIAL
  card("clo_s01", "Lookbook Chuyên Nghiệp", "Tạo lookbook thu hút khách.", "COMMON", ["CLOTHING"], "SPECIAL", "MID", 18, 180,
    ce("INSTANT_REVENUE", 700, "SELF"), ce("CUSTOMER_BOOST", 8, "SELF")),
];

// ── ELECTRONICS CARDS ────────────────────────────────────────────────────────

export const ELECTRONICS_CARDS: Card[] = [
  // COMMON - Revenue
  card("ele_001", "Sản Phẩm Mới", "Ra mắt sản phẩm công nghệ mới.", "COMMON", ["ELECTRONICS"], "REVENUE", "MID", 15, 200,
    ce("INSTANT_REVENUE", 900, "SELF")),
  card("ele_002", "Gian Hàng Online", "Bán hàng trên sàn thương mại điện tử.", "COMMON", ["ELECTRONICS"], "REVENUE", "EARLY", 10, 150,
    ce("CUSTOMER_BOOST", 20, "SELF")),
  card("ele_003", "Bảo Hành Mở Rộng", "Dịch vụ bảo hành tăng doanh thu.", "COMMON", ["ELECTRONICS"], "REVENUE", "MID", 8, 80,
    ce("AVG_TICKET_BOOST", 18, "SELF")),
  card("ele_004", "Phụ Kiện Kèm Theo", "Tai nghe, ốp lưng đi kèm.", "COMMON", ["ELECTRONICS"], "REVENUE", "MID", 6, 50,
    ce("AVG_TICKET_BOOST", 12, "SELF")),
  card("ele_005", "Trade-in", "Chương trình thu cũ đổi mới.", "COMMON", ["ELECTRONICS"], "REVENUE", "EARLY", 12, 120,
    ce("CUSTOMER_BOOST", 15, "SELF")),

  // RARE - Revenue
  card("ele_r01", "Flash Sale Điện Tử", "Flash sale sản phẩm điện tử.", "RARE", ["ELECTRONICS"], "REVENUE", "MID", 25, 350,
    ce("INSTANT_REVENUE", 2800, "SELF")),
  card("ele_r02", "YouTuber Review", "Review từ YouTuber nổi tiếng.", "RARE", ["ELECTRONICS"], "REVENUE", "MID", 22, 300,
    ce("CUSTOMER_BOOST", 50, "SELF")),
  card("ele_r03", "Demo Trải Nghiệm", "Cho khách trải nghiệm sản phẩm.", "RARE", ["ELECTRONICS"], "REVENUE", "EARLY", 18, 220,
    ce("CUSTOMER_BOOST", 35, "SELF")),

  // EPIC - Revenue
  card("ele_e01", "Hệ Thống POS", "Hệ thống bán hàng hiện đại.", "EPIC", ["ELECTRONICS"], "REVENUE", "EARLY", 30, 450,
    ce("INSTANT_REVENUE", 4500, "SELF")),
  card("ele_e02", "Chiến Dịch Quảng Cáo", "Chiến dịch quảng cáo lớn.", "EPIC", ["ELECTRONICS"], "BUFF", "MID", 25, 400,
    ce("CUSTOMER_BOOST", 55, "SELF"), undefined, "LONG"),

  // LEGENDARY
  card("ele_l01", "Tech Empire", "Xây dựng đế chế công nghệ.", "LEGENDARY", ["ELECTRONICS"], "REVENUE", "LATE", 55, 1500,
    ce("INSTANT_REVENUE", 18000, "SELF")),

  // COMMON - Cost
  card("ele_c01", "Tối Ưu Kho", "Tối ưu hóa kho hàng.", "COMMON", ["ELECTRONICS"], "COST", "EARLY", 12, 100,
    ce("COST_REDUCTION", 300, "SELF")),
  card("ele_c02", "Bảo Trì Thiết Bị", "Bảo trì định kỳ giảm hỏng hóc.", "COMMON", ["ELECTRONICS"], "COST", "MID", 10, 80,
    ce("OPERATING_COST_MULT", 6, "SELF")),

  // BUFF
  card("ele_b01", "Cập Nhật Phần Mềm", "Cập nhật phần mềm mới nhất.", "COMMON", ["ELECTRONICS"], "BUFF", "EARLY", 10, 80,
    ce("CUSTOMER_BOOST", 14, "SELF")),

  // DEFENSE
  card("ele_d01", "Backup Dữ Liệu", "Sao lưu dữ liệu an toàn.", "COMMON", ["ELECTRONICS"], "DEFENSE", "MID", 8, 60,
    ce("HP_SHIELD", 12, "SELF")),

  // SPECIAL
  card("ele_s01", "Bundle Deal", "Gói sản phẩm hấp dẫn.", "COMMON", ["ELECTRONICS"], "SPECIAL", "MID", 20, 250,
    ce("INSTANT_REVENUE", 1000, "SELF"), ce("AVG_TICKET_BOOST", 15, "SELF")),
];

// ── AD_AGENCY CARDS ─────────────────────────────────────────────────────────

export const AD_AGENCY_CARDS: Card[] = [
  // COMMON - Revenue
  card("ad_001", "Poster Quảng Cáo", "Thiết kế poster thu hút.", "COMMON", ["AD_AGENCY"], "REVENUE", "EARLY", 8, 60,
    ce("INSTANT_REVENUE", 450, "SELF")),
  card("ad_002", "Mạng Xã Hội", "Đăng bài trên mạng xã hội.", "COMMON", ["AD_AGENCY"], "REVENUE", "EARLY", 5, 40,
    ce("CUSTOMER_BOOST", 12, "SELF")),
  card("ad_003", "Leaflet Rải Tay", "Phát leaflet quảng cáo.", "COMMON", ["AD_AGENCY"], "REVENUE", "MID", 10, 80,
    ce("CUSTOMER_BOOST", 15, "SELF")),
  card("ad_004", "KOL Ngắn Hạn", "Thuê KOL quảng cáo nhỏ.", "COMMON", ["AD_AGENCY"], "REVENUE", "MID", 15, 150,
    ce("INSTANT_REVENUE", 700, "SELF")),

  // RARE - Revenue
  card("ad_r01", "Chiến Dịch TVC", "Quảng cáo trên truyền hình.", "RARE", ["AD_AGENCY"], "REVENUE", "MID", 25, 400,
    ce("INSTANT_REVENUE", 3200, "SELF")),
  card("ad_r02", "Viral TikTok", "Video viral TikTok.", "RARE", ["AD_AGENCY"], "REVENUE", "MID", 20, 300,
    ce("CUSTOMER_BOOST", 50, "SELF")),
  card("ad_r03", "Billboard Nổi Bật", "Đặt billboard vị trí đắc địa.", "RARE", ["AD_AGENCY"], "REVENUE", "LATE", 22, 350,
    ce("AVG_TICKET_BOOST", 35, "SELF")),

  // EPIC - Revenue
  card("ad_e01", "Sự Kiện Ra Mắt", "Tổ chức sự kiện ra mắt hoành tráng.", "EPIC", ["AD_AGENCY"], "REVENUE", "LATE", 35, 600,
    ce("INSTANT_REVENUE", 6000, "SELF")),
  card("ad_e02", "Super Bowl Ad", "Quảng cáo siêu bowl.", "EPIC", ["AD_AGENCY"], "REVENUE", "LATE", 40, 800,
    ce("CUSTOMER_BOOST", 80, "SELF")),

  // LEGENDARY
  card("ad_l01", "Toàn Cầu Hóa", "Mở rộng thương hiệu toàn cầu.", "LEGENDARY", ["AD_AGENCY"], "REVENUE", "LATE", 55, 1500,
    ce("INSTANT_REVENUE", 20000, "SELF")),

  // COMMON - Cost
  card("ad_c01", "Freelancer Giá Rẻ", "Thuê freelancer tiết kiệm.", "COMMON", ["AD_AGENCY"], "COST", "EARLY", 10, 60,
    ce("COST_REDUCTION", 200, "SELF")),

  // BUFF
  card("ad_b01", "Brand Awareness", "Tăng nhận diện thương hiệu.", "COMMON", ["AD_AGENCY"], "BUFF", "EARLY", 8, 50,
    ce("CUSTOMER_BOOST", 10, "SELF"), undefined, "LONG"),
  card("ad_b02", "Retargeting", "Quảng cáo retargeting hiệu quả.", "COMMON", ["AD_AGENCY"], "BUFF", "MID", 12, 100,
    ce("AVG_TICKET_BOOST", 20, "SELF")),

  // DEFENSE
  card("ad_d01", "Crisis Management", "Quản lý khủng hoảng truyền thông.", "COMMON", ["AD_AGENCY"], "DEFENSE", "MID", 15, 120,
    ce("HP_SHIELD", 15, "SELF")),

  // SPECIAL
  card("ad_s01", "PR Stunt", "Chiến dịch PR độc đáo.", "COMMON", ["AD_AGENCY"], "SPECIAL", "MID", 22, 250,
    ce("INSTANT_REVENUE", 900, "SELF"), ce("CUSTOMER_BOOST", 20, "SELF")),
];

// ── CROSS-STORE CARDS ───────────────────────────────────────────────────────

export const CROSS_STORE_CARDS: Card[] = [
  // Cards usable in any store type
  card("x_all_01", "Khách Hàng Trung Thành", "Khách trung thành quay lại.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 10, 80,
    ce("CUSTOMER_BOOST", 15, "SELF"), undefined, "LONG"),
  card("x_all_02", "Thiệp Chúc Tết", "Gửi thiệp chúc Tết đến khách.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 5, 30,
    ce("CUSTOMER_BOOST", 8, "SELF")),
  card("x_all_03", "Thẻ Thành Viên", "Phát thẻ thành viên cho khách.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 15, 100,
    ce("AVG_TICKET_BOOST", 20, "SELF")),

  // Environment defense - usable in any store
  card("x_env_01", "Bảo Hiểm Kinh Doanh", "Giảm thiệt hại từ môi trường xấu.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 15, 120,
    ce("ENV_RESISTANCE", 1, "SELF"), undefined, "LONG"),
  card("x_env_02", "Dự Phòng Chi Phí", "Quỹ dự phòng cho thời kỳ khó khăn.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 10, 80,
    ce("HP_SHIELD", 20, "SELF")),
  card("x_env_03", "Đa Dạng Hóa", "Đa dạng nguồn thu nhập.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 12, 100,
    ce("FREEZE_COST", 1, "SELF"), undefined, "LONG"),

  // Revenue boosters - usable in any store
  card("x_rev_01", "Khuyến Mãi Cross-Store", "Khuyến mãi hấp dẫn mọi cửa hàng.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 25, 300,
    ce("INSTANT_REVENUE", 3000, "SELF")),
  card("x_rev_02", "Combo Deal", "Gói sản phẩm combo.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 12, 100,
    ce("AVG_TICKET_BOOST", 18, "SELF")),
  card("x_rev_03", "Early Bird Discount", "Giảm giá cho khách đến sớm.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "EARLY", 8, 60,
    ce("CUSTOMER_BOOST", 15, "SELF")),

  // HP / Defense
  card("x_hp_01", "Quỹ Cứu Trợ", "Quỹ hỗ trợ khi gặp khó khăn.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 18, 150,
    ce("HP_HEAL", 25, "SELF")),
  card("x_hp_02", "Vay Vốn Ngân Hàng", "Vay vốn mở rộng kinh doanh.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 0, 0,
    ce("LOAN", 500, "SELF")),
  card("x_hp_03", "Bảo Hiểm Payout", "Nhận tiền bảo hiểm.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 5, 50,
    ce("INSURANCE_PAYOUT", 500, "SELF")),

  // Special / Utility
  card("x_ut_01", "Phân Tích Dữ Liệu", "Phân tích data để tối ưu.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 15, 100,
    ce("REVENUE_MULTIPLIER", 10, "SELF"), undefined, "LONG"),
  card("x_ut_02", "Đầu Tư Rủi Ro", "Đầu tư có rủi ro nhưng lợi nhuận cao.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 30, 500,
    ce("INSTANT_REVENUE", 5000, "SELF"), ce("INSTANT_DAMAGE", 1000, "SELF")),
  card("x_ut_03", "Rút Thăm May Mắn", "Rút thăm trúng thưởng.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "MID", 10, 0,
    ce("CRIT_REVENUE", 200, "SELF")),

  // LEGENDARY - Cross store
  card("x_l01", "Thương Hiệu Legend", "Xây dựng thương hiệu huyền thoại.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 50, 1000,
    ce("REVENUE_MULTIPLIER", 40, "SELF"), undefined, "LONG"),
  card("x_l02", "Chiến Lược Toàn Cầu", "Mở rộng ra thị trường toàn cầu.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 55, 1200,
    ce("INSTANT_REVENUE", 15000, "SELF")),

  // Condition-based cards
  card("x_cond_01", "Chiến Thuật Giá Rẻ", "Tăng doanh thu khi giá thấp.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 8, 50,
    ce("INSTANT_REVENUE", 300, "SELF", { type: "MONEY_BELOW", value: 3000 })),
  card("x_cond_02", "Tăng Tốc Cuối Game", "Doanh thu cao hơn ở vòng cuối.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 20, 200,
    ce("INSTANT_REVENUE", 2000, "SELF", { type: "ROUND_EVEN" })),
  card("x_cond_03", "Last Stand", "Tăng sức mạnh khi HP thấp.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 25, 300,
    ce("INSTANT_REVENUE", 2500, "SELF", { type: "LAST_STAND" }), ce("HP_HEAL", 15, "SELF")),
  card("x_cond_04", "Khởi Đầu Hoàn Hảo", "Bonus lớn ở vòng đầu.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "EARLY", 15, 150,
    ce("INSTANT_REVENUE", 800, "SELF", { type: "FIRST_ROUND" })),
];

// ── GENERATED CARDS ──────────────────────────────────────────────────────────
// Supplements hand-crafted cards to reach 200+

const CAFE_GENERATED: Card[] = [
  ...["Espresso Máy", "Cà Phê Pha Máy", "Drip Cầu Đất", "Phin Đen Đá", "Bạc Xỉu"].map((n, i) =>
    card(`cafe_g_c${i+1}`, n, `Cà phê ${n} được nhiều khách yêu thích.`, "COMMON", ["CAFE"], "REVENUE", i % 2 === 0 ? "EARLY" : "MID", 6 + i * 2, 30 + i * 10,
      ce("INSTANT_REVENUE", 350 + i * 80, "SELF")),
  ),
  ...["Bánh Mì Nướng", "Bánh Tart Trứng", "Croissant Bơ", "Macaron Pháp", "Cheesecake Nhật"].map((n, i) =>
    card(`cafe_g_c${i+6}`, n, `Món bánh ${n} bán chạy.`, "COMMON", ["CAFE"], "REVENUE", "MID", 5 + i, 20 + i * 10,
      ce("AVG_TICKET_BOOST", 6 + i * 2, "SELF")),
  ),
  ...["Wifi Free", "Ổ Cắm Sạc", "Góc Chụp Ảnh", "Khu Vực Yên Lặng", "Góc Học Tập"].map((n, i) =>
    card(`cafe_g_b${i+1}`, n, `${n} thu hút thêm khách.`, "COMMON", ["CAFE"], "BUFF", "EARLY", 5 + i * 2, 40 + i * 15,
      ce("CUSTOMER_BOOST", 7 + i * 2, "SELF")),
  ),
  ...["Tinh Gọn Quy Trình", "Tự Động Hóa Order", "Chatbot Đặt Hàng", "App Đặt Trước", "Nhân Viên Part-time"].map((n, i) =>
    card(`cafe_g_co${i+1}`, n, `${n} giảm chi phí vận hành.`, "COMMON", ["CAFE"], "COST", "EARLY", 8 + i * 2, 50 + i * 20,
      ce("COST_REDUCTION", 100 + i * 30, "SELF")),
  ),
  ...["Đèn Trang Trí", "Nhạc Nền Chill", "Điều Hòa Mát", "Nến Thơm", "Bảng Menu Điện Tử"].map((n, i) =>
    card(`cafe_g_d${i+1}`, n, `${n} tạo không gian thoải mái.`, "COMMON", ["CAFE"], "DEFENSE", "MID", 6 + i * 2, 30 + i * 15,
      ce("HP_SHIELD", 5 + i * 3, "SELF")),
  ),
  ...["Cà Phê Hữu Cơ", "Trà Sữa Premium", "Smoothie Trái Cây", "Matcha Đặc Sản", "Yogurt Đá Xay"].map((n, i) =>
    card(`cafe_g_r${i+1}`, n, `${n} thu hút phân khúc khách cao cấp.`, "RARE", ["CAFE"], "REVENUE", "MID", 18 + i * 2, 200 + i * 30,
      ce("INSTANT_REVENUE", 1800 + i * 200, "SELF")),
  ),
  ...["Ship Đồ Miễn Phí", "Giao Hàng Nhanh", "Đặt App Tích Điểm", "Thẻ Thành Viên Vàng", "Combo Bữa Trưa"].map((n, i) =>
    card(`cafe_g_rb${i+1}`, n, `${n} tăng doanh thu và khách hàng.`, "RARE", ["CAFE"], "BUFF", "EARLY", 15 + i * 3, 150 + i * 25,
      ce("CUSTOMER_BOOST", 25 + i * 5, "SELF")),
  ),
  card("cafe_g_e1", "Phim Ngắn Viral", "Quay phim ngắn quán cafe thu hút triệu view.", "EPIC", ["CAFE"], "REVENUE", "MID", 30, 400, ce("CUSTOMER_BOOST", 65, "SELF")),
  card("cafe_g_e2", "Sự Kiện Cà Phê", "Tổ chức sự kiện cà phê quy mô.", "EPIC", ["CAFE"], "REVENUE", "LATE", 35, 500, ce("INSTANT_REVENUE", 5500, "SELF")),
  card("cafe_g_e3", "Bếp Trưởng Nổi Tiếng", "Mời bếp trưởng nổi tiếng làm đại sứ.", "EPIC", ["CAFE"], "BUFF", "MID", 25, 350,
    ce("AVG_TICKET_BOOST", 45, "SELF"), undefined, "LONG"),
];

const CLOTHING_GENERATED: Card[] = [
  ...["Áo Phông Basic", "Quần Jeans V2", "Váy Hè Nhẹ", "Áo Khoác Gió", "Set Đồ Sport"].map((n, i) =>
    card(`clo_g_c${i+1}`, n, `${n} bán chạy mùa này.`, "COMMON", ["CLOTHING"], "REVENUE", i % 2 === 0 ? "EARLY" : "MID", 8 + i * 2, 80 + i * 20,
      ce("INSTANT_REVENUE", 550 + i * 80, "SELF")),
  ),
  ...["Khách Mặc Thử", "Tư Vấn Phong Cách", "Makeover Miễn Phí", "Chụp Ảnh Look", "Stream Bán Hàng"].map((n, i) =>
    card(`clo_g_b${i+1}`, n, `${n} tăng trải nghiệm khách.`, "COMMON", ["CLOTHING"], "BUFF", "EARLY", 7 + i * 2, 50 + i * 15,
      ce("CUSTOMER_BOOST", 10 + i * 3, "SELF")),
  ),
  ...["Vải Chất Lượng", "Thiết Kế Tối Giản", "Màu Sắc Trendy", "Phối Đồ Sẵn", "Kích Cỡ Đa Dạng"].map((n, i) =>
    card(`clo_g_co${i+1}`, n, `${n} giảm chi phí và tăng doanh thu.`, "COMMON", ["CLOTHING"], "COST", "MID", 9 + i * 2, 60 + i * 20,
      ce("COST_REDUCTION", 150 + i * 40, "SELF")),
  ),
  ...["Bảo Quản Hàng", "Giá Kệ Mới", "Kho Thông Minh", "Tủ Trưng Bày", "Hệ Thống POS"].map((n, i) =>
    card(`clo_g_d${i+1}`, n, `${n} giúp quản lý tốt hơn.`, "COMMON", ["CLOTHING"], "DEFENSE", "MID", 8 + i * 2, 70 + i * 20,
      ce("HP_SHIELD", 8 + i * 2, "SELF")),
  ),
  ...["Mùa Thu Mới", "Xuân Hè Trend", "Đông Ấm", "Hè Nắng Gắt"].map((n, i) =>
    card(`clo_g_r${i+1}`, n, `Bộ sưu tập ${n} ra mắt.`, "RARE", ["CLOTHING"], "REVENUE", "MID", 22 + i * 3, 280 + i * 40,
      ce("INSTANT_REVENUE", 2600 + i * 300, "SELF")),
  ),
  ...["Hot Trend Pick", "Fashion Icon", "Phối Đồ Viral", "Style Tips", "Mua Kèm Deal"].map((n, i) =>
    card(`clo_g_rb${i+1}`, n, `${n} thu hút khách trẻ.`, "RARE", ["CLOTHING"], "BUFF", "EARLY", 16 + i * 3, 200 + i * 30,
      ce("CUSTOMER_BOOST", 35 + i * 5, "SELF")),
  ),
  card("clo_g_e1", "Quảng Cáo Billboard", "Billboard nổi bật ở vị trí đắc địa.", "EPIC", ["CLOTHING"], "REVENUE", "LATE", 32, 550, ce("INSTANT_REVENUE", 5500, "SELF")),
  card("clo_g_e2", "Fashion Show Mini", "Tổ chức fashion show mini tại cửa hàng.", "EPIC", ["CLOTHING"], "BUFF", "MID", 28, 450,
    ce("CUSTOMER_BOOST", 60, "SELF"), undefined, "LONG"),
];

const ELECTRONICS_GENERATED: Card[] = [
  ...["Tai Nghe Không Dây", "Sạc Dự Phòng", "Ốp Lưng Trendy", "Dây Cáp Cao Cấp", "Giá Đỡ Điện Thoại"].map((n, i) =>
    card(`ele_g_c${i+1}`, n, `${n} phụ kiện bán chạy.`, "COMMON", ["ELECTRONICS"], "REVENUE", "MID", 10 + i * 2, 100 + i * 30,
      ce("INSTANT_REVENUE", 700 + i * 100, "SELF")),
  ),
  ...["Tư Vấn Kỹ Thuật", "Lắp Đặt Tại Nhà", "Bảo Trì Định Kỳ", "Nâng Cấp Phần Mềm", "Hỗ Trợ Từ Xa"].map((n, i) =>
    card(`ele_g_b${i+1}`, n, `${n} tăng giá trị dịch vụ.`, "COMMON", ["ELECTRONICS"], "BUFF", "EARLY", 8 + i * 2, 80 + i * 20,
      ce("AVG_TICKET_BOOST", 12 + i * 3, "SELF")),
  ),
  ...["Kho Hàng Tự Động", "Robot Sắp Xếp", "AI Dự Đoán", "Hệ Thống ERP", "Quản Lý Tồn Kho"].map((n, i) =>
    card(`ele_g_co${i+1}`, n, `${n} giảm chi phí vận hành.`, "COMMON", ["ELECTRONICS"], "COST", "MID", 10 + i * 3, 100 + i * 30,
      ce("COST_REDUCTION", 200 + i * 50, "SELF")),
  ),
  ...["Bảo Hành 2 Năm", "Gói VIP", "Dịch Vụ Đổi Mới", "Hỗ Trợ 24/7"].map((n, i) =>
    card(`ele_g_d${i+1}`, n, `${n} tăng uy tín cửa hàng.`, "COMMON", ["ELECTRONICS"], "DEFENSE", "MID", 9 + i * 3, 80 + i * 25,
      ce("HP_SHIELD", 10 + i * 3, "SELF")),
  ),
  ...["Sản Phẩm AI", "Smart Home Kit", "Thiết Bị IoT", "Đồ Chơi Công Nghệ", "Drone Mini"].map((n, i) =>
    card(`ele_g_r${i+1}`, n, `${n} sản phẩm công nghệ mới.`, "RARE", ["ELECTRONICS"], "REVENUE", "MID", 24 + i * 3, 320 + i * 50,
      ce("INSTANT_REVENUE", 3000 + i * 300, "SELF")),
  ),
  card("ele_g_r6", "Black Friday Deal", "Black Friday cực sốc giá.", "RARE", ["ELECTRONICS"], "REVENUE", "LATE", 28, 400, ce("CUSTOMER_BOOST", 55, "SELF")),
  card("ele_g_e1", "Trung Tâm Bảo Hành", "Mở trung tâm bảo hành riêng.", "EPIC", ["ELECTRONICS"], "REVENUE", "LATE", 38, 700, ce("INSTANT_REVENUE", 7000, "SELF")),
  card("ele_g_e2", "Hội Chợ Công Nghệ", "Tham gia hội chợ công nghệ lớn.", "EPIC", ["ELECTRONICS"], "BUFF", "MID", 30, 500,
    ce("CUSTOMER_BOOST", 65, "SELF"), undefined, "LONG"),
];

const AD_AGENCY_GENERATED: Card[] = [
  ...["Quảng Cáo Google", "SEO Website", "Content Marketing", "Email Marketing", "SMS Marketing"].map((n, i) =>
    card(`ad_g_c${i+1}`, n, `${n} tiếp cận khách hàng mục tiêu.`, "COMMON", ["AD_AGENCY"], "REVENUE", "EARLY", 8 + i * 2, 60 + i * 20,
      ce("INSTANT_REVENUE", 500 + i * 80, "SELF")),
  ),
  ...["Thiết Kế Logo", "Branding Kit", "Bộ Nhận Diện", "Catalogue Sản Phẩm", "Profile Doanh Nghiệp"].map((n, i) =>
    card(`ad_g_b${i+1}`, n, `${n} chuyên nghiệp.`, "COMMON", ["AD_AGENCY"], "BUFF", "EARLY", 6 + i * 2, 40 + i * 15,
      ce("CUSTOMER_BOOST", 8 + i * 2, "SELF")),
  ),
  ...["Freelancer Tiết Kiệm", "Nhân Sự Linh Hoạt", "Outsource Dự Án", "AI Tạo Nội Dung"].map((n, i) =>
    card(`ad_g_co${i+1}`, n, `${n} giảm chi phí dự án.`, "COMMON", ["AD_AGENCY"], "COST", "EARLY", 8 + i * 3, 50 + i * 20,
      ce("COST_REDUCTION", 180 + i * 50, "SELF")),
  ),
  ...["Chiến Dịch Toàn Quốc", "TVC 30s", "Podcast Nổi Tiếng", "Mini Game Online", "AR Filter"].map((n, i) =>
    card(`ad_g_r${i+1}`, n, `${n} thu hút hàng triệu người xem.`, "RARE", ["AD_AGENCY"], "REVENUE", "MID", 22 + i * 3, 350 + i * 50,
      ce("INSTANT_REVENUE", 2800 + i * 300, "SELF")),
  ),
  ...["PR Báo Lớn", "Talk Show", "Sự Kiện Ra Mắt", "Hội Thảo"].map((n, i) =>
    card(`ad_g_rb${i+1}`, n, `${n} tăng độ phủ thương hiệu.`, "RARE", ["AD_AGENCY"], "BUFF", "MID", 18 + i * 3, 250 + i * 40,
      ce("CUSTOMER_BOOST", 40 + i * 6, "SELF")),
  ),
  card("ad_g_e1", "Quảng Cáo Siêu Tàu", "Quảng cáo trên phương tiện công cộng toàn quốc.", "EPIC", ["AD_AGENCY"], "REVENUE", "LATE", 38, 700, ce("INSTANT_REVENUE", 8000, "SELF")),
  card("ad_g_e2", "Sự Kiện Tri Ân", "Sự kiện tri ân khách hàng quy mô lớn.", "EPIC", ["AD_AGENCY"], "BUFF", "MID", 30, 500,
    ce("CUSTOMER_BOOST", 70, "SELF"), undefined, "LONG"),
];

const CROSS_GENERATED: Card[] = [
  ...["Khách Nước Ngoài", "Khách Du Lịch", "Khách Công Ty", "Khách VIP"].map((n, i) =>
    card(`x_g_c${i+1}`, n, `${n} chi tiêu cao hơn.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 10 + i * 3, 80 + i * 20,
      ce("AVG_TICKET_BOOST", 15 + i * 4, "SELF")),
  ),
  ...["Thiên Tai Dự Báo", "Chính Sách Mới", "Đối Thủ Mới", "Nhà Cung Cấp Mới"].map((n, i) =>
    card(`x_g_d${i+1}`, n, `Chuẩn bị cho ${n}.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 12 + i * 2, 100 + i * 25,
      ce("HP_SHIELD", 12 + i * 3, "SELF")),
  ),
  card("x_g_e1", "Thương Hiệu Bền Vững", "Xây dựng thương hiệu bền vững lâu dài.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 35, 600, ce("INSTANT_REVENUE", 6000, "SELF")),
  card("x_g_e2", "Hệ Sinh Thái", "Xây dựng hệ sinh thái khách hàng.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 28, 450,
    ce("CUSTOMER_BOOST", 50, "SELF"), undefined, "LONG"),
  card("x_g_cond1", "Boom Vòng 5", "Doanh thu tăng mạnh ở vòng 5.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 12, 100,
    ce("INSTANT_REVENUE", 800, "SELF", { type: "ROUND_ODD" })),
  card("x_g_cond2", "Thắng Liên Tiếp", "Bonus khi streak cao.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 20, 200,
    ce("INSTANT_REVENUE", 1500, "SELF", { type: "STREAK", count: 3 })),
  // Phase-specific cards
  ...["Khách Sáng Tạo", "Khách Nghiêm Túc", "Khách Thân Thiện", "Khách Hào Phóng"].map((n, i) =>
    card(`x_g_m${i+1}`, n, `${n} mang lại trải nghiệm tốt.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "EARLY", 8 + i * 2, 60 + i * 15,
      ce("INSTANT_REVENUE", 300 + i * 50, "SELF")),
  ),
  ...["Đàm Phán Nhà Cung Cấp", "Hợp Đồng Dài Hạn", "Chiết Khấu Sỉ", "Thanh Toán Sớm"].map((n, i) =>
    card(`x_g_co${i+1}`, n, `${n} giảm chi phí vận hành.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "COST", "EARLY", 10 + i * 2, 70 + i * 20,
      ce("COST_REDUCTION", 150 + i * 30, "SELF")),
  ),
  ...["Bảo Trì Định Kỳ", "Nâng Cấp Thiết Bị", "Cải Thiện Quy Trình", "Tự Động Hóa"].map((n, i) =>
    card(`x_g_ef${i+1}`, n, `${n} tăng hiệu suất.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 15 + i * 3, 150 + i * 40,
      ce("CUSTOMER_BOOST", 20 + i * 5, "SELF"), undefined, "LONG"),
  ),
  // HP/Survival cards
  ...["Gói Cứu Trợ", "Quỹ Khẩn Cấp", "Bảo Hiểm Kinh Doanh", "Dự Phòng Rủi Ro"].map((n, i) =>
    card(`x_g_hp${i+1}`, n, `${n} bảo vệ trước rủi ro.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 14 + i * 2, 120 + i * 30,
      ce("HP_SHIELD", 18 + i * 4, "SELF"), undefined, "LONG"),
  ),
  ...["Khách Trung Thành", "Khách Thường Xuyên", "Thành Viên VIP", "Khách Truyền Miệng"].map((n, i) =>
    card(`x_g_l${i+1}`, n, `${n} mang lại doanh thu ổn định.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 12 + i * 2, 100 + i * 25,
      ce("REVENUE_MULTIPLIER", 8 + i * 2, "SELF")),
  ),
  // Energy cards
  ...["Nhân Viên Năng Động", "Đội Ngũ Trẻ", "Chuyên Gia Tư Vấn", "Cố Vấn Chiến Lược"].map((n, i) =>
    card(`x_g_en${i+1}`, n, `${n} tăng năng lượng hoạt động.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 6 + i * 2, 40 + i * 10,
      ce("ENERGY_GAIN", 10 + i * 3, "SELF")),
  ),
  // Late game power cards
  ...["Sáp Nhập Doanh Nghiệp", "Mua Lại Đối Thủ", "Liên Doanh Quốc Tế", "Niêm Yết Chứng Khoán"].map((n, i) =>
    card(`x_g_lg${i+1}`, n, `${n} mở rộng quy mô.`, "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 30 + i * 4, 500 + i * 80,
      ce("INSTANT_REVENUE", 5000 + i * 500, "SELF")),
  ),
  card("x_g_leg1", "Đế Chế Kinh Doanh", "Xây dựng đế chế kinh doanh vĩ đại.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 50, 1000,
    ce("INSTANT_REVENUE", 15000, "SELF")),
  card("x_g_leg2", "Thành Phố Thông Minh", "Quản lý thành phố thông minh.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "LATE", 45, 900,
    ce("CUSTOMER_BOOST", 100, "SELF"), ce("REVENUE_MULTIPLIER", 25, "SELF"), "LONG"),
  card("x_g_leg3", "Công Nghệ Đột Phá", "Công nghệ đột phá thay đổi ngành.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 55, 1200,
    ce("INSTANT_REVENUE", 20000, "SELF")),
  card("x_g_hp1", "Hồi Phục Thần Tốc", "Hồi phục HP nhanh chóng.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 16, 130,
    ce("HP_HEAL", 30, "SELF")),
  card("x_g_hp2", "Lá Chắn Vàng", "Lá chắn bảo vệ HP.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 25, 350,
    ce("HP_SHIELD", 50, "SELF"), undefined, "LONG"),
  // Crit cards
  card("x_g_crit1", "May Mắn Bất Ngờ", "Tăng cơ hội crit.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "MID", 18, 200,
    ce("CRIT_REVENUE", 400, "SELF")),
  card("x_g_crit2", "Sấm sét Kinh Doanh", "Crit siêu cao.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 32, 550,
    ce("CRIT_REVENUE", 1200, "SELF")),
  // Low HP power cards
  card("x_g_last1", "Tuyệt Vọng Chiến Đấu", "Sức mạnh tăng khi HP thấp.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 14, 150,
    ce("INSTANT_REVENUE", 600, "SELF", { type: "LAST_STAND" })),
  // Multiplier cards
  card("x_g_mul1", "Khuyến Mãi Lớn", "Tăng doanh thu nhân đôi.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 22, 300,
    ce("REVENUE_MULTIPLIER", 20, "SELF")),
  card("x_g_mul2", "Siêu Sale", "Doanh thu nhân ba.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "LATE", 35, 600,
    ce("REVENUE_MULTIPLIER", 35, "SELF")),
  // Condition cards
  card("x_g_cond3", "Sáng Suốt Đầu Tuần", "Bonus vào vòng đầu.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "EARLY", 8, 50,
    ce("INSTANT_REVENUE", 400, "SELF", { type: "FIRST_ROUND" })),
  card("x_g_cond4", "Bùng Nổ Vòng 10", "Sức mạnh vòng 10.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 20, 250,
    ce("INSTANT_REVENUE", 3000, "SELF", { type: "ROUND_EVEN" })),
  card("x_g_cond5", "Giàu Có Rồi", "Bonus khi có nhiều tiền.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "LATE", 15, 180,
    ce("CUSTOMER_BOOST", 25, "SELF", { type: "HP_ABOVE", value: 80 })),
  card("x_g_cond6", "Sinh Tồn", "Bonus khi HP thấp.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 12, 100,
    ce("INSTANT_REVENUE", 500, "SELF", { type: "HP_BELOW", value: 30 })),
  // Streak power cards
  card("x_g_stk1", "Chuỗi Thắng 2", "Bonus streak x2.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "MID", 15, 160,
    ce("INSTANT_REVENUE", 1000, "SELF", { type: "STREAK", count: 2 })),
  // Env resistance
  card("x_g_env1", "Nhà Chống Bão", "Bảo vệ khỏi thiên tai.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 12, 100,
    ce("ENV_RESISTANCE", 1, "SELF"), undefined, "LONG"),
  card("x_g_env2", "Hệ Thống Dự Báo", "Dự báo và phòng ngừa rủi ro.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "MID", 20, 280,
    ce("HP_SHIELD", 25, "SELF"), ce("ENV_RESISTANCE", 1, "SELF"), "LONG"),
  // Cost reduction
  card("x_g_cost1", "Tinh Gọn Vận Hành", "Giảm chi phí vận hành.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "COST", "MID", 14, 140,
    ce("OPERATING_COST_MULT", 15, "SELF")),
  card("x_g_cost2", "Công Nghệ Tiết Kiệm", "Giảm chi phí đáng kể.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "COST", "LATE", 22, 320,
    ce("OPERATING_COST_MULT", 25, "SELF")),
  // Heal + revenue combo
  card("x_g_combo1", "Sức Khỏe Là Vàng", "Hồi HP và tăng doanh thu.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "MID", 24, 380,
    ce("HP_HEAL", 20, "SELF"), ce("INSTANT_REVENUE", 1200, "SELF")),
  // Multi-round effects
  card("x_g_long1", "Hợp Đồng 3 Vòng", "Hiệu ứng kéo dài 3 vòng.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 10, 100,
    ce("CUSTOMER_BOOST", 15, "SELF"), undefined, "LONG"),
  card("x_g_long2", "Thương Hiệu Nổi Tiếng", "Nổi tiếng toàn quốc.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 18, 250,
    ce("CUSTOMER_BOOST", 35, "SELF"), ce("REVENUE_MULTIPLIER", 10, "SELF"), "LONG"),
  // Ultra-late game
  card("x_g_ult1", "IPO Chứng Khoán", "IPO thành công lớn.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 60, 1500,
    ce("INSTANT_REVENUE", 30000, "SELF")),
  card("x_g_ult2", "Chuỗi Siêu Thị", "Mở rộng chuỗi cửa hàng.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 50, 1100,
    ce("INSTANT_REVENUE", 18000, "SELF"), ce("CUSTOMER_BOOST", 80, "SELF")),
  card("x_g_ult3", "Vươn Tầm Quốc Tế", "Mở rộng ra toàn cầu.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "LATE", 55, 1300,
    ce("AVG_TICKET_BOOST", 100, "SELF"), ce("REVENUE_MULTIPLIER", 40, "SELF"), "LONG"),
  // Extra commons
  ...["Khách Hài Lòng", "Đánh Giá 5 Sao", "Phản Hồi Tích Cực", "Giới Thiệu Bạn Bè"].map((n, i) =>
    card(`x_g_x${i+1}`, n, `${n} tăng uy tín.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 6 + i, 50 + i * 10,
      ce("INSTANT_REVENUE", 200 + i * 30, "SELF")),
  ),
  // More commons
  ...["Tiết Kiệm Năng Lượng", "Tái Chế Vật Liệu", "Mua Sỉ Nguyên Liệu", "Tối Ưu Kho", "Kiểm Soát Hàng Tồn"].map((n, i) =>
    card(`x_g_c${i+1}`, n, `${n} giảm chi phí.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "COST", "EARLY", 8 + i * 2, 60 + i * 15,
      ce("COST_REDUCTION", 120 + i * 25, "SELF")),
  ),
  // More rare/buff
  ...["Nhân Viên Xuất Sắc", "Quản Lý Tài Ba", "Kế Toán Chính Xác", "Marketing Chuyên Nghiệp"].map((n, i) =>
    card(`x_g_r${i+1}`, n, `${n} tăng hiệu suất.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 14 + i * 2, 130 + i * 30,
      ce("CUSTOMER_BOOST", 18 + i * 4, "SELF"), undefined, "LONG"),
  ),
  // More epic
  card("x_g_ep1", "Văn Hóa Doanh Nghiệp", "Xây dựng văn hóa doanh nghiệp mạnh.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 26, 400,
    ce("CUSTOMER_BOOST", 45, "SELF"), ce("REVENUE_MULTIPLIER", 15, "SELF"), "LONG"),
  card("x_g_ep2", "Hệ Thống CRM", "Quản lý quan hệ khách hàng.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 22, 350,
    ce("CUSTOMER_BOOST", 40, "SELF"), undefined, "LONG"),
  card("x_g_ep3", "Phân Tích Dữ Liệu", "Phân tích dữ liệu để tối ưu.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "MID", 20, 300,
    ce("INSTANT_REVENUE", 2000, "SELF"), ce("COST_REDUCTION", 200, "SELF")),
  card("x_g_ep4", "Quảng Cáo Đúng Đắn", "Quảng cáo đúng đối tượng.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 28, 450,
    ce("INSTANT_REVENUE", 3500, "SELF")),
  // Legendary extra
  card("x_g_lx1", "Đại Sự Kiện", "Đại sự kiện marketing toàn cầu.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 60, 1400,
    ce("INSTANT_REVENUE", 25000, "SELF")),
  card("x_g_lx2", "Cách Mạng Công Nghệ", "Cách mạng hóa ngành.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 55, 1200,
    ce("INSTANT_REVENUE", 20000, "SELF"), ce("REVENUE_MULTIPLIER", 30, "SELF")),
  // Phase-locked commons
  card("x_g_p1", "Khởi Đầu Thuận Lợi", "Bonus ở vòng đầu.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "EARLY", 6, 40,
    ce("INSTANT_REVENUE", 250, "SELF", { type: "FIRST_ROUND" })),
  card("x_g_p2", "Cuối Trận Chiến", "Bonus ở vòng cuối.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 10, 80,
    ce("INSTANT_REVENUE", 600, "SELF")),
  // HP defense cards
  ...["Máu Dự Phòng", "Quỹ Cứu Hộ", "Bảo Hiểm Cao Cấp", "Lá Chắn Bão Táp"].map((n, i) =>
    card(`x_g_d${i+1}`, n, `${n} bảo vệ HP.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "DEFENSE", "EARLY", 10 + i * 2, 80 + i * 20,
      ce("HP_SHIELD", 10 + i * 3, "SELF")),
  ),
  // Energy cards
  ...["Cà Phê Buổi Sáng", "Nghỉ Ngơi Có Tiêu", "Tinh Thần Sảng Khoái", "Động Lực Làm Việc"].map((n, i) =>
    card(`x_g_e${i+1}`, n, `${n} tăng năng lượng.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 5 + i * 2, 35 + i * 10,
      ce("ENERGY_GAIN", 8 + i * 3, "SELF")),
  ),
  // More rare revenue
  ...["Festival Cộng Đồng", "Sự Kiện Mùa", "Giảm Giá Lớn", "Flash Sale"].map((n, i) =>
    card(`x_g_f${i+1}`, n, `${n} thu hút đông đảo.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 16 + i * 3, 160 + i * 40,
      ce("INSTANT_REVENUE", 1000 + i * 200, "SELF")),
  ),
  // More epic revenue
  ...["Hợp Tác Chiến Lược", "Liên Kết Ngành", "Mạng Lưới Phân Phối", "Hệ Thống Logistics"].map((n, i) =>
    card(`x_g_h${i+1}`, n, `${n} mở rộng thị trường.`, "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 26 + i * 4, 420 + i * 60,
      ce("INSTANT_REVENUE", 4000 + i * 400, "SELF")),
  ),
  // More buff
  ...["Đào Tạo Nhân Viên", "Workshop Chuyên Nghiệp", "Hội Thảo Nội Bộ"].map((n, i) =>
    card(`x_g_j${i+1}`, n, `${n} nâng cao kỹ năng.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 14 + i * 3, 130 + i * 35,
      ce("CUSTOMER_BOOST", 22 + i * 5, "SELF"), undefined, "LONG"),
  ),
  // Extra legendary
  card("x_g_lz1", "Siêu Thị Toàn Cầu", "Xây dựng chuỗi siêu thị toàn cầu.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 58, 1350,
    ce("INSTANT_REVENUE", 28000, "SELF"), ce("CUSTOMER_BOOST", 90, "SELF")),
  card("x_g_lz2", "Nền Tảng Công Nghệ", "Nền tảng công nghệ đột phá.", "LEGENDARY", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 52, 1150,
    ce("REVENUE_MULTIPLIER", 50, "SELF"), ce("INSTANT_REVENUE", 22000, "SELF")),
  // Additional commons
  ...["Khách Mới", "Khách Quen", "Khách Tiềm Năng", "Khách Thực Chiến", "Khách Chiến Lược"].map((n, i) =>
    card(`x_g_k${i+1}`, n, `${n} mang lại doanh thu.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 8 + i * 2, 65 + i * 15,
      ce("INSTANT_REVENUE", 280 + i * 40, "SELF")),
  ),
  // Additional rare
  ...["Phân Tích Thị Trường", "Nghiên Cứu Khách Hàng", "Chiến Lược Giá"].map((n, i) =>
    card(`x_g_m${i+1}`, n, `${n} tối ưu chiến lược.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 14 + i * 2, 130 + i * 30,
      ce("CUSTOMER_BOOST", 20 + i * 4, "SELF")),
  ),
  // Final additions to reach 200+
  ...["Quản Lý Hiệu Quả", "Tối Ưu Quy Trình", "Tự Động Hóa Bán Hàng", "Chăm Sóc Khách Hàng VIP"].map((n, i) =>
    card(`x_g_n${i+1}`, n, `${n} tăng hiệu suất.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "EARLY", 6 + i * 2, 50 + i * 12,
      ce("INSTANT_REVENUE", 220 + i * 35, "SELF")),
  ),
  ...["Chiến Dịch Lan Truyền", "Viral Marketing", "Livestream Bán Hàng"].map((n, i) =>
    card(`x_g_o${i+1}`, n, `${n} tăng độ phủ.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 16 + i * 3, 150 + i * 40,
      ce("INSTANT_REVENUE", 900 + i * 150, "SELF")),
  ),
  // Final push to 200+
  ...["Khách Doanh Nghiệp", "Hợp Đồng Lớn", "Đối Tác Chiến Lược"].map((n, i) =>
    card(`x_g_q${i+1}`, n, `${n} mang lại lợi nhuận lớn.`, "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 18 + i * 3, 200 + i * 50,
      ce("INSTANT_REVENUE", 1100 + i * 200, "SELF")),
  ),
  card("x_g_r2", "Tầm Nhìn Lãnh Đạo", "Lãnh đạo tầm nhìn chiến lược.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "LATE", 24, 380,
    ce("CUSTOMER_BOOST", 42, "SELF"), ce("REVENUE_MULTIPLIER", 12, "SELF"), "LONG"),
  ...["Khách Tiết Kiệm", "Khách Chi Tiêu", "Khách Hào Phóng", "Khách Bộ Phận"].map((n, i) =>
    card(`x_g_s${i+1}`, n, `${n} có mô hình chi tiêu khác nhau.`, "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "MID", 7 + i * 2, 55 + i * 12,
      ce("INSTANT_REVENUE", 230 + i * 35, "SELF")),
  ),
  // Final 4 cards to reach 200
  card("x_g_t1", "Thành Công Vượt Bậc", "Thành công vượt bậc trong kinh doanh.", "EPIC", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "REVENUE", "LATE", 28, 450,
    ce("INSTANT_REVENUE", 3800, "SELF")),
  card("x_g_t2", "Hệ Thống Quản Lý", "Quản lý tập trung hiệu quả.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 16, 180,
    ce("CUSTOMER_BOOST", 28, "SELF"), undefined, "LONG"),
  card("x_g_t3", "Chiến Lược Tăng Trưởng", "Kế hoạch tăng trưởng dài hạn.", "RARE", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "SPECIAL", "LATE", 18, 220,
    ce("INSTANT_REVENUE", 1200, "SELF")),
  card("x_g_t4", "Mạng Lưới Đối Tác", "Mở rộng mạng lưới đối tác.", "COMMON", ["CAFE", "CLOTHING", "ELECTRONICS", "AD_AGENCY"], "BUFF", "MID", 8, 70,
    ce("INSTANT_REVENUE", 320, "SELF")),
];

// ── ALL CARDS ────────────────────────────────────────────────────────────────

export const ALL_CARDS: Card[] = [
  ...CAFE_CARDS,
  ...CLOTHING_CARDS,
  ...ELECTRONICS_CARDS,
  ...AD_AGENCY_CARDS,
  ...CROSS_STORE_CARDS,
  ...CAFE_GENERATED,
  ...CLOTHING_GENERATED,
  ...ELECTRONICS_GENERATED,
  ...AD_AGENCY_GENERATED,
  ...CROSS_GENERATED,
];

export const CARD_BY_KEY: Record<string, Card> = Object.fromEntries(
  ALL_CARDS.map((c) => [c.cardKey, c]),
);

export function getCardsByStore(storeType: StoreType): Card[] {
  return ALL_CARDS.filter((c) => c.storeTypes.includes(storeType));
}

export function getCardsByRarity(rarity: Rarity): Card[] {
  return ALL_CARDS.filter((c) => c.rarity === rarity);
}

export function getCardsBySlot(slotType: SlotType): Card[] {
  return ALL_CARDS.filter((c) => c.slotType === slotType);
}

export const RARITY_DROP_RATES = {
  COMMON: 0.60,
  RARE: 0.27,
  EPIC: 0.10,
  LEGENDARY: 0.03,
} as const;

export const PITY_LEGENDARY = 30;
