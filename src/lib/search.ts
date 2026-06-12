import { getCollection } from 'astro:content';
import { getTextEntryUrl, isTextDocumentEntry } from './text';
import { getStoryEntryUrl, isStorySeriesIndex } from './story';

export async function buildSearchIndex() {
  const [text, stories, entities, designs, blogs] = await Promise.all([
    getCollection('text', e => e.data.published && isTextDocumentEntry(e)),
    getCollection('story', e => e.data.published && !isStorySeriesIndex(e)),
    getCollection('entities', e => e.data.published),
    getCollection('design', e => e.data.published),
    getCollection('blog', e => e.data.published),
  ]);

  return [
    ...text.map(doc => ({
      type: 'text' as const,
      id: doc.id,
      title: doc.data.title,
      excerpt: doc.data.excerpt ?? '',
      entities: doc.data.entities ?? [],
      tags: doc.data.tags ?? [],
      url: getTextEntryUrl(doc),
    })),
    ...stories.map(doc => ({
      type: 'story' as const,
      id: doc.id,
      title: doc.data.title,
      excerpt: doc.data.description ?? '',
      entities: doc.data.primaryEntities ?? [],
      tags: doc.data.tags ?? [],
      url: getStoryEntryUrl(doc),
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
