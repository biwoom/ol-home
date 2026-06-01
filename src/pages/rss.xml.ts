import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (
    await getCollection('blog', ({ data }) => data.published)
  ).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'OL BLOG — 불교 콘텐츠 작업 일지',
    description: 'OL 프로젝트의 개발 기록, 결정과 회고, 작은 발견들.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      pubDate: post.data.date,
      link: `/ol-home/blog/${post.id}/`,
    })),
    customData: '<language>ko</language>',
  });
}
