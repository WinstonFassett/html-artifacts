// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE ?? 'https://winstonfassett.github.io',
  base: process.env.BASE_URL ?? '/html-artifacts',
  // Static SSG (default). Artifacts + previews are served verbatim from public/.
  // Search = the instant client-side inline filter (name/tag/source); no
  // full-text/Pagefind in v1 — kept simple, no per-artifact pages needed.
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['macbook-pro.tailc3138.ts.net'],
      headers: {
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
      },
    },
  },
});
