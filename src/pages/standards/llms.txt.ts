// /standards/llms.txt — оглавление стандартов для LLM (формат llmstxt.org): как пользоваться и где текст каждого в .md.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { headerLine } from '../../header';
import { absolute } from '../../markdown';
import { getStandards } from '../../site';

export const GET: APIRoute = async () => {
  const standards = (await getStandards()).flat();
  const ids = new Set((await getCollection('standards')).map((entry) => entry.id));
  const parts = [
    '# Стандарты jcb-*',
    '> Правила для проектов: ветки и версии, настройки окружения, порты, проверки, выкладка, внешние службы.',
    [
      'Как пользоваться:',
      '',
      '- Стандарт — правила, по которым проект соответствует или нет; соответствие — по разделу «Проверка».',
      '- Проект фиксирует принятые стандарты с версией в своём CLAUDE.md: `jcb-dotenv v1.0`.',
      `- Текст принятой версии не меняется: ${absolute('standards/<имя>/<версия>.md')}. Ссылки ниже — текущий текст.`,
      `- Список стандартов с версиями — ${absolute('standards/index.json')}; все стандарты одним файлом — ${absolute('standards/llms-full.txt')}.`,
      '- «Приложение 1» к стандарту — примеры автора на его стеке, не требование. `v0.x` — черновик.',
    ].join('\n'),
    [
      '## Стандарты',
      '',
      ...standards.flatMap((entry) => {
        const appendix = `${entry.id}/appendix-1`;
        return [
          `- [${entry.data.title}](${absolute(`standards/${entry.id}.md`)}): ${headerLine(entry.data)}`,
          ...(ids.has(appendix) ? [`  - [Приложение 1](${absolute(`standards/${appendix}.md`)})`] : []),
        ];
      }),
    ].join('\n'),
  ];
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
