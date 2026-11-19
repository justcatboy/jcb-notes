interface HeaderFields {
  code?: string;
  version?: string;
  date?: Date;
}

export const day = (date: Date) => date.toISOString().slice(0, 10);

export function headerLine({ code, version, date }: HeaderFields): string | null {
  if (!version) return date ? day(date) : null;
  return [code && `Практика ${code}`, version, date && day(date)].filter(Boolean).join(' - ');
}
