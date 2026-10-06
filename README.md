# Zhicheng Yu — portfolio

Personal site served by GitHub Pages at <https://zhichengu1.github.io/>.
Plain HTML, CSS and JavaScript — no framework, no build step, no dependencies
beyond Google Fonts and Font Awesome from a CDN.

## Run it locally

Open `index.html` in a browser, or serve the folder so links behave exactly as
they do online:

```sh
python -m http.server 8000   # then visit http://localhost:8000
```

## Layout

```
index.html            Home page markup (content lives here)
css/                  Home page styles, loaded in this order:
  tokens.css            colours, fonts, timing — every value the rest uses
  base.css              reset, element defaults, utilities
  background.css        animated wallpaper behind the page
  chrome.css            nav, progress bar, cursor, footer, page fade
  components.css        panels, buttons, tags, card layers, section headers
  hero.css              intro: name, recruiter brief, key results
  experience.css        timeline, role list, data-flow side pane
  flows.css             data-flow diagram styling
  projects.css          project grid and cards
  skills-contact.css    skills table and contact block
  print.css             print / save-as-PDF layout (always last)
js/                   Home page behaviour, loaded in this order:
  site.js               shared flags (window.Site), nav, scroll, reveal, clock
  cursor.js             cursor reticle
  cards.js              card hover layers, "Details" pins, expand-all
  skills.js             skill filter + evidence table (exposes Site.skills)
  flows.js              data-flow diagram DATA and renderer
  experience.js         rail, side pane, timeline popover (needs Site.skills)
  hero-field.js         hero dot-field canvas
project.html          All-projects archive
Goodhub.html          GoodHub case study
Moodify.html          Moodify case study
css/case-study.css    styles for both case studies (one shared file)
css/archive.css       styles for project.html
js/case-study.js      behaviour for both case studies
js/archive.js         behaviour for project.html
download.png          portrait; also the link-preview image
```

Scripts are plain (non-module) files, so the site also works when opened
straight from disk. Order matters only in that `site.js` comes first and
`skills.js` comes before `experience.js`.

## Common edits

**Add or change a role** — in `index.html`, each role is an
`<article class="quest" id="role-…" data-short="…">` inside `#quest-list`.
Copy an existing one. `data-short` is the short name the skills table shows.
Then add a matching row to the timeline (`figure.tline`): `--s` and `--e` are
the bar's start and end as a percentage of Mar 2024 – Aug 2026 (30 months,
so one month ≈ 3.333%). If the axis needs to grow, change the year markers
(`--x`) and the year gridlines in `css/experience.css` together.

**Add or change a project** — `index.html`, `<article class="mission" id="proj-…" data-short="…">`
inside `.missions-grid`. Add `feature` to the class to make a card full width.

**Edit a data-flow diagram** — never edit SVG. Diagrams are data in
`js/flows.js` (`FLOWS`), drawn into any element with `data-flow="<key>"`.
Each node is `[label, value]`; edges join nodes by their 1-based position
(`[from, to]`, or `[from, to, 'dash']` for a dashed check/loop). The numbered
"How the data flows" steps beside a diagram are plain HTML next to it.

**Add a skill** — add an `<li class="sk" data-keys="…">` to a group in the
skills section. `data-keys` is the tag text it should match on the role and
project cards (several alternatives separated by `|`). The "where used" line
and the pips are computed from those tags, so a skill can't claim experience
the page doesn't show — add the tag to the right card first.

**Change a colour, font or timing** — `css/tokens.css` only. The page has
exactly one accent colour, `--sig`; it means *live, measured or actionable*.
If you change a text colour, re-check contrast against all four background
steps (the page claims WCAG AA).

## Conventions

- **Type:** sans for anything read as language, mono for anything read as data
  (labels, dates, tags, figures), the serif italic only for the accent word in
  a display heading.
- **Motion:** animate `transform` and `opacity` only. Every effect has a
  `prefers-reduced-motion` fallback. Entrances *fail open*: the resting style
  is the finished state, and animation only runs once JS adds `.visible`, so
  if scripts fail nothing is left hidden.
- **Hover:** shared timing tokens (`--t-in` fast, `--t-out` slow); only things
  you can act on lift or move.
- **No-JS honesty:** tags, skill rows and tabs are plain text in the markup and
  become buttons only once the script that powers them has loaded.
- **Class names** such as `quest`, `mission` and `sidequest` are historical
  (roles, projects, in-progress project). They are kept because the scripts
  depend on them.
- **Each fact once:** before adding a block, check the fact isn't already
  stated elsewhere on the page.
