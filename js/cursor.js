/* Cursor reticle — trails the pointer and brackets anything actionable. */
(function () {
  'use strict';
  var reduceMotion = Site.reduceMotion, finePointer = Site.finePointer;

  /* Cursor reticle — trails the pointer, brackets interactive targets */
  const reticle = document.getElementById('reticle');
  if (finePointer && !reduceMotion) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    let retRaf = null, prev = 0;
    /* Frame-rate independent easing: a fixed per-frame factor tracks at
       a different speed on 60Hz vs 120Hz and jerks after a dropped
       frame. Converting it to a time constant keeps the trail identical
       everywhere. */
    function trailReticle(now) {
      const dt = prev ? Math.min(50, now - prev) : 16.7;
      prev = now;
      const k = 1 - Math.pow(1 - 0.16, dt / 16.7);
      const dx = mx - rx, dy = my - ry;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        reticle.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
        rx = mx; ry = my; retRaf = null; prev = 0;
        return;
      }
      rx += dx * k;
      ry += dy * k;
      reticle.style.transform = `translate3d(${rx.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
      retRaf = requestAnimationFrame(trailReticle);
    }
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('ret-on');
      if (retRaf === null) { prev = 0; retRaf = requestAnimationFrame(trailReticle); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => document.body.classList.remove('ret-on'));
    document.addEventListener('mouseover', e => {
      reticle.classList.toggle('lock',
        !!e.target.closest('a, button, .imp, .tl-row, .sk[role=button], .qf-step, .qf-chip, .fn, .brief-row, .tag, .quest-card, .mission, .sidequest'));
    }, { passive: true });
  }
})();
