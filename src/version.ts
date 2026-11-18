// Версия сайта при сборке — из git.
// - В main (сборка на Cloudflare Pages) теги версий стоят на коммитах слияния: «v2026.002»
//   или «v2026.002-1-g3ded221», если после версии были коммиты.
// - В dev теги не входят (jcb-git-workflow: тег — только на слиянии в main): «v2026.002+dev».
// - Нет git или тегов — «dev».
// Cloudflare Pages (переменная CF_PAGES) скачивает репозиторий без истории и тегов — сначала докачиваем их.
import { execSync } from 'node:child_process';

const git = (args: string) =>
  execSync(`git ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

if (process.env.CF_PAGES) {
  try {
    git('fetch --unshallow --tags');
  } catch {
    try {
      git('fetch --tags');
    } catch {}
  }
}

function describe(): string {
  try {
    return git('describe --tags --match "v[0-9]*"');
  } catch {
    try {
      const last = git('tag --list "v[0-9]*" --sort=-v:refname').split('\n')[0];
      return last ? `${last}+dev` : 'dev';
    } catch {
      return 'dev';
    }
  }
}

export const siteVersion = describe();
/** Ближайший тег версии — для ссылки на него. */
export const siteTag = siteVersion.match(/^v\d{4}\.\d{3}/)?.[0];
