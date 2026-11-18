// Общее для страниц и машиночитаемых файлов: адреса документов, порядок стандартов, посты по дате.
import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE_TITLE = 'JCB-NOTES';
export const REPO = 'https://github.com/justcatboy/jcb-notes';

export type Doc =
  | { collection: 'standards'; entry: CollectionEntry<'standards'> }
  | { collection: 'blog'; entry: CollectionEntry<'blog'> }
  | { collection: 'pages'; entry: CollectionEntry<'pages'> };

/** Путь документа без слэшей по краям: standards/dotenv, blog/brevo, stack. */
export function docPath(collection: Doc['collection'], id: string): string {
  return collection === 'pages' ? id : `${collection}/${id}`;
}

/** Имя скачиваемого .md: jcb-dotenv.md, jcb-dotenv-appendix-1.md, brevo.md. */
export function downloadName(collection: Doc['collection'], id: string): string {
  return `${collection === 'standards' ? `jcb-${id}` : id}`.replaceAll('/', '-') + '.md';
}

/** Все документы сайта — для .md каждой страницы. */
export async function allDocs(): Promise<Doc[]> {
  return [
    ...(await getCollection('standards')).map((entry) => ({ collection: 'standards' as const, entry })),
    ...(await getCollection('blog')).map((entry) => ({ collection: 'blog' as const, entry })),
    ...(await getCollection('pages')).map((entry) => ({ collection: 'pages' as const, entry })),
  ];
}

// Стандарты по группам — в списке между группами черта. Новый стандарт — имя папки сюда.
export const standardGroups = [
  ['git-workflow', 'git-public-ready', 'git-private-backup'],
  ['dotenv', 'devports', 'external-services', 'testing', 'deploy'],
];

export type Standard = CollectionEntry<'standards'> & { data: { code: string; version: string } };

/** Стандарты (без приложений) в порядке групп. Папка, которой нет в группах, — ошибка сборки. */
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

/** Посты, новые первыми. */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  return (await getCollection('blog')).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title),
  );
}

/** Метки со счётом, по убыванию. */
export function countTags(posts: CollectionEntry<'blog'>[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
