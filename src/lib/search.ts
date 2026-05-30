import { getCollection } from 'astro:content';

export async function buildSearchIndex() {
  const [works, entities, designs, blogs] = await Promise.all([
    getCollection('works', e => e.data.published),
    getCollection('entities', e => e.data.published),
    getCollection('design', e => e.data.published),
    getCollection('blog', e => e.data.published),
  ]);

  return [
    ...works.map(doc => ({
      type: 'works' as const,
      id: doc.id,
      title: doc.data.title,
      excerpt: doc.data.excerpt ?? '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/works/${doc.id}`,
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
      id: doc.id,
      title: doc.data.title,
      excerpt: '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/design/${doc.id}`,
    })),
    ...blogs.map(doc => ({
      type: 'blog' as const,
      id: doc.id,
      title: doc.data.title,
      excerpt: doc.data.description ?? '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: `/blog/${doc.id}`,
    })),
  ];
}
