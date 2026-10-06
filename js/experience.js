/* Experience section: the scroll-linked rail, the click-to-select data-flow
   pane, jump-to-source from key results / timeline rows, and the timeline
   hover popover. Needs Site.skills (skills.js) for tag clicks in the pane. */
(function () {
  'use strict';
  var softMotion = Site.reduceMotion;
  var skills = Site.skills, norm = skills.norm, applySkill = skills.apply;
  var syncPaneTags = function () {};   /* replaced by the pane below */
  skills.onChange(function () { syncPaneTags(); });

  /* ══ Scroll-linked experience rail ════════════════
     The one continuously scroll-driven element on the page. All the
     reads happen before any of the writes: toggling a class between
     two getBoundingClientRect() calls invalidates style and forces a
     fresh layout for each remaining card, which is the classic way a
     handler like this turns into a per-frame layout thrash. */
  var qlist = document.getElementById('quest-list');
  var qfill = document.getElementById('quest-fill');
  var questEls = [].slice.call(document.querySelectorAll('.quest'));
  var railRaf = null;

  function railRead() {
    railRaf = null;
    if (!qlist || !qfill) return;
    var mid = window.innerHeight * 0.55;
    var listRect = qlist.getBoundingClientRect();
    var tops = questEls.map(function (q) { return q.getBoundingClientRect().top; });

    var p = listRect.height > 0 ? (mid - listRect.top) / listRect.height : 0;
    p = Math.max(0, Math.min(1, p));
    qfill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    qlist.style.setProperty('--p', p.toFixed(4));
    questEls.forEach(function (q, i) { q.classList.toggle('passed', tops[i] < mid); });
  }
  if (qlist && qfill && !softMotion) {
    window.addEventListener('scroll', function () {
      if (railRaf === null) railRaf = requestAnimationFrame(railRead);
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (railRaf === null) railRaf = requestAnimationFrame(railRead);
    }, { passive: true });
    railRead();
  }

  /* ── Data-flow pane ───────────────────────────
     Desktop only (fine pointer, ≥1000px): #experience gets .pane-mode, the
     rows compact, and clicking a row shows its .qflow diagram in the
     sticky side pane. Layout lives in css/experience.css, section 4. */
  (function () {
    var section = document.getElementById('experience');
    var pane = document.getElementById('quest-pane');
    var body = document.getElementById('qp-body');
    var idxEl = document.getElementById('qp-idx');
    var dateEl = document.getElementById('qp-date');
    var cursor = document.getElementById('quest-cursor');
    var list = document.getElementById('quest-list');
    if (!section || !pane || !body || !cursor || !list) return;
    var rows = [].slice.call(list.querySelectorAll('.quest'));
    if (!rows.length) return;

    var mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
    var active = -1, token = 0;
    var inMode = function () { return section.classList.contains('pane-mode'); };

    function build(i) {
      var card = rows[i].querySelector('.quest-card');
      var frag = document.createDocumentFragment();
      /* The pane is the data-flow view only. The role's description is
         already on the row and in the timeline popover, so repeating it
         here put the same paragraph on screen three times. Roles with no
         system to draw get an honest empty state plus their focus areas,
         which are otherwise clipped out of the compact rows. */
      var h = document.createElement('h3'); h.className = 'qp-title';
      var fl = card.querySelector('.qflow');
      h.textContent = (fl && fl.dataset.title) || ('Data flow · ' + (rows[i].dataset.short || ''));
      frag.appendChild(h);
      var flow = card.querySelector('.qflow');
      if (flow) {
        var f = flow.cloneNode(true);
        var lbl = f.querySelector('.obj-label:not(.qf-label)');
        if (lbl) lbl.remove();
        frag.appendChild(f);
      } else {
        var type = (rows[i].querySelector('.quest-type') || {}).textContent || 'This role';
        var note = document.createElement('p'); note.className = 'qp-none';
        note.textContent = type.trim() + ' — no production system to diagram. SAS and CUNY have data flows.';
        frag.appendChild(note);
        ['.reward-label', '.rewards'].forEach(function (sel) {
          var el = card.querySelector(sel);
          if (el) frag.appendChild(el.cloneNode(true));
        });
      }
      return frag;
    }

    function fill(i) {
      body.innerHTML = '';
      body.appendChild(build(i));
      /* The pane is aria-hidden; nothing inside it may be reachable by tab. */
      body.querySelectorAll('a, [tabindex]').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
      body.querySelectorAll('.rewards .tag').forEach(function (t, n) {
        t.style.setProperty('--ti', n);
        t.addEventListener('click', function () { applySkill(norm(t)); });
      });
      syncPaneTags();
    }

    /* Swap with a measured height so the pane grows or shrinks to the
       new content instead of jumping: fade the old content out, measure
       the new content at its natural height, then animate the box
       between the two. Height is released back to auto afterwards so
       later reflows (fonts, resize) aren't fought by a stale value. */
    function render(i, animate) {
      idxEl.textContent = (i < 9 ? '0' : '') + (i + 1) + ' / ' + (rows.length < 10 ? '0' : '') + rows.length;
      var d = rows[i].querySelector('.quest-date');
      dateEl.textContent = d ? d.textContent.trim() : '';
      var my = ++token;
      if (!animate || softMotion) { fill(i); body.style.height = ''; return; }
      var from = body.offsetHeight;
      body.style.height = from + 'px';
      body.classList.remove('swap-in');
      body.classList.add('swap-out');
      setTimeout(function () {
        if (my !== token) return;               /* a newer click won */
        fill(i);
        pane.scrollTop = 0;
        body.style.height = 'auto';
        var to = body.offsetHeight;
        body.style.height = from + 'px';
        void body.offsetHeight;                 /* commit the start height */
        body.classList.remove('swap-out');
        body.classList.add('swap-in');
        body.style.height = to + 'px';
        var release = function (e) {
          if (e && (e.target !== body || e.propertyName !== 'height')) return;
          body.removeEventListener('transitionend', release);
          if (my === token) body.style.height = '';
        };
        body.addEventListener('transitionend', release);
        setTimeout(release, 650);
      }, 190);
    }

    /* The bracket is positioned from the row's real box, so it stays
       true through the entrance animations and any later reflow. */
    var curRaf = null;
    function moveCursor() {
      curRaf = null;
      if (active === -1 || !inMode()) return;
      var card = rows[active].querySelector('.quest-card');
      var lr = list.getBoundingClientRect(), cr = card.getBoundingClientRect();
      cursor.style.top = (cr.top - lr.top) + 'px';
      cursor.style.left = (cr.left - lr.left) + 'px';
      cursor.style.width = cr.width + 'px';
      cursor.style.height = cr.height + 'px';
      cursor.classList.add('on');
    }
    function queueCursor() { if (curRaf === null) curRaf = requestAnimationFrame(moveCursor); }

    function show(i, animate) {
      if (i === active) return;
      rows.forEach(function (q, n) {
        var c = q.querySelector('.quest-card');
        c.classList.toggle('is-active', n === i);
        c.setAttribute('aria-pressed', n === i ? 'true' : 'false');
      });
      active = i;
      pane.classList.remove('is-empty');
      render(i, animate);
      queueCursor();
    }

    /* Nothing is chosen until the reader asks: the pane opens on a
       prompt rather than pre-filling the first role. */
    function empty() {
      idxEl.textContent = '— / ' + (rows.length < 10 ? '0' : '') + rows.length;
      dateEl.textContent = '';
      body.innerHTML = '<p class="qp-empty"><span class="arrow" aria-hidden="true">←</span>Select a role to see how its data flows.</p>';
      pane.classList.add('is-empty');
    }

    /* Click (or Enter / Space on a focused row) selects. Hover only
       highlights the row — the pane never changes under a passing
       cursor. Links, buttons and tags inside a row keep their own job. */
    rows.forEach(function (q, i) {
      var card = q.querySelector('.quest-card');
      var cta = document.createElement('span');
      cta.className = 'qc-cta'; cta.setAttribute('aria-hidden', 'true');
      cta.innerHTML = '<b class="v">Viewing</b><b class="h">' + (card.querySelector('.qflow[data-title]') ? 'View flow' : 'View data flow') + ' →</b>';
      card.appendChild(cta);
      card.addEventListener('click', function (e) {
        if (!inMode() || e.target.closest('a, button, .tag')) return;
        show(i, true);
      });
      card.addEventListener('keydown', function (e) {
        if (!inMode() || e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i, true); }
      });
    });
    list.addEventListener('animationend', queueCursor);
    list.addEventListener('transitionend', queueCursor);
    window.addEventListener('resize', queueCursor, { passive: true });
    window.addEventListener('load', queueCursor);

    syncPaneTags = function () {
      var activeSkill = skills.active();
      body.querySelectorAll('.tag').forEach(function (t) {
        t.classList.toggle('skill-on', activeSkill !== null && norm(t) === activeSkill);
      });
    };

    function setMode() {
      var on = mq.matches;
      section.classList.toggle('pane-mode', on);
      rows.forEach(function (q) {
        var c = q.querySelector('.quest-card');
        if (on) { c.tabIndex = 0; c.setAttribute('aria-pressed', c.classList.contains('is-active') ? 'true' : 'false'); }
        else { c.removeAttribute('tabindex'); c.removeAttribute('aria-pressed'); }
      });
      if (on) { if (active === -1) empty(); else queueCursor(); }
      else cursor.classList.remove('on');
    }
    if (mq.addEventListener) mq.addEventListener('change', setMode); else mq.addListener(setMode);
    setMode();
  })();

  /* ══ Jump to the source ═══════════════════════════
     Key-result tiles and timeline rows are plain anchors, so they work
     with no script at all. With it, the card you land on pulses once,
     and in the desktop pane layout the role is selected into the pane
     — the figure you clicked is right there, in full. */
  (function () {
    var section = document.getElementById('experience');
    function land(target) {
      var card = target.classList.contains('quest') ? target.querySelector('.quest-card') : target;
      if (!card) return;
      if (section && section.classList.contains('pane-mode') &&
          target.classList.contains('quest') && !card.classList.contains('is-active')) card.click();
      card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
    }
    document.querySelectorAll('a.imp[href^="#"], a.tl-row[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        var t = document.querySelector(a.getAttribute('href'));
        if (t) setTimeout(function () { land(t); }, softMotion ? 0 : 500);
      });
    });
  })();

  /* ══ Timeline popover ═════════════════════════════
     Built once per hover from the role card the row points at — the
     card is the single source, so the popover can never disagree with
     it. Same hover-intent idea as the cards: a short dwell before it
     opens so a cursor sweeping down the chart doesn't strobe it, and a
     moment's grace before it closes so moving between bars swaps the
     content instead of blinking. */
  (function () {
    var fig = document.querySelector('.tline');
    if (!fig) return;
    var rows = [].slice.call(fig.querySelectorAll('.tl-row'));
    var hoverOK = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var pop = document.createElement('div');
    pop.className = 'tl-pop';
    pop.setAttribute('aria-hidden', 'true');
    fig.appendChild(pop);
    var openT = null, closeT = null, current = null;

    function text(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

    function fill(row) {
      var q = document.querySelector(row.getAttribute('href'));
      var card = q && q.querySelector('.quest-card');
      if (!card) return false;
      pop.innerHTML = '';
      var meta = document.createElement('div'); meta.className = 'tp-meta';
      var d = document.createElement('span'); d.className = 'd'; d.textContent = text(q.querySelector('.quest-date'));
      var t = document.createElement('span'); t.textContent = text(q.querySelector('.quest-type'));
      meta.appendChild(d); meta.appendChild(t); pop.appendChild(meta);
      var h = document.createElement('p'); h.className = 'tp-title'; h.textContent = text(card.querySelector('.quest-title'));
      pop.appendChild(h);
      var o = document.createElement('p'); o.className = 'tp-org'; o.textContent = text(card.querySelector('.quest-giver'));
      pop.appendChild(o);
      var b = card.querySelector('.quest-brief strong');
      if (b) { var bp = document.createElement('p'); bp.className = 'tp-brief'; bp.textContent = text(b); pop.appendChild(bp); }
      var lis = card.querySelectorAll('.objectives li');
      if (lis.length) {
        var ul = document.createElement('ul'); ul.className = 'tp-list';
        /* Cloned rather than re-typed so the <strong>/<mark> emphasis
           on figures and tools carries over. */
        [].forEach.call(lis, function (li) {
          var c = document.createElement('li'); c.innerHTML = li.innerHTML; ul.appendChild(c);
        });
        pop.appendChild(ul);
      }
      var hint = document.createElement('p'); hint.className = 'tp-hint'; hint.textContent = 'Click the bar to see its data flow';
      pop.appendChild(hint);
      return true;
    }

    function place(row) {
      var f = fig.getBoundingClientRect();
      var bar = row.querySelector('.tl-bar').getBoundingClientRect();
      var r = row.getBoundingClientRect();
      var w = pop.offsetWidth, hgt = pop.offsetHeight;
      var cx = bar.left + bar.width / 2 - f.left;
      var left = Math.max(12, Math.min(cx - w / 2, f.width - w - 12));
      /* Below the row by default; above it when there isn't room
         in the viewport underneath. */
      var below = r.bottom + hgt + 16 < window.innerHeight || r.top - hgt - 16 < 0;
      var top = below ? r.bottom - f.top + 8 : r.top - f.top - hgt - 8;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.style.setProperty('--ax', Math.max(14, Math.min(cx - left, w - 14)) + 'px');
      pop.classList.toggle('above', !below);
    }

    function open(row) {
      clearTimeout(closeT);
      if (current === row) return;
      if (!fill(row)) return;
      rows.forEach(function (x) { x.classList.toggle('is-pop', x === row); });
      current = row;
      place(row);
      pop.classList.add('show');
    }
    function close() {
      pop.classList.remove('show');
      rows.forEach(function (x) { x.classList.remove('is-pop'); });
      current = null;
    }

    rows.forEach(function (row) {
      if (hoverOK) {
        row.addEventListener('mouseenter', function () {
          clearTimeout(openT); clearTimeout(closeT);
          /* Already showing one: swap straight away. Cold: dwell. */
          if (current) open(row);
          else openT = setTimeout(function () { open(row); }, 140);
        });
        row.addEventListener('mouseleave', function () {
          clearTimeout(openT);
          closeT = setTimeout(close, 180);
        });
        row.addEventListener('click', function () { clearTimeout(openT); close(); });
      }
      /* Keyboard users get the same readout on focus. */
      row.addEventListener('focus', function () { if (row.matches(':focus-visible')) open(row); });
      row.addEventListener('blur', function () { close(); });
    });
    window.addEventListener('scroll', function () { if (current) place(current); }, { passive: true });
    window.addEventListener('resize', function () { if (current) place(current); }, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) close(); });
  })();
})();
