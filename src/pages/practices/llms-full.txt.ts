import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolute, toMarkdown } from '../../markdown';
import { getPractices } from '../../site';

export const GET: APIRoute = async () => {
  const order = (await getPractices()).flat().map((entry) => entry.id);
  const all = await getCollection('practices');
  const docs = order.flatMap((name) => all.filter((entry) => entry.id === name || entry.id.startsWith(`${name}/`)));
  const text = docs
    .map((entry) => `<!-- ${absolute(`practices/${entry.id}/`)} -->\n\n${toMarkdown(entry.data, entry.body ?? '')}`)
    .join('\n---\n\n');
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
