// Строка шапки из полей frontmatter: «Стандарт jcb-dotenv - v1.0 - 2026-11-16» или «v0.1 - 2026-11-16».
// Одна на сайт (PageTitle) и на все .md (src/markdown.ts).
interface HeaderFields {
  code?: string;
  version?: string;
  date?: Date;
}

export function headerLine({ code, version, date }: HeaderFields): string | null {
  if (!version) return null;
  return [code && `Стандарт ${code}`, version, date && date.toISOString().slice(0, 10)].filter(Boolean).join(' - ');
}
