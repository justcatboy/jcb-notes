// Каждый документ — ещё и файлом .md рядом со страницей: /standards/dotenv/ → /standards/dotenv.md.
// В начале файла — заголовок `# …` и шапка из полей, чтобы файл читался сам по себе.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { headerLine } from '../header';

export const getStaticPaths = (async () => {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'docs'> };
  const header = headerLine(entry.data);
  const text = [`# ${entry.data.title}`, header, (entry.body ?? '').trim()].filter(Boolean).join('\n\n') + '\n';
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
