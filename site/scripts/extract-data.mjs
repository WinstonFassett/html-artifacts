#!/usr/bin/env node
// One-time-ish: extract the inline `artifacts` array from ../index.html into
// src/data/artifacts.json, adding derived fields (id, bucket, featured, preview).
// Re-runnable: re-derives from index.html, so it's the data-migration source.
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');          // repo root
const SITE = resolve(__dirname, '..');                // site/
const OUT = resolve(SITE, 'src/data/artifacts.json');

// --- parse the inline array out of index.html ---
const html = readFileSync(resolve(REPO, 'index.html'), 'utf8');
const start = html.indexOf('const artifacts = [');
const end = html.indexOf('\n];', start);
if (start < 0 || end < 0) throw new Error('could not locate artifacts array in index.html');
const block = html.slice(start + 'const artifacts = '.length, end + 2);
// It's valid JS object-literal syntax → evaluate it.
const raw = Function(`"use strict"; return (${block});`)();

// slug rule — MUST match tools/shoot.py (and slugPath in index.html):
// path lowercased, non-alphanumeric runs → '-', trimmed of leading/trailing '-'.
const slug = (p) => p.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const BUCKET = {
  matchina: 'mine', starters: 'mine',
  simonw: 'collected', github: 'collected', 'open-artifacts': 'collected',
  'html-anything': 'templates',
};

const seen = new Set();
const out = raw.map((a) => {
  const id = slug(a.path);
  if (seen.has(id)) throw new Error(`duplicate id (slug collision): ${id} (${a.path})`);
  seen.add(id);
  const bucket = BUCKET[a.source] ?? 'collected';
  let size = 0;
  try { size = statSync(resolve(REPO, a.path)).size; } catch { /* missing file */ }
  return {
    id,
    name: a.name,
    path: a.path,
    tags: a.tags ?? [],
    source: a.source,
    ...(a.loading ? { loading: a.loading } : {}),
    bucket,
    // featured = publisher highlight; seed true on authored work (mine bucket)
    featured: bucket === 'mine',
    size,                          // bytes of the source .html (no-build single file)
    preview: `previews/${id}.png`,
  };
});

if (!existsSync(dirname(OUT))) mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

const featured = out.filter((a) => a.featured).length;
const byBucket = out.reduce((m, a) => ((m[a.bucket] = (m[a.bucket] || 0) + 1), m), {});
console.log(`wrote ${out.length} entries → ${OUT}`);
console.log(`  featured: ${featured}  buckets:`, byBucket);
