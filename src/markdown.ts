// Общее для всех машиночитаемых файлов сайта (.md страниц, версий, llms.txt, standards.json):
// адреса с учётом site/base и сам Markdown документа.
import { headerLine } from './header';

const site = (import.meta.env.SITE ?? '').replace(/\/$/, '');
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Путь внутри сайта с base: page('standards/dotenv.md') → /jcb-notes/standards/dotenv.md */
export const page = (path: string) => `${base}/${path.replace(/^\//, '')}`;
/** Полный адрес: absolute('standards/dotenv.md') → https://…/jcb-notes/standards/dotenv.md */
export const absolute = (path: string) => `${site}${page(path)}`;

export interface DocHeader {
  title: string;
  code?: string;
  version?: string;
  date?: Date;
}

/** Документ как самостоятельный .md: `# заголовок`, строка шапки, текст. */
export function toMarkdown(data: DocHeader, body: string): string {
  return [`# ${data.title}`, headerLine(data), body.trim()].filter(Boolean).join('\n\n') + '\n';
}
