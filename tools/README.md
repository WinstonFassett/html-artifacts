# tools/

Maintenance scripts for the gallery.

## `shoot.py` — regenerate preview thumbnails

The gallery (`index.html`) shows a static screenshot per artifact
(`previews/<slug>.png`) instead of live `<iframe>` previews — with ~165 cards the
iframes tanked scroll perf. `shoot.py` (re)generates those screenshots with
headless Playwright, reading the artifact list straight from `index.html`.

Serve the repo over HTTP first (ESM artifacts need it). Easiest via the
`webapp-testing` skill's `with_server.py`:

```bash
python3 <webapp-testing>/scripts/with_server.py \
  --server "python3 -m http.server 9731 --directory public" --port 9731 \
  -- python3 tools/shoot.py
```

- No args → shoot every artifact, **skipping** previews that already exist.
- Pass one or more artifact `path`s → (re)shoot just those, overwriting.

Each artifact renders in its **own native theme** (forcing dark across all the
uncontrolled third-party artifacts produced broken half-dark renders); the
gallery UI provides the dark chrome. Slug = `path` lowercased, non-alphanumerics
→ `-`. Must stay in sync with `slugPath()` in `index.html`.

