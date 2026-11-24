/* Procedural motion scenes. They stand in for a hero video until one is added,
   and they are also the live thumbnails on the landing-page project panels.
   No images, no downloads. Respects prefers-reduced-motion. */
(function () {
  "use strict";
  var TAU = Math.PI * 2;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- Landing fallback: twinkling stars on a transparent canvas ---- */
  function stars(ctx, w, h) {
    var r = rng(7), n = Math.round((w * h) / 4200), s = [];
    for (var i = 0; i < n; i++) s.push({ x: r() * w, y: r() * h, z: 0.4 + r() * 1.4, p: r() * TAU, f: 0.4 + r() * 1.4 });
    return function (t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < s.length; i++) {
        var q = s[i], a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(q.p + t * q.f));
        ctx.fillStyle = "rgba(255,244,220," + a.toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(q.x, q.y, q.z * 0.8, 0, TAU); ctx.fill();
      }
    };
  }

  /* ---- Pion research: matter flowing into a cosmic web ---- */
  function pion(ctx, w, h) {
    var r = rng(11), n = Math.min(1100, Math.round((w * h) / 1500)), px = [], py = [], vx = [], vy = [], modes = [];
    for (var i = 0; i < n; i++) { px.push(r() * w); py.push(r() * h); vx.push(0); vy.push(0); }
    for (var m = 0; m < 7; m++) {
      var k = 0.006 + r() * 0.012, a = r() * TAU;
      modes.push({ kx: Math.cos(a) * k, ky: Math.sin(a) * k, ph: r() * TAU, om: 0.05 + r() * 0.12, amp: 0.6 + r() * 0.8 });
    }
    ctx.fillStyle = "#0a0820"; ctx.fillRect(0, 0, w, h);
    return function (t, dt) {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(10,8,32,0.16)"; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      var step = Math.min(dt, 0.05) * 60;
      for (var i = 0; i < n; i++) {
        var fx = 0, fy = 0;
        for (var m = 0; m < modes.length; m++) {
          var md = modes[m], s = Math.sin(md.kx * px[i] + md.ky * py[i] + md.ph + t * md.om) * md.amp;
          fx += md.kx * s; fy += md.ky * s;
        }
        vx[i] = (vx[i] + fx * 9 * step) * 0.97; vy[i] = (vy[i] + fy * 9 * step) * 0.97;
        px[i] += vx[i] * step * 6; py[i] += vy[i] * step * 6;
        if (px[i] < 0) px[i] += w; else if (px[i] > w) px[i] -= w;
        if (py[i] < 0) py[i] += h; else if (py[i] > h) py[i] -= h;
        var sp = Math.min(1, Math.hypot(vx[i], vy[i]) * 5);
        ctx.fillStyle = i % 9 === 0 ? "rgba(255,214,150," + (0.35 + sp * 0.5) + ")" : "rgba(190,150,255," + (0.28 + sp * 0.55) + ")";
        ctx.fillRect(px[i], py[i], 1.6, 1.6);
      }
    };
  }

  /* ---- Honors thesis: a lattice displaced by superposed Fourier modes ---- */
  function thesis(ctx, w, h) {
    var gap = Math.max(22, Math.sqrt((w * h) / 2000)), cols = Math.ceil(w / gap) + 2, rows = Math.ceil(h / gap) + 2;
    var r = rng(5), waves = [];
    for (var i = 0; i < 4; i++) {
      var a = r() * TAU, k = 0.012 + r() * 0.02;
      waves.push({ kx: Math.cos(a) * k, ky: Math.sin(a) * k, om: 0.25 + r() * 0.5, ph: r() * TAU });
    }
    var X = new Float32Array(cols * rows), Y = new Float32Array(cols * rows), A = new Float32Array(cols * rows);
    return function (t) {
      ctx.fillStyle = "#05131a"; ctx.fillRect(0, 0, w, h);
      var i, j, idx, a, wv;
      for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
        idx = j * cols + i; var gx = (i - 1) * gap, gy = (j - 1) * gap; a = 0;
        for (wv = 0; wv < waves.length; wv++) a += Math.sin(waves[wv].kx * gx + waves[wv].ky * gy + t * waves[wv].om + waves[wv].ph);
        a /= waves.length;
        A[idx] = a; X[idx] = gx + a * gap * 0.55; Y[idx] = gy + Math.sin(a * 2 + t * 0.3) * gap * 0.3;
      }
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(82,214,200,0.16)"; ctx.beginPath();
      for (j = 0; j < rows - 1; j++) for (i = 0; i < cols - 1; i++) {
        idx = j * cols + i;
        ctx.moveTo(X[idx], Y[idx]); ctx.lineTo(X[idx + 1], Y[idx + 1]);
        ctx.moveTo(X[idx], Y[idx]); ctx.lineTo(X[idx + cols], Y[idx + cols]);
      }
      ctx.stroke();
      for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
        idx = j * cols + i; var u = A[idx] * 0.5 + 0.5;
        ctx.fillStyle = "rgba(120,240,225," + (0.18 + 0.82 * u * u).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(X[idx], Y[idx], 0.9 + 2.3 * u * u, 0, TAU); ctx.fill();
      }
    };
  }

  /* ---- Capstone chatbot: signals moving through a layered network ---- */
  function capstone(ctx, w, h) {
    var r = rng(21), layers = [5, 7, 8, 7, 4], nodes = [], edges = [], pulses = [], L, i, j, k;
    var padX = w * 0.1, padY = h * 0.14;
    for (L = 0; L < layers.length; L++) {
      var col = [];
      for (i = 0; i < layers[L]; i++) {
        col.push({ x: padX + (w - padX * 2) * (L / (layers.length - 1)) + (r() - 0.5) * 18,
                   y: padY + (h - padY * 2) * ((i + 0.5) / layers[L]) + (r() - 0.5) * 22, glow: 0 });
      }
      nodes.push(col);
    }
    for (L = 0; L < layers.length - 1; L++) for (i = 0; i < nodes[L].length; i++) for (j = 0; j < nodes[L + 1].length; j++) edges.push({ a: nodes[L][i], b: nodes[L + 1][j], L: L });
    function spawn() { var e = edges[Math.floor(r() * edges.length)]; pulses.push({ e: e, p: 0, v: 0.35 + r() * 0.4 }); }
    for (k = 0; k < 10; k++) spawn();
    return function (t, dt) {
      ctx.fillStyle = "#070d24"; ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(127,174,255,0.12)"; ctx.beginPath();
      for (k = 0; k < edges.length; k++) { ctx.moveTo(edges[k].a.x, edges[k].a.y); ctx.lineTo(edges[k].b.x, edges[k].b.y); }
      ctx.stroke();
      if (pulses.length < 26 && r() < 0.18) spawn();
      for (k = pulses.length - 1; k >= 0; k--) {
        var p = pulses[k]; p.p += p.v * Math.min(dt, 0.05);
        if (p.p >= 1) { p.e.b.glow = 1; pulses.splice(k, 1); continue; }
        var x = p.e.a.x + (p.e.b.x - p.e.a.x) * p.p, y = p.e.a.y + (p.e.b.y - p.e.a.y) * p.p;
        var g = ctx.createRadialGradient(x, y, 0, x, y, 12);
        g.addColorStop(0, "rgba(190,215,255,0.95)"); g.addColorStop(1, "rgba(127,174,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill();
      }
      for (L = 0; L < nodes.length; L++) for (i = 0; i < nodes[L].length; i++) {
        var n = nodes[L][i]; n.glow = Math.max(0, n.glow - dt * 1.6);
        ctx.fillStyle = "rgba(127,174,255," + (0.5 + n.glow * 0.5).toFixed(3) + ")";
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.2 + n.glow * 3.5, 0, TAU); ctx.fill();
        ctx.strokeStyle = "rgba(233,236,245," + (0.25 + n.glow * 0.6).toFixed(3) + ")"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, 6 + n.glow * 4, 0, TAU); ctx.stroke();
      }
    };
  }

  var FACTORIES = { stars: stars, pion: pion, thesis: thesis, capstone: capstone };

  /* Mount a scene on a canvas. Returns nothing; control the canvas via data-paused. */
  function mount(canvas) {
    var name = canvas.getAttribute("data-scene"), make = FACTORIES[name];
    if (!make) return;
    var ctx = canvas.getContext("2d"), draw = null, w = 0, h = 0, visible = true, last = 0, t = 0, raf = 0;

    function size() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.round(rect.width); h = Math.round(rect.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw = make(ctx, w, h);
      if (reduce) draw(6, 0.016);
    }
    function frame(now) {
      raf = 0;
      if (!draw) return;
      var dt = last ? (now - last) / 1000 : 0.016; last = now; t += dt;
      if (visible && canvas.getAttribute("data-paused") !== "1" && !document.hidden) draw(t, dt);
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    function start() { if (!reduce && !raf) { last = 0; raf = requestAnimationFrame(frame); } }

    if ("ResizeObserver" in window) new ResizeObserver(function () { size(); }).observe(canvas); else window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: "100px" }).observe(canvas);
    size(); start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.forEach.call(document.querySelectorAll("canvas[data-scene]"), mount);
  });
})();
