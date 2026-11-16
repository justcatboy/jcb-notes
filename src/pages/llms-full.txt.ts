// /llms-full.txt — весь сайт одним файлом: все документы в Markdown, текущие версии. Для Claude: один запрос вместо многих.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute, toMarkdown } from '../markdown';

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).filter((entry) => entry.id !== 'index').sort((a, b) => a.id.localeCompare(b.id));
  const text = docs
    .map((entry) => `<!-- ${absolute(`${entry.id}/`)} -->\n\n${toMarkdown(entry.data, entry.body ?? '')}`)
    .join('\n---\n\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
