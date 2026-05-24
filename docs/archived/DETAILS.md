# GAME DESIGN DOCUMENT (GDD)

> **Dự kiến:** Project Sunny - Startup Journey
>
> **Thể loại:** Card-based · Strategy · Business Simulation · Co-op Multiplayer · Route Life
>
> **Quy mô ban đầu:** 100 CCU (Concurrent Users)
>
> **Tài liệu bởi:** Bùi Nhật Đức Anh — CEO LOOP Solutions
>
> **Liên hệ:** [Email] · [Phone] · [LinkedIn] · [GitHub](https://github.com/buinhatducanh1)

---

## 1. Tổng Quan Dự Án

### 1.1. Cốt Truyện & Bối Cảnh

Trò chơi lấy bối cảnh xã hội hiện đại đan xen yếu tố công nghệ hóa. Nhân vật chính — **SunnyHolleyLight** — là một sinh viên vừa ra trường. Dù sở hữu kinh nghiệm thực chiến dày dặn, Sunny liên tục bị các nhà tuyển dụng từ chối chỉ vì xuất thân từ một trường nghề không có tiếng tăm.

Không khuất phục trước định kiến, Sunny quyết định tụ họp cùng những người bạn để mở một doanh nghiệp khởi nghiệp. Hành trình đi từ **con số không đến sự giàu có** chính thức bắt đầu.

### 1.2. Mục Tiêu Trò Chơi

| Chế độ | Mô tả |
|---|---|
| **Survival Mode** | Nhóm 5 người chơi phối hợp, ra quyết định chiến lược qua hệ thống thẻ bài để duy trì cửa hàng sống sót qua các rủi ro thị trường và đạt **Vòng 20** (≈ 20 tháng hoạt động). |

### 1.3. Look & Feel

| Khía cạnh | Chi tiết |
|---|---|
| **Hình ảnh** | Phong cách *Cosmic Tech / Galaxy* pha trộn thiết kế hiện đại, tinh gọn (Minimalist UI). Assets isometric tạo cảm giác quản lý chân thực, gợi nhớ sự ấm cúng như *Stardew Valley* hay *Fallout Shelter*. |
| **Âm thanh** | Nhạc nền lofi nhẹ nhàng ở vòng đầu, tăng nhịp điệu ở vòng cuối khi áp lực tài chính tăng cao. |

---

## 2. Hệ Thống Nhân Vật & Chỉ Số

> Người chơi bắt đầu bằng việc chọn **1 Ngành nghề Chính** (hiệu suất 100%) và **1 Ngành nghề Phụ** (hiệu suất 40%).

### 2.1. Nhóm Chỉ Số Cơ Bản

Được nâng cấp vĩnh viễn (Metagame progression) thông qua hệ thống thẻ phạt/thưởng ngoài sảnh.

| Chỉ số | Tác động |
|---|---|
| **Trí lực** | Khả năng mở khóa các thẻ bài chiến lược cao cấp. |
| **Thể lực** | Năng lượng tối đa để sử dụng các lá bài tốn sức lao động. |
| **Tốc độ** | Thứ tự ưu tiên xử lý sự kiện trong vòng đấu. |
| **Tinh thần** | Sức chịu đựng trước lá bài rủi ro hoặc sự kiện môi trường xấu. |
| **Linh hoạt** | Chuyển đổi hoặc hủy bài trên tay không mất phí. |
| **Ngoại giao** | Lượng khách hàng vãng lai cơ bản. |

### 2.2. Ngành Nghề & Kỹ Năng

| Ngành nghề | Kỹ năng đặc thù | Hiệu ứng trong Gameplay |
|---|---|---|
| **Kỹ thuật phần mềm** | Thao tác ứng dụng, Code Logic | Tăng tỷ lệ chí mạng và chỉ số chí mạng cho thẻ liên quan phần mềm/hệ thống. |
| **Kỹ thuật phần cứng** | Sửa chữa, Bảo trì thiết bị | Giảm thời gian hồi phục sự cố; giảm % rủi ro chi phí sửa chữa và mua sắm thiết bị. |
| **Marketing** | Thu hút, Phân tích thị trường | Tăng tỷ lệ thành công thẻ truyền thông; tăng biên độ lợi nhuận; giảm tỷ lệ mua hàng thất bại. |
| **Thiết kế đồ họa** | Nhận diện thương hiệu, UI/UX | Tăng tỷ lệ khách quay lại (Retention); tăng mạnh hiệu ứng khi ra mắt sản phẩm mới. |
| **Luật sư** | Pháp lý, Xử lý khủng hoảng | Giảm tỷ lệ thẻ rủi ro tội phạm/thất thoát; giảm % chi phí thuế hàng tháng. |
| **Kỹ sư điện** | Năng lượng, Vận hành | Tăng tốc độ phục hồi mất điện; giảm tỷ lệ chập cháy; giảm thiểu chi phí tiền điện. |

---

## 3. Ghép Phòng & Môi Trường

### 3.1. Lobby & Khởi Tạo

- Mỗi Lobby tối đa **5 người chơi**.
- Cho phép chọn ngành nghề trùng lặp (VD: cả team đều làm Kỹ thuật phần mềm → Startup công nghệ thuần túy).
- Chủ phòng (Host) thiết lập chế độ chơi (hiện tại: **Survival**).

### 3.2. Bỏ Phiếu Cửa Hàng

Hệ thống random **3 loại hình** cửa hàng ban đầu, 5 người chơi bỏ phiếu. Card Pool và nhánh phát triển thay đổi theo lựa chọn:

| Loại hình |
|---|
| Quán Cafe / Quán ăn gia đình |
| Cửa hàng Quần áo |
| Cửa hàng Điện thoại / Điện tử |
| Cửa hàng / Agency Quảng cáo |

### 3.3. Hiệu Ứng Môi Trường

Hệ thống ngẫu nhiên áp dụng các môi trường tác động trực tiếp đến toàn bộ người chơi trong lobby.

#### Môi Trường Xấu

| Sự kiện | Tác động |
|---|---|
| **Đại dịch** | Giảm tỷ lệ khách mua trực tiếp; chi phí vốn hàng hóa tăng; có tháng mất trắng lượng khách offline. |
| **Chiến tranh / Khủng hoảng** | Giảm mạnh sức mua hàng thời trang, công nghệ. |
| **Bầy quạ (Dịch bệnh cục bộ)** | Tính cạnh tranh và giá vốn thực phẩm, đồ tiêu dùng tăng mạnh. |

#### Môi Trường Tốt

| Sự kiện | Tác động |
|---|---|
| **Kỷ nguyên Công nghệ** | Tăng đột biến tỷ lệ mua mặt hàng điện tử. |
| **Gói Thúc đẩy (Trợ cấp)** | Tăng vốn ban đầu; nhận thêm trợ cấp hàng tháng từ chính phủ. |
| **Trend Truyền thông** | Tăng hiệu suất mọi chiến dịch quảng cáo, marketing. |

---

## 4. Hệ Thống Thẻ Bài & Vòng Lặp Game

### 4.1. Thông Số Thẻ Bài

Mỗi thẻ bài được tạo bằng AI trực quan, bao gồm:

- **Hình ảnh & Icon** — Thể hiện rõ nhóm ngành nghề chính của lá bài.
- **Phí kích hoạt** — Tiền, Điện năng, Nước, Thể lực.
- **Chỉ số tăng trưởng** — Các biến số thay đổi trực quan trên giao diện khi lá bài được đánh ra.

#### Thời Gian Tác Dụng

| Loại | Mô tả |
|---|---|
| **Tức thì** | Kích hoạt và tiêu biến ngay trong tháng. |
| **Ngắn hạn** | Duy trì 6 tháng. |
| **Dài hạn** | Duy trì cả năm. |
| **Vĩnh viễn** | Duy trì cho đến khi bị lá bài khác vô hiệu hóa. |

### 4.2. Vòng Lặp 1 Tháng (1 Round)

> Không giới hạn thời gian thực — đề cao sự tính toán chiến thuật.

```
Draw  →  Action  →  Resolution  →  Clean Up
```

1. **Draw (Phát bài)** — Server phát 5 thẻ cho mỗi người chơi. Tối đa cầm 5 lá trên tay.
2. **Action (Sắp xếp)** — Người chơi kéo/thả bài vào các Slot. Khi thỏa mãn điều kiện chi phí, nhấn *"Sẵn sàng"*.
3. **Resolution (Kích hoạt)** — Khi cả 5 người chơi sẵn sàng, vòng đấu tự động chạy:
   - Bài lật theo thứ tự người chơi **1 → 5**, và **trái → phải** trên bàn mỗi người.
   - Hệ thống tính toán buff/nerf dựa trên Ngành nghề Chính (100%) và Phụ (40%).
   - Trừ chi phí duy trì cửa hàng (vòng càng cao → phí vận hành càng đắt).
   - Tính toán lượng khách ra vào (hiển thị bằng Animation Assets cơ bản).
4. **Clean Up (Dọn dẹp)** — Xóa toàn bộ bài thừa chưa sử dụng. Người chơi được khóa (giữ lại) **1 lá bài duy nhất** cho vòng sau.

---

## 5. Yêu Cầu Kỹ Thuật & Triển Khai

> Dự án áp dụng mô hình **Zero-budget** với sự hỗ trợ của AI Agent để tối ưu hóa code và thiết kế.

### 5.1. Tech Stack

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| **Frontend** | Next.js · TypeScript · Tailwind CSS · Framer Motion | UI responsive mọi thiết bị; hiệu ứng thẻ bài |
| **Backend** | NestJS · Socket.io | Real-time Multiplayer; đồng bộ state 5 người chơi |
| **Database** | PostgreSQL · Prisma ORM | User, Stats, Lịch sử trận đấu |
| **Hosting** | Vercel (Frontend) · Railway (Backend) · GitHub Actions | CI/CD tự động |

### 5.2. Luồng Xử Lý Multiplayer

- **Room-based architecture** — State cửa hàng (Quỹ tiền, HP doanh nghiệp, Danh sách buff/nerf) được giữ ở **server-side** để ngăn chặn gian lận.
- Hàm `calculateRound()` trên máy chủ nhận array thẻ bài của 5 người chơi, áp dụng công thức array mapping để tính toán thứ tự, trả kết quả qua sự kiện `onRoundEnded` của WebSockets.

> **Lưu ý triển khai:** Cấu trúc dự án sẽ được đưa vào môi trường làm việc của AI Agent (Claude Code) để khởi tạo các thư mục Monorepo và Prisma schema ở bước tiếp theo. Nền tảng kiến trúc đảm bảo khả năng **mở rộng (Scale)** nếu dự án vượt mốc 100 người dùng trong tương lai.
