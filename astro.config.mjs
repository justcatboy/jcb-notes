import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Стандарт — папка standards/<имя>/: index.md (стандарт) и appendix-1.md (приложение 1).
const standards = ['git-workflow', 'dotenv', 'devports', 'external-services', 'testing', 'deploy'];

const standard = (name) => ({
  label: `jcb-${name}`,
  items: [
    { label: 'Стандарт', slug: `standards/${name}` },
    { label: 'Приложение 1', slug: `standards/${name}/appendix-1` },
  ],
});

export default defineConfig({
  // GitHub Pages: https://justcatboy.github.io/jcb-notes/
  site: 'https://justcatboy.github.io',
  base: '/jcb-notes',
  integrations: [
    starlight({
      title: 'JCB-NOTES',
      locales: {
        root: { label: 'Русский', lang: 'ru' },
      },
      customCss: ['./src/styles/custom.css'],
      components: {
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar: [
        { label: 'Стандарты', items: standards.map(standard) },
        { label: 'Гайды', items: [{ autogenerate: { directory: 'guides' } }] },
        { label: 'Claude', items: [{ autogenerate: { directory: 'claude' } }] },
        { label: 'Мой стек', slug: 'stack' },
      ],
    }),
  ],
});
