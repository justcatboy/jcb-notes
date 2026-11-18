import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts, SITE_TITLE } from '../site';

export const GET: APIRoute = async (context) =>
  rss({
    title: SITE_TITLE,
    description: 'Личный блог: записи о разном — от разработки до всего, что интересно.',
    site: context.site!,
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>ru</language>',
  });
