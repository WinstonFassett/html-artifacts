#!/usr/bin/env node
// Populate public/ with the artifacts + previews the gallery references.
// Source of truth lives in the parent repo (../examples, ../starters, ../previews);
// public/artifacts/ and public/previews/ are GENERATED (gitignored). Runs before
// every build. Idempotent: copies only when source is newer than dest.
//
// Why copy (not symlink): `astro build` copies public/ into dist/ with fs.cp;
// symlinks behave inconsistently across that and some static hosts.
import { readFileSync, mkdirSync, copyFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');
const SITE = resolve(__dirname, '..');
const PUB_ARTIFACTS = resolve(SITE, 'public/artifacts');
const PUB_PREVIEWS = resolve(SITE, 'public/previews');

const artifacts = JSON.parse(readFileSync(resolve(SITE, 'src/data/artifacts.json'), 'utf8'));

let copied = 0, skipped = 0;
function copyNewer(src, dest) {
  if (!existsSync(src)) { console.warn('  ! missing source:', src); return; }
  if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) { skipped++; return; }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  copied++;
}

// 1. Each referenced artifact .html → public/artifacts/<path> (subtree preserved).
for (const a of artifacts) {
  copyNewer(resolve(REPO, a.path), join(PUB_ARTIFACTS, a.path));
}

// 2. Sibling non-.html assets next to any referenced artifact (today: only
//    examples/matchina/demo.css, linked relatively as href="demo.css"). Generalize:
//    for every dir that holds a referenced artifact, copy its non-.html files.
const artifactDirs = new Set(artifacts.map((a) => dirname(a.path)));
for (const dir of artifactDirs) {
  const abs = resolve(REPO, dir);
  if (!existsSync(abs)) continue;
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.endsWith('.html')) {
      copyNewer(join(abs, entry.name), join(PUB_ARTIFACTS, dir, entry.name));
    }
  }
}

// 3. Previews → public/previews/<id>.png
for (const a of artifacts) {
  copyNewer(resolve(REPO, a.preview), join(PUB_PREVIEWS, `${a.id}.png`));
}

console.log(`sync-assets: ${copied} copied, ${skipped} up-to-date (${artifacts.length} artifacts)`);
