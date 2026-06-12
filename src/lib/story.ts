import type { CollectionEntry } from 'astro:content';

type StoryEntry = CollectionEntry<'story'>;

export const STORY_DEFAULT_SERIES = '_story';
export const STORY_DEFAULT_PART = 'bibliography';
export const STORY_DEFAULT_GROUP = '_ungrouped';

export interface StoryGroup {
  key: string;
  slug: string;
  label: string;
  order: number;
  entries: StoryEntry[];
  count: number;
}

export interface StoryPart {
  key: string;
  slug: string;
  label: string;
  order: number;
  entries: StoryEntry[];
  groups: StoryGroup[];
  count: number;
}

export interface StorySeries {
  key: string;
  slug: string;
  label: string;
  order: number;
  entries: StoryEntry[];
  parts: StoryPart[];
  count: number;
}

export function slugifyStorySegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStorySeriesSlug(entry: StoryEntry): string {
  return entry.data.seriesSlug ?? entry.id.split('/')[0] ?? STORY_DEFAULT_SERIES;
}

export function getStoryPartSlug(entry: StoryEntry): string {
  return entry.data.partSlug ?? slugifyStorySegment(entry.data.part ?? STORY_DEFAULT_PART);
}

export function getStoryGroupSlug(entry: StoryEntry): string {
  return entry.data.groupSlug ?? slugifyStorySegment(entry.data.group ?? STORY_DEFAULT_GROUP);
}

export function isStorySeriesIndex(entry: StoryEntry): boolean {
  const segments = entry.id.split('/');
  return segments.length === 1 || segments.at(-1) === 'index';
}

export function getStoryDocumentSlug(entry: StoryEntry): string {
  return entry.id.split('/').at(-1) ?? slugifyStorySegment(entry.data.title);
}

export function getStoryEntryUrl(entry: StoryEntry): string {
  const seriesSlug = getStorySeriesSlug(entry);
  if (isStorySeriesIndex(entry)) return `/story/${seriesSlug}`;
  return `/story/${seriesSlug}/${getStoryPartSlug(entry)}/${getStoryDocumentSlug(entry)}`;
}

export function storyAsset(entry: StoryEntry, asset?: string): string {
  return asset ? `/generated/story/${entry.id}/${asset}` : '';
}

export function sortStoryEntries(entries: StoryEntry[]): StoryEntry[] {
  return [...entries].sort((a, b) => {
    const partDiff = (a.data.partOrder ?? 0) - (b.data.partOrder ?? 0);
    if (partDiff !== 0) return partDiff;

    const groupDiff = (a.data.groupOrder ?? 0) - (b.data.groupOrder ?? 0);
    if (groupDiff !== 0) return groupDiff;

    const orderDiff = (a.data.order ?? 0) - (b.data.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const chapterA = a.data.chapter ?? Number.MAX_SAFE_INTEGER;
    const chapterB = b.data.chapter ?? Number.MAX_SAFE_INTEGER;
    if (chapterA !== chapterB) return chapterA - chapterB;

    return a.data.title.localeCompare(b.data.title, 'ko');
  });
}

export function buildStoryHierarchy(entries: StoryEntry[]): StorySeries[] {
  const seriesMap = new Map<string, StoryEntry[]>();

  for (const entry of entries) {
    const seriesSlug = getStorySeriesSlug(entry);
    const seriesEntries = seriesMap.get(seriesSlug) ?? [];
    seriesEntries.push(entry);
    seriesMap.set(seriesSlug, seriesEntries);
  }

  return Array.from(seriesMap.entries())
    .map(([seriesSlug, seriesEntries]) => {
      const partMap = new Map<string, StoryEntry[]>();

      for (const entry of seriesEntries) {
        const partSlug = getStoryPartSlug(entry);
        const partEntries = partMap.get(partSlug) ?? [];
        partEntries.push(entry);
        partMap.set(partSlug, partEntries);
      }

      const parts = Array.from(partMap.entries())
        .map(([partSlug, partEntries]) => {
          const groupMap = new Map<string, StoryEntry[]>();

          for (const entry of partEntries) {
            const groupSlug = getStoryGroupSlug(entry);
            const groupEntries = groupMap.get(groupSlug) ?? [];
            groupEntries.push(entry);
            groupMap.set(groupSlug, groupEntries);
          }

          const groups = Array.from(groupMap.entries())
            .map(([groupSlug, groupEntries]) => ({
              key: groupSlug,
              slug: groupSlug,
              label: groupEntries[0]?.data.group ?? '본문',
              order: groupEntries[0]?.data.groupOrder ?? 0,
              entries: sortStoryEntries(groupEntries),
              count: groupEntries.length,
            }))
            .sort((a, b) => {
              const orderDiff = a.order - b.order;
              if (orderDiff !== 0) return orderDiff;
              return a.label.localeCompare(b.label, 'ko');
            });

          return {
            key: partSlug,
            slug: partSlug,
            label: partEntries[0]?.data.part ?? '본문',
            order: partEntries[0]?.data.partOrder ?? 0,
            entries: sortStoryEntries(partEntries),
            groups,
            count: partEntries.length,
          };
        })
        .sort((a, b) => {
          const orderDiff = a.order - b.order;
          if (orderDiff !== 0) return orderDiff;
          return a.label.localeCompare(b.label, 'ko');
        });

      return {
        key: seriesSlug,
        slug: seriesSlug,
        label: seriesEntries[0]?.data.series ?? seriesEntries[0]?.data.title ?? seriesSlug,
        order: seriesEntries[0]?.data.seriesOrder ?? 0,
        entries: sortStoryEntries(seriesEntries),
        parts,
        count: seriesEntries.length,
      };
    })
    .sort((a, b) => {
      const orderDiff = a.order - b.order;
      if (orderDiff !== 0) return orderDiff;
      return a.label.localeCompare(b.label, 'ko');
    });
}

export function formatStoryTag(tag: string): { prefix: string; label: string } {
  const [prefix, ...rest] = tag.split('/');
  return {
    prefix: rest.length > 0 ? prefix : '태그',
    label: rest.length > 0 ? rest.join('/') : tag,
  };
}
