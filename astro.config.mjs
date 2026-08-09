import { defineConfig } from 'astro/config';

// Static export — deployable to Cloudflare Pages, Netlify, or any static host.
export default defineConfig({
  site: 'https://failforward.dev',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
