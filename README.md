# Lá thư 20/10

Một lá thư viết tay trên giấy: phong thư giấy kraft dán sáp, chạm vào để mở, lá thư trải ra trên bàn và chữ hiện dần như đang được viết. Quanh lá thư: thảm cỏ hoa dại mọc lên và đung đưa, bó hoa khô buộc dây gai, cánh hoa ép rơi chậm, những lời chúc nhỏ viết trên mẩu giấy trôi trên mặt bàn — kèm nhạc nền. Viết bằng HTML/CSS/JS thuần, không cần cài đặt hay build.

## Cách mở

- Nhấp đúp vào `index.html` để mở bằng trình duyệt (Chrome, Edge, Firefox, Safari).
- Chạm vào phong thư để mở, nhạc sẽ tự phát (trình duyệt chỉ cho phát nhạc sau khi người dùng chạm).
- Chạm vào lá thư khi chữ đang hiện để xem toàn bộ ngay.
- Muốn gửi cho người khác: đưa cả thư mục lên GitHub Pages, Netlify, Vercel… rồi gửi đường link.

## Đổi tên người nhận

Thêm `?to=Tên` vào cuối đường dẫn, ví dụ:

```
index.html?to=Lan
https://ten-trang.github.io/20-10/?to=Mẹ%20yêu
```

Đổi tên người ký cuối thư bằng `?from=` (mặc định là **Anh**, đổi trong `defaultFrom`):

```
index.html?to=Lan&from=Minh
```

Không có `?to=` thì tên mặc định là **Em** (đổi trong `js/config.js` → `defaultName`).

## Đổi lời chúc

Mở `js/config.js`:

- `wishes` — các đoạn trong thư (hiện dần như đang viết tay).
- `floatingMessages` — các câu chúc viết trên mẩu giấy nhỏ, trôi ở khoảng trống của mặt bàn (không đè lên lá thư; tối đa 4 mẩu trên điện thoại, 8 trên máy tính).
- `signLine` — lời ký nhỏ ở cuối thư, phía trên tên người gửi.
- `place` — nơi viết thư (dòng "Hà Nội, ngày 20 tháng 10" và dấu bưu điện trên phong bì).
- `{to}` trong câu sẽ được thay bằng tên người nhận.

Lưu file dưới dạng **UTF-8** để giữ đúng dấu tiếng Việt.

## Đổi / thêm bài hát

1. Chép file nhạc `.mp3` vào thư mục `songs/`, ảnh bìa vào `images/music/`.
2. Thêm một dòng vào `playlist` trong `js/config.js`:

```js
{ name: "Tên bài", artist: "Ca sĩ", cover: "images/music/anh-bia.jpg", src: "songs/bai-hat.mp3" }
```

Bài đầu tiên trong danh sách sẽ phát khi mở thư. Ảnh bìa hiện trên đĩa than, trong danh sách bài và trên màn hình khóa điện thoại. Thêm `start`/`end` (giây) nếu chỉ muốn phát một đoạn của bài.

Trình phát nằm ở góc phải dưới dạng một chiếc đĩa than nhỏ (xoay khi đang phát, có ảnh bìa và cột sóng nhạc). Bấm vào đĩa để mở bảng điều khiển: ảnh bìa, tên bài, thanh tua, bài trước/sau, phát/dừng, chế độ lặp/ngẫu nhiên và danh sách bài (có ảnh bìa, thời lượng). Nhấn Esc hoặc nút mũi tên để thu gọn.

## Cấu trúc thư mục

```
index.html
css/
  base.css     màu, phông chữ, hạt giấy, mặt bàn
  intro.css    phong thư dán sáp và hiệu ứng mở
  letter.css   lá thư, phong bì có tem, nhành hoa ép
  garden.css   thảm cỏ hoa, bó hoa khô, mẩu giấy lời chúc, cánh hoa rơi
  player.css   trình phát nhạc đĩa than
js/
  config.js    nội dung: tên, lời chúc, danh sách nhạc
  letter.js    hiệu ứng chữ hiện dần như đang viết
  flora.js     vẽ thảm cỏ hoa dại và bó hoa khô (SVG)
  drift.js     cánh hoa rơi & bụi trong ánh đèn (canvas)
  notes.js     lời chúc trên mẩu giấy trôi
  player.js    trình phát nhạc
  main.js      điều phối toàn bộ
images/, songs/  ảnh và nhạc
```

## Ghi chú

- Nếu thiết bị bật chế độ "Giảm chuyển động", thư mở ngay, chữ hiện ngay, cỏ hoa đứng yên, không có cánh hoa rơi hay mẩu giấy trôi.
- Phông chữ tải từ Google Fonts; khi không có mạng trang vẫn chạy với phông dự phòng.
- Phông chữ: EB Garamond (chữ in) và Dancing Script (chữ viết tay), cả hai đều có bộ tiếng Việt.
- Màu sắc chỉnh nhanh trong `css/base.css` (phần `:root`). Hạt giấy được tạo bằng SVG noise ngay trong CSS, không dùng ảnh.
