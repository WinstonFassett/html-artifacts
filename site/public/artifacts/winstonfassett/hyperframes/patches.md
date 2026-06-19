# Post-harvest patches

`harvest.mjs` copies each composition verbatim + injects the player harness. A few
compositions need manual fixes afterward because they depend on the project's
`index.html` (which the engine composites in) rather than being self-contained. If you
re-run the harvest, re-apply these.

## timeline-launch__act4-video.html — add the `<video>` element

The composition only *animates* `#act4-final-video`; the actual `<video>` lives in the
project `index.html`. Re-add it inside the root div, sourcing the footage from GitHub LFS
(link, not bundle — the file is 5 MB):

```html
<video
  id="act4-final-video"
  src="https://media.githubusercontent.com/media/heygen-com/hyperframes-launches/main/timeline-launch/assets/sstest.mp4"
  muted playsinline
  style="position:absolute; inset:0; width:1920px; height:1080px; object-fit:cover; transform-origin:50% 50%"
></video>
```

Note: shows real footage standalone, but frame-accurate scrubbing needs the HeyGen
engine to drive `video.currentTime` — the GSAP timeline alone won't advance the video.

## Dropped

- `variables-launch__scene-08.html` — **broken in HeyGen's source** (`appendChild` error,
  registers no timeline; reproduces on the raw original with zero harness). Not harvested.

## Labeled in manifest (work-as-designed, look empty standalone)

- `endcard` — `blank-by-design`: a 3.5s white placeholder; logo composited in post.
- `quiet-captions` — `caption-overlay`: caption-only track (duration is ~12s, not the 56s
  the root attr claimed); meant to overlay footage, so gaps between captions are expected.
