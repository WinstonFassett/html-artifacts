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

## Notes

- Component files may need manual cleanup — imports are generated conservatively.
- Any assets referenced via absolute paths (e.g. `/previews/`) need to be
  copied into `public/` or paths updated to `staticFile('...')`.
