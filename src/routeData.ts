// В <head> каждой страницы — ссылка на её .md: Claude, открыв HTML, видит, что есть текст в Markdown.
// (Ссылка на /llms.txt — общая, в `head` в astro.config.mjs.)
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';
import { page } from './markdown';

let ids: Promise<Set<string>> | undefined;

export const onRequest = defineRouteMiddleware(async (context) => {
  const route = context.locals.starlightRoute;
  ids ??= getCollection('docs').then((docs) => new Set(docs.map((doc) => doc.id)));
  const id = route.entry.id || 'index'; // у главной Starlight отдаёт пустой id, в коллекции она — index
  if (!(await ids).has(id)) return; // 404 и прочие служебные — без .md
  route.head.push({ tag: 'link', attrs: { rel: 'alternate', type: 'text/markdown', href: page(`${id}.md`) } });
});
