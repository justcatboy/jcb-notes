// /llms.txt — оглавление сайта для LLM (формат llmstxt.org): что здесь и где текст каждого документа в .md.
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { headerLine } from '../header';
import { absolute } from '../markdown';

const sections = [
  { dir: 'standards', title: 'Стандарты' },
  { dir: 'guides', title: 'Гайды' },
  { dir: 'claude', title: 'Claude' },
  { dir: 'notes', title: 'Notes' },
];

const line = (entry: CollectionEntry<'docs'>) => {
  const header = headerLine(entry.data);
  return `- [${entry.data.title}](${absolute(`${entry.id}.md`)})${header ? `: ${header}` : ''}`;
};

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));
  const parts = [
    '# JCB-NOTES',
    '> Мои стандарты jcb-* и гайды для своих проектов: ветки и версии, настройки окружения, порты, проверки, выкладка, внешние службы.',
    [
      'Как пользоваться:',
      '',
      '- Стандарт — правила, по которым проект соответствует или нет; соответствие — по разделу «Проверка».',
      '- Проект фиксирует принятые стандарты с версией в своём CLAUDE.md: `jcb-dotenv v1.0`.',
      `- Текст принятой версии не меняется: ${absolute('standards/<имя>/<версия>.md')}. Ссылки ниже — текущий текст.`,
      `- Список стандартов с версиями — ${absolute('standards.json')}; весь сайт одним файлом — ${absolute('llms-full.txt')}.`,
      '- «Приложение 1» к стандарту — примеры автора на его стеке, не требование. `v0.x` — черновик.',
    ].join('\n'),
    ...sections.map(({ dir, title }) =>
      [`## ${title}`, '', ...docs.filter((entry) => entry.id.startsWith(`${dir}/`)).map(line)].join('\n'),
    ),
  ];
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
