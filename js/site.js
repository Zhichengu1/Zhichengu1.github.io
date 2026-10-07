/* Site shell: shared flags, nav + scroll progress, mobile menu, scrollspy,
   scroll reveal, count-up figures, section-label decode, copy-email,
   footer clock and page transitions.

   Loaded first. It creates window.Site, the one shared object the other
   scripts read flags from and hang their small public APIs on. */
(function () {
  'use strict';
  var Site = window.Site = {
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches
  };
  var reduceMotion = Site.reduceMotion, softMotion = Site.reduceMotion, finePointer = Site.finePointer;

  const navLinks  = document.getElementById('nav-links');
  const navToggle = document.getElementById('nav-toggle');

  /* Scroll progress + nav state + parallax — rAF-throttled, transform-only */
  const xp = document.getElementById('xp');
  const nav = document.getElementById('nav');
  const field = document.querySelector('.bg-fx');
  const hero = document.querySelector('.hero');
  const ringBtn = document.getElementById('scroll-ring');
  const ringFg = document.getElementById('ring-fg');
  const smap = document.getElementById('smap');
  const smapFill = document.getElementById('smap-fill');
  let scrollRaf = null, lastY = 0;

  /* ── Auto-hiding nav ──────────────────────────────
     Comparing this frame's y against the previous one is too twitchy to
     drive a half-second transition: a trackpad glide moves 2-4px per
     frame, so a per-frame threshold either never trips or flickers the
     bar on every jitter. Intent is accumulated instead — travel in one
     direction adds up, reversing starts a fresh run, and the bar only
     moves once a run passes its threshold. Leaving costs more travel
     than coming back, because a reader who reverses wants the nav now. */
  const NAV_HIDE_AFTER = 72;   /* px of continuous downward travel */
  const NAV_SHOW_AFTER = 28;   /* px of upward travel */
  const NAV_TOP_ZONE   = 340;  /* pinned above this — the hero owns it */
  let navRun = 0, navHidden = false, navHoldUntil = 0;

  function setNavHidden(state) {
    if (state === navHidden) return;
    navHidden = state;
    nav.classList.toggle('hidden', state);
  }
  /* Anything that should out-rank the scroll direction for a moment:
     an in-page jump, a pointer reaching for the bar, focus landing in
     it. Without this a smooth-scrolled anchor hides the nav mid-flight. */
  function holdNav(ms) {
    navHoldUntil = performance.now() + ms;
    setNavHidden(false);
  }

  function updateNav(y) {
    const dy = y - lastY;
    if (Math.abs(dy) < 1) return;              /* sub-pixel noise */
    navRun = (dy > 0) === (navRun > 0) ? navRun + dy : dy;
    lastY = y;

    if (y < NAV_TOP_ZONE ||
        navLinks.classList.contains('open') ||
        nav.contains(document.activeElement) ||
        performance.now() < navHoldUntil ||
        y + window.innerHeight >= document.body.scrollHeight - 4) {
      setNavHidden(false);
      return;
    }
    if (navRun >  NAV_HIDE_AFTER) setNavHidden(true);
    else if (navRun < -NAV_SHOW_AFTER) setNavHidden(false);
  }

  function onScroll() {
    scrollRaf = null;
    const y = window.scrollY;
    const max = document.body.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(1, y / max) : 0;
    xp.style.transform = `scaleX(${pct})`;
    nav.classList.toggle('scrolled', y > 24);
    /* The parallax var is set on the background layer, not :root —
       setting a custom property on the root element invalidates style
       for the whole document on every scroll frame. Both the field and
       the trace map inherit it from here and move at their own rates. */
    if (field) field.style.setProperty('--sp', pct.toFixed(3));
    /* Hero parallax. Capped at 820 — the point where its opacity
       reaches zero — so nothing keeps updating below the fold. */
    if (hero && !reduceMotion) hero.style.setProperty('--hy', Math.min(y, 820));
    /* Progress gauge */
    ringFg.style.strokeDashoffset = 100 - pct * 100;
    ringBtn.classList.toggle('show', y > 420);
    if (smapFill) smapFill.style.transform = `scaleY(${pct.toFixed(4)})`;
    if (smap) smap.classList.toggle('show', y > 420);
    updateNav(y);
  }
  window.addEventListener('scroll', () => {
    if (scrollRaf === null) scrollRaf = requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener('load', onScroll);
  ringBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* A hidden bar must not be a focus trap: tabbing into it brings it back
     before the ring would land off-screen. */
  nav.addEventListener('focusin', () => holdNav(0));
  /* An in-page jump scrolls down hundreds of px — hold through the glide. */
  document.addEventListener('click', e => {
    if (e.target.closest('a[href^="#"]')) holdNav(reduceMotion ? 120 : 900);
  }, true);
  /* Reaching for the top edge asks for the nav back without scrolling. */
  if (finePointer) {
    document.addEventListener('mousemove', e => {
      if (navHidden && e.clientY < 64) holdNav(600);
    }, { passive: true });
  }

  /* Mobile menu */
  navToggle.setAttribute('aria-controls', 'nav-links');
  navToggle.setAttribute('aria-expanded', 'false');
  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    const icon = navToggle.querySelector('i');
    if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
  }
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  /* An open menu with no way out but the toggle is a trap on a phone. */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); navToggle.focus(); }
  });
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') && !e.target.closest('.nav-inner')) setMenu(false);
  });

  /* Section mood: whichever section crosses the middle of the screen
     lights its own soft glow in the fixed background, and the previous
     one fades out (css/polish.css). Only opacity changes, once per
     section, so it costs nothing while scrolling. */
  (function () {
    const zones = [...document.querySelectorAll('.bg-zone')];
    if (!zones.length || !('IntersectionObserver' in window)) return;
    const marks = [...document.querySelectorAll('.smap a')];
    const show = id => {
      zones.forEach(z => z.classList.toggle('on', z.dataset.zone === id));
      marks.forEach(m => m.classList.toggle('on', m.dataset.sec === id));
    };
    const zoneObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) show(e.target.id); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    zones.forEach(z => {
      const el = document.getElementById(z.dataset.zone);
      if (el) zoneObs.observe(el);
    });
    show('top');
  })();

  /* Grid lens: the background grid lights up around the pointer. The
     light trails the cursor with easing (each frame closes 14% of the
     gap) and the loop stops once it settles, so a still mouse costs
     nothing. Fine pointers only; off under reduced motion. */
  (function () {
    const lens = document.getElementById('bg-lens');
    if (!lens || !finePointer || reduceMotion) return;
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, raf = null;
    function frame() {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      lens.style.setProperty('--lx', x.toFixed(1) + 'px');
      lens.style.setProperty('--ly', y.toFixed(1) + 'px');
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) ? requestAnimationFrame(frame) : null;
    }
    document.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      lens.classList.add('on');
      if (raf === null) raf = requestAnimationFrame(frame);
    }, { passive: true });
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) lens.classList.remove('on'); });
  })();

  /* Scrollspy */
  const spyTargets = [...navLinks.querySelectorAll('a[href^="#"]')]
    .map(a => ({ link: a, el: document.querySelector(a.getAttribute('href')) }))
    .filter(t => t.el);
  /* The sliding indicator is positioned from the active link's own
     box, so it stays correct whatever the labels say or how the font
     renders — no hard-coded offsets to drift out of sync. */
  function moveIndicator() {
    const active = navLinks.querySelector('a.active');
    if (!active || getComputedStyle(navLinks).flexDirection === 'column') {
      navLinks.classList.remove('has-active');
      return;
    }
    navLinks.style.setProperty('--w', active.offsetWidth + 'px');
    navLinks.style.setProperty('--x', active.offsetLeft + 'px');
    navLinks.classList.add('has-active');
  }
  const spyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      spyTargets.forEach(t => {
        const on = t.el === entry.target;
        t.link.classList.toggle('active', on);
        if (on) t.link.setAttribute('aria-current', 'true');
        else t.link.removeAttribute('aria-current');
      });
      moveIndicator();
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  spyTargets.forEach(t => spyObs.observe(t.el));
  window.addEventListener('resize', moveIndicator, { passive: true });
  window.addEventListener('load', moveIndicator);

  /* Scroll reveal.
     The whole page's copy sits behind `html.js .reveal { opacity: 0 }`,
     so if this observer cannot be constructed the site renders blank.
     Reveal everything up front rather than betting the content on an
     API being present. */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, [data-observe]').forEach(el => el.classList.add('visible'));
  }
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, [data-observe]').forEach(el => revealObs.observe(el));

  /* One-time count-up on the key-result figures. Runs once when a tile
     scrolls in, then the numbers sit still — no looping motion in type. */
  if (!reduceMotion) {
    const nums = [...document.querySelectorAll('.imp-num[data-count]')];
    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        countObs.unobserve(e.target);
        const el = e.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const dur = 900, t0 = performance.now();
        el.textContent = prefix + '0' + suffix;
        (function step(now) {
          const k = Math.min(1, (now - t0) / dur);
          /* ease-out so it settles rather than stopping dead */
          el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US') + suffix;
          if (k < 1) requestAnimationFrame(step);
          else { el.textContent = prefix + target.toLocaleString('en-US') + suffix; el.classList.add('done'); }
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(n => countObs.observe(n));
  }

  /* Section label decode: the small uppercase label resolves out of noise
     as its section arrives, and the index ticks up to its own number. It
     runs on the label, not the heading — the heading contains markup a
     text rewrite would destroy, and a 0.75rem label scrambling reads as a
     readout where a 2.6rem heading would read as a stunt. */
  if (!softMotion) {
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>';
    var decodeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        decodeObs.unobserve(e.target);
        var el = e.target, finalText = el.textContent, frame = 0, total = 16;
        var iv = setInterval(function () {
          frame++;
          var out = '';
          for (var i = 0; i < finalText.length; i++) {
            if (finalText[i] === ' ') { out += ' '; continue; }
            out += (i < finalText.length * (frame / total))
              ? finalText[i]
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          el.textContent = out;
          if (frame >= total) { clearInterval(iv); el.textContent = finalText; }
        }, 34);
      });
    }, { threshold: 1 });
    document.querySelectorAll('.sec-rule .name').forEach(function (el) { decodeObs.observe(el); });

    /* The section index ticks up to its own number alongside it. */
    var idxObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        idxObs.unobserve(e.target);
        var el = e.target, target = parseInt(el.textContent, 10);
        if (isNaN(target)) return;
        var n = 0;
        var iv = setInterval(function () {
          n++;
          el.textContent = (n < 10 ? '0' : '') + n;
          if (n >= target) clearInterval(iv);
        }, 70);
      });
    }, { threshold: 1 });
    document.querySelectorAll('.sec-rule .idx').forEach(function (el) { idxObs.observe(el); });
  }

  /* Copy the email address — faster than a mailto for anyone not using
     a desktop mail client, which is most people reading a portfolio. */
  const copyBtn = document.getElementById('copy-mail');
  if (copyBtn) {
    const status = document.getElementById('copy-status');
    const label = copyBtn.querySelector('span');
    let resetTimer = null;
    copyBtn.addEventListener('click', async () => {
      const mail = copyBtn.dataset.mail;
      let ok = true;
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(mail);
        else throw new Error('no clipboard');
      } catch (err) { ok = false; }
      /* The address is no longer printed on the page, so a failed copy
         can't fall back to selecting it — point at the mail link instead. */
      label.textContent = ok ? 'Copied' : 'Use Email me';
      copyBtn.classList.toggle('done', ok);
      if (status) status.textContent = ok ? 'Email address copied to clipboard' : 'Copy failed — use the Email me button';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        label.textContent = 'Copy address';
        copyBtn.classList.remove('done');
        if (status) status.textContent = '';
      }, 2600);
    });
  }

  /* NYC clock — footer only, since the nav readout was removed. */
  (function () {
    const els = [document.getElementById('clock-footer')];
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour12: false,
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    function tick() {
      const t = fmt.format(new Date());
      els.forEach(el => { if (el) el.textContent = t; });
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ══ Page transitions ═════════════════════════════
     Same-site links fade the page out before navigating, and every
     page fades in on arrival, so moving between the home page and a
     case study reads as one site rather than two loads. Hash links,
     new-tab links, modified clicks and anything off-site are left
     alone. pageshow handles the back button: a bfcache restore would
     otherwise land on a page still faded to nothing. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel):/.test(href)) return;
    if (a.origin !== location.origin) return;
    if (softMotion) return;
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 220);
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.documentElement.classList.remove('leaving');
  });
})();
