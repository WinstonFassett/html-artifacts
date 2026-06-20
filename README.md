# HTML Artifacts

Gallery of single-file HTML apps that run with no build step.

## Setup

```bash
cd site
npm install
npm run dev
```

## Adding an artifact

1. Drop the `.html` file in `site/public/artifacts/<collection>/`
2. Add an entry to `site/src/data/artifacts.json`

## Layout

```
site/
  src/data/artifacts.json  ← artifact registry
  public/artifacts/        ← artifact files
skills/                    ← AI skills for generating artifacts
RESEARCH.md                ← source-verified findings on no-build stacks
```
