---
name: html-artifacts
description: Find and reuse the HTML artifacts in this repo instead of building from scratch or grepping the tree. Use whenever a task needs a specific library/stack (React, Vue, Solid, Lit, Three.js, D3, GSAP, Mermaid, CodeMirror, Milkdown, PGlite, SQL.js, Leaflet, Plotly, etc.) or a generic artifact type (deck, dashboard, report, chat, social card, video, doc). Query the catalog with find.mjs; copy the closest match and adapt.
---

# HTML artifacts — catalog router

This repo curates ~140 HTML artifacts. **Don't build a library setup from scratch and
don't grep the tree — there is almost certainly an existing one to copy.** Query the
catalog first.

## Find what's here (one command, no file search)

`artifacts.json` (`site/src/data/artifacts.json`) indexes every artifact with name,
path, and tags. Query it with the bundled tool — run from this skill dir:

```
node find.mjs --libs            # all library/stack starters (the no-build setups)
node find.mjs --types           # every artifact type (tag) with counts
node find.mjs <term>...         # match name/tag/path, AND across terms  (e.g. react chat)
node find.mjs --tag <tag>       # exact-tag filter, repeatable          (e.g. --tag 3d)
node find.mjs --all
```

Output is `NAME  PATH  [tags]`; paths are under `site/public/artifacts/`. Open the match,
copy it, adapt. Use `find.mjs` instead of Grep/Glob for "what do we have for X".

`find.mjs` finds the catalog by walking up from itself; if this skill is installed
outside the repo it fetches the published catalog from
`github.com/WinstonFassett/html-artifacts` instead, and prints raw URLs for each artifact.

## Two axes to query along

1. **Library / stack** — a minimal working setup for a specific lib. Lives in
   `winstonfassett/`, tagged `starter`. This is the no-search win: "want Solid?" →
   `node find.mjs solid`; "Postgres in the browser?" → `node find.mjs pglite`;
   "force graph?" → `node find.mjs d3`. These define the repo's three shapes:
   single-file inline, ESM-importmap (`*-esm.html`), and folder artifacts.
2. **Artifact type** — a finished example of a *kind* of thing (deck, dashboard, report,
   social card, chat, video, doc). Mostly in `html-anything/`. For "build me a dashboard"
   → `node find.mjs --tag dashboard` and start from the closest.

## Framework quick-reference

When a catalog match doesn't exist and you must build from scratch, pick by CDN viability:

| Framework | CDN / no-build | Shape | When to reach for it |
|-----------|---------------|-------|----------------------|
| **Lit** | ✓ importmap + jsDelivr | `*-esm.html` | Reactive components, scoped CSS, web component interop |
| **Vue 3** | ✓ global CDN | inline or ESM | Forms, filters, cohesive app logic; template-syntax fans |
| **Solid** | ✓ importmap | `*-esm.html` | Fine-grained reactivity, signals; see `node find.mjs solid` |
| **React / Preact** | ✓ via Babel CDN | inline | JSX required; Preact is 4 KB vs React's 42 KB |
| **htmx** | ✓ script tag | inline | Server-driven hypermedia, zero JS logic |
| **Three.js / D3 / GSAP** | ✓ importmap / script | ESM or inline | 3D, dataviz, animation — check catalog first |
| **Svelte / Next / Nuxt** | ✗ compile required | — | Not usable as no-build artifacts |

**CDN rules:**
- Always use jsDelivr with `+esm` suffix: `https://cdn.jsdelivr.net/npm/lit@3/+esm`
- Use an `<script type="importmap">` block for ESM libs — don't inline bare `import` without one
- If an import silently fails, debug the CDN URL first; **never fall back to vanilla JS** without explicit approval

## Common pitfalls

**Reactive array/object mutation won't re-render** (Lit, Solid signals):
```js
// ❌ Lit won't detect this
this.items.push(x);
// ✓ new reference triggers render
this.items = [...this.items, x];
```

**Lit: forgetting `static properties`** — without it, property assignments don't trigger `render()`.

**Lit input binding** — use `.value` (property) not `value` (attribute), plus `@input` handler:
```html
<input .value=${this.text} @input=${e => this.text = e.target.value} />
```

## Areas that override defaults (read their SKILL.md)

Most artifacts are just copy-and-adapt. A few areas delegate to external tooling and
carry their own `SKILL.md` — read it before working there:

- **Hyperframes / HeyGen video** — `skills/html-artifacts/video/hyperframes/SKILL.md`.
  Use HeyGen's official skills; render with our no-build `render.mjs`.

## Adding an artifact

Goes under `site/public/artifacts/<author>/`; register in `site/src/data/artifacts.json`
(hand-maintained: 2-space indent, inline arrays — insert surgically, never reformat). Tag
it on **both** axes (library AND type) so `find.mjs` surfaces it. A folder artifact is one
card; give it a `README.md`.
