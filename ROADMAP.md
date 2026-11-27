# 🗺️ IRONTIDE Roadmap

Mỗi giai đoạn được làm trên một nhánh riêng (`phase-N`). Xong giai đoạn nào thì play test theo checklist của giai đoạn đó, ổn thì mới merge vào `main`.

**Trạng thái:** ⬜ Chưa làm · 🟨 Đang làm · ✅ Xong

---

## 🟨 Giai đoạn 0 · Chuẩn bị nền
Chuyển game từ một file minify sang project dễ phát triển. Gameplay giữ nguyên.

- [ ] 0.1 Dựng project Vite, cài Three.js qua npm
- [ ] 0.2 Tách code thành module: `render`, `world`, `player`, `weapon`, `enemies`, `mission`, `audio`, `ui`, `shaders`
- [ ] 0.3 Đặt lại tên các biến và hàm chính cho dễ đọc
- [ ] 0.4 Build ra một file `index.html` và tự động deploy lên GitHub Pages

**Play test:**
- [ ] Game chạy giống hệt bản cũ
- [ ] Cắt đủ 3 relay, lên được thuyền, hiện màn hình tổng kết
- [ ] FPS không giảm so với bản cũ

---

## ⬜ Giai đoạn 1 · Cảm giác bắn
- [ ] 1.1 Vết đạn trên container, thép, bê tông (tự mờ dần)
- [ ] 1.2 Vỏ đạn văng ra, nảy trên sàn, có tiếng leng keng
- [ ] 1.3 Tia lửa và mảnh vụn khác nhau theo bề mặt
- [ ] 1.4 Súng giật và lắc nhẹ khi chạy hoặc nhảy

**Play test:**
- [ ] Bắn có "đã tay" hơn
- [ ] Độ giật vừa phải
- [ ] FPS ổn khi xả đạn liên tục

---

## ⬜ Giai đoạn 2 · Robot bị phá hủy
- [ ] 2.1 Robot chết vỡ thành mảnh có vật lý
- [ ] 2.2 Xác robot bốc khói, tóe điện
- [ ] 2.3 Chớp sáng khi trúng đạn, hiệu ứng riêng cho điểm yếu
- [ ] 2.4 Hit marker và âm thanh riêng cho phát bắn hạ

**Play test:**
- [ ] Hạ robot đủ "đã"
- [ ] Mảnh vỡ không kẹt hay bay xuyên tường
- [ ] FPS ổn khi nhiều robot chết cùng lúc

---

## ⬜ Giai đoạn 3 · Ánh sáng & không khí
- [ ] 3.1 God rays của nắng bình minh xuyên qua cẩu và container
- [ ] 3.2 SSAO (chỉ ở mức đồ họa High)
- [ ] 3.3 Mặt biển: bọt sóng quanh cầu cảng, phản chiếu tốt hơn
- [ ] 3.4 Hạt bụi và hơi nước trong không khí

**Play test:**
- [ ] So sánh ảnh chụp trước và sau
- [ ] Cả 3 mức đồ họa đều chạy ổn
- [ ] Thử trên điện thoại

---

## ⬜ Giai đoạn 4 · Thời tiết & ban đêm
- [ ] 4.1 Chọn điều kiện khi Deploy: Bình minh / Mưa giông / Đêm
- [ ] 4.2 Mưa: hạt mưa, sàn ướt phản chiếu, vệt nước trên màn hình, sấm chớp
- [ ] 4.3 Đêm: đèn pha cẩu, đèn cảnh báo nhấp nháy, mắt robot phát sáng
- [ ] 4.4 Đèn pin gắn súng (phím `F`)

**Play test:**
- [ ] Đêm không quá tối
- [ ] Mưa không che khuất địch quá mức
- [ ] FPS ổn khi mưa

---

## ⬜ Giai đoạn 5 · Âm thanh
- [ ] 5.1 Tiếng bước chân theo bề mặt (thép, bê tông, nước)
- [ ] 5.2 Âm thanh môi trường: sóng, mòng biển, cẩu, còi tàu
- [ ] 5.3 Thêm câu thoại radio Control
- [ ] 5.4 Tiếng vang khác nhau trong nhà kho và ngoài trời

**Play test:**
- [ ] Đeo tai nghe nghe được hướng địch
- [ ] Âm thanh không bị rè, lặp hay chói

---

## ⬜ Giai đoạn 6 · Vũ khí
- [ ] 6.1 Hệ thống đổi súng (phím `1` `2` `3`, cuộn chuột)
- [ ] 6.2 Shotgun tầm gần
- [ ] 6.3 Súng trường bán tự động có ống ngắm
- [ ] 6.4 Lựu đạn EMP làm robot tê liệt (phím `G`)

**Play test:**
- [ ] Sát thương cân bằng, không có súng nào quá mạnh

---

## ⬜ Giai đoạn 7 · Kẻ địch
- [ ] 7.1 Robot khiên chặn đạn phía trước
- [ ] 7.2 Boss xuất hiện khi cắt relay cuối
- [ ] 7.3 AI biết núp sau vật cản và bọc sườn

**Play test:**
- [ ] Độ khó hợp lý, boss công bằng
- [ ] AI không kẹt địa hình

---

## ⬜ Giai đoạn 8 · Nội dung & giữ chân người chơi
- [ ] 8.1 Chọn độ khó: Easy / Normal / Hard
- [ ] 8.2 Lưu kỷ lục: thời gian, độ chính xác, rating
- [ ] 8.3 Thử thách và huy hiệu ("dưới 5 phút", "không bị trúng đạn"…)
- [ ] 8.4 Màn chơi thứ 2: boong tàu container KITTIWAKE

**Play test:**
- [ ] Chơi xong muốn chơi lại
- [ ] Màn 2 có cảm giác khác màn 1
