import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_TITLE = 'JCB-NOTES';
export const REPO = 'https://github.com/justcatboy/jcb-notes';

export type Doc =
  | { collection: 'practices'; entry: CollectionEntry<'practices'> }
  | { collection: 'blog'; entry: CollectionEntry<'blog'> }
  | { collection: 'pages'; entry: CollectionEntry<'pages'> };

export function docPath(collection: Doc['collection'], id: string): string {
  return collection === 'pages' ? id : `${collection}/${id}`;
}

export function downloadName(collection: Doc['collection'], id: string): string {
  return `${collection === 'practices' ? `jcb-${id}` : id}`.replaceAll('/', '-') + '.md';
}

export async function allDocs(): Promise<Doc[]> {
  return [
    ...(await getCollection('practices')).map((entry) => ({ collection: 'practices' as const, entry })),
    ...(await getCollection('blog')).map((entry) => ({ collection: 'blog' as const, entry })),
    ...(await getCollection('pages')).map((entry) => ({ collection: 'pages' as const, entry })),
  ];
}

export const isDraft = (version: string) => version.startsWith('v0.');

// новая практика — имя папки сюда
export const practiceGroups = [
  ['git-workflow', 'git-public-ready', 'git-private-backup'],
  ['dotenv', 'devports', 'external-services', 'testing'],
];

export type Practice = CollectionEntry<'practices'> & { data: { code: string; version: string } };

export async function getPractices(): Promise<Practice[][]> {
  const all = (await getCollection('practices')).filter((entry): entry is Practice =>
    Boolean(entry.data.code && entry.data.version),
  );
  const listed = new Set(practiceGroups.flat());
  const missing = all.filter((entry) => !listed.has(entry.id)).map((entry) => entry.id);
  if (missing.length) throw new Error(`Практики не в practiceGroups (src/site.ts): ${missing.join(', ')}`);
  return practiceGroups.map((group) =>
    group.map((name) => all.find((entry) => entry.id === name)).filter((entry): entry is Practice => Boolean(entry)),
  );
}

export function appendixNumber(id: string): number | undefined {
  const n = id.match(/\/appendix-(\d+)$/)?.[1];
  return n ? Number(n) : undefined;
}

export async function getAppendices(name: string): Promise<CollectionEntry<'practices'>[]> {
  return (await getCollection('practices'))
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
