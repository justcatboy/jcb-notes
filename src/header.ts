// Строка шапки из полей frontmatter: «Стандарт jcb-dotenv - v1.0 - 2026-11-16» у стандарта, «2026-11-16» у поста.
// Одна на сайт и на все .md (src/markdown.ts).
interface HeaderFields {
  code?: string;
  version?: string;
  date?: Date;
}

export const day = (date: Date) => date.toISOString().slice(0, 10);

export function headerLine({ code, version, date }: HeaderFields): string | null {
  if (!version) return date ? day(date) : null;
  return [code && `Стандарт ${code}`, version, date && day(date)].filter(Boolean).join(' - ');
}
