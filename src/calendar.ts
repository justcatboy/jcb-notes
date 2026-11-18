
export interface CalendarPost {
  title: string;
  url: string;
}

export const dayKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

function plural(n: number, one: string, few: string, many: string): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}

export function renderMonth(y: number, m: number, today: string, posts: Record<string, CalendarPost[]>): string {
  const title = new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(new Date(y, m, 1)).replace(' г.', '');
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // понедельник — 0
  const days = new Date(y, m + 1, 0).getDate();
  const cells: string[] = WEEKDAYS.map((w) => `<span class="cal-wd">${w}</span>`);
  for (let i = 0; i < offset; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const key = dayKey(y, m, d);
    const cls = key === today ? ' class="cal-today"' : '';
    const count = posts[key]?.length ?? 0;
    if (count) {
      // у краёв подсказка прижата к краю
      const col = (offset + d - 1) % 7;
      const edge = col < 2 ? ' cal-l' : col > 4 ? ' cal-r' : '';
      const today = cls ? ' cal-today' : '';
      const text = `${count} ${plural(count, 'запись', 'записи', 'записей')}`;
      cells.push(`<span class="cal-post${today}${edge}" tabindex="0" data-tip="${text}" aria-label="${d}: ${text}">${d}</span>`);
    } else {
      cells.push(`<span${cls}>${d}</span>`);
    }
  }
  // всегда 6 недель: высота не скачет
  while (cells.length < WEEKDAYS.length + 42) cells.push('<span aria-hidden="true">&nbsp;</span>');
  return (
    `<div class="cal-head">` +
    `<button type="button" class="cal-nav" data-step="-1" aria-label="Предыдущий месяц">‹</button>` +
    `<span class="cal-title">${title}</span>` +
    `<button type="button" class="cal-nav" data-step="1" aria-label="Следующий месяц">›</button>` +
    `</div><div class="cal-grid">${cells.join('')}</div>`
  );
}
