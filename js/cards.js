/* Card behaviour shared by role and project cards: tag stagger indices,
   the hover-intent "Details" pin, expand-all, the pointer scan wash, and
   the decorative scan/spot layers injected into each card. */
(function () {
  'use strict';
  var reduceMotion = Site.reduceMotion, finePointer = Site.finePointer;

  /* ── Tag stagger index ─────────────────────────────
     Set once so the deal-in delay is per-tag rather than per-card. */
  document.querySelectorAll('.rewards, .mission-tags').forEach(function (row) {
    [].forEach.call(row.children, function (t, i) { t.style.setProperty('--ti', i); });
  });

  /* Hover opens the cards (see the hover-intent CSS above — the delay
     lives there, not here, so a cursor sweeping the page costs nothing).
     This only handles the pin: the explicit "keep it open after I move
     away" state, which is also how a keyboard or a touch tap gets the
     same result.

     It's a toggle button, not a disclosure trigger any more, so it
     reports aria-pressed. The panel itself is reachable by tab either
     way, because :focus-within opens the card the moment focus lands
     inside it. */
  const peeks = [...document.querySelectorAll('.peek')];
  function peekLabel(btn) {
    const card = btn._card;
    const pinned = card.classList.contains('pinned');
    const txt = btn.querySelector('span');
    const icon = btn.querySelector('i');
    if (txt) txt.textContent = pinned ? 'Pinned' : 'Details';
    if (icon) icon.className = pinned ? 'fas fa-thumbtack' : 'fas fa-chevron-down';
    btn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
    /* The accessible name has to start with the visible label, or
       speech-input users saying what they can read on the button won't
       hit it (WCAG 2.5.3). */
    btn.setAttribute('aria-label', pinned
      ? 'Pinned — click to release details'
      : 'Details — click to keep open');
  }
  peeks.forEach((btn, i) => {
    const card = btn.closest('.quest-card, .mission');
    const detail = card && card.querySelector('.detail');
    if (!detail) return;
    detail.id = detail.id || 'detail-' + i;
    btn.setAttribute('aria-controls', detail.id);
    btn.removeAttribute('aria-expanded');
    btn._card = card;
    peekLabel(btn);
    btn.addEventListener('click', e => {
      card.classList.toggle('pinned');
      peekLabel(btn);
      syncExpandAll();
      /* :focus-within is what lets a keyboard open a card, but after a
         mouse click the button keeps focus and the card can never close
         again — you click to release it and nothing happens. Drop focus
         for pointer activation only; e.detail is 0 when the button was
         hit with a key, and focus has to stay for that. */
      if (e.detail > 0) btn.blur();
    });
  });

  /* Pin or release every experience entry at once. */
  const expandAll = document.getElementById('expand-all');
  const questPeeks = peeks.filter(b => b._card && b._card.classList.contains('quest-card'));
  function syncExpandAll() {
    if (!expandAll || !questPeeks.length) return;
    const allPinned = questPeeks.every(b => b._card.classList.contains('pinned'));
    expandAll.setAttribute('aria-pressed', allPinned ? 'true' : 'false');
    expandAll.querySelector('span').textContent = allPinned ? 'Collapse all details' : 'Expand all details';
    expandAll.querySelector('i').className = allPinned ? 'fas fa-thumbtack' : 'fas fa-chevron-down';
  }
  if (expandAll) {
    expandAll.removeAttribute('aria-expanded');
    expandAll.addEventListener('click', () => {
      const pin = expandAll.getAttribute('aria-pressed') !== 'true';
      questPeeks.forEach(b => {
        b._card.classList.toggle('pinned', pin);
        peekLabel(b);
      });
      syncExpandAll();
    });
    syncExpandAll();
  }

  /* Pointer position — writes --mx / --my (percent within the card) for the
     scan wash and the spot border light in css/components.css. Only
     custom properties, never a transform: no geometry is invalidated, the
     compositor just repaints a gradient. */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.quest-card, .mission, .sidequest, .stat-panel').forEach(card => {
      let raf = null, lastE = null;
      card.addEventListener('mousemove', e => {
        lastE = e;
        if (raf !== null) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (((lastE.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (((lastE.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
        });
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      });
    });
  }

  /* ── Decorative card layers ────────────────────
     Role and project cards carry <span class="scan"> in the markup; the
     recruiter brief (.stat-panel) gets its scan here. Every card also gets
     a .spot (the pointer-following border light). Both are decoration, so
     a no-JS page simply lacks them. */
  document.querySelectorAll('.stat-panel').forEach(function (el) {
    if (el.querySelector(':scope > .scan')) return;
    var sc = document.createElement('span');
    sc.className = 'scan'; sc.setAttribute('aria-hidden', 'true');
    el.insertBefore(sc, el.firstChild);
  });

  document.querySelectorAll('.quest-card, .mission, .sidequest, .stat-panel').forEach(function (card) {
    var t = document.createElement('span');
    t.className = 'spot'; t.setAttribute('aria-hidden', 'true');
    card.appendChild(t);
  });
})();
