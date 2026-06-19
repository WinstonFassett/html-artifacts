#!/usr/bin/env node
// Query the artifact catalog without grepping the tree. Reads site/src/data/artifacts.json
// (the hand-maintained index every gallery card comes from).
//
//   node find.mjs <query>...     match name OR tag OR path substring (AND across terms)
//   node find.mjs --tag react     exact-tag filter (repeatable: --tag react --tag chat)
//   node find.mjs --libs          list the library/stack starters (winstonfassett/, tagged 'starter')
//   node find.mjs --types         list artifact types (tags) with counts
//   node find.mjs --all           every artifact, one per line
//
// Output: NAME  PATH  [tags]   — path is relative to site/public/artifacts/
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Canonical public source — used when this skill runs outside the repo (e.g. installed
// globally in ~/.claude/skills). Catalog + artifacts live at:
const REPO = "WinstonFassett/html-artifacts";
const BRANCH = "main";
const RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;

// Find the local catalog by walking up from this file; fall back to fetching the
// published copy from GitHub raw if the repo isn't present locally.
const here = dirname(fileURLToPath(import.meta.url));
function localDB() {
  let d = here;
  for (let i = 0; i < 6; i++) {
    const p = join(d, "site/src/data/artifacts.json");
    if (existsSync(p)) return p;
    d = dirname(d);
  }
  return null;
}
let all, sourceNote;
const dbPath = localDB();
if (dbPath) {
  all = JSON.parse(readFileSync(dbPath, "utf8"));
  sourceNote = "local repo";
} else {
  const url = `${RAW}/site/src/data/artifacts.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    all = await res.json();
    sourceNote = `published catalog (${url})`;
  } catch (e) {
    console.error(`Catalog not found locally and couldn't fetch it from GitHub.\n` +
      `  tried: ${url}\n  error: ${e.message}\n` +
      `Clone the repo to use artifacts directly:  git clone https://github.com/${REPO}`);
    process.exit(2);
  }
}

const args = process.argv.slice(2);
const tags = [];
for (let i = 0; i < args.length; i++) if (args[i] === "--tag") tags.push(args[++i].toLowerCase());
const terms = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--tag").map(s => s.toLowerCase());
const flag = (f) => args.includes(f);

function row(a) { return `${a.name.padEnd(34)} ${a.path.padEnd(46)} [${(a.tags || []).join(", ")}]`; }

if (flag("--types")) {
  const c = {};
  for (const a of all) for (const t of a.tags || []) c[t] = (c[t] || 0) + 1;
  console.log("ARTIFACT TYPES (tag: count):");
  Object.entries(c).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${t.padEnd(16)} ${n}`));
  process.exit(0);
}

let out = all;
if (flag("--libs")) out = out.filter(a => a.path.startsWith("winstonfassett/") && (a.tags || []).includes("starter"));
if (tags.length) out = out.filter(a => tags.every(t => (a.tags || []).includes(t)));
if (terms.length) out = out.filter(a => {
  const hay = (a.name + " " + a.path + " " + (a.tags || []).join(" ")).toLowerCase();
  return terms.every(t => hay.includes(t));
});

if (!out.length) { console.error("no matches. try: node find.mjs --types  |  --libs  |  <term>"); process.exit(1); }
out.sort((a, b) => a.path.localeCompare(b.path)).forEach(a => console.log(row(a)));
const where = dbPath
  ? "Each path is under site/public/artifacts/ — open the file/folder to copy & adapt."
  : `Source: ${sourceNote}. Fetch any artifact at ${RAW}/site/public/artifacts/<path>`;
console.error(`\n${out.length} match(es). ${where}`);
