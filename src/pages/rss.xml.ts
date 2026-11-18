// RSS блога: /rss.xml.
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts, SITE_TITLE } from '../site';

export const GET: APIRoute = async (context) =>
  rss({
    title: SITE_TITLE,
    description: 'Блог о том, как я веду свои проекты, и гайды.',
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
