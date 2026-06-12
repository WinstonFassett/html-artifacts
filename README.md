# HTML Artifacts Archive

A collection of **single-file HTML artifacts** that run with no build step — the kind you can paste into an artifact host (Claude artifacts, CodePen, Val Town) or just open in a browser. Plus the skills, platforms, and prior art for generating them.

**Browse it:** open [`index.html`](index.html) — a searchable gallery with live thumbnails. Click any card to run it fullscreen.

```
.
├── index.html          ← browsable gallery (search + tag/source filter, live previews)
├── README.md           ← this file
├── RESEARCH.md         ← deep-research findings (4 rounds, source-verified)
├── starters/           ← 24 hand-built, tested single-file starters
├── examples/
│   ├── html-anything/  ← 87 runnable templates extracted from nexu-io/html-anything
│   └── interactive/    ← pulled real-world examples (Mermaid viewers, d3-graphviz)
├── skills/             ← AI skills that generate HTML artifacts
├── platforms/          ← artifact generator platforms (open-artifacts, vibes.diy, anthropic skills)
└── collections/        ← awesome-lists / galleries
```

## The core idea

Single-file HTML artifacts split into two loading modes — encoded in filenames and shown as a badge in the gallery:

| Mode | Suffix | Mechanism | Runs from `file://`? |
|------|--------|-----------|----------------------|
| **Script-tag / UMD** | _(none)_ | `<script src>` globals, import maps with script tags | ✅ yes |
| **ES modules** | `-esm` | `import` statements, ESM CDN URLs | ❌ no — needs an HTTP server (CORS) |

The enabling tech is **import maps** (baseline in all browsers since March 2023) + ESM CDNs (esm.sh, jsDelivr's `+esm`/esm.run). For JSX/TSX with no build: **esm.sh/tsx** (ESM) or **Babel Standalone / htm** (`file://`-safe). See [RESEARCH.md](RESEARCH.md) for the full breakdown.

## Starters

All 24 are tested (rendered output verified, zero console errors). 🟢 = runs from `file://`, 🟠 = needs HTTP.

### React / reactive apps
| Starter | What | Mode |
|---------|------|------|
| [react-18-tsx-esm](starters/react-18-tsx-esm.html) | React 18 + JSX via esm.sh/tsx | 🟠 |
| [react-19-tsx-esm](starters/react-19-tsx-esm.html) | React 19 + JSX via esm.sh/tsx | 🟠 |
| [react-18-babel](starters/react-18-babel.html) | React 18 + Babel Standalone (classic CommonJS-style JSX) | 🟢 |
| [react-htm](starters/react-htm.html) | React + htm tagged templates, ~600B, no transform | 🟢 |
| [react-fireproof-esm](starters/react-fireproof-esm.html) | React + Fireproof → **persists to IndexedDB** | 🟠 |
| [petite-vue](starters/petite-vue.html) | Vue-style reactivity, ~6KB | 🟠 |
| [alpine](starters/alpine.html) | Alpine.js reactive directives in plain HTML | 🟢 |

### Charts & data viz
| Starter | What | Mode |
|---------|------|------|
| [chartjs](starters/chartjs.html) | Chart.js bar chart | 🟢 |
| [vega-lite](starters/vega-lite.html) | Declarative Vega-Lite | 🟢 |
| [plotly](starters/plotly.html) | Plotly interactive scatter | 🟢 |
| [d3-force-esm](starters/d3-force-esm.html) | Draggable D3 force-directed graph | 🟠 |
| [leaflet-map](starters/leaflet-map.html) | Leaflet OpenStreetMap with markers | 🟢 |

### Diagrams
| Starter | What | Mode |
|---------|------|------|
| [mermaid-esm](starters/mermaid-esm.html) | Live Mermaid editor — type syntax, renders | 🟠 |

### Decks / presentations
| Starter | What | Mode |
|---------|------|------|
| [reveal-deck](starters/reveal-deck.html) | reveal.js — fragments, vertical slides, speaker notes | 🟠 |
| [impress-deck](starters/impress-deck.html) | impress.js — 3D canvas presentation | 🟢 |

### Motion / animation
| Starter | What | Mode |
|---------|------|------|
| [gsap-motion](starters/gsap-motion.html) | GSAP timeline | 🟢 |
| [anime](starters/anime.html) | anime.js v4 staggered grid | 🟠 |
| [motion-esm](starters/motion-esm.html) | Motion (motion.dev) scroll + spring | 🟠 |
| [lottie](starters/lottie.html) | Lottie After Effects JSON player | 🟢 |

### Canvas / 3D / games
| Starter | What | Mode |
|---------|------|------|
| [canvas-life](starters/canvas-life.html) | Conway's Game of Life — draw/pause/step | 🟢 |
| [three-esm](starters/three-esm.html) | Three.js spinning cube | 🟠 |

### Tools
| Starter | What | Mode |
|---------|------|------|
| [markdown-editor](starters/markdown-editor.html) | Live marked + highlight.js split pane | 🟢 |
| [json-viewer](starters/json-viewer.html) | JSON formatter + syntax highlight | 🟢 |
| [regex-tester](starters/regex-tester.html) | Live regex match highlighter | 🟢 |

## Prior art (cloned for reference)

**Skills** (`skills/`) — AI skills that instruct models to write self-contained HTML:
- [html-anything](skills/html-anything) (nexu-io) — 75 templates, 9 surfaces, streams into iframe srcdoc
- [html-artifacts](skills/html-artifacts) (dogum) — strict single-file, inline everything, works offline
- [md2html](skills/md2html) (haidang1810) — Markdown → self-contained HTML
- [claude-design-skill](skills/claude-design-skill) (jiji262) — from Claude.ai's leaked Design prompt

**Platforms** (`platforms/`):
- [open-artifacts](platforms/open-artifacts) (mayfer) — in-browser JSX bundling via esbuild-wasm
- [vibes.diy](platforms/vibes.diy) — React ES modules + Fireproof; runtime is **Sucrase + import-map + esm.sh fallback** (see RESEARCH.md)
- [anthropics-skills](platforms/anthropics-skills) — web-artifacts-builder (React+Parcel → `html-inline` → single bundle.html)

**Collections** (`collections/`):
- [awesome-claude-artifacts](collections/awesome-claude-artifacts) (madewithclaude)

## Running

- **Script-tag starters (🟢):** just open the `.html` file.
- **ESM starters (🟠):** serve over HTTP, e.g. `python3 -m http.server` in the folder, then visit `localhost:8000/...`.
- **The gallery** itself loads everything in iframes, so serve the repo root over HTTP to see ESM previews render.
