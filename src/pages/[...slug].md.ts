// Каждый документ — ещё и файлом .md рядом со страницей: /standards/dotenv/ → /standards/dotenv.md.
// Это всегда текущий текст; неизменяемый по версии — /standards/dotenv/v1.0.md (standards/[name]/[version].md.ts).
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { toMarkdown } from '../markdown';

export const getStaticPaths = (async () => {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'docs'> };
  return new Response(toMarkdown(entry.data, entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
