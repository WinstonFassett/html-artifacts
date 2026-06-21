# HTML Artifacts

Gallery of single-file HTML apps that run with no build step.

## Setup

```bash
npm install
npm run dev
```

## Adding an artifact

1. Drop the `.html` file in `public/artifacts/<collection>/`
2. Add an entry to `src/data/artifacts.json`

## Layout

```
src/data/artifacts.json  ← artifact registry
public/artifacts/        ← artifact files
tools/                   ← maintenance scripts (shoot.py for thumbnails)
skills/                  ← AI skills for generating artifacts
RESEARCH.md              ← source-verified findings on no-build stacks
```
