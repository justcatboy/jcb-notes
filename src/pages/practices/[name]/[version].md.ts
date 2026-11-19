import type { APIRoute, GetStaticPaths } from 'astro';
import { practiceVersions, type PracticeVersion } from '../../../versions';

export const getStaticPaths = (async () =>
  (await practiceVersions()).map((v) => ({ params: { name: v.name, version: v.version }, props: { v } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response((props as { v: PracticeVersion }).v.markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
