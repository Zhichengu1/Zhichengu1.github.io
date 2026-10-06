/* Skill filter + the evidence-linked skills table.

   Public API (Site.skills): norm(el), apply(key), clear(), active(),
   onChange(fn). The experience pane uses it to keep its cloned tags in
   step with the filter. */
(function () {
  'use strict';
  var softMotion = Site.reduceMotion;

  /* ══ Skill filter ═════════════════════════════════
     Tags are spans in the markup — semantically they are
     labels, and they only become controls once this script confirms
     the behaviour exists. Promoting them here (rather than shipping
     <button> in the HTML) keeps the no-JS page honest: without this
     file they are still just labels, and nothing advertises an
     affordance that would not work. */
  var tags = [].slice.call(document.querySelectorAll('.tag'));
  /* Match on a folded key, not the literal label: the skills table says
     "REST APIs" and "System design" while the tags say "REST API" and
     "System Design", and a reviewer clicking one plainly means both.
     Punctuation and spacing go, a trailing plural goes, and + / # stay
     so C++ and C# survive. The visible label still comes from the
     element's own text — only the comparison is normalised. */
  var norm = function (el) {
    return (el.textContent || '').trim().toLowerCase()
      .replace(/[^a-z0-9+#]+/g, '')
      .replace(/s$/, '');
  };
  var bar = document.getElementById('skillbar');
  var barText = document.getElementById('skillbar-text');
  var activeSkill = null;
  /* Anything that mirrors the filter state (the evidence table, the
     experience pane's copy of a tag row) subscribes here instead of being
     called by name, so this file doesn't need to know who is listening. */
  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function notify() { listeners.forEach(function (fn) { fn(activeSkill); }); }

  function clearSkill() {
    activeSkill = null;
    document.body.classList.remove('skill-filter');
    tags.forEach(function (t) { t.classList.remove('skill-on'); t.setAttribute('aria-pressed', 'false'); });
    document.querySelectorAll('.skill-hit').forEach(function (c) { c.classList.remove('skill-hit'); });
    bar.classList.remove('show');
    notify();
  }

  function applySkill(name) {
    if (activeSkill === name) { clearSkill(); return; }
    activeSkill = name;
    document.body.classList.add('skill-filter');
    document.querySelectorAll('.skill-hit').forEach(function (c) { c.classList.remove('skill-hit'); });
    /* A class removed and re-added in the same frame never restarts
       its animation; reading layout in between forces the reset, so
       cards found by consecutive filters pulse every time. */
    void document.body.offsetWidth;
    var hits = 0, cards = 0;
    tags.forEach(function (t) {
      var on = norm(t) === name;
      t.classList.toggle('skill-on', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (!on) return;
      hits++;
      var card = t.closest('.quest-card, .mission, .sidequest');
      if (card && !card.classList.contains('skill-hit')) { card.classList.add('skill-hit'); cards++; }
    });
    var label = tags.filter(function (t) { return norm(t) === name; })[0];
    barText.innerHTML = '<b></b> <span class="n"></span>';
    barText.querySelector('b').textContent = label ? label.textContent.trim() : name;
    barText.querySelector('.n').textContent =
      hits + (hits === 1 ? ' mention' : ' mentions') + ' across ' + cards + (cards === 1 ? ' card' : ' cards');
    bar.classList.add('show');
    notify();
  }

  tags.forEach(function (t) {
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-pressed', 'false');
    t.title = 'Filter the page by this skill';
    t.addEventListener('click', function () { applySkill(norm(t)); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applySkill(norm(t)); }
    });
  });
  document.getElementById('skillbar-clear').addEventListener('click', clearSkill);

  /* Escape clears an active skill filter. The skill bar's own Clear
     button does the same thing; this is the keyboard route to it. */
  document.addEventListener('keydown', function (e) {
    var el = document.activeElement;
    var typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (e.key === 'Escape' && activeSkill && !typing) clearSkill();
  });

  /* ══ Skills with receipts ═════════════════════════
     The evidence is computed from the page, not typed in: for each
     skill, find every role or project card carrying a matching tag and
     list it. Add a tag to a card and the table updates itself; nothing
     here can claim a skill the rest of the page doesn't back up. */
  (function () {
    var items = [].slice.call(document.querySelectorAll('.sk[data-keys]'));
    if (!items.length) return;
    var foldText = function (s) {
      return s.trim().toLowerCase().replace(/[^a-z0-9+#]+/g, '').replace(/s$/, '');
    };
    var cardTags = [].slice.call(document.querySelectorAll('.quest-card .tag, .mission .tag, .sidequest .tag'));
    items.forEach(function (li) {
      var keys = li.dataset.keys.split('|').map(foldText);
      var hosts = [], names = [];
      cardTags.forEach(function (t) {
        if (keys.indexOf(norm(t)) === -1) return;
        var host = t.closest('[data-short]');
        if (!host || hosts.indexOf(host) !== -1) return;
        hosts.push(host); names.push(host.dataset.short);
      });
      li._keys = keys;
      var label = li.querySelector('.sk-name').textContent;
      li.querySelector('.sk-where').textContent = names.length ? names.join(' · ') : '';
      var pips = li.querySelector('.sk-pips');
      for (var i = 0; i < 5; i++) {
        var d = document.createElement('i');
        if (i < names.length) d.className = 'on';
        pips.appendChild(d);
      }
      if (!names.length) return;
      /* Filter by whichever key actually occurs on a card. */
      var key = keys.filter(function (k) {
        return cardTags.some(function (t) { return norm(t) === k; });
      })[0];
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.setAttribute('aria-pressed', 'false');
      li.setAttribute('aria-label', label + ' — used at ' + names.join(', ') + '. Highlight on page');
      li.addEventListener('click', function () { applySkill(key); });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applySkill(key); }
      });
    });
    onChange(function () {
      items.forEach(function (li) {
        var on = activeSkill !== null && li._keys.indexOf(activeSkill) !== -1;
        li.classList.toggle('skill-on', on);
        if (li.hasAttribute('role')) li.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    });
  })();

  Site.skills = {
    norm: norm,
    apply: applySkill,
    clear: clearSkill,
    active: function () { return activeSkill; },
    onChange: onChange
  };
})();
