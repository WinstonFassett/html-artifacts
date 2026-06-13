# HTML Artifact Gallery — Astro site

The gallery for the HTML-artifacts archive, destined for **tools.winstonfassett.com**.
Static Astro (SSG) site that renders the 164-entry collection as a filterable card
grid with static thumbnails and a click-to-run lightbox.

## How it works

- **Data** lives in [`src/data/artifacts.json`](src/data/artifacts.json) — a flat
  array loaded as an Astro content collection via the `file()` loader
  ([`src/content.config.ts`](src/content.config.ts), Zod-validated). Generated from
  the legacy `../index.html` by [`scripts/extract-data.mjs`](scripts/extract-data.mjs).
  Each entry: `id, name, path, tags, source, loading?, bucket, featured, preview`.
  - `bucket` ∈ `mine | collected | templates` (derived from `source`).
  - `featured` = publisher highlight (a **publishing** concept — committed, everyone
    sees it). Seeded `true` on authored work (matchina + starters). *Not* the same as
    per-viewer faves (a user concept, deferred).
- **Artifacts + thumbnails** are served verbatim from `public/` — generated (and
  gitignored) by [`scripts/sync-assets.mjs`](scripts/sync-assets.mjs), which copies
  the referenced `.html` (preserving the subtree so matchina's relative `demo.css`
  resolves) and `previews/*.png` from the parent repo. Artifacts run at
  `/artifacts/<path>`; ESM imports stay intact because `public/` is untouched.
- **Search = the instant inline filter** (name/tag/source substring) plus the view
  toggle (Featured / Mine / Collected / Templates / All) and source/tag pills. No
  full-text search engine — decent filtering is all v1 needs. The default view is
  **Featured**.
- **Run-in-place** via the lightbox iframe ([`src/components/Lightbox.astro`](src/components/Lightbox.astro)).

## Commands

| Command           | Action                                                            |
| :---------------- | :--------------------------------------------------------------- |
| `npm run data`    | Re-extract `artifacts.json` from `../index.html`                 |
| `npm run sync`    | Copy artifacts + previews into `public/` (runs before dev/build) |
| `npm run dev`     | Sync + dev server                                               |
| `npm run build`   | Sync + static build to `./dist/`                                |
| `npm run preview` | Preview the build (run ESM artifacts here — needs HTTP)         |

## Deploy

`npm run build` → static `dist/` → tools.winstonfassett.com (e.g. rclone, same as
winstonfassett.com) + DNS CNAME. The host must serve `/artifacts/*.html` verbatim as
`text/html` so ESM imports resolve.

## Stack

Astro 5 (Astro 6's rolldown-vite is currently incompatible with `@tailwindcss/vite`),
Tailwind v4 (`@theme` tokens, dark-only), no runtime framework.

## Deferred (fast-follow)

- Per-artifact `[id]` pages (shareable URLs + a basis for real full-text search).
- Per-viewer faves (★ + localStorage), distinct from publisher `featured`.
- Light/dark theme toggle.
