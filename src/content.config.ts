import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Шапка документа — полями во frontmatter; PageTitle показывает её под заголовком.
// Формат проверяется при сборке: не тот — сборка падает.
const header = z.object({
  /** Код стандарта: jcb-<имя>. Есть только у стандартов. */
  code: z.string().regex(/^jcb-[a-z0-9-]+$/, 'код — jcb-<имя>').optional(),
  /** Версия: v<старший>.<младший>. */
  version: z.string().regex(/^v\d+\.\d+$/, 'версия — v<старший>.<младший>').optional(),
  /** Дата версии: 2026-11-16 (в кавычках или без). */
  date: z.coerce.date().optional(),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: header }) }),
};
