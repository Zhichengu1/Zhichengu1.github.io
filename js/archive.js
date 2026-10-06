/* project.html (all-projects archive): category filter tabs, then the
   same reveal / progress / count-up / transitions as the case studies. */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const filter = tab.dataset.filter;
      
      // Filter project cards
      document.querySelectorAll('.project-card, .featured-card').forEach(card => {
        const category = card.dataset.category || '';
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });

      /* A filter that empties a group used to leave its heading standing over
         blank space — "Featured Projects" with nothing under it reads as a
         broken page. Hide the heading with its group, and say so plainly if a
         filter matches nothing at all. */
      let shown = 0;
      [['.featured-projects', 'featured'], ['.projects-grid', 'archive']].forEach(([sel, key]) => {
        const grid = document.querySelector(sel);
        if (!grid) return;
        const visible = [...grid.children].filter(c => c.style.display !== 'none').length;
        shown += visible;
        /* Hide the whole <section>, not just the grid — the wrapper keeps its
           vertical padding otherwise and leaves a tall empty band. */
        const wrap = grid.closest('section') || grid;
        wrap.style.display = visible ? '' : 'none';
      });
      const empty = document.getElementById('filter-empty');
      if (empty) empty.hidden = shown > 0;
    });
  });

(function () {
  'use strict';
  var softMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = 'yuzhicheng369@gmail.com';

  /* ══ Scroll reveal ════════════════════════════════
     Anything structural that was not already marked up as .fade-in is
     opted in here, with a stagger inside each group, so a grid deals
     itself in rather than appearing as one slab. */
  var GROUPS = '.featured-card, .project-card, .feature-card, .arch-card,' +
               '.challenge-card, .team-card, .stat-item, .timeline-item,' +
               '.section-header, .terminal, .overview-grid, .video-container';
  document.querySelectorAll(GROUPS).forEach(function (el) {
    if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
  });
  document.querySelectorAll('.features-grid, .projects-grid, .featured-projects,' +
                            '.stats-grid, .team-grid, .tech-grid, .arch-grid, .timeline')
    .forEach(function (grid) {
      [].forEach.call(grid.children, function (c, i) {
        c.style.setProperty('--rd', Math.min(i, 8) * 0.06 + 's');
      });
    });

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in').forEach(function (el) { revealObs.observe(el); });

  /* ══ Reading progress + back to top ══════════════ */
  var xp = document.getElementById('xp');
  var ringBtn = document.getElementById('scroll-ring');
  var ringFg = document.getElementById('ring-fg');
  var raf = null;
  function onScroll() {
    raf = null;
    var max = document.body.scrollHeight - window.innerHeight;
    var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    xp.style.transform = 'scaleX(' + pct + ')';
    ringFg.style.strokeDashoffset = 100 - pct * 100;
    ringBtn.classList.toggle('show', window.scrollY > 420);
  }
  window.addEventListener('scroll', function () {
    if (raf === null) raf = requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener('load', onScroll);
  onScroll();
  ringBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: softMotion ? 'auto' : 'smooth' });
  });

  /* ══ Headline figures count up ═══════════════════
     Only where the value is a plain number; figures like "1st" or
     "3 days" are left exactly as written rather than being parsed
     into something the page never claimed. */
  if (!softMotion) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countObs.unobserve(e.target);
        var el = e.target;
        var raw = (el.textContent || '').trim();
        var m = raw.match(/^([0-9]+)([^0-9]*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10), suffix = m[2] || '';
        if (target < 2) return;
        var t0 = performance.now(), dur = 900;
        el.textContent = '0' + suffix;
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.stat-value').forEach(function (n) { countObs.observe(n); });
  }

  /* ══ Signal trace ═════════════════════════════════
     The ring element is added here rather than in the markup — see
     the .trace comment in the stylesheet. */
  document.querySelectorAll('.featured-card, .project-card, .feature-card, .arch-card, .challenge-card, .team-card, .stat-item, .timeline-item').forEach(function (card) {
    var t = document.createElement('span');
    t.className = 'trace'; t.setAttribute('aria-hidden', 'true');
    card.appendChild(t);
  });

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
