# 🗺️ IRONTIDE Roadmap

Mỗi giai đoạn được làm trên một nhánh riêng (`phase-N`, nhánh sau tách từ nhánh trước). Xong giai đoạn nào thì play test theo checklist của giai đoạn đó, ổn thì mới merge vào `main`.

**Trạng thái:** ⬜ Chưa làm · 🟨 Đang làm · ✅ Xong · 🧪 Chờ bạn test

> **Đã có sẵn trong game gốc** (không cần làm lại): vết đạn và tia lửa riêng theo bề mặt (kim loại, gỗ, bê tông, nước, kính), vỏ đạn nảy kèm âm thanh, súng giật, rung màn hình, xác robot, mảnh vỡ, chớp sáng khi trúng, god rays, AO, bọt sóng, bụi, mưa, sấm sét, tiếng bước chân theo bề mặt.

---

## ✅ Giai đoạn 0 · Chuẩn bị nền
- [x] 0.1 Dựng project Vite, cài Three.js r180 qua npm
- [x] 0.2 Tách code thành 24 module (`render`, `world`, `fx`, `audio`, `player`, `combat`, `weapon`, `enemies`, `ui`, `game`…)
- [x] 0.3 Đặt tên dễ đọc cho các hệ thống và hằng số chính
- [x] 0.4 Build ra một file `index.html`, workflow deploy GitHub Pages

**Play test:**
- [x] Game chạy giống hệt bản cũ (so ảnh chụp từng pixel: khác < 0,1%)
- [x] Cắt đủ 3 relay, lên được thuyền (test tự động)
- [ ] FPS không giảm so với bản cũ (cần test trên máy thật)

---

## 🧪 Giai đoạn 1 · Ban đêm & đèn pin
- [x] 1.1 Trời đêm: ánh trăng, sao lấp lánh qua khe mây, auto-exposure giới hạn cho đêm
- [x] 1.2 Cột đèn pha và đèn đứng phát sáng thật (spot light), có luồng sáng xuyên mưa
- [x] 1.3 Đèn pin gắn súng: phím `F` (tay cầm: D-pad lên), tự bật khi đánh đêm
- [x] 1.4 Mắt robot và đèn trên súng nổi bật trong bóng tối (dùng emissive sẵn có)

**Play test:**
- [ ] Đêm không quá tối, vẫn thấy đường đi và thấy địch
- [ ] Bật/tắt đèn pin bằng `F` mượt
- [ ] FPS ổn khi đứng gần nhiều cột đèn

---

## 🧪 Giai đoạn 2 · Bão & chọn điều kiện
- [x] 2.1 Bầu trời bão: mây phủ kín, tối và lạnh màu
- [x] 2.2 Mưa nặng hạt gấp ~2,2 lần, sét mỗi 6–16 giây
- [x] 2.3 Màn hình chính có mục **Conditions: Dawn / Storm / Night**, lựa chọn được lưu lại
- [x] 2.4 Giờ trên màn hình đổi theo điều kiện (05:42 / 07:15 / 02:10)

**Play test:**
- [ ] Đổi điều kiện ở màn hình chính, game tải lại đúng cảnh
- [ ] Mưa bão không che khuất địch quá mức
- [ ] FPS ổn khi mưa bão

---

## 🧪 Giai đoạn 3 · Độ khó, kỷ lục & thử thách
- [x] 3.1 Chọn độ khó ở màn hình chính: Easy / Normal / Hard (máu, sát thương, nhịp bắn của địch, số địch tấn công cùng lúc, quy mô các đợt)
- [x] 3.2 Lưu kỷ lục theo từng điều kiện và độ khó: thời gian, độ chính xác, rating, số lần hoàn thành (hiện chữ NEW khi phá kỷ lục)
- [x] 3.3 8 huy hiệu: Breacher, Rapid Response (< 5 phút), Untouched (không trúng đạn), Marksman (≥ 60% chính xác), Storm Chaser, Night Owl, Hardened, Surgical

**Play test:**
- [ ] Độ khó khác biệt rõ
- [ ] Kỷ lục hiện đúng ở màn hình tổng kết

---

## 🧪 Giai đoạn 4 · Lựu đạn EMP
- [x] 4.1 Ném lựu đạn EMP (phím `G`, tay cầm: LB), bay theo quỹ đạo, nảy trên tường và sàn, đèn nhấp nháy nhanh dần
- [x] 4.2 Nổ sau 1,6 giây: vòm xung điện xanh, vòng sóng trên mặt đất, chớp sáng; robot trong bán kính 9 m mất máu và tê liệt tới 4 giây (gull rơi thấp, hound đứng khựng, tóe điện); vật cản chắn được xung
- [x] 4.3 2 quả mỗi nhiệm vụ, hiện số còn lại phía trên ô đạn

**Play test:**
- [ ] Ném trúng chỗ mình nhắm
- [ ] EMP mạnh vừa phải, không phá game

---

## 🧪 Giai đoạn 5 · Bạn play test giai đoạn 1–4

---

## ⬜ Sau này
- [ ] Vũ khí thứ 2 (shotgun) và đổi súng
- [ ] Loại địch mới, boss khi cắt relay cuối
- [ ] Màn chơi thứ 2: boong tàu container KITTIWAKE
- [ ] Nút đèn pin và lựu đạn trên màn hình cảm ứng
