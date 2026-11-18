import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';


// dotenv/index.md → dotenv, dotenv/appendix-1.md → dotenv/appendix-1
const standards = defineCollection({
  loader: glob({
    base: './src/content/standards',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/\/index$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    code: z.string().regex(/^jcb-[a-z0-9-]+$/, 'код — jcb-<имя>').optional(),
    version: z.string().regex(/^v\d+\.\d+$/, 'версия — v<старший>.<младший>').optional(),
    date: z.coerce.date().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { standards, blog, pages };
