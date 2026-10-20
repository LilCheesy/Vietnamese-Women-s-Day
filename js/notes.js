/* =========================================================
   Lời chúc trên mẩu giấy nhỏ: hiện lên ở khoảng trống của mặt
   bàn (không đè lên lá thư), trôi chậm lên rồi mờ dần.
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  // avoid: những phần tử mà mẩu giấy không được đè lên
  App.createNotes = function (layer, messages, avoid) {
    if (!layer || !messages || !messages.length) return null;

    var queue = [], live = 0, timer = 0, running = false;

    function maxLive() { return window.innerWidth < 640 ? 4 : 8; }

    // Xáo trộn để lời chúc không lặp lại liên tục
    function nextMessage() {
      if (!queue.length) {
        queue = messages.slice();
        for (var i = queue.length - 1; i > 0; i--) {
          var j = (Math.random() * (i + 1)) | 0;
          var t = queue[i]; queue[i] = queue[j]; queue[j] = t;
        }
      }
      return queue.pop();
    }

    /* Thử vài vị trí ngẫu nhiên, chọn chỗ không chạm lá thư, phong bì,
       trình phát và các mẩu giấy khác (tính cả đoạn trôi lên) */
    function blocked() {
      var rects = [];
      avoid.forEach(function (el) { if (el) rects.push(el.getBoundingClientRect()); });
      var others = layer.children;
      for (var i = 0; i < others.length; i++) rects.push(others[i].getBoundingClientRect());
      return rects;
    }

    function hits(x, y, w, h, rects) {
      var pad = 14;
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (x < r.right + pad && x + w > r.left - pad && y - 80 < r.bottom + pad && y + h > r.top - pad) return true;
      }
      return false;
    }

    function spawn() {
      if (live >= maxLive()) return;

      var note = document.createElement("span");
      note.className = "note";
      var text = nextMessage();
      note.textContent = text.charAt(0).toUpperCase() + text.slice(1); // viết hoa chữ đầu câu
      note.style.setProperty("--r", (Math.random() * 10 - 5).toFixed(1) + "deg");
      note.style.setProperty("--dx", (Math.random() * 40 - 20).toFixed(0) + "px");
      note.style.setProperty("--t", (11 + Math.random() * 6).toFixed(1) + "s");
      note.style.setProperty("--tone", Math.random() < 0.3 ? "#e9dcc4" : "#efe7d8");
      note.style.visibility = "hidden";
      layer.appendChild(note);

      var w = note.offsetWidth, h = note.offsetHeight;
      var vw = window.innerWidth, vh = window.innerHeight;
      var rects = blocked();
      rects.pop(); // bỏ chính mẩu giấy vừa thêm
      for (var tries = 0; tries < 30; tries++) {
        var x = 10 + Math.random() * (vw - w - 20);
        var y = 100 + Math.random() * (vh - h - (vw < 640 ? 170 : 200)); // chừa chỗ cho thảm cỏ
        if (x < 0 || y < 0 || hits(x, y, w, h, rects)) continue;
        note.style.left = Math.round(x) + "px";
        note.style.top = Math.round(y) + "px";
        note.style.visibility = "";
        live++;
        note.addEventListener("animationend", function () {
          note.remove();
          live--;
        });
        return;
      }
      note.remove(); // không còn chỗ trống — lần sau thử lại
    }

    function loop() {
      if (!running) return;
      spawn();
      timer = setTimeout(loop, 1600 + Math.random() * 1600);
    }

    return {
      start: function () {
        if (running || App.config.reducedMotion()) return;
        running = true;
        loop();
      },
      stop: function () {
        running = false;
        clearTimeout(timer);
      }
    };
  };
})();
