#!/usr/bin/env node
// Harvest Hyperframes compositions into standalone, harness-equipped single files.
// Usage: node harvest.mjs <repoDir> <outDir> [listFile]
// Reads each composition HTML, wraps template-only files in a minimal doc,
// injects the player harness, and writes <project>__<name>.html to outDir.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";

const [repoDir, outDir, listFile] = process.argv.slice(2);
if (!repoDir || !outDir) { console.error("usage: node harvest.mjs <repoDir> <outDir> [listFile]"); process.exit(1); }
mkdirSync(outDir, { recursive: true });

const harness = readFileSync(join(dirname(new URL(import.meta.url).pathname), "harness.html"), "utf8");

let comps;
if (listFile) {
  comps = readFileSync(listFile, "utf8").trim().split("\n").filter(Boolean);
} else {
  comps = [];
  const walk = (d) => readdirSync(d).forEach((f) => {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.includes("/compositions/") && p.endsWith(".html")) comps.push(p.slice(repoDir.length + 1));
  });
  walk(repoDir);
}

const manifest = [];
for (const rel of comps) {
  let html = readFileSync(join(repoDir, rel), "utf8");
  const project = rel.split("/")[0];
  const name = basename(rel, ".html");
  const id = (html.match(/data-composition-id="([^"]+)"/) || [])[1] || name;
  const dur = parseFloat((html.match(/data-duration="([0-9.]+)"/) || [])[1] || "0");
  const isTemplate = !/<body[\s>]/i.test(html) && /<template/i.test(html);

  let out;
  if (isTemplate) {
    // Wrap the bare template fragment in a minimal document + harness.
    out = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${id} — Hyperframes</title></head>
<body>
${html}
${harness}
</body></html>`;
  } else if (/<\/body>/i.test(html)) {
    out = html.replace(/<\/body>/i, `${harness}\n</body>`);
  } else {
    out = html + "\n" + harness;
  }

  const outName = `${project}__${name}.html`;
  writeFileSync(join(outDir, outName), out);
  manifest.push({ file: outName, project, name, id, duration: dur, template: isTemplate });
}

writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`Harvested ${manifest.length} compositions -> ${outDir}`);
console.log(`Templates: ${manifest.filter(m => m.template).length}, full-doc: ${manifest.filter(m => !m.template).length}`);
