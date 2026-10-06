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
  var NODE_W = 284, NODE_H = 46, GAP = 26, LEFT = 14, WIRE_X = 34;

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

    spec.edges.forEach(function (e, n) {
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
        packets.push('<path class="ff" data-step="' + b + '" d="' + d + '" pathLength="100" style="animation-delay:' +
                     (n * 0.5).toFixed(1) + 's"/>');
      }
    });
    out = out.concat(wires, packets);

    Object.keys(spec.badges || {}).forEach(function (i) {
      var y = r0(ys[i - 1] + NODE_H + GAP / 2 + 3.5);
      out.push('<text class="vb" x="' + (WIRE_X + 12) + '" y="' + y + '">' + esc(spec.badges[i]) + '</text>');
    });

    spec.nodes.forEach(function (node, i) {
      var y = ys[i], num = (i < 9 ? '0' : '') + (i + 1);
      out.push('<g class="fn" data-step="' + (i + 1) + '">' +
        '<rect x="' + LEFT + '" y="' + y + '" width="' + NODE_W + '" height="' + NODE_H + '"/>' +
        '<rect class="no" x="' + LEFT + '" y="' + y + '" width="26" height="' + NODE_H + '"/>' +
        '<text class="nn" x="' + (LEFT + 13) + '" y="' + r0(y + NODE_H / 2 + 3.5) + '" text-anchor="middle">' + num + '</text>' +
        '<text class="k" x="' + (LEFT + 38) + '" y="' + (y + 18) + '">' + esc(node[0]) + '</text>' +
        '<text class="v" x="' + (LEFT + 38) + '" y="' + (y + 36) + '">' + esc(node[1]) + '</text></g>');
    });

    return '<svg class="vf" viewBox="0 0 340 ' + height + '" role="img" aria-label="' + esc(spec.label) +
           '" focusable="false">' + out.join('') + '</svg>';
  }

  document.querySelectorAll('[data-flow]').forEach(function (el) {
    var spec = FLOWS[el.getAttribute('data-flow')];
    if (spec) el.innerHTML = render(spec);
  });

  /* ── Step tracing ─────────────────────────────────
     Delegated, because the pane's copy of a flow is rebuilt on every
     selection. Resting on a step (or a node) lights that node and the
     wire into it; everything else recedes. */
  function trace(flow, n) {
    var svg = flow.querySelector('.vf'); if (!svg) return;
    svg.classList.toggle('tracing', n !== null);
    [].forEach.call(svg.querySelectorAll('[data-step]'), function (el) {
      el.classList.toggle('on', n !== null && el.getAttribute('data-step') === n);
    });
    [].forEach.call(flow.querySelectorAll('.qf-step'), function (li) {
      li.classList.toggle('on', n !== null && li.getAttribute('data-step') === n);
    });
  }
  var SEL = '.qflow .qf-step, .qflow .fn';
  document.addEventListener('mouseover', function (e) {
    var hit = e.target.closest && e.target.closest(SEL);
    if (hit) trace(hit.closest('.qflow'), hit.getAttribute('data-step'));
  });
  document.addEventListener('mouseout', function (e) {
    var hit = e.target.closest && e.target.closest(SEL);
    if (!hit || (e.relatedTarget && hit.contains(e.relatedTarget))) return;
    trace(hit.closest('.qflow'), null);
  });
})();
