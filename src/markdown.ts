import { headerLine } from './header';

const site = (import.meta.env.SITE ?? '').replace(/\/$/, '');
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const page = (path: string) => `${base}/${path.replace(/^\//, '')}`;
export const absolute = (path: string) => `${site}${page(path)}`;

export interface DocHeader {
  title: string;
  code?: string;
  version?: string;
  date?: Date;
}

export function toMarkdown(data: DocHeader, body: string): string {
  return [`# ${data.title}`, headerLine(data), body.trim()].filter(Boolean).join('\n\n') + '\n';
}
