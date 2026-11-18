import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Формат полей проверяется при сборке: не тот — сборка падает.

// standards/<имя>/index.md → «<имя>», standards/<имя>/appendix-1.md → «<имя>/appendix-1».
const standards = defineCollection({
  loader: glob({
    base: './src/content/standards',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/\/index$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    /** Код стандарта: jcb-<имя>. Есть только у самого стандарта, у приложения — нет. */
    code: z.string().regex(/^jcb-[a-z0-9-]+$/, 'код — jcb-<имя>').optional(),
    /** Версия: v<старший>.<младший>. */
    version: z.string().regex(/^v\d+\.\d+$/, 'версия — v<старший>.<младший>').optional(),
    /** Дата версии: 2026-11-16. */
    date: z.coerce.date().optional(),
  }),
});

// Посты блога: заметки и гайды (метка «гайд»).
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    /** Одна строка для ленты и RSS. */
    description: z.string(),
    date: z.coerce.date(),
    /** Когда пост заметно поправили — для гайдов, которые следят за изменениями службы. */
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// Отдельные страницы вне блога: /stack/.
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { standards, blog, pages };
