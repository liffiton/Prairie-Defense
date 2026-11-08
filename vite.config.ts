import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative base path so the built game runs anywhere
  // (GitHub Pages subpaths, Netlify, Vercel, itch.io, Cloudflare Pages, etc.)
  base: './',
});
