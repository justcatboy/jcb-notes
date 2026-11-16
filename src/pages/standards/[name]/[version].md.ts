// Неизменяемый текст стандарта по версии: /standards/dotenv/v1.0.md. На него ссылаются проекты,
// принявшие «jcb-dotenv v1.0», — он не меняется, когда выходит новая версия.
import type { APIRoute, GetStaticPaths } from 'astro';
import { standardVersions, type StandardVersion } from '../../../versions';

export const getStaticPaths = (async () =>
  (await standardVersions()).map((v) => ({ params: { name: v.name, version: v.version }, props: { v } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response((props as { v: StandardVersion }).v.markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
