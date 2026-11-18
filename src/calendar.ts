// Календарь месяца для правой колонки главной: одна разметка и при сборке, и в браузере.

export interface CalendarPost {
  title: string;
  url: string;
}

/** Ключ дня: 2026-11-18. */
export const dayKey = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

/** 1 запись, 2 записи, 5 записей, 21 запись. */
function plural(n: number, one: string, few: string, many: string): string {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}

/**
 * HTML месяца: заголовок со стрелками и сетка с понедельника, всегда 6 недель. today — ключ сегодняшнего дня,
 * posts — записи по ключу дня (день с записями выделен, при наведении или нажатии — сколько их).
 */
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
      // Подсказка у краёв — к краю, чтобы не вылезала за колонку.
      const col = (offset + d - 1) % 7;
      const edge = col < 2 ? ' cal-l' : col > 4 ? ' cal-r' : '';
      const today = cls ? ' cal-today' : '';
      const text = `${count} ${plural(count, 'запись', 'записи', 'записей')}`;
      cells.push(`<span class="cal-post${today}${edge}" tabindex="0" data-tip="${text}" aria-label="${d}: ${text}">${d}</span>`);
    } else {
      cells.push(`<span${cls}>${d}</span>`);
    }
  }
  // Всегда 6 недель — высота не меняется при переключении месяцев.
  while (cells.length < WEEKDAYS.length + 42) cells.push('<span aria-hidden="true">&nbsp;</span>');
  return (
    `<div class="cal-head">` +
    `<button type="button" class="cal-nav" data-step="-1" aria-label="Предыдущий месяц">‹</button>` +
    `<span class="cal-title">${title}</span>` +
    `<button type="button" class="cal-nav" data-step="1" aria-label="Следующий месяц">›</button>` +
    `</div><div class="cal-grid">${cells.join('')}</div>`
  );
}
