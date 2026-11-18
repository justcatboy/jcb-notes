import type { MarkdownHeading } from 'astro';

/** Разделы ## для оглавления — когда их не меньше min; иначе пусто и оглавления нет. */
export function tocItems(headings: MarkdownHeading[], min = 3): MarkdownHeading[] {
  const items = headings.filter((h) => h.depth === 2);
  return items.length >= min ? items : [];
}
