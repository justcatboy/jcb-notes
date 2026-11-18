// Машиночитаемый список стандартов: /standards/index.json. Для Claude и скриптов в других проектах:
// какая версия текущая, где её текст, какие версии были.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { day } from '../../header';
import { absolute } from '../../markdown';
import { getStandards } from '../../site';
import { standardVersions } from '../../versions';

export const GET: APIRoute = async () => {
  const versions = await standardVersions();
  const ids = new Set((await getCollection('standards')).map((entry) => entry.id));
  const standards = (await getStandards()).flat().map((entry) => ({
    code: entry.data.code,
    title: entry.data.title,
    version: entry.data.version,
    date: entry.data.date ? day(entry.data.date) : null,
    draft: entry.data.version.startsWith('v0.'),
    url: absolute(`standards/${entry.id}/`),
    md: absolute(`standards/${entry.id}/${entry.data.version}.md`),
    appendix: ids.has(`${entry.id}/appendix-1`) ? absolute(`standards/${entry.id}/appendix-1.md`) : null,
    versions: versions
      .filter((v) => v.name === entry.id)
      .map((v) => ({ version: v.version, date: v.date ? day(v.date) : null, md: absolute(`standards/${entry.id}/${v.version}.md`) })),
  }));
  const body = {
    site: absolute(''),
    description: 'Стандарты jcb-*. Проект фиксирует принятые стандарты с версией: «jcb-dotenv v1.0».',
    standards,
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
