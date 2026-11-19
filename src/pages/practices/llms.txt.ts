import type { APIRoute } from 'astro';
import { headerLine } from '../../header';
import { absolute } from '../../markdown';
import { appendixNumber, getAppendices, getPractices, isDraft, type Practice } from '../../site';

const list = async (entries: Practice[]) =>
  (
    await Promise.all(
      entries.map(async (entry) => [
        `- [${entry.data.title}](${absolute(`practices/${entry.id}.md`)}): ${headerLine(entry.data)}`,
        ...(await getAppendices(entry.id)).map(
          (a) => `  - [Приложение ${appendixNumber(a.id)}](${absolute(`practices/${a.id}.md`)})`,
        ),
      ]),
    )
  ).flat();

export const GET: APIRoute = async () => {
  const practices = (await getPractices()).flat();
  const parts = [
    '# Практики jcb-*',
    '> Правила для проектов: ветки и версии, настройки окружения, порты, проверки, внешние службы.',
    [
      'Как пользоваться:',
      '',
      '- Практика — правила, по которым проект соответствует или нет; соответствие — по разделу «Проверка».',
      '- Проект фиксирует принятые практики с версией в своём CLAUDE.md: `jcb-dotenv v2.1`.',
      `- Текст принятой версии не меняется: ${absolute('practices/<имя>/<версия>.md')}. Ссылки ниже — текущий текст.`,
      `- Список практик с версиями — ${absolute('practices/index.json')}; все практики одним файлом — ${absolute('practices/llms-full.txt')}.`,
      '- Приложение к практике — необязательное дополнение: связанные материалы (примеры, пояснения, инструменты), которые могут пригодиться; соответствие проверяется только по самой практике.',
    ].join('\n'),
    ['## Принятые', '', ...(await list(practices.filter((e) => !isDraft(e.data.version))))].join('\n'),
    [
      '## В разработке',
      '',
      '`v0.x` — ещё в работе: текст меняется свободно, без новой версии; устоявшаяся версия начнётся с `v1.0`.',
      '',
      ...(await list(practices.filter((e) => isDraft(e.data.version)))),
    ].join('\n'),
  ];
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
