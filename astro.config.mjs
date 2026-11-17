import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// Стандарт — папка standards/<имя>/: index.md (стандарт) и appendix-1.md (приложение 1).
// Группы — без заголовка: в меню между ними черта (custom.css, .group-end).
const standardGroups = [
  ['git-workflow', 'git-public-ready', 'git-private-backup'],
  ['dotenv', 'devports', 'external-services', 'testing', 'deploy'],
];

const standard = (name, groupEnd) => ({
  label: `jcb-${name}`,
  items: [
    { label: 'Стандарт', slug: `standards/${name}`, ...(groupEnd && { attrs: { class: 'group-end' } }) },
    { label: 'Приложение 1', slug: `standards/${name}/appendix-1` },
  ],
});

const standards = standardGroups.flatMap((group, g) =>
  group.map((name, i) => standard(name, i === group.length - 1 && g < standardGroups.length - 1)),
);

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
      social: [{ icon: 'github', label: 'Исходники на GitHub', href: 'https://github.com/justcatboy/jcb-notes' }],
      customCss: ['./src/styles/custom.css'],
      // Для Claude: оглавление сайта и .md каждой страницы (src/routeData.ts).
      head: [{ tag: 'link', attrs: { rel: 'alternate', type: 'text/plain', title: 'llms.txt', href: '/jcb-notes/llms.txt' } }],
      routeMiddleware: './src/routeData.ts',
      components: {
        Footer: './src/components/Footer.astro',
        Header: './src/components/Header.astro',
        PageTitle: './src/components/PageTitle.astro',
        Sidebar: './src/components/Sidebar.astro',
      },
      // Разделы — темы starlight-sidebar-topics: вкладки в шапке (Header.astro), слева — меню только
      // текущего раздела. Ссылка темы — её первая страница.
      plugins: [
        starlightSidebarTopics(
          [
            { label: 'Стандарты', link: '/standards/git-workflow/', items: standards },
            { label: 'Гайды', link: '/guides/brevo/', items: [{ autogenerate: { directory: 'guides' } }] },
            { label: 'Claude', link: '/claude/decisions/', items: [{ autogenerate: { directory: 'claude' } }] },
            { label: 'Notes', link: '/notes/stack/', items: [{ autogenerate: { directory: 'notes' } }] },
          ],
          // Главная — вне разделов: обзорная страница без меню слева.
          { exclude: ['/'] },
        ),
      ],
    }),
  ],
});
