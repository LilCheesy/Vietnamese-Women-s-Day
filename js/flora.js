/* =========================================================
   Cỏ hoa vẽ tay: thảm cỏ dại mọc dọc mép dưới mặt bàn
   (mọc lên khi mở thư rồi đung đưa theo gió) và bó hoa khô
   buộc dây gai nằm cạnh lá thư. Tất cả là SVG sinh bằng code,
   nét hơi lệch, màu nhạt như màu nước.
   ========================================================= */
(function () {
  "use strict";

  var App = (window.App = window.App || {});

  /* Số ngẫu nhiên có hạt giống — mỗi lần mở trang, cỏ hoa mọc y như cũ */
  function rng(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  var COLORS = {
    grass: ["#7d8461", "#8a8f68", "#6f7656", "#9a9b74", "#a7a582", "#87805a"],
    rose: ["#c48e88", "#b9746e", "#d3a6a0", "#c99a94"],
    roseDark: ["#9b4f4a", "#a3564f", "#8c4541"],
    cream: ["#efe6d2", "#e9dcc2", "#f4ede0"],
    lav: ["#8e86a6", "#9d93b2", "#827a9c"],
    straw: ["#bba77f", "#c4b28a", "#a99670"],
    stem: "#6f6a48",
    ochre: "#b8964e"
  };

  function pick(r, list) { return list[(r() * list.length) | 0]; }
  function n(v) { return Math.round(v * 10) / 10; }
  function between(r, a, b) { return a + r() * (b - a); }

  /* ---------- Từng nét vẽ (toạ độ tính từ gốc, y âm là hướng lên) ---------- */

  // Lá cỏ: hình lá mảnh, cong theo hướng nghiêng
  function blade(r, h, lean, alpha) {
    var w = between(r, 1.1, 2.6);
    return '<path d="M' + n(-w) + " 0Q" + n(lean * 0.3 - w * 0.4) + " " + n(-h * 0.55) + " " + n(lean) + " " + n(-h) +
      "Q" + n(lean * 0.36 + w * 0.7) + " " + n(-h * 0.5) + " " + n(w) + ' 0Z" fill="' + pick(r, COLORS.grass) +
      '" fill-opacity="' + n(alpha * between(r, 0.55, 0.95)) + '"/>';
  }

  // Thân hoa: một đường cong mảnh, trả về cả toạ độ ngọn
  function stem(r, h, lean, width) {
    var mx = lean * 0.25 + between(r, -5, 5);
    return {
      svg: '<path d="M0 0Q' + n(mx) + " " + n(-h * 0.5) + " " + n(lean) + " " + n(-h) + '" fill="none" stroke="' + COLORS.stem +
        '" stroke-width="' + (width || 1.1) + '" stroke-linecap="round" stroke-opacity=".85"/>',
      x: lean,
      y: -h,
      mx: mx
    };
  }

  // Lá nhỏ trên thân
  function leaf(r, x, y, dir, size) {
    var l = size * between(r, 0.8, 1.2);
    return '<path d="M' + n(x) + " " + n(y) + "q" + n(dir * l * 0.5) + " " + n(-l * 0.5) + " " + n(dir * l) + " " + n(-l * 0.25) +
      "q" + n(-dir * l * 0.5) + " " + n(l * 0.35) + " " + n(-dir * l) + " " + n(l * 0.25) + 'z" fill="' + pick(r, COLORS.grass) + '" fill-opacity=".75"/>';
  }

  // Hoa cúc dại: cánh trắng ngà, nhụy vàng đất
  function daisy(r, x, y, size) {
    var out = "";
    var count = 10 + ((r() * 4) | 0);
    var fill = pick(r, COLORS.cream);
    for (var i = 0; i < count; i++) {
      var a = (i / count) * 360 + between(r, -8, 8);
      var len = size * between(r, 0.75, 1.1);
      out += '<ellipse cx="0" cy="' + n(-len / 2) + '" rx="' + n(len * 0.2) + '" ry="' + n(len / 2) +
        '" transform="translate(' + n(x) + " " + n(y) + ") rotate(" + n(a) + ')" fill="' + fill + '" fill-opacity=".92"/>';
    }
    out += '<circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(size * 0.3) + '" fill="' + COLORS.ochre + '"/>';
    out += '<circle cx="' + n(x + size * 0.06) + '" cy="' + n(y + size * 0.06) + '" r="' + n(size * 0.14) + '" fill="#8f7036" fill-opacity=".6"/>';
    return out;
  }

  // Cúc họa mi hồng (cosmos): cánh rộng, đầu cánh khía
  function cosmos(r, x, y, size) {
    var out = '<g transform="translate(' + n(x) + " " + n(y) + ')" fill="' + pick(r, COLORS.rose) +
      '" fill-opacity=".8" stroke="#8d524d" stroke-width=".5" stroke-opacity=".4">';
    var count = 7 + ((r() * 2) | 0);
    for (var i = 0; i < count; i++) {
      var a = (i / count) * 360 + between(r, -10, 10);
      var l = size * between(r, 0.8, 1.1);
      var w = l * 0.32;
      out += '<path transform="rotate(' + n(a) + ')" d="M0 0C' + n(-w) + " " + n(-l * 0.35) + " " + n(-w * 1.1) + " " + n(-l * 0.9) + " " +
        n(-w * 0.4) + " " + n(-l) + "L0 " + n(-l * 0.9) + "L" + n(w * 0.4) + " " + n(-l) + "C" + n(w * 1.1) + " " + n(-l * 0.9) + " " +
        n(w) + " " + n(-l * 0.35) + ' 0 0Z"/>';
    }
    out += '</g><circle cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(size * 0.18) + '" fill="#8a6b3c"/>';
    return out;
  }

  // Oải hương: chuỗi nụ tím xám dọc ngọn
  function lavender(r, s, h) {
    var out = "";
    var count = 7 + ((r() * 5) | 0);
    var fill = pick(r, COLORS.lav);
    for (var i = 0; i < count; i++) {
      var t = 0.62 + (i / count) * 0.38;
      var px = s.mx * 2 * t * (1 - t) + s.x * t * t; // điểm trên đường cong thân
      var py = -h * t;
      var side = i % 2 ? 1 : -1;
      out += '<ellipse cx="' + n(px + side * 1.6) + '" cy="' + n(py) + '" rx="1.7" ry="2.8" transform="rotate(' + side * 22 + " " +
        n(px + side * 1.6) + " " + n(py) + ')" fill="' + fill + '" fill-opacity=".85"/>';
    }
    return out;
  }

  // Hoa baby: nhánh nhỏ lấm tấm chấm trắng
  function babyBreath(r, x, y, spread) {
    var out = "";
    var branches = 4 + ((r() * 3) | 0);
    for (var i = 0; i < branches; i++) {
      var bx = x + between(r, -spread, spread);
      var by = y + between(r, -spread * 0.8, spread * 0.3);
      out += '<path d="M' + n(x) + " " + n(y + spread * 0.5) + "L" + n(bx) + " " + n(by) + '" stroke="' + COLORS.stem + '" stroke-width=".6" stroke-opacity=".7"/>';
      var dots = 3 + ((r() * 3) | 0);
      for (var k = 0; k < dots; k++) {
        out += '<circle cx="' + n(bx + between(r, -4, 4)) + '" cy="' + n(by + between(r, -4, 3)) + '" r="' + n(between(r, 0.9, 1.9)) +
          '" fill="' + pick(r, COLORS.cream) + '"/>';
      }
    }
    return out;
  }

  // Bông cỏ khô: hạt lúa nhỏ so le
  function seedhead(r, s, h) {
    var out = "";
    var count = 6 + ((r() * 5) | 0);
    var fill = pick(r, COLORS.straw);
    for (var i = 0; i < count; i++) {
      var t = 0.7 + (i / count) * 0.3;
      var px = s.mx * 2 * t * (1 - t) + s.x * t * t;
      var py = -h * t;
      var side = i % 2 ? 1 : -1;
      out += '<ellipse cx="' + n(px + side * 1.8) + '" cy="' + n(py) + '" rx="1.3" ry="3.4" transform="rotate(' + side * 30 + " " +
        n(px + side * 1.8) + " " + n(py) + ')" fill="' + fill + '"/>';
    }
    return out;
  }

  // Nụ hồng khô
  function rosebud(r, x, y, size) {
    var s = size;
    return '<path d="M' + n(x) + " " + n(y + s * 0.2) + "c" + n(-s * 0.45) + " " + n(-s * 0.3) + " " + n(-s * 0.45) + " " + n(-s) + " 0 " + n(-s * 1.3) +
      "c" + n(s * 0.45) + " " + n(s * 0.3) + " " + n(s * 0.45) + " " + n(s * 1) + ' 0 ' + n(s * 1.3) + 'z" fill="' + pick(r, COLORS.roseDark) + '" fill-opacity=".88"/>' +
      '<path d="M' + n(x) + " " + n(y + s * 0.25) + "q" + n(-s * 0.5) + " " + n(-s * 0.1) + " " + n(-s * 0.55) + " " + n(-s * 0.6) +
      "M" + n(x) + " " + n(y + s * 0.25) + "q" + n(s * 0.5) + " " + n(-s * 0.1) + " " + n(s * 0.5) + " " + n(-s * 0.6) +
      '" fill="none" stroke="' + COLORS.stem + '" stroke-width=".9" stroke-linecap="round"/>';
  }

  // Một cây hoa hoàn chỉnh (thân + lá + bông)
  function flower(r, h, scale) {
    var lean = between(r, -h * 0.18, h * 0.18);
    var s = stem(r, h, lean, n(between(r, 0.9, 1.4)));
    var out = s.svg;
    if (r() < 0.7) out += leaf(r, s.mx * 0.5, -h * between(r, 0.3, 0.5), r() < 0.5 ? -1 : 1, 9 * scale + 4);
    var kind = r();
    if (kind < 0.24) out += daisy(r, s.x, s.y, between(r, 6, 9) * scale + 2);
    else if (kind < 0.44) out += cosmos(r, s.x, s.y, between(r, 7, 10) * scale + 2);
    else if (kind < 0.62) out += lavender(r, s, h);
    else if (kind < 0.76) out += babyBreath(r, s.x, s.y, 9 * scale + 3);
    else if (kind < 0.9) out += seedhead(r, s, h);
    else out += rosebud(r, s.x, s.y, 6 * scale + 2);
    return out;
  }

  /* ---------- Thảm cỏ hoa ---------- */
  function buildMeadow(svg) {
    var width = Math.max(320, Math.round(svg.clientWidth || window.innerWidth));
    var height = Math.round(svg.clientHeight || 200);
    var r = rng(2010);
    var small = width < 640;
    var scale = small ? 0.55 : 1;
    var grassH = height * 0.42;
    var flowerH = height * 0.92;
    var out = "";

    // Hai hàng: hàng sau nhạt và thấp hơn để có chiều sâu
    [{ y: -height * 0.06, alpha: 0.5, size: 0.75, gap: small ? 16 : 22 }, { y: 0, alpha: 1, size: 1, gap: small ? 13 : 17 }].forEach(function (row, rowIndex) {
      var x = -12 + r() * row.gap;
      while (x < width + 12) {
        var clump = "";
        // Mật độ hoa dày ở hai bên, thưa ở giữa (giữa là chỗ lá thư)
        var edge = Math.abs(x / width - 0.5) * 2; // 0 ở giữa, 1 ở mép
        var blades = 4 + ((r() * 6) | 0);
        for (var b = 0; b < blades; b++) {
          var h = grassH * row.size * between(r, 0.35, 1) * (0.75 + edge * 0.35);
          clump += '<g transform="translate(' + n(between(r, -6, 6)) + ' 0)">' + blade(r, h, between(r, -h * 0.3, h * 0.3), row.alpha) + "</g>";
        }
        var flowers = r() < 0.35 + edge * 0.45 ? 1 + (r() < 0.35 + edge * 0.3 ? 1 : 0) : 0;
        for (var f = 0; f < flowers; f++) {
          var fh = flowerH * row.size * between(r, 0.45, 1) * (0.6 + edge * 0.45);
          clump += '<g transform="translate(' + n(between(r, -7, 7)) + ' 0)" opacity="' + row.alpha + '">' + flower(r, fh, scale * row.size) + "</g>";
        }

        var grow = (rowIndex * 0.3 + between(r, 0, 1.4)).toFixed(2);
        var sway = between(r, 3.6, 6.8).toFixed(2);
        var delay = (-between(r, 0, 6)).toFixed(2);
        var angle = between(r, 1.4, 3.4).toFixed(2);
        out += '<g transform="translate(' + n(x) + " " + n(height + row.y) + ')"><g class="grow" style="--g:' + grow + 's">' +
          '<g class="sway" style="--t:' + sway + "s;--d:" + delay + "s;--a:" + angle + 'deg">' + clump + "</g></g></g>";

        x += row.gap * between(r, 0.7, 1.3);
      }
    });

    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.innerHTML = out;
    svg.dataset.width = width;
  }

  App.createMeadow = function (svg) {
    if (!svg) return null;
    buildMeadow(svg);
    var timer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        // chỉ vẽ lại khi chiều rộng đổi đáng kể (thanh địa chỉ điện thoại co giãn thì bỏ qua)
        if (Math.abs(svg.clientWidth - (+svg.dataset.width || 0)) > 40) buildMeadow(svg);
      }, 250);
    });
    return { rebuild: function () { buildMeadow(svg); } };
  };

  /* ---------- Bó hoa khô buộc dây gai ---------- */
  App.drawBouquet = function (svg) {
    if (!svg) return;
    var r = rng(1020);
    var tieX = 150, tieY = 238;
    var stems = "", heads = "";
    var count = 17;

    for (var i = 0; i < count; i++) {
      var t = i / (count - 1) - 0.5;
      var angle = t * 70 + between(r, -6, 6);              // độ xòe
      var len = between(r, 120, 200) * (1 - Math.abs(t) * 0.35);
      var rad = (angle * Math.PI) / 180;
      var hx = tieX + Math.sin(rad) * len;
      var hy = tieY - Math.cos(rad) * len;
      var bx = tieX + t * 26 + between(r, -3, 3);            // cuống dưới chỗ buộc
      var by = 345 + between(r, -10, 6);
      stems += '<path d="M' + n(bx) + " " + n(by) + "L" + n(tieX + t * 9) + " " + tieY + "Q" + n(tieX + Math.sin(rad) * len * 0.45) + " " +
        n(tieY - len * 0.5) + " " + n(hx) + " " + n(hy) + '" fill="none" stroke="' + (i % 3 ? COLORS.stem : "#7d7350") + '" stroke-width="1.3"/>';

      var kind = i % 6;
      if (kind === 0 || kind === 3) {
        // hoa hồng khô
        var s = between(r, 9, 13);
        heads += '<g transform="translate(' + n(hx) + " " + n(hy) + ") rotate(" + n(angle + between(r, -30, 30)) + ')">' +
          '<ellipse rx="' + n(s) + '" ry="' + n(s * 0.85) + '" fill="' + pick(r, COLORS.roseDark) + '"/>' +
          '<path d="M' + n(-s * 0.7) + " " + n(s * 0.2) + "C" + n(-s * 0.6) + " " + n(-s * 0.7) + " " + n(s * 0.6) + " " + n(-s * 0.8) + " " + n(s * 0.7) + ' 0" fill="none" stroke="#6e302d" stroke-width="1"/>' +
          '<path d="M' + n(-s * 0.3) + " 0C" + n(-s * 0.25) + " " + n(-s * 0.45) + " " + n(s * 0.3) + " " + n(-s * 0.45) + " " + n(s * 0.3) + " 0C" + n(s * 0.3) + " " + n(s * 0.25) + " " +
          n(-s * 0.1) + " " + n(s * 0.3) + " " + n(-s * 0.15) + ' 0" fill="none" stroke="#6e302d" stroke-width=".8"/>' +
          '<path d="M' + n(-s * 0.9) + " " + n(s * 0.3) + "C" + n(-s * 0.4) + " " + n(s * 0.9) + " " + n(s * 0.5) + " " + n(s * 0.9) + " " + n(s * 0.9) + " " + n(s * 0.3) +
          '" fill="' + pick(r, COLORS.rose) + '" fill-opacity=".55"/></g>';
      } else if (kind === 1) {
        heads += babyBreath(r, hx, hy, 14);
      } else if (kind === 2) {
        // oải hương dọc ngọn
        for (var k = 0; k < 9; k++) {
          var tt = 0.72 + k * 0.032;
          var px = tieX + Math.sin(rad) * len * tt, py = tieY - Math.cos(rad) * len * tt;
          var side = k % 2 ? 1 : -1;
          heads += '<ellipse cx="' + n(px + side * 2) + '" cy="' + n(py) + '" rx="2" ry="3.2" transform="rotate(' + n(angle + side * 25) + " " + n(px + side * 2) + " " + n(py) +
            ')" fill="' + pick(r, COLORS.lav) + '"/>';
        }
      } else if (kind === 4) {
        // bông cỏ khô
        for (var q = 0; q < 8; q++) {
          var tq = 0.78 + q * 0.028;
          var qx = tieX + Math.sin(rad) * len * tq, qy = tieY - Math.cos(rad) * len * tq;
          var sd = q % 2 ? 1 : -1;
          heads += '<ellipse cx="' + n(qx + sd * 2) + '" cy="' + n(qy) + '" rx="1.6" ry="4" transform="rotate(' + n(angle + sd * 32) + " " + n(qx + sd * 2) + " " + n(qy) +
            ')" fill="' + pick(r, COLORS.straw) + '"/>';
        }
      } else {
        // lá bạch đàn tròn
        for (var e = 0; e < 4; e++) {
          var te = 0.55 + e * 0.13;
          var ex = tieX + Math.sin(rad) * len * te, ey = tieY - Math.cos(rad) * len * te;
          heads += '<circle cx="' + n(ex + (e % 2 ? 5 : -5)) + '" cy="' + n(ey) + '" r="' + n(between(r, 5, 7)) + '" fill="#8f9877" fill-opacity=".75"/>';
        }
      }
    }

    // Dây gai: vài vòng quấn + nơ
    var twine = '<g fill="none" stroke="#b39566" stroke-linecap="round">' +
      '<path d="M134 232c10 4 22 4 32-1M133 238c11 4 23 4 34-1M134 244c10 4 21 4 32 0" stroke-width="2.4"/>' +
      '<path d="M134 232c10 4 22 4 32-1M133 238c11 4 23 4 34-1M134 244c10 4 21 4 32 0" stroke="#8c7149" stroke-width=".7" stroke-dasharray="2 3"/>' +
      '<path d="M150 239c-14-12-34-10-30 0 4 9 22 4 30 0ZM150 239c12-14 33-13 30-2-3 9-21 5-30 2Z" stroke-width="2"/>' +
      '<path d="M150 240c-6 12-14 24-24 34M151 240c4 13 12 25 22 33" stroke-width="1.8"/></g>';

    svg.innerHTML = '<g opacity=".96">' + stems + heads + "</g>" + twine;
  };
})();
