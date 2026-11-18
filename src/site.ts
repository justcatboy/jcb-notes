import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_TITLE = 'JCB-NOTES';
export const REPO = 'https://github.com/justcatboy/jcb-notes';

export type Doc =
  | { collection: 'standards'; entry: CollectionEntry<'standards'> }
  | { collection: 'blog'; entry: CollectionEntry<'blog'> }
  | { collection: 'pages'; entry: CollectionEntry<'pages'> };

export function docPath(collection: Doc['collection'], id: string): string {
  return collection === 'pages' ? id : `${collection}/${id}`;
}

export function downloadName(collection: Doc['collection'], id: string): string {
  return `${collection === 'standards' ? `jcb-${id}` : id}`.replaceAll('/', '-') + '.md';
}

export async function allDocs(): Promise<Doc[]> {
  return [
    ...(await getCollection('standards')).map((entry) => ({ collection: 'standards' as const, entry })),
    ...(await getCollection('blog')).map((entry) => ({ collection: 'blog' as const, entry })),
    ...(await getCollection('pages')).map((entry) => ({ collection: 'pages' as const, entry })),
  ];
}

// новый стандарт — имя папки сюда
export const standardGroups = [
  ['git-workflow', 'git-public-ready', 'git-private-backup'],
  ['dotenv', 'devports', 'external-services', 'testing', 'deploy'],
];

export type Standard = CollectionEntry<'standards'> & { data: { code: string; version: string } };

export async function getStandards(): Promise<Standard[][]> {
  const all = (await getCollection('standards')).filter((entry): entry is Standard =>
    Boolean(entry.data.code && entry.data.version),
  );
  const listed = new Set(standardGroups.flat());
  const missing = all.filter((entry) => !listed.has(entry.id)).map((entry) => entry.id);
  if (missing.length) throw new Error(`Стандарты не в standardGroups (src/site.ts): ${missing.join(', ')}`);
  return standardGroups.map((group) =>
    group.map((name) => all.find((entry) => entry.id === name)).filter((entry): entry is Standard => Boolean(entry)),
  );
}

export function appendixNumber(id: string): number | undefined {
  const n = id.match(/\/appendix-(\d+)$/)?.[1];
  return n ? Number(n) : undefined;
}

export async function getAppendices(name: string): Promise<CollectionEntry<'standards'>[]> {
  return (await getCollection('standards'))
    .filter((entry) => entry.id.startsWith(`${name}/`) && appendixNumber(entry.id) !== undefined)
    .sort((a, b) => appendixNumber(a.id)! - appendixNumber(b.id)!);
}

export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  return (await getCollection('blog')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title),
  );
}

export function countTags(posts: CollectionEntry<'blog'>[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
