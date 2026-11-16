// Машиночитаемый список стандартов: /standards.json. Для Claude и скриптов в других проектах:
// какая версия текущая, где её текст, какие версии были.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute } from '../markdown';
import { standardVersions } from '../versions';

const day = (date?: Date) => date?.toISOString().slice(0, 10) ?? null;

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const versions = await standardVersions();
  const standards = docs
    .filter((entry) => entry.data.code && entry.data.version)
    .map((entry) => {
      const name = entry.id.replace(/^standards\//, '');
      return {
        code: entry.data.code,
        title: entry.data.title,
        version: entry.data.version,
        date: day(entry.data.date),
        draft: entry.data.version!.startsWith('v0.'),
        url: absolute(`${entry.id}/`),
        md: absolute(`${entry.id}/${entry.data.version}.md`),
        appendix: absolute(`${entry.id}/appendix-1.md`),
        versions: versions
          .filter((v) => v.name === name)
          .map((v) => ({ version: v.version, date: day(v.date), md: absolute(`standards/${name}/${v.version}.md`) })),
      };
    });
  const body = {
    site: absolute(''),
    description: 'Стандарты jcb-* и гайды. Проект фиксирует принятые стандарты с версией: «jcb-dotenv v1.0».',
    standards,
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
