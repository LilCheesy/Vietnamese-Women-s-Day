/* =========================================================
   Cánh hoa ép khô rơi chậm (lật nhẹ, chao theo gió) và vài
   hạt bụi ấm lơ lửng trong vùng ánh đèn. Vẽ trên một canvas,
   số lượng có giới hạn, tự dừng khi chuyển tab.
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  var PETAL_COLORS = ["196,142,136", "185,116,110", "211,166,160", "201,154,148", "232,220,196", "163,86,79"];

  /* Vài dáng cánh hoa không đều — vẽ trong khung đơn vị rồi phóng to */
  var SHAPES = [
    function (c) { c.moveTo(0, 1); c.bezierCurveTo(-0.9, 0.4, -0.75, -0.8, -0.1, -1); c.bezierCurveTo(0.15, -0.8, 0.35, -1, 0.5, -0.9); c.bezierCurveTo(0.95, -0.3, 0.7, 0.5, 0, 1); },
    function (c) { c.moveTo(0, 1); c.bezierCurveTo(-0.6, 0.6, -0.7, -0.5, -0.2, -1); c.quadraticCurveTo(0.1, -0.85, 0.3, -0.98); c.bezierCurveTo(0.8, -0.4, 0.55, 0.6, 0, 1); },
    function (c) { c.moveTo(0, 0.95); c.bezierCurveTo(-1, 0.2, -0.5, -1, 0.15, -0.95); c.bezierCurveTo(0.8, -0.7, 0.75, 0.3, 0, 0.95); },
    function (c) { c.moveTo(-0.1, 1); c.bezierCurveTo(-0.7, 0.3, -0.4, -0.7, 0, -1); c.bezierCurveTo(0.45, -0.75, 0.6, 0.1, -0.1, 1); }
  ];

  App.createDrift = function (canvas) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, petals = [], specks = [], raf = 0, last = 0, running = false;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function maxPetals() { return W < 640 ? 9 : 18; }

    function makePetal(fromTop) {
      var size = 6 + Math.random() * 8;
      return {
        x: Math.random() * W,
        y: fromTop ? -20 - Math.random() * 60 : Math.random() * H,
        size: size,
        vy: 12 + Math.random() * 16 + size * 0.8,   // px/giây, rất chậm
        drift: 6 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        sway: 0.6 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 1.2,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.8 + Math.random() * 1.6,
        shape: (Math.random() * SHAPES.length) | 0,
        color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
        alpha: 0.55 + Math.random() * 0.3
      };
    }

    function makeSpeck() {
      // bụi chỉ ở quanh vùng đèn (góc trên bên trái)
      return {
        x: W * (0.15 + Math.random() * 0.5),
        y: H * (0.05 + Math.random() * 0.5),
        r: 0.6 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 3,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.22
      };
    }

    function drawPetal(p) {
      var fx = Math.cos(p.flip); // lật cánh: co theo chiều ngang
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.size * (0.25 + 0.75 * Math.abs(fx)), p.size);
      ctx.beginPath();
      SHAPES[p.shape](ctx);
      ctx.closePath();
      // mặt sau cánh nhạt hơn một chút
      ctx.fillStyle = "rgba(" + p.color + "," + (fx > 0 ? p.alpha : p.alpha * 0.75) + ")";
      ctx.fill();
      // gân cánh mảnh
      ctx.beginPath();
      ctx.moveTo(0, 0.85);
      ctx.quadraticCurveTo(0.08, 0, 0.02, -0.7);
      ctx.lineWidth = 0.06;
      ctx.strokeStyle = "rgba(120,60,55," + p.alpha * 0.45 + ")";
      ctx.stroke();
      ctx.restore();
    }

    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);

      // bụi trong ánh đèn
      for (var s = 0; s < specks.length; s++) {
        var d = specks[s];
        d.phase += dt * 0.6;
        d.x += (d.vx + Math.sin(d.phase) * 2) * dt;
        d.y += (d.vy + Math.cos(d.phase * 0.8) * 2) * dt;
        if (d.x < 0 || d.x > W || d.y < 0 || d.y > H * 0.7) specks[s] = makeSpeck();
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,226,180," + d.alpha * (0.6 + 0.4 * Math.sin(d.phase * 1.7)) + ")";
        ctx.fill();
      }

      // cánh hoa
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.phase += dt * p.sway;
        p.flip += dt * p.flipSpeed;
        p.rot += dt * p.spin + Math.sin(p.phase) * dt * 0.4;
        p.y += p.vy * dt * (0.8 + 0.3 * Math.sin(p.phase * 1.3));
        p.x += Math.sin(p.phase) * p.drift * dt + 4 * dt; // gió nhẹ từ trái sang
        if (p.y > H + 30 || p.x > W + 30) petals[i] = makePetal(true);
        drawPetal(p);
      }

      // thêm dần cho đủ số lượng, không bung ra cùng lúc
      if (petals.length < maxPetals() && Math.random() < dt * 0.8) petals.push(makePetal(true));

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || App.config.reducedMotion()) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    for (var k = 0; k < (W < 640 ? 5 : 10); k++) specks.push(makeSpeck());
    for (var j = 0; j < 3; j++) petals.push(makePetal(false));

    window.addEventListener("resize", function () {
      resize();
      if (petals.length > maxPetals()) petals.length = maxPetals();
    });

    var active = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (active) start();
    });

    return {
      start: function () { active = true; start(); },
      stop: function () { active = false; stop(); }
    };
  };
})();
