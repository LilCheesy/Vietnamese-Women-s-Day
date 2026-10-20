/* =========================================================
   Lá thư "đang được viết": từng chữ hiện dần như mực vừa
   thấm vào giấy. Chạm vào thư để hiện toàn bộ ngay.
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  // Nghỉ thêm (ms) sau dấu câu — giống lúc người viết dừng bút
  var PAUSES = { ",": 240, ".": 520, "!": 520, "?": 520, "…": 560, ":": 300 };
  var PARAGRAPH_PAUSE = 700;

  function Letter(container, paragraphs, opts) {
    this.container = container;
    this.paragraphs = paragraphs;
    this.pace = (opts && opts.pace) || 1; // >1 viết chậm hơn
    this.onDone = (opts && opts.onDone) || function () {};
    this.timer = 0;
    this.state = "idle"; // idle | writing | done
    this.build();
  }

  /* Dựng sẵn toàn bộ chữ (ẩn) để thư không bị giật khi hiện */
  Letter.prototype.build = function () {
    var box = this.container;
    var words = (this.words = []);
    box.textContent = "";

    this.paragraphs.forEach(function (text) {
      var p = document.createElement("p");
      text.split(/\s+/).forEach(function (word, i) {
        if (i) p.appendChild(document.createTextNode(" "));
        var span = document.createElement("span");
        span.className = "w";
        span.textContent = word;
        p.appendChild(span);
        words.push(span);
      });
      words[words.length - 1].dataset.end = "1";
      box.appendChild(p);
    });
  };

  /* Tính thời điểm xuất hiện của từng chữ theo nhịp viết tay */
  Letter.prototype.schedule = function () {
    var t = 0;
    var pace = this.pace;
    this.words.forEach(function (span) {
      span.dataset.at = Math.round(t);
      span.style.animationDelay = Math.round(t) + "ms";
      var word = span.textContent;
      t += (70 + word.length * 26 + Math.random() * 40) * pace;
      var last = word.charAt(word.length - 1);
      if (PAUSES[last]) t += PAUSES[last] * pace;
      if (span.dataset.end) t += PARAGRAPH_PAUSE * pace;
    });
    return t;
  };

  Letter.prototype.start = function () {
    clearTimeout(this.timer);
    var box = this.container;
    box.classList.remove("is-written");
    void box.offsetWidth; // ép trình duyệt chạy lại hiệu ứng từ đầu

    this.state = "idle";
    if (App.config.reducedMotion()) { this.finish(); return; }

    this.state = "writing";
    var total = this.schedule();
    this.startedAt = Date.now();
    box.classList.add("is-written");

    var self = this;
    this.timer = setTimeout(function () { self.done(); }, total + 800);
  };

  /* Hiện ngay phần còn lại: những chữ chưa viết cùng hiện ra (nhanh, hơi so le) */
  Letter.prototype.finish = function () {
    if (this.state === "done") return;
    clearTimeout(this.timer);
    var now = this.state === "writing" ? Date.now() - this.startedAt : 0;
    var k = 0;
    this.words.forEach(function (span) {
      if (+span.dataset.at > now) span.style.animationDelay = now + k++ * 6 + "ms";
    });
    this.container.classList.add("is-written");
    this.done();
  };

  Letter.prototype.done = function () {
    this.state = "done";
    this.onDone();
  };

  App.createLetter = function (container, paragraphs, opts) {
    if (!container) return null;
    return new Letter(container, paragraphs, opts);
  };
})();
