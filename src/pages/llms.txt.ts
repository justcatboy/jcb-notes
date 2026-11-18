// /llms.txt — оглавление сайта для LLM (формат llmstxt.org). Стандарты — отдельным оглавлением в /standards/llms.txt.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute } from '../markdown';
import { getPosts, SITE_TITLE } from '../site';

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const pages = await getCollection('pages');
  const parts = [
    `# ${SITE_TITLE}`,
    '> Личный блог о разном, гайды и стандарты jcb-* — правила для проектов, на которые можно сослаться с версией.',
    `Стандарты: ${absolute('standards/llms.txt')} — оглавление, как пользоваться, ссылки на .md каждого стандарта.`,
    [
      '## Блог',
      '',
      ...posts.map((post) => `- [${post.data.title}](${absolute(`blog/${post.id}.md`)}): ${post.data.description}`),
    ].join('\n'),
    ['## Страницы', '', ...pages.map((page) => `- [${page.data.title}](${absolute(`${page.id}.md`)})`)].join('\n'),
  ];
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
