// /standards/llms-full.txt — все стандарты с приложениями одним файлом, текущие версии. Для Claude: один запрос вместо многих.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute, toMarkdown } from '../../markdown';
import { getStandards } from '../../site';

export const GET: APIRoute = async () => {
  const order = (await getStandards()).flat().map((entry) => entry.id);
  const all = await getCollection('standards');
  const docs = order.flatMap((name) => all.filter((entry) => entry.id === name || entry.id.startsWith(`${name}/`)));
  const text = docs
    .map((entry) => `<!-- ${absolute(`standards/${entry.id}/`)} -->\n\n${toMarkdown(entry.data, entry.body ?? '')}`)
    .join('\n---\n\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
