import { execFileSync } from 'node:child_process';
import { toMarkdown } from './markdown';
import { getPractices } from './site';
import './version'; // докачивает историю на Cloudflare

export interface PracticeVersion {
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

function fromHistory(file: string): Omit<PracticeVersion, 'name'>[] {
  let log: string;
  try {
    log = git('log', '--follow', '--format=%x00%H', '--name-only', '--', file);
  } catch {
    return [];
  }
  const found = new Map<string, Omit<PracticeVersion, 'name'>>();
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

let cache: Promise<PracticeVersion[]> | undefined;

export function practiceVersions(): Promise<PracticeVersion[]> {
  cache ??= (async () => {
    const practices = (await getPractices()).flat();
    return practices.flatMap((entry) => {
      const name = entry.id;
      const current: PracticeVersion = {
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
