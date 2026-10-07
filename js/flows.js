/* Data-flow diagrams.

   Each diagram is described once, as data, in FLOWS below, and drawn into
   any element carrying data-flow="<key>". To change a diagram, edit its
   entry here — never the SVG in the page (there isn't any).

   A flow is a vertical column of nodes, numbered in the order the data
   moves. Its edges connect nodes by their 1-based position:
     [from, to]          solid wire with a moving packet
     [from, to, 'dash']  dashed wire, no packet (a check or a feedback loop)
   Adjacent nodes are joined by a straight wire down the left; any other
   pair by a bracket round the right edge. `badges` prints a short label
   beside the wire leaving node N.

   Every label must be a fact already stated on the page. The numbered
   step text under each diagram lives in index.html, next to the role. */
(function () {
  'use strict';

  var FLOWS = {
    sas: {
      label: 'SAS risk monitoring data flow: API error telemetry, Python pipelines, failure-rate and latency metrics, SAS Viya dashboard views, Risk Testing team triage; verified with pytest and Locust',
      nodes: [['SOURCE · HIGH VOLUME', 'API error telemetry'], ['INGEST · AUTOMATED', 'Python pipelines'],
              ['METRICS', 'Failure rate · latency'], ['SAS VIYA', 'Dashboard views'],
              ['RISK TESTING TEAM', 'Triage in one screen'], ['VERIFY · UNDER LOAD', 'pytest · Locust']],
      edges: [[1, 2], [2, 3], [3, 4], [4, 5], [6, 2, 'dash']]
    },
    cuny: {
      label: 'CUNY dashboard data flow: 10,000+ records, Flask REST API, internal dashboard, 500+ users across 25 campuses; Brightspace LMS certificate widget',
      nodes: [['DATA', '10,000+ records'], ['API · BUILT 0→1', 'Flask REST API'],
              ['UI · 5+ WCAG COMPONENTS', 'Internal dashboard'], ['REACH', '500+ users · 25 campuses'],
              ['BRIGHTSPACE LMS WIDGET', 'One-click certificates']],
      edges: [[1, 2], [2, 3], [3, 4], [5, 4]],
      badges: { 1: 'CRUD · pagination', 2: '~60% faster initial load' }
    },
    ebay: {
      label: 'Scaling architecture studied at eBay: traffic surges, load balancing, microservices, caching, sharding across millions of listings',
      nodes: [['TRAFFIC · 10× SURGES', 'Incoming requests'], ['LOAD BALANCING', 'Spread across servers'],
              ['MICROSERVICES', 'Services scale independently'], ['CACHING', 'Hot reads kept off the DB'],
              ['SHARDING', 'Millions of listings']],
      edges: [[1, 2], [2, 3], [3, 4], [4, 5]]
    },
    google: {
      label: 'Google Code2Career practice loop: workshops, design an approach, complexity analysis, implement in Python or C++, mock interview feedback, iterate',
      nodes: [['12+ WORKSHOPS', 'Algorithms · system design'], ['DESIGN', 'Choose an approach'],
              ['ANALYZE', 'Time & space complexity'], ['IMPLEMENT', 'Python · C++'],
              ['MOCK INTERVIEW', 'Feedback from Google engineers']],
      edges: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 2, 'dash']]
    },
    sbu: {
      label: 'Stony Brook teaching loop: 10+ problem sets and quizzes, 50+ freshmen in CSE 101, at-risk students, 1:1 tutoring, 15% class-wide score improvement',
      nodes: [['MATERIALS · 10+', 'Problem sets · quizzes'], ['CSE 101 · PYTHON', '50+ freshmen'],
              ['SUPPORT', 'At-risk students'], ['1:1 TUTORING', 'Targeted help'],
              ['OUTCOME', '+15% class-wide scores']],
      edges: [[1, 2], [2, 3], [3, 4], [4, 5]]
    },
    summa: {
      label: 'Summa data flow: SEC EDGAR, scheduled Python pipelines on GitHub Actions, normalised Postgres warehouse of 20+ tables, Next.js 14 research dashboard; $0 infrastructure',
      nodes: [['SOURCE', 'SEC EDGAR'], ['SCHEDULED · GITHUB ACTIONS', 'Python pipelines'],
              ['WAREHOUSE · NORMALISED', 'Postgres · 20+ tables'], ['NEXT.JS 14', 'Research dashboard'],
              ['INFRASTRUCTURE', '$0 · fully automated']],
      edges: [[1, 2], [2, 3], [3, 4], [5, 2, 'dash']],
      badges: { 1: '10-K/10-Q · insider trades · 13F' }
    },
    goodhub: {
      label: 'GoodHub data flow: volunteer geolocation, nearby live project listings, React and Leaflet map, sign-up; Python and Flask backend',
      nodes: [['GEOLOCATION', 'Volunteer'], ['FILTER · LIVE LISTINGS', 'Nearby projects'],
              ['REACT · LEAFLET', 'Map view'], ['END TO END', 'Sign-up'], ['BACKEND', 'Python · Flask']],
      edges: [[1, 2], [2, 3], [3, 4], [5, 2]]
    },
    moodify: {
      label: 'Moodify data flow: Spotify OAuth with token refresh, Spotify Web API history, genres and artists, the chosen mood, a Flask playlist builder with 8 endpoints, the mood playlist',
      nodes: [['AUTO TOKEN REFRESH', 'Spotify OAuth'], ['SPOTIFY WEB API', 'History · genres · artists'],
              ['LISTENER INPUT', 'Chosen mood'], ['FLASK · 8 ENDPOINTS', 'Playlist builder'], ['OUTPUT', 'Mood playlist']],
      edges: [[1, 2], [2, 4], [3, 4], [4, 5]],
      badges: { 3: 'weighted to taste' }
    }
  };

  /* Geometry, in viewBox units (the SVG scales to its container). */
  var NODE_W = 284, NODE_H = 36, GAP = 22, LEFT = 14, WIRE_X = 34;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* Half-to-even rounding, so text baselines land on the same pixel the
     original generator put them on. */
  function r0(n) {
    var f = Math.floor(n);
    return n - f === 0.5 ? (f % 2 === 0 ? f : f + 1) : Math.round(n);
  }

  function render(spec) {
    var ys = spec.nodes.map(function (_, i) { return 12 + i * (NODE_H + GAP); });
    var height = ys[ys.length - 1] + NODE_H + 12;
    var wires = [], packets = [], out = [];

    spec.edges.forEach(function (e) {
      var a = e[0], b = e[1], dash = e[2] === 'dash';
      var ya = ys[a - 1], yb = ys[b - 1], d;
      if (Math.abs(a - b) === 1) {
        d = b > a ? 'M' + WIRE_X + ' ' + (ya + NODE_H) + ' V' + yb
                  : 'M' + WIRE_X + ' ' + ya + ' V' + (yb + NODE_H);
      } else {
        var xr = LEFT + NODE_W;
        d = 'M' + xr + ' ' + r0(ya + NODE_H / 2) + ' H' + (xr + 16) + ' V' + r0(yb + NODE_H / 2) + ' H' + xr;
      }
      wires.push('<path class="' + (dash ? 'fe dash' : 'fe') + '" data-step="' + b + '" d="' + d + '"/>');
      if (!dash) {
        packets.push('<path class="ff" data-step="' + b + '" d="' + d + '" pathLength="100"/>');
      }
    });
    out = out.concat(wires, packets);

    Object.keys(spec.badges || {}).forEach(function (i) {
      var y = r0(ys[i - 1] + NODE_H + GAP / 2 + 3.5);
      out.push('<text class="vb" x="' + (WIRE_X + 12) + '" y="' + y + '">' + esc(spec.badges[i]) + '</text>');
    });

    spec.nodes.forEach(function (node, i) {
      var y = ys[i], num = (i < 9 ? '0' : '') + (i + 1);
      /* Nodes carry only the value; the kicker moves to the readout,
         shown when the reader rests on the node. */
      out.push('<g class="fn" data-step="' + (i + 1) + '">' +
        '<rect x="' + LEFT + '" y="' + y + '" width="' + NODE_W + '" height="' + NODE_H + '"/>' +
        '<rect class="no" x="' + LEFT + '" y="' + y + '" width="26" height="' + NODE_H + '"/>' +
        '<text class="nn" x="' + (LEFT + 13) + '" y="' + r0(y + NODE_H / 2 + 3.5) + '" text-anchor="middle">' + num + '</text>' +
        '<text class="v" x="' + (LEFT + 38) + '" y="' + r0(y + NODE_H / 2 + 4.5) + '">' + esc(node[1]) + '</text></g>');
    });

    return '<svg class="vf" viewBox="0 0 340 ' + height + '" role="img" aria-label="' + esc(spec.label) +
           '" focusable="false">' + out.join('') + '</svg>';
  }

  /* The readout replaces the paragraph list: one word per step, and a
     single line of detail only for the step being looked at. Words come
     from the role's numbered steps when it has them, else the node. */
  function readout(el, spec) {
    var qflow = el.closest('.qflow');
    var steps = qflow ? [].slice.call(qflow.querySelectorAll('.qf-step')) : [];
    if (steps.length) qflow.classList.add('has-readout');
    var chips = spec.nodes.map(function (node, i) {
      var li = steps[i], b = li && li.querySelector('b');
      var word = b ? b.textContent.trim() : node[1];
      var detail = li ? li.textContent.replace(/^\s*\d+/, '').replace(word, '').replace(/\s+/g, ' ').trim() : '';
      return '<span class="qf-chip" data-step="' + (i + 1) + '" data-k="' + esc(node[0]) + '" data-d="' +
             esc(detail || node[1]) + '">' + esc(word) + '</span>';
    });
    /* Without step words the chips would only repeat the node labels, so
       they stay in the DOM (trace() reads the detail from them) but hidden. */
    return '<div class="qf-read" aria-hidden="true"><div class="qf-chips' + (steps.length ? '' : ' bare') + '">' +
           chips.join('') + '</div><p class="qf-detail"><span class="hint">' + HINT + '</span></p></div>';
  }
  var HINT = Site.finePointer ? 'Hover a step' : 'Tap a step';

  document.querySelectorAll('[data-flow]').forEach(function (el) {
    var spec = FLOWS[el.getAttribute('data-flow')];
    if (spec) el.innerHTML = render(spec) + readout(el, spec);
  });

  /* ── Pulse ────────────────────────────────────────
     A packet runs the chain in order; each node lights as it arrives and
     stays lit until the run completes, then the chain clears and starts
     again. One timer drives every diagram on screen; a diagram being
     looked at is held, and when the cursor leaves it restarts from 01. */
  var TICK = 850;
  function stepOf(wrap) { return wrap._step || 0; }
  function paint(wrap, k) {
    wrap._step = k;
    var n = wrap.querySelectorAll('.fn').length;
    [].forEach.call(wrap.querySelectorAll('.vf [data-step], .qf-chip'), function (el) {
      var s = +el.getAttribute('data-step');
      el.classList.toggle('hot', s === k);
      el.classList.toggle('seen', k > 0 && s < k);
    });
    wrap.classList.toggle('done', k > n);
  }
  function inView(el) {
    if (!el.offsetParent) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  if (!Site.reduceMotion) {
    setInterval(function () {
      document.querySelectorAll('.vf-wrap').forEach(function (wrap) {
        if (wrap._hold || !inView(wrap)) return;
        var n = wrap.querySelectorAll('.fn').length;
        var k = stepOf(wrap) + 1;
        paint(wrap, k > n + 2 ? 0 : k);          /* two beats fully lit, then clear */
      });
    }, TICK);
  }

  /* ── Step tracing ─────────────────────────────────
     Delegated, because the pane's copy of a flow is rebuilt on every
     selection. Resting on a node or a step word lights that node and
     the wire into it, and prints its one line of detail. */
  function trace(wrap, n) {
    var svg = wrap.querySelector('.vf'); if (!svg) return;
    svg.classList.toggle('tracing', n !== null);
    [].forEach.call(wrap.querySelectorAll('.vf [data-step], .qf-chip'), function (el) {
      el.classList.toggle('on', n !== null && el.getAttribute('data-step') === n);
    });
    var out = wrap.querySelector('.qf-detail'); if (!out) return;
    var chip = n !== null && wrap.querySelector('.qf-chip[data-step="' + n + '"]');
    out.innerHTML = chip
      ? '<span class="k">' + esc(chip.getAttribute('data-k')) + '</span>' + esc(chip.getAttribute('data-d'))
      : '<span class="hint">' + HINT + '</span>';
  }
  var SEL = '.vf-wrap .fn, .vf-wrap .qf-chip';
  document.addEventListener('mouseover', function (e) {
    var hit = e.target.closest && e.target.closest(SEL);
    if (!hit) return;
    var wrap = hit.closest('.vf-wrap');
    wrap._hold = true;
    paint(wrap, 0);
    trace(wrap, hit.getAttribute('data-step'));
  });
  /* Leaving the diagram altogether puts it back where it began: nothing
     traced, the pulse starting over from the first node. */
  document.addEventListener('mouseout', function (e) {
    var wrap = e.target.closest && e.target.closest('.vf-wrap');
    if (!wrap) return;
    var to = e.relatedTarget;
    if (to && wrap.contains(to)) {
      if (!to.closest(SEL)) trace(wrap, null);
      return;
    }
    trace(wrap, null);
    wrap._hold = false;
    paint(wrap, 0);
  });
})();
