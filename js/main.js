/* =========================================================
   Điều phối: phong thư dán sáp → mở thư (bật nhạc) →
   lá thư trải ra trên bàn, chữ hiện dần như đang viết,
   cỏ hoa mọc lên, cánh hoa rơi và lời chúc trôi trên bàn.
   ========================================================= */
(function () {
  "use strict";

  var App = window.App;
  var cfg = App.config;
  var body = document.body;
  var reduced = cfg.reducedMotion();

  function $(id) { return document.getElementById(id); }
  function fill(selector, text) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  /* ---------- Cá nhân hóa ---------- */
  fill("[data-recipient]", cfg.recipient);
  fill("[data-place]", cfg.place);
  fill("[data-initial]", cfg.recipient.charAt(0).toUpperCase());
  fill("[data-postmark]", (cfg.place + " · 20.10 · ").toUpperCase());
  fill("[data-sender-line]", cfg.sender ? "Từ: " + cfg.sender : "");
  $("sign-line").textContent = cfg.signLine;
  $("sign-name").textContent = cfg.sender;
  document.title = "Gửi " + cfg.recipient + " · 20/10";

  /* ---------- Khởi tạo ---------- */
  var player = App.createPlayer($("player"), cfg.playlist);
  var paper = $("letter");

  // Cỏ hoa, bó hoa khô, cánh hoa rơi, lời chúc trên mẩu giấy
  App.createMeadow($("meadow"));
  App.drawBouquet($("bouquet"));
  var drift = App.createDrift($("drift"));
  // Mẩu giấy luôn viết hoa chữ đầu, kể cả khi bắt đầu bằng tên ("em là…")
  var noteTexts = (cfg.floatingMessages || []).map(function (m) {
    var s = cfg.personalize(m);
    return s.charAt(0).toUpperCase() + s.slice(1);
  });
  var notes = App.createNotes($("notes"), noteTexts,
    [paper, document.querySelector(".sent"), document.querySelector(".player__mini"), $("bouquet")]);
  var replayBtn = $("replay");

  var letter = App.createLetter($("letter-body"), cfg.wishes.map(cfg.personalize), {
    onDone: function () {
      paper.classList.add("is-signed"); // chữ ký hiện sau cùng
      replayBtn.classList.add("is-visible");
    }
  });

  /* ---------- Chờ phông chữ rồi mới hiện phong thư (tối đa 2,5 giây) ---------- */
  var shown = false;
  function showIntro() {
    if (shown) return;
    shown = true;
    body.classList.remove("is-loading");
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(showIntro);
  else window.addEventListener("load", showIntro);
  setTimeout(showIntro, 2500);

  /* ---------- Mở thư ---------- */
  var intro = $("intro");
  var envelope = $("envelope");
  var stage = $("stage");
  var opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    showIntro();

    // Phát nhạc ngay trong thao tác chạm (trình duyệt chỉ cho phát sau khi người dùng chạm)
    if (player) player.play();

    intro.classList.add("is-open");
    envelope.setAttribute("aria-expanded", "true");
    setTimeout(revealLetter, reduced ? 150 : 1900);
  }

  function revealLetter() {
    intro.classList.add("is-leaving");
    body.classList.remove("is-locked");
    body.classList.add("is-revealed");
    stage.removeAttribute("aria-hidden");
    window.scrollTo(0, 0);

    setTimeout(function () { intro.hidden = true; }, reduced ? 50 : 900);
    if (drift) setTimeout(drift.start, reduced ? 0 : 1200);
    if (notes) setTimeout(notes.start, reduced ? 0 : 3500);
    if (letter) setTimeout(function () { letter.start(); }, reduced ? 0 : 1300);
  }

  envelope.addEventListener("click", openEnvelope);

  /* ---------- Chạm vào thư để hiện hết chữ ---------- */
  paper.addEventListener("click", function () {
    if (letter && letter.state === "writing") letter.finish();
  });

  replayBtn.addEventListener("click", function () {
    replayBtn.classList.remove("is-visible");
    paper.classList.remove("is-signed");
    paper.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setTimeout(function () { letter.start(); }, reduced ? 0 : 500);
  });
})();
