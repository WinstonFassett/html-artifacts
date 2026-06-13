#!/usr/bin/env node
// desite.mjs — strip docs-site/Netlify framework cruft from a slurped HTML page
// so a standalone artifact runs from a plain folder. Seed of a "slurp a site into
// one self-contained HTML file" utility. Usage:
//   node tools/desite.mjs <in.html> <out.html>
// Transforms applied (idempotent):
//   1. rewrite absolute Astro asset/css paths that point at the demo folder
//      (/cdn-demos/demo.css -> demo.css) to relative.
//   2. drop the Astro page bundle <script src="/assets/page.*.js">.
//   3. drop the Netlify deploy badge div + /.netlify/scripts/cdp script.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node tools/desite.mjs <in.html> <out.html>');
  process.exit(1);
}

let html = readFileSync(inPath, 'utf8');

// 1. demo.css (and any other /cdn-demos/* asset) -> relative
html = html.replace(/href="\/cdn-demos\/([^"]+)"/g, 'href="$1"');

// 2. Astro page bundle script
html = html.replace(/<script type="module" src="\/assets\/page\.[^"]+\.js"><\/script>/g, '');

// 3. Netlify deploy badge block (div + cdp script)
html = html.replace(/<div data-netlify-deploy-id=[\s\S]*?<\/div>(?=<\/body>)/g, '');

writeFileSync(outPath, html);
console.error(`wrote ${outPath} (${html.length} bytes)`);
