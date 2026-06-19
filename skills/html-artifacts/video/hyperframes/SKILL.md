---
name: html-artifacts-video-hyperframes
description: How to author or render HeyGen Hyperframes (HTML-native) video in this repo. Use whenever a task involves Hyperframes or HeyGen video — generating a composition, editing one, or rendering to MP4. The rule is: always use HeyGen's official Hyperframes agent skills; if they aren't installed, ask the user global-vs-local and install.
---

# Hyperframes (HeyGen) — use the official skills

Hyperframes is HeyGen's open-source "write HTML, render video" framework. **Do not
hand-roll Hyperframes compositions from generic web knowledge.** HeyGen ships official
agent skills that encode the exact contract (`window.__timelines`, `class="clip"`,
`data-*` timing semantics, runtime adapters like `window.__hfLottie`, no `Math.random()`,
synchronous timeline construction). Using them produces correct output from the start;
not using them produces compositions that lint-fail or render wrong.

## Rule: always route Hyperframes work through HeyGen's skills

When a task involves authoring or rendering Hyperframes/HeyGen video:

1. **Check if the official skills are installed.** Look for a `hyperframes` skill (e.g.
   `/hyperframes`, `/hyperframes-core`, `/hyperframes-cli`) in the agent's skills
   (`~/.claude/skills/` for global, `./.claude/skills/` for project-local).
2. **If installed:** use them. Entry point is `/hyperframes`; it routes to the right
   sub-skill (`-core`, `-animation`, `-creative`, `-cli`, `-media`, `-registry`).
3. **If not installed:** STOP and ask the user whether to install **global** or
   **local**, then run the matching command (or have the user run it):
   - global (all projects): `npx skills add heygen-com/hyperframes --global`
   - local (this repo only): `npx skills add heygen-com/hyperframes`
   - add `--all` to skip the interactive picker and install every sub-skill.
   Do not pick the scope unilaterally — ask each time.

The 8 skills installed: `/hyperframes` (router), `-core`, `-animation`, `-creative`,
`-cli`, `-media`, `-registry`, and `/general-video` (fallback).

## Prompting (from HeyGen's guide)

- **Cold start:** specify duration, aspect ratio, mood, key elements.
- **Warm start:** point at source material (URL/PDF/CSV) and ask for an N-second video.
- Motion vocab → easing: "smooth"=`power2.out`, "snappy"=`power4.out`, "bouncy"=`back.out`.
- Use the `/hyperframes` slash command rather than free-form, so conventions aren't guessed.
- On errors, run `npx hyperframes lint` first; don't paste raw errors blind.

## What's already in this repo (no install needed to *inspect*)

`site/public/artifacts/winstonfassett/hyperframes/` has 36 harvested CDN-pure
compositions plus our own tooling — see its `README.md`:

- `index.html` — gallery; play/scrub any composition in-browser.
- `render.mjs` — **no-build** HTML→MP4 (Playwright + FFmpeg), no Hyperframes CLI.
  `node render.mjs <comp>.html out.mp4 --fps 30`. Good for quick local renders of a
  single composition.
- `harvest.mjs` — pull more compositions from `heygen-com/hyperframes-launches`.

Use our `render.mjs` for a fast one-off render of an existing harvested composition.
Use the **official skills + CLI** for authoring new compositions, audio/video muxing,
multi-composition timelines, and production-deterministic renders.
