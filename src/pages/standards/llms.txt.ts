import type { APIRoute } from 'astro';
import { headerLine } from '../../header';
import { absolute } from '../../markdown';
import { appendixNumber, getAppendices, getStandards } from '../../site';

export const GET: APIRoute = async () => {
  const standards = (await getStandards()).flat();
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
      '- Приложение к стандарту — необязательное дополнение: связанные материалы (примеры, пояснения, инструменты), которые могут пригодиться; соответствие проверяется только по стандарту. `v0.x` — черновик.',
    ].join('\n'),
    [
      '## Стандарты',
      '',
      ...(
        await Promise.all(
          standards.map(async (entry) => [
            `- [${entry.data.title}](${absolute(`standards/${entry.id}.md`)}): ${headerLine(entry.data)}`,
            ...(await getAppendices(entry.id)).map(
              (a) => `  - [Приложение ${appendixNumber(a.id)}](${absolute(`standards/${a.id}.md`)})`,
            ),
          ]),
        )
      ).flat(),
    ].join('\n'),
  ];
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
