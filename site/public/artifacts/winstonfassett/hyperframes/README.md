# Hyperframes — harvested compositions + no-build player & renderer

[Hyperframes](https://hyperframes.mintlify.app) (HeyGen, open source) is "Write HTML,
render video, built for agents" — the HTML-native cousin of Remotion. Each composition
is a single HTML file with inline CSS/JS, GSAP from CDN, and a **paused** GSAP timeline
registered at `window.__timelines["<id>"]`. The official engine drives that timeline
frame-by-frame in headless Chrome and pipes frames to FFmpeg. No build step.

This folder harvests the open compositions from
[`heygen-com/hyperframes-launches`](https://github.com/heygen-com/hyperframes-launches)
and adds two things that exploit the same `window.__timelines` contract:

1. **A player harness** so each frozen composition becomes play/scrubbable standalone.
2. **A standalone renderer** so you can make MP4s without the Hyperframes CLI or any build.

## Browse

Open `index.html` — a gallery that lists every harvested composition and plays any of
them in an iframe. Each file is also a standalone artifact: open it directly to play/scrub.

## What's here

- `*__*.html` — 36 **CDN-pure** compositions (no local font/audio/video deps), each with
  the player harness injected. Naming: `<project>__<composition>.html`.
- `index.html` — the gallery browser (reads `manifest.json`).
- `manifest.json` — id / project / duration / template-flag per composition.
- `harness.html` — the injected player UI (play, restart, scrub, auto-fit 1920×1080).
- `harvest.mjs` — pull more compositions from the repo + inject the harness.
- `render.mjs` — **no-build** HTML→MP4 renderer.

Only the 35/87 zero-asset compositions are bundled. The other 52 reference local
`assets/` (audio/video) or `fonts/` and need a folder checkout — see "Harvest more".

## The composition contract

```
<div data-composition-id="x" data-width="1920" data-height="1080" data-duration="5">…</div>
<script>window.__timelines = window.__timelines || {};
        window.__timelines["x"] = gsap.timeline({ paused: true })…;</script>
```

Two shapes in the wild: **full-doc** (root rendered in `<body>`) and **template**
(everything inside `<template id="x-template">`, inert until cloned). The harness and
renderer both handle template activation — they clone `template.content` into the page
and re-create each `<script>` in order (awaiting CDN `src` loads before inline scripts run).

## Make a video (no build)

```bash
npm i playwright && npx playwright install chromium   # one-time
# any harvested file, or any raw Hyperframes composition:
node render.mjs hyperframes-launch__flex-shader.html out.mp4 --fps 30 --scale 1
```

`render.mjs` opens the HTML headless, activates templates if needed, hides the player
UI, then for each frame seeks `window.__timelines[id].time(t)` and screenshots → FFmpeg
(libx264, yuv420p, crf 17). Flags: `--fps` (default 30), `--scale` (0.5 = half-res draft).
Requires `ffmpeg` on PATH.

This is deliberately the *minimum* — the official `@hyperframes/engine` does the same
seek-and-capture via Chrome's `BeginFrame` for frame-perfect determinism, plus audio
muxing, multi-composition timelines, and Docker-pinned reproducibility. For audio/video
compositing or production determinism, use the real CLI (`npx hyperframes render`).

## Harvest more (including asset-dependent ones)

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 \
  https://github.com/heygen-com/hyperframes-launches.git repo
node harvest.mjs repo ./out            # all compositions
node harvest.mjs repo ./out list.txt   # only paths listed in list.txt
```

For asset-dependent compositions, harvest into a dir that sits next to the project's
`assets/` and `fonts/` (or inline them), then serve over http:// — `file://` blocks some
font/media loads.
