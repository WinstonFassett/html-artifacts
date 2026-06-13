// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Static SSG (default). Artifacts + previews are served verbatim from public/.
  // Search = the instant client-side inline filter (name/tag/source); no
  // full-text/Pagefind in v1 — kept simple, no per-artifact pages needed.
  vite: {
    plugins: [tailwindcss()],
  },
});
