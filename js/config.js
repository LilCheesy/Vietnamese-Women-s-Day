/* =========================================================
   Cấu hình nội dung — chỉnh tên, lời chúc, danh sách nhạc tại đây.
   {to} sẽ được thay bằng tên người nhận (tham số ?to=Tên trên URL).
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  var config = {
    // Tên mặc định khi không có ?to= trên đường dẫn
    defaultName: "em",

    // Người gửi mặc định (ký tên cuối thư) khi không có ?from= trên đường dẫn
    defaultFrom: "Anh",

    // Lời ký trước tên người gửi
    signLine: "Với tất cả yêu thương,",

    // Nơi viết thư — hiện ở dòng "…, ngày 20 tháng 10" và dấu bưu điện
    place: "Hà Nội",

    // Những lời chúc nhỏ viết trên mẩu giấy, trôi chậm trên mặt bàn (phía sau lá thư)
    floatingMessages: [
      "Chúc mừng 20/10",
      "Happy Women's Day",
      "Luôn xinh đẹp và rạng rỡ",
      "Mãi hạnh phúc nhé",
      "Cười thật nhiều nha",
      "{to} là điều tuyệt vời nhất",
      "Vạn sự như ý",
      "Luôn được yêu thương",
      "Trẻ mãi không già",
      "Tỏa sáng theo cách của {to}",
      "Bình an và may mắn",
      "Mọi ước mơ thành hiện thực",
      "Ngọt ngào như những đóa hoa",
      "Cảm ơn vì đã luôn ở đây",
      "Thương {to} nhiều lắm"
    ],

    // Lời chúc trong thư — mỗi phần tử là một đoạn, hiện dần như đang được viết tay
    wishes: [
      "Nhân ngày Phụ nữ Việt Nam 20/10, xin gửi đến {to} những lời chúc ngọt ngào nhất.",
      "Chúc {to} luôn xinh đẹp, rạng rỡ như những đóa hồng, mỗi sáng thức dậy đều thấy lòng nhẹ nhàng và bình yên.",
      "Mong {to} luôn được yêu thương, được trân trọng, và có thật nhiều niềm vui trong công việc lẫn cuộc sống.",
      "Cảm ơn em vì đã xuất hiện và khiến thế giới xung quanh trở nên bình yên hơn bao giờ hết. Chúc em một ngày 20/10 thật trọn vẹn, và mong rằng những ngày sau này anh luôn được đồng hành cùng nụ cười của em."
    ],

    // Danh sách nhạc: ảnh trong images/music/, bài hát trong songs/
    // cover: ảnh bìa hiện trên đĩa than, danh sách bài và màn hình khóa điện thoại
    // start/end (giây, tùy chọn): chỉ phát đoạn từ start đến end của bài
    playlist: [
      { name: "Flower Dance (Piano)", artist: "DJ Okawari", cover: "images/music/music-2.jpg", src: "songs/flower-dance.mp3" },
      { name: "Forever Young", artist: "UNDRESSD, Ellie May", cover: "images/music/music-1.jpg", src: "songs/music-1.mp3" },
      { name: "Hoa", artist: "Johannes Johansson", cover: "images/music/music-2.jpg", src: "songs/music-2.mp3" },
      { name: "Raindrops Never Stop Falling", artist: "Dennis Kuo", cover: "images/music/music-3.jpg", src: "songs/music-3.mp3" },
      { name: "Ever Eternity", artist: "Dennis Kuo", cover: "images/music/music-4.jpg", src: "songs/music-4.mp3" },
      { name: "There You'll Be", artist: "Faith Hill", cover: "images/music/music-5.jpg", src: "songs/music-5.mp3" },
      { name: "Tennessee", artist: "Hans Zimmer", cover: "images/music/music-5.jpg", src: "songs/music-6.mp3" }
    ]
  };

  /* ---------- Đọc tham số URL ---------- */
  function readParam(key, max) {
    try {
      var value = new URLSearchParams(window.location.search).get(key);
      if (!value) return "";
      return value.replace(/\s+/g, " ").trim().slice(0, max || 40);
    } catch (e) {
      return "";
    }
  }

  config.recipient = readParam("to") || config.defaultName;
  config.sender = readParam("from") || config.defaultFrom;

  /* Thay {to} bằng tên người nhận */
  config.personalize = function (text) {
    return String(text).split("{to}").join(config.recipient);
  };

  /* Người dùng có muốn giảm chuyển động không */
  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  config.reducedMotion = function () {
    return !!(motionQuery && motionQuery.matches);
  };

  App.config = config;
})();
