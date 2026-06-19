#!/usr/bin/env node
// Standalone Hyperframes renderer — no Hyperframes CLI, no build step.
// Drives a composition's paused GSAP timeline frame-by-frame in headless
// Chrome (Playwright) and pipes PNG frames to FFmpeg -> MP4.
//
//   node render.mjs <composition.html> [out.mp4] [--fps 30] [--scale 1]
//
// Works on the harvested standalone files in this folder *and* on raw
// Hyperframes compositions (it injects the same template-activation logic
// the player harness uses, so template-wrapped comps render too).
//
// Requires: `npm i playwright` (or playwright-core + a Chrome) and ffmpeg on PATH.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith("--") && a.endsWith(".html"));
const output = args.find(a => !a.startsWith("--") && a.endsWith(".mp4"))
  || (input ? basename(input).replace(/\.html$/, ".mp4") : null);
const fps = +(getFlag("--fps") || 30);
const scale = +(getFlag("--scale") || 1);
function getFlag(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }

if (!input || !existsSync(input)) { console.error("usage: node render.mjs <composition.html> [out.mp4] [--fps 30] [--scale 1]"); process.exit(1); }

const { chromium } = await import("playwright").catch(() => {
  console.error("Install Playwright first:  npm i playwright  &&  npx playwright install chromium");
  process.exit(1);
});

// Runs in the page: activate template if needed, return {id,duration,w,h}.
const ACTIVATE = () => new Promise((done) => {
  function recreate(scripts, i, cb) {
    if (i >= scripts.length) return cb();
    const old = scripts[i], s = document.createElement("script");
    for (const a of old.attributes) s.setAttribute(a.name, a.value);
    s.textContent = old.textContent;
    if (old.src) { s.onload = s.onerror = () => recreate(scripts, i + 1, cb); }
    old.parentNode.replaceChild(s, old);
    if (!old.src) recreate(scripts, i + 1, cb);
  }
  function finish() {
    const root = document.querySelector("[data-composition-id]");
    const id = root && root.getAttribute("data-composition-id");
    const tl = (window.__timelines || {})[id] || Object.values(window.__timelines || {})[0];
    if (!tl || !root) return setTimeout(finish, 60);
    done({
      id, duration: tl.duration() || +root.getAttribute("data-duration") || 5,
      w: +root.getAttribute("data-width") || 1920,
      h: +root.getAttribute("data-height") || 1080,
    });
  }
  if (!document.querySelector("[data-composition-id]")) {
    const tpl = document.querySelector("template");
    if (tpl) { document.body.appendChild(tpl.content.cloneNode(true));
      return recreate([...document.querySelectorAll("script")], 0, finish); }
  }
  finish();
});

const browser = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--ignore-gpu-blocklist"] });
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(input)).href, { waitUntil: "load" });
const info = await page.evaluate(ACTIVATE);
// Hide the standalone player UI so it never appears in the render.
await page.addStyleTag({ content: "#hf-harness{display:none!important}" }).catch(() => {});
const W = Math.round(info.w * scale), H = Math.round(info.h * scale);
await page.setViewportSize({ width: W, height: H });
// pin the stage to the top-left at native size and scale via CSS
await page.evaluate((s) => {
  const root = document.querySelector("[data-composition-id]");
  const host = root.closest("template") ? root.parentElement : root;
  const wrap = host === document.body ? root : host;
  wrap.style.transformOrigin = "top left";
  wrap.style.transform = `scale(${s})`;
  wrap.style.position = "absolute"; wrap.style.left = "0"; wrap.style.top = "0";
}, scale);

const total = Math.ceil(info.duration * fps);
console.log(`Rendering ${info.id}: ${info.duration}s @ ${fps}fps = ${total} frames -> ${output} (${W}x${H})`);

const ff = spawn("ffmpeg", [
  "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
  "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", output,
], { stdio: ["pipe", "inherit", "inherit"] });

for (let f = 0; f < total; f++) {
  await page.evaluate((t) => {
    const tl = window.__timelines[document.querySelector("[data-composition-id]").getAttribute("data-composition-id")]
      || Object.values(window.__timelines)[0];
    tl.pause(); tl.time(t);
  }, f / fps);
  const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: W, height: H } });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
  if (f % fps === 0) process.stdout.write(`\r  frame ${f}/${total}`);
}
ff.stdin.end();
await new Promise(r => ff.on("close", r));
await browser.close();
console.log(`\nDone -> ${output}`);
