// Машиночитаемый список стандартов: /standards/index.json. Для Claude и скриптов в других проектах:
// какая версия текущая, где её текст, какие версии были.
import type { APIRoute } from 'astro';
import { day } from '../../header';
import { absolute } from '../../markdown';
import { appendixNumber, getAppendices, getStandards } from '../../site';
import { standardVersions } from '../../versions';

export const GET: APIRoute = async () => {
  const versions = await standardVersions();
  const standards = await Promise.all(
    (await getStandards()).flat().map(async (entry) => ({
      code: entry.data.code,
      title: entry.data.title,
      version: entry.data.version,
      date: entry.data.date ? day(entry.data.date) : null,
      draft: entry.data.version.startsWith('v0.'),
      url: absolute(`standards/${entry.id}/`),
      md: absolute(`standards/${entry.id}/${entry.data.version}.md`),
      appendices: (await getAppendices(entry.id)).map((a) => ({
        number: appendixNumber(a.id),
        md: absolute(`standards/${a.id}.md`),
      })),
      versions: versions
        .filter((v) => v.name === entry.id)
        .map((v) => ({ version: v.version, date: v.date ? day(v.date) : null, md: absolute(`standards/${entry.id}/${v.version}.md`) })),
    })),
  );
  const body = {
    site: absolute(''),
    description: 'Стандарты jcb-*. Проект фиксирует принятые стандарты с версией: «jcb-dotenv v1.0».',
    standards,
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
