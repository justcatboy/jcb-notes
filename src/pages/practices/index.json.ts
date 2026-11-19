import type { APIRoute } from 'astro';
import { day } from '../../header';
import { absolute } from '../../markdown';
import { appendixNumber, getAppendices, getPractices, isDraft } from '../../site';
import { practiceVersions } from '../../versions';

export const GET: APIRoute = async () => {
  const versions = await practiceVersions();
  const practices = await Promise.all(
    (await getPractices()).flat().map(async (entry) => ({
      code: entry.data.code,
      title: entry.data.title,
      version: entry.data.version,
      date: entry.data.date ? day(entry.data.date) : null,
      draft: isDraft(entry.data.version),
      url: absolute(`practices/${entry.id}/`),
      md: absolute(`practices/${entry.id}/${entry.data.version}.md`),
      appendices: (await getAppendices(entry.id)).map((a) => ({
        number: appendixNumber(a.id),
        md: absolute(`practices/${a.id}.md`),
      })),
      versions: versions
        .filter((v) => v.name === entry.id)
        .map((v) => ({ version: v.version, date: v.date ? day(v.date) : null, md: absolute(`practices/${entry.id}/${v.version}.md`) })),
    })),
  );
  const body = {
    site: absolute(''),
    description: 'Практики jcb-*. Проект фиксирует принятые практики с версией: «jcb-dotenv v2.0». draft: true — v0.x, ещё в разработке.',
    practices,
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
