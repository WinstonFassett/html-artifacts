#!/usr/bin/env node
/**
 * copy-previews.mjs — populate public/previews/ before rendering.
 *
 * The bento scene references preview PNGs via staticFile('previews/...'),
 * which Remotion only resolves from this project's own public/ dir. Rather
 * than commit duplicate copies, this script copies just the PNGs the scene
 * actually uses from the canonical site previews dir.
 *
 * Runs automatically via the `prerender` / `prestart` npm hooks. Run manually:
 *   node scripts/copy-previews.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')

// Canonical source: site/public/previews (three levels up from the project).
const SRC = path.resolve(projectRoot, '../../../previews')
const DEST = path.join(projectRoot, 'public', 'previews')

// Parse the filenames the scene references so this stays in sync with the code.
const bento = fs.readFileSync(
  path.join(projectRoot, 'src', 'components', 'InfiniteBentoPan.tsx'),
  'utf8',
)
const m = bento.match(/const PREVIEW_IMGS = \[([\s\S]*?)\]/)
if (!m) {
  console.error('Could not find PREVIEW_IMGS array in InfiniteBentoPan.tsx')
  process.exit(1)
}
const imgs = [...m[1].matchAll(/'([^']+\.png)'/g)].map((x) => x[1])

if (!fs.existsSync(SRC)) {
  console.error(`Canonical previews dir not found: ${SRC}`)
  console.error('Run this from inside the project, with the repo checked out.')
  process.exit(1)
}

fs.mkdirSync(DEST, { recursive: true })

let copied = 0
const missing = []
for (const img of imgs) {
  const src = path.join(SRC, img)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DEST, img))
    copied++
  } else {
    missing.push(img)
  }
}

console.log(`Copied ${copied}/${imgs.length} previews into public/previews/`)
if (missing.length) {
  console.error(`Missing from ${SRC}:\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
