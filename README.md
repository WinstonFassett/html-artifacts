# HTML Artifacts Archive — Stacks for No-Build Single-File Apps

This is about **HTML artifacts with the powers of npm / ESM imports / React + TSX** — single files that run with no build step but get real superpowers from modern libraries. The organizing question:

> Given a no-build delivery target (one HTML file, runs in an artifact host or straight in a browser), **what stack can you run, and what does it unlock?**

**Browse it:** open [`index.html`](index.html) — searchable gallery, live thumbnails, click to run fullscreen. Defaults to the interactive/powered artifacts.

## The two axes

**1. View / reactive layer** — how you build UI:

| Stack | Reactivity | Loading | `file://`? | Starter |
|-------|-----------|---------|:--:|---------|
| **React + esm.sh/tsx** | hooks, real TSX | ESM | ✗ | [react-19-tsx-esm](starters/react-19-tsx-esm.html) · [react-18-tsx-esm](starters/react-18-tsx-esm.html) |
| **React + Babel** | hooks, real JSX | script | ✓ | [react-18-babel](starters/react-18-babel.html) |
| **React + htm** | hooks, tagged templates | script | ✓ | [react-htm](starters/react-htm.html) |
| **Preact + htm** | hooks, 3KB | ESM | ✗ | [preact-htm-esm](starters/preact-htm-esm.html) |
| **Solid + html** | fine-grained signals | ESM | ✗ | [solid-html-esm](starters/solid-html-esm.html) |
| **Vue 3 (full)** | composition API | script | ✓ | [vue3](starters/vue3.html) |
| **petite-vue** | Vue directives, 6KB | ESM | ✗ | [petite-vue](starters/petite-vue.html) |
| **Alpine** | directives in HTML | script | ✓ | [alpine](starters/alpine.html) |
| **Lit** | reactive web components | ESM | ✗ | [lit-esm](starters/lit-esm.html) |
| **Svelte** | — | — | — | ❌ **compiler-required, no clean no-build path** |

**2. Power / capability layer** — what makes it more than a page:

| Capability | Library | Loading | `file://`? | Starter |
|-----------|---------|---------|:--:|---------|
| Declarative 3D in React | React Three Fiber | ESM | ✗ | [react-three-fiber-esm](starters/react-three-fiber-esm.html) |
| Programmatic video (preview) | Remotion Player | ESM | ✗ | [remotion-player-esm](starters/remotion-player-esm.html) |
| 3D / WebGL | Three.js | ESM | ✗ | [three-esm](starters/three-esm.html) |
| In-browser SQLite | SQL.js | script | ✓ | [sqljs](starters/sqljs.html) |
| Local-first persistence | Fireproof | ESM | ✗ | [react-fireproof-esm](starters/react-fireproof-esm.html) |
| Charts | Chart.js · Vega-Lite · Plotly | script | ✓ | [chartjs](starters/chartjs.html) · [vega-lite](starters/vega-lite.html) · [plotly](starters/plotly.html) |
| Diagrams | Mermaid · D3 · d3-graphviz | ESM/script | mixed | [mermaid-esm](starters/mermaid-esm.html) · [d3-force-esm](starters/d3-force-esm.html) |
| Maps | Leaflet | script | ✓ | [leaflet-map](starters/leaflet-map.html) |
| Motion | GSAP · anime · Motion · Lottie | mixed | mixed | [gsap-motion](starters/gsap-motion.html) · [anime](starters/anime.html) · [motion-esm](starters/motion-esm.html) · [lottie](starters/lottie.html) |
| Decks | reveal.js · impress.js | mixed | mixed | [reveal-deck](starters/reveal-deck.html) · [impress-deck](starters/impress-deck.html) |
| Canvas / games | (vanilla) | script | ✓ | [canvas-life](starters/canvas-life.html) |
| Tools | marked · regex · JSON | script | ✓ | [markdown-editor](starters/markdown-editor.html) · [regex-tester](starters/regex-tester.html) · [json-viewer](starters/json-viewer.html) |

## The rule that cuts across everything

**Any *runtime* React library works** via `esm.sh` + `esm.sh/tsx` — R3F, Remotion Player, Framer Motion, etc. The only things that *don't* work no-build are **compiler-dependent** tools:

- **Svelte** — needs the Svelte compiler; raw `.svelte` can't run in-browser (Svelte 5 can't even be CDN-bundled). `svelte-browser-import` exists but is `eval`-based and dev-only.
- **Solid via TSX** — esm.sh/tsx uses swc's generic jsx-runtime, but Solid needs its *compile-time* `babel-preset-solid` for fine-grained reactivity. Use the **`solid-js/html`** tagged-template renderer instead (what the starter does).
- **Remotion rendering** — the Player previews in-browser fine, but exporting an mp4 needs Remotion's Node render toolchain.

## Loading modes

- **`-esm` suffix / ESM column** = uses ES module `import` → needs an HTTP server (CORS blocks module loads from `file://`).
- **no suffix / script column** = `<script>` tags / UMD globals → runs directly from `file://`.

The gallery shows this as a per-card badge: 🟠 `ESM·http` / 🟢 `file://`.

## How JSX/TSX runs with no build

| Approach | Mechanism | Size | `file://`? |
|----------|-----------|------|:--:|
| **esm.sh/tsx** | `<script type="module" src="esm.sh/tsx">` + `<script type="text/tsx">` | ~1.7KB loader | ✗ (uses `import.meta`/fetch) |
| **Babel Standalone** | UMD globals + `<script type="text/babel" data-presets="react,typescript">` | ~2.7MB | ✓ |
| **htm** | tagged template literals, `` html`<App/>` `` | ~600B | ✓ |

esm.sh/tsx **must** be `type="module"` and needs `react/jsx-runtime` in the import map.

## Layout

```
index.html       ← gallery (search, stack/tag filter, live previews, file:// badges)
RESEARCH.md      ← source-verified findings (5 rounds): import maps, stacks, CDN URLs
starters/        ← 31 hand-built, tested single-file starters
examples/
  html-anything/ ← 87 templates from nexu-io/html-anything (mostly static docs — the "Templates" collection)
  interactive/   ← pulled real-world examples (Mermaid viewers, d3-graphviz)
skills/          ← AI skills that generate HTML artifacts (html-anything, html-artifacts, md2html, claude-design)
platforms/       ← generator platforms (open-artifacts, vibes.diy, anthropic web-artifacts-builder)
collections/     ← awesome-claude-artifacts
```

## How vibes.diy runs React no-build (source-verified)

Inspected from the cloned source. Runtime = **Sucrase + import map + esm.sh fallback** (not esbuild/Parcel): Sucrase strips TS + transforms JSX in-browser; `bare-specifier-rewrite.ts` rewrites unknown bare imports → `esm.sh/<name>`; a persistent React root survives broken streaming renders. See [RESEARCH.md](RESEARCH.md).

## Running

- **🟢 script starters:** open the `.html` directly.
- **🟠 ESM starters:** serve over HTTP — `python3 -m http.server` in the folder.
- **Gallery:** serve the repo root over HTTP so ESM previews render in their iframes.

All 31 starters are tested with rendered-output verification and zero console errors.
