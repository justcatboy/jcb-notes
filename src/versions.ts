// Версии стандартов — неизменяемые адреса /standards/<имя>/<версия>.md.
// Текущая версия — из коллекции (то, что сейчас на сайте); прошлые — из истории git: для каждой версии
// берётся последний коммит, где в файле стояла эта версия. Сборке нужна вся история — на Cloudflare её докачивает
// src/version.ts.
import { execFileSync } from 'node:child_process';
import { toMarkdown } from './markdown';
import { getStandards } from './site';
import './version'; // на Cloudflare докачивает историю до чтения git log

export interface StandardVersion {
  /** Имя папки стандарта: dotenv. */
  name: string;
  code: string;
  version: string;
  date?: Date;
  markdown: string;
}

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });

const field = (frontmatter: string, name: string) =>
  frontmatter.match(new RegExp(`^${name}:\\s*['"]?(.+?)['"]?\\s*$`, 'm'))?.[1];

/** Прошлые версии файла из git: версия → Markdown последнего коммита с этой версией. */
function fromHistory(file: string): Omit<StandardVersion, 'name'>[] {
  let log: string;
  try {
    // По коммитам от новых к старым, с путём файла в каждом (--follow — через переименования).
    log = git('log', '--follow', '--format=%x00%H', '--name-only', '--', file);
  } catch {
    return [];
  }
  const found = new Map<string, Omit<StandardVersion, 'name'>>();
  for (const chunk of log.split('\0').filter(Boolean)) {
    const [hash, ...paths] = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    const path = paths.at(-1);
    if (!hash || !path) continue;
    let text: string;
    try {
      text = git('show', `${hash}:${path}`).replace(/\r\n/g, '\n');
    } catch {
      continue;
    }
    const match = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) continue;
    const [code, version, title, date] = ['code', 'version', 'title', 'date'].map((name) => field(match[1], name));
    if (!code || !version || !title || found.has(version)) continue;
    const data = { title, code, version, date: date ? new Date(date) : undefined };
    found.set(version, { ...data, code, version, markdown: toMarkdown(data, text.slice(match[0].length)) });
  }
  return [...found.values()];
}

let cache: Promise<StandardVersion[]> | undefined;

/** Все версии всех стандартов: текущие (из коллекции) и прошлые (из git), новые первыми. */
export function standardVersions(): Promise<StandardVersion[]> {
  cache ??= (async () => {
    const standards = (await getStandards()).flat();
    return standards.flatMap((entry) => {
      const name = entry.id;
      const current: StandardVersion = {
        name,
        code: entry.data.code,
        version: entry.data.version,
        date: entry.data.date,
        markdown: toMarkdown(entry.data, entry.body ?? ''),
      };
      const past = entry.filePath ? fromHistory(entry.filePath).filter((v) => v.version !== current.version) : [];
      return [current, ...past.map((v) => ({ ...v, name }))];
    });
  })();
  return cache;
}
