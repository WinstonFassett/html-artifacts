// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://winstonfassett.github.io',
  base: '/html-artifacts',
  // Static SSG (default). Artifacts + previews are served verbatim from public/.
  // Search = the instant client-side inline filter (name/tag/source); no
  // full-text/Pagefind in v1 — kept simple, no per-artifact pages needed.
  vite: {
    plugins: [tailwindcss()],
    server: {
      headers: {
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
      },
    },
  },
});
