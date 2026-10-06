/* Hero dot-field canvas. */
(function () {
  'use strict';
  var softMotion = Site.reduceMotion, finePointerI = Site.finePointer;

  /* ══ Hero dot-field ═══════════════════════════════
     A sampled grid of points behind the hero. A slow interference
     wave crosses it on its own, and the pointer acts like a lens:
     points near it brighten to the signal colour and part around it.
     It only animates while the hero is on screen and the tab is
     visible; under reduced motion it draws a single still frame. */
  (function () {
    var cv = document.getElementById('hero-field');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var host = cv.parentElement;
    var still = softMotion || !window.matchMedia('(min-width: 641px)').matches;
    var GAP = 24, R = 170, R2 = R * R;
    var W = 0, H = 0, pts = [];
    var mx = -1e4, my = -1e4, tx = -1e4, ty = -1e4;
    var onScreen = true, raf = null;

    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = host.clientWidth; H = host.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (var y = GAP / 2; y < H; y += GAP)
        for (var x = GAP / 2; x < W; x += GAP) pts.push(x, y);
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      /* Frame-rate-independent follow, same idea as the reticle. */
      mx += (tx - mx) * 0.14; my += (ty - my) * 0.14;
      if (tx < -5000) { mx = tx; my = ty; }
      var s = t * 0.00045;
      for (var i = 0; i < pts.length; i += 2) {
        var x = pts[i], y = pts[i + 1];
        var w = Math.sin(x * 0.011 + y * 0.006 - s * 2.2) * Math.cos(y * 0.009 - x * 0.002 - s * 1.3);
        var a = 0.1 + Math.max(0, w) * 0.22, r = 0.8, px = x, py = y, lit = w > 0.6;
        var dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          var k = 1 - d2 / R2; k *= k;
          var d = Math.sqrt(d2) || 1;
          px += dx / d * k * 12; py += dy / d * k * 12;
          a += k * 0.8; r += k * 1.1; lit = true;
        }
        ctx.fillStyle = lit
          ? 'rgba(73,214,232,' + Math.min(1, a).toFixed(3) + ')'
          : 'rgba(232,236,241,' + a.toFixed(3) + ')';
        ctx.fillRect(px - r, py - r, r * 2, r * 2);
      }
    }

    function loop(t) {
      raf = null;
      draw(t);
      if (onScreen && !document.hidden) raf = requestAnimationFrame(loop);
    }
    function start() { if (!still && raf === null && onScreen && !document.hidden) raf = requestAnimationFrame(loop); }

    size();
    draw(0);
    if (still) {
      window.addEventListener('resize', function () { size(); draw(0); }, { passive: true });
      return;
    }
    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt); rt = setTimeout(function () { size(); start(); }, 120);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting; start();
      }).observe(host);
    }
    document.addEventListener('visibilitychange', start);
    if (finePointerI) {
      host.addEventListener('mousemove', function (e) {
        var r = cv.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (mx < -5000) { mx = tx; my = ty; }
      }, { passive: true });
      host.addEventListener('mouseleave', function () { tx = ty = -1e4; });
    }
    start();
  })();
})();
