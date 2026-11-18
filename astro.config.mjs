import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jcb-notes.pages.dev',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { themes: { light: 'min-light', dark: 'min-dark' } },
  },
});
