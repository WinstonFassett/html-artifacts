# remocn-repo-video

Generated from `remocn-repo-video.html` by `html-to-remotion.mjs`.

## Setup

```bash
npm install
```

## Preview in Remotion Studio

```bash
npm run start
```

## Render to mp4

```bash
npm run render
```

Output: `out/remocn-repo-video.mp4`

## Preview images

The bento scene uses real artifact screenshots from the canonical
`site/public/previews/` dir. They are **not committed here** — `npm start`
and `npm run render` auto-copy the needed PNGs into `public/previews/` via
`scripts/copy-previews.mjs` (a `prestart`/`prerender` hook). To copy manually:

```bash
npm run previews
```

The script parses `PREVIEW_IMGS` out of `src/components/InfiniteBentoPan.tsx`,
so it stays in sync if you change which previews the scene uses.
