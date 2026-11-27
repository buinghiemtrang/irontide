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

## 🧪 Giai đoạn 5 · Hoàn thiện cảm ứng & âm thanh
- [x] 5.1 Nút cảm ứng **LIGHT** (đèn pin) và **EMP** (lựu đạn) trên điện thoại
- [x] 5.2 Âm thanh tổng hợp riêng cho EMP: tiếng rít sạc điện tăng dần theo ngòi nổ, tiếng nổ trầm kèm điện lách tách, có định hướng trái/phải
- [x] 5.3 Tiếng click khi bật/tắt đèn pin

> Âm thanh môi trường (sóng, mòng biển, còi tàu, tiếng vang trong kho / ngoài trời) game gốc đã có sẵn.

**Play test:**
- [ ] Nút cảm ứng mới dễ bấm, không đè lên nút khác
- [ ] Âm thanh EMP nghe rõ, không quá to

---

## 🧪 Giai đoạn 6 · Shotgun & đổi súng
- [x] 6.1 Shotgun **M-12 Breakwater**: 8 viên mỗi phát, tầm 40 m, ống 6 viên + 36 dự trữ, kéo pump sau mỗi phát (văng vỏ đạn), nạp từng viên và bắn được giữa chừng, giật mạnh, chớp lửa đầu nòng riêng, tiếng nổ trầm hơn rifle
- [x] 6.2 Đổi súng bằng phím `1` `2` hoặc cuộn chuột (tay cầm: D-pad trái/phải, cảm ứng: nút SWAP), có động tác hạ/nâng súng
- [x] 6.3 HUD hiện tên, số đạn và tâm ngắm rộng hơn theo súng đang cầm

**Play test:**
- [ ] Shotgun mạnh ở gần, yếu ở xa
- [ ] Đổi súng mượt, không lỗi đạn

---

## 🧪 Giai đoạn 7 · Kẻ địch mới & boss
- [x] 7.1 **Shield Hound**: tấm khiên chặn 90% sát thương từ phía trước (~125°), vỡ sau khoảng 170 sát thương; bọc sườn, bắn phá khiên hoặc EMP (đang tê liệt thì hạ khiên). Xuất hiện từ đợt 2, Hard nhiều hơn, Easy ít hơn
- [x] 7.2 Boss **Harbormaster's Warden**: hound khổng lồ (to gấp 1,75 lần), 1100 máu, giáp giảm 45% sát thương, khiên lớn; xuất hiện 6 giây sau khi cắt relay cuối và săn bạn tới thuyền. Có thanh máu riêng và huy hiệu **Warden Down** khi hạ được

**Play test:**
- [ ] Khiên chặn đúng hướng
- [ ] Boss khó nhưng công bằng

---

## 🧪 Giai đoạn 8 · Chế độ Holdout
- [x] 8.1 Chọn **Mode: Mission / Holdout** ở màn hình chính. Holdout: không có relay và thuyền, sống sót qua các đợt địch tăng dần (gull, hound, Shield Hound), Warden xuất hiện mỗi 5 đợt. Nghỉ 10 giây giữa các đợt, được tiếp tế đạn, +1 EMP (tối đa 3), hồi 40 máu
- [x] 8.2 Điểm theo số máy hạ và đợt vượt qua (nhân theo độ khó). Kỷ lục số đợt và điểm cao nhất được lưu theo điều kiện và độ khó; huy hiệu **Seawall** khi tới đợt 10

**Play test:**
- [ ] Các đợt tăng độ khó hợp lý
- [ ] Chết thì hiện điểm và đợt đạt được

---

## 🧪 Giai đoạn 9 · Giao diện theo phong cách Valorant
- [x] 9.1 Bảng màu: xanh mực + chữ kem, **màu nhấn vàng kem `#eaeeb2`** (như thanh READY của Valorant); **đỏ `#ff4655` chỉ dùng cho nguy hiểm**
- [x] 9.2 Font: Bebas Neue cho đồng hồ và tiêu đề, Barlow (giống DIN) cho chữ và số HUD; nhúng thẳng vào bản build (không cần mạng)
- [x] 9.3 **Lobby**: thanh trên cùng có tab hình thang chứa giờ ở giữa, tab con Mission / Holdout có gạch chân + mũi thoi, hộp độ khó, 3 thẻ điều kiện dọc (thẻ đang chọn có thanh tên vàng kem), dòng mô tả có icon, hàng nút Controls — DEPLOY — Settings nối bằng đường kẻ, nền mờ có hoa văn chéo
- [x] 9.4 Nút: nút phụ nền xám xanh trong mờ + viền mảnh; nút chính khối tối viền đôi, chữ đậm, icon thoi, rê chuột chuyển vàng kem
- [x] 9.5 **HUD không khung nền**: máu góc trái dưới (số lớn + thanh trắng cắt chéo + dấu "+"), đạn góc phải dưới (số / dự trữ + hình bóng súng), **thanh kỹ năng giữa dưới** (1/2 đổi súng, F đèn pin, G EMP với vạch lượt dùng), đường kẻ mảnh trang trí, chữ có quầng tối để đọc rõ trên mọi nền
- [x] 9.6 Đo độ tương phản trên ảnh chụp (bình minh / bão / đêm): kỹ năng 13–15:1, máu 10–15:1, đạn 8–13:1, mục tiêu 6–9:1

**Play test:**
- [ ] Chữ và nút dễ đọc trên cả máy tính và điện thoại
- [ ] HUD không che tầm nhìn khi bắn

---

## ⬜ Sau này
- [ ] Màn chơi thứ 2: boong tàu container KITTIWAKE
