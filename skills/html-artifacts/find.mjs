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
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const DB = join(here, "../../site/src/data/artifacts.json");
const all = JSON.parse(readFileSync(DB, "utf8"));

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
console.error(`\n${out.length} match(es). Each path is under site/public/artifacts/. Open the file/folder to copy & adapt.`);
