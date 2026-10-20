/* =========================================================
   Trình phát nhạc đĩa than: phát/dừng, trước/sau, tua,
   chế độ lặp/ngẫu nhiên, danh sách phát, thu gọn/mở rộng.
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  var MODES = ["all", "one", "shuffle"];
  var MODE_LABELS = { all: "Lặp danh sách", one: "Lặp một bài", shuffle: "Phát ngẫu nhiên" };

  function $(id) { return document.getElementById(id); }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "0:00";
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  App.createPlayer = function (root, tracks) {
    if (!root || !tracks || !tracks.length) return null;

    var audio = $("audio");
    var ui = {
      mini: root.querySelector(".player__mini"),
      covers: root.querySelectorAll(".disc__cover"),
      name: $("player-name"),
      artist: $("player-artist"),
      seek: $("player-seek"),
      current: $("player-current"),
      duration: $("player-duration"),
      toggle: $("player-toggle"),
      prev: $("player-prev"),
      next: $("player-next"),
      mode: $("player-mode"),
      listToggle: $("player-list-toggle"),
      list: $("playlist"),
      listClose: $("playlist-close"),
      items: $("playlist-items"),
      collapse: $("player-collapse")
    };

    var index = 0;
    var mode = "all";
    var seeking = false;
    var errorStreak = 0;

    /* ---------- Danh sách phát ---------- */
    tracks.forEach(function (t, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "track";
      btn.dataset.index = i;
      btn.innerHTML =
        '<img class="track__cover" alt="" loading="lazy">' +
        '<span class="track__meta"><span class="track__name"></span><span class="track__artist"></span></span>' +
        '<span class="track__time">–:––</span>' +
        '<span class="track__eq" aria-hidden="true"><i></i><i></i><i></i></span>';
      btn.querySelector(".track__cover").src = t.cover;
      btn.querySelector(".track__name").textContent = t.name;
      btn.querySelector(".track__artist").textContent = t.artist;
      btn.addEventListener("click", function () {
        load(i);
        play();
      });
      li.appendChild(btn);
      ui.items.appendChild(li);

      // Đọc thời lượng từng bài
      var probe = new Audio();
      probe.preload = "metadata";
      probe.addEventListener("loadedmetadata", function () {
        btn.querySelector(".track__time").textContent = formatTime(probe.duration);
        probe.removeAttribute("src");
      });
      probe.src = t.src;
    });

    function highlight() {
      var buttons = ui.items.querySelectorAll(".track");
      for (var i = 0; i < buttons.length; i++) {
        var active = i === index;
        buttons[i].classList.toggle("is-active", active);
        if (active) buttons[i].setAttribute("aria-current", "true");
        else buttons[i].removeAttribute("aria-current");
      }
    }

    /* ---------- Nạp & điều khiển ---------- */
    function load(i) {
      index = (i + tracks.length) % tracks.length;
      var t = tracks[index];
      audio.src = t.src;
      ui.name.textContent = t.name;
      ui.artist.textContent = t.artist;
      for (var k = 0; k < ui.covers.length; k++) ui.covers[k].src = t.cover;
      ui.seek.value = 0;
      ui.seek.style.setProperty("--p", "0%");
      ui.current.textContent = "0:00";
      ui.duration.textContent = "0:00";
      highlight();
      updateMediaSession(t);
    }

    // Điểm bắt đầu của bài (giây) — dùng khi chỉ phát "đoạn hay"
    function startOf() { return tracks[index].start || 0; }

    function finish() {
      if (mode === "one") { audio.currentTime = startOf(); play(); }
      else next();
    }

    function play() {
      var p = audio.play();
      if (p && p.catch) p.catch(function () { /* trình duyệt chặn tự phát — chờ người dùng bấm */ });
    }

    function pause() { audio.pause(); }

    function toggle() { audio.paused ? play() : pause(); }

    function randomIndex() {
      if (tracks.length < 2) return index;
      var r;
      do { r = (Math.random() * tracks.length) | 0; } while (r === index);
      return r;
    }

    function next() {
      load(mode === "shuffle" ? randomIndex() : index + 1);
      play();
    }

    function prev() {
      if (audio.currentTime > startOf() + 3) { audio.currentTime = startOf(); return; }
      load(mode === "shuffle" ? randomIndex() : index - 1);
      play();
    }

    function setMode(m) {
      mode = m;
      root.dataset.mode = m;
      ui.mode.title = MODE_LABELS[m];
      ui.mode.setAttribute("aria-label", "Chế độ phát: " + MODE_LABELS[m].toLowerCase());
    }

    function setExpanded(open) {
      root.dataset.state = open ? "expanded" : "collapsed";
      ui.mini.setAttribute("aria-expanded", String(open));
      if (!open) setList(false);
    }

    function setList(open) {
      ui.list.classList.toggle("is-open", open);
      ui.listToggle.setAttribute("aria-expanded", String(open));
    }

    function updateMediaSession(t) {
      if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: t.name,
          artist: t.artist,
          album: "Chúc mừng 20/10",
          artwork: /^https?:$/.test(location.protocol) ? [{ src: new URL(t.cover, location.href).href }] : []
        });
      } catch (e) { /* bỏ qua */ }
    }

    /* ---------- Sự kiện âm thanh ---------- */
    audio.addEventListener("play", function () { root.classList.add("is-playing"); ui.toggle.setAttribute("aria-label", "Tạm dừng"); });
    audio.addEventListener("pause", function () { root.classList.remove("is-playing"); ui.toggle.setAttribute("aria-label", "Phát"); });
    audio.addEventListener("loadedmetadata", function () {
      ui.duration.textContent = formatTime(audio.duration);
      if (startOf() && audio.currentTime < startOf()) audio.currentTime = startOf();
      errorStreak = 0;
    });
    audio.addEventListener("timeupdate", function () {
      if (seeking || !audio.duration) return;
      var end = tracks[index].end;
      if (end && audio.currentTime >= end) { finish(); return; }
      var ratio = audio.currentTime / audio.duration;
      ui.seek.value = Math.round(ratio * 1000);
      ui.seek.style.setProperty("--p", (ratio * 100).toFixed(2) + "%");
      ui.current.textContent = formatTime(audio.currentTime);
    });
    audio.addEventListener("ended", finish);
    audio.addEventListener("error", function () {
      // Bài lỗi: thử bài tiếp theo, nhưng không lặp vô hạn
      if (++errorStreak < tracks.length) setTimeout(next, 600);
    });

    /* ---------- Tua ---------- */
    ui.seek.addEventListener("input", function () {
      seeking = true;
      var ratio = ui.seek.value / 1000;
      ui.seek.style.setProperty("--p", (ratio * 100).toFixed(2) + "%");
      ui.current.textContent = formatTime(ratio * (audio.duration || 0));
    });
    ui.seek.addEventListener("change", function () {
      if (audio.duration) audio.currentTime = (ui.seek.value / 1000) * audio.duration;
      seeking = false;
      if (audio.paused) play();
    });

    /* ---------- Nút bấm ---------- */
    ui.toggle.addEventListener("click", toggle);
    ui.next.addEventListener("click", next);
    ui.prev.addEventListener("click", prev);
    ui.mode.addEventListener("click", function () {
      setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
    });
    ui.listToggle.addEventListener("click", function () { setList(!ui.list.classList.contains("is-open")); });
    ui.listClose.addEventListener("click", function () { setList(false); });
    ui.mini.addEventListener("click", function () { setExpanded(true); });
    ui.collapse.addEventListener("click", function () { setExpanded(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.dataset.state === "expanded") setExpanded(false);
    });

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("play", play);
        navigator.mediaSession.setActionHandler("pause", pause);
        navigator.mediaSession.setActionHandler("previoustrack", prev);
        navigator.mediaSession.setActionHandler("nexttrack", next);
      } catch (e) { /* bỏ qua */ }
    }

    setMode("all");
    load(0);

    return { play: play, pause: pause, toggle: toggle, next: next, prev: prev, expand: setExpanded };
  };
})();
