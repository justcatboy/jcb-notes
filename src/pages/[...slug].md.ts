// Каждая страница — ещё и файлом .md рядом: /standards/dotenv/ → /standards/dotenv.md, /blog/brevo/ → /blog/brevo.md.
// Это всегда текущий текст; неизменяемый по версии — /standards/dotenv/v1.0.md (standards/[name]/[version].md.ts).
import type { APIRoute, GetStaticPaths } from 'astro';
import { toMarkdown } from '../markdown';
import { allDocs, docPath, type Doc } from '../site';

export const getStaticPaths = (async () =>
  (await allDocs()).map((doc) => ({ params: { slug: docPath(doc.collection, doc.entry.id) }, props: { doc } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { entry } = (props as { doc: Doc }).doc;
  return new Response(toMarkdown(entry.data, entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
