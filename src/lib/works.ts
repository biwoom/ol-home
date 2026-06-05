import type { CollectionEntry } from 'astro:content';

type WorkEntry = CollectionEntry<'works'>;

export const STANDALONE_SERIES = '_standalone';
export const UNPARTED_WORKS = '_unparted';
export const UNGROUPED_WORKS = '_ungrouped';

export interface WorksGroup {
  key: string;
  label: string;
  order: number;
  entries: WorkEntry[];
}

export interface WorksPart {
  key: string;
  label: string;
  order: number;
  groups: WorksGroup[];
  count: number;
}

export interface WorksSeries {
  key: string;
  label: string;
  order: number;
  parts: WorksPart[];
  count: number;
}

export function formatSeries(key: string): string {
  if (key === STANDALONE_SERIES) return '독립 문서';
  return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatGroup(key: string): string {
  if (key === UNGROUPED_WORKS) return '기타 문서';
  return key;
}

export function formatPart(key: string): string {
  if (key === UNPARTED_WORKS) return '기타 부';
  return key;
}

export function sortWorksEntries(entries: WorkEntry[]): WorkEntry[] {
  return [...entries].sort((a, b) => {
    const orderDiff = (a.data.order ?? 0) - (b.data.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const chapterA = a.data.chapter ?? Number.MAX_SAFE_INTEGER;
    const chapterB = b.data.chapter ?? Number.MAX_SAFE_INTEGER;
    if (chapterA !== chapterB) return chapterA - chapterB;

    return a.data.title.localeCompare(b.data.title, 'ko');
  });
}

export function buildWorksHierarchy(entries: WorkEntry[]): WorksSeries[] {
  const seriesMap = new Map<string, WorkEntry[]>();

  for (const entry of entries) {
    const seriesKey = entry.data.series ?? STANDALONE_SERIES;
    const seriesEntries = seriesMap.get(seriesKey) ?? [];
    seriesEntries.push(entry);
    seriesMap.set(seriesKey, seriesEntries);
  }

  return Array.from(seriesMap.entries())
    .map(([seriesKey, seriesEntries]) => {
      const partMap = new Map<string, WorkEntry[]>();

      for (const entry of seriesEntries) {
        const partKey = entry.data.part ?? UNPARTED_WORKS;
        const partEntries = partMap.get(partKey) ?? [];
        partEntries.push(entry);
        partMap.set(partKey, partEntries);
      }

      const parts = Array.from(partMap.entries())
        .map(([partKey, partEntries]) => {
          const groupMap = new Map<string, WorkEntry[]>();

          for (const entry of partEntries) {
            const groupKey = entry.data.group ?? UNGROUPED_WORKS;
            const groupEntries = groupMap.get(groupKey) ?? [];
            groupEntries.push(entry);
            groupMap.set(groupKey, groupEntries);
          }

          const groups = Array.from(groupMap.entries())
            .map(([groupKey, groupEntries]) => ({
              key: groupKey,
              label: formatGroup(groupKey),
              order: groupEntries[0]?.data.groupOrder ?? 0,
              entries: sortWorksEntries(groupEntries),
            }))
            .sort((a, b) => {
              const orderDiff = a.order - b.order;
              if (orderDiff !== 0) return orderDiff;
              return a.label.localeCompare(b.label, 'ko');
            });

          return {
            key: partKey,
            label: formatPart(partKey),
            order: partEntries[0]?.data.partOrder ?? 0,
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
        key: seriesKey,
        label: formatSeries(seriesKey),
        order: seriesEntries[0]?.data.seriesOrder ?? 0,
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
