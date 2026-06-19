---
name: html-artifacts
description: Router for working with the HTML artifacts in this repo (single-file demos, stacks/starters, collections, and HTML-native video). Use when adding, adapting, harvesting, or rendering an artifact, or when asked which example/stack to start from. Routes to the relevant content area; if that area has its own SKILL.md, read and follow it.
---

# HTML artifacts — router

This repo collects and curates HTML artifacts: single-file demos, stack/starter
recipes, and HTML-native video. When a task touches one of the areas below, **go to
that area, and if it contains a `SKILL.md`, read and follow it before doing anything
else** — the leaf skill is authoritative and may delegate to external tooling.

Keep this file thin. It only routes. Behavior lives in the area, not here.

## Areas

Content lives under `site/public/artifacts/`. Most areas carry a `README.md` (read it
for conventions); only areas that need to **override** default behavior carry a `SKILL.md`.

- **video** — HTML-native / programmatic video.
  - `winstonfassett/hyperframes/` — harvested HeyGen Hyperframes compositions + a no-build
    player & renderer. **Has a leaf skill:** `skills/html-artifacts/video/hyperframes/SKILL.md`.
    Read it before generating or rendering Hyperframes video.
  - `winstonfassett/remocn-repo-video/`, `winstonfassett/remotion-player-esm.html` — Remotion
    (React) video. No leaf skill; see their files.
- **stacks / starters** — `winstonfassett/standalone-*.html`, `*-esm.html`, chat starters,
  reactive-framework demos. Self-contained; copy the closest one and adapt. No leaf skill.
- **collections** — `simonw-tools/`, `html-anything/`. Curated external artifacts.

## How to route

1. Identify the area from the task (video? a stack/starter? a collection?).
2. `ls` that area; **if a `SKILL.md` exists there, read it and follow it.**
3. Otherwise read the area's `README.md` and the nearest existing example, then adapt.

## Adding a new artifact

New artifacts go under `site/public/artifacts/<author>/`. Register each in
`site/src/data/artifacts.json` (hand-maintained; 2-space indent, inline arrays — insert
surgically, don't reformat the file). A folder artifact is one card; give it a `README.md`.
