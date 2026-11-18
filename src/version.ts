import { execSync } from 'node:child_process';

const git = (args: string) =>
  execSync(`git ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// Cloudflare клонирует без истории и тегов
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
export const siteTag = siteVersion.match(/^v\d{4}\.\d{3}/)?.[0];
