import { getCollection } from 'astro:content';

/**
 * 전체 검색 인덱스 생성
 * pagefind 또는 fuse.js와 연동 가능 (Phase 4)
 */
export async function buildSearchIndex() {
  const [books, entities, designs, blogs] = await Promise.all([
    getCollection('book', e => e.data.published),
    getCollection('entities', e => e.data.published),
    getCollection('design', e => e.data.published),
    getCollection('blog', e => e.data.published),
  ]);

  return [
    ...books.map(doc => ({
      type: 'book' as const,
      id: doc.slug,
      title: doc.data.title,
      excerpt: doc.data.excerpt ?? '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/book/${doc.slug}`,
    })),
    ...entities.map(doc => ({
      type: 'entity' as const,
      id: doc.data.id,
      title: doc.data.name.ko,
      excerpt: doc.data.description ?? '',
      entities: [doc.data.id],
      tags: doc.data.tags ?? [],
      url: `/entity/${doc.data.type}s/${doc.data.id}`,
    })),
    ...designs.map(doc => ({
      type: 'design' as const,
      id: doc.slug,
      title: doc.data.title,
      excerpt: '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/design/${doc.slug}`,
    })),
    ...blogs.map(doc => ({
      type: 'blog' as const,
      id: doc.slug,
      title: doc.data.title,
      excerpt: doc.data.excerpt ?? '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/blog/${doc.slug}`,
    })),
  ];
}
