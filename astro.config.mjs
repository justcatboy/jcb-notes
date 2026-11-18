import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages: собирает и выкладывает сам при push в main.
export default defineConfig({
  site: 'https://jcb-notes.pages.dev',
  integrations: [sitemap()],
  markdown: {
    // Две темы подсветки: светлая по умолчанию, тёмная — через --shiki-dark (src/styles/site.css).
    shikiConfig: { themes: { light: 'min-light', dark: 'min-dark' } },
  },
});
