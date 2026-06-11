import type { CollectionEntry } from 'astro:content';

type TextEntry = CollectionEntry<'text'>;

export const STANDALONE_SERIES = '_standalone';
export const UNPARTED_TEXT = '_unparted';
export const UNGROUPED_TEXT = '_ungrouped';

export interface TextGroup {
  key: string;
  label: string;
  order: number;
  entries: TextEntry[];
}

export interface TextPart {
  key: string;
  label: string;
  order: number;
  groups: TextGroup[];
  count: number;
}

export interface TextSeries {
  key: string;
  slug: string;
  label: string;
  order: number;
  meta?: TextEntry;
  parts: TextPart[];
  count: number;
  entries: TextEntry[];
}

export function slugifyTextSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTextSeriesSlug(entry: TextEntry): string {
  return entry.data.seriesSlug ?? entry.id.split('/')[0] ?? STANDALONE_SERIES;
}

export function isTextSeriesEntry(entry: TextEntry): boolean {
  return entry.data.kind === 'series' || entry.id.endsWith('/index');
}

export function isTextDocumentEntry(entry: TextEntry): boolean {
  return !isTextSeriesEntry(entry);
}

export function getTextPartSlug(entry: TextEntry): string {
  return entry.data.partSlug ?? slugifyTextSegment(entry.data.part ?? UNPARTED_TEXT);
}

export function getTextDocSlug(entry: TextEntry): string {
  const seriesSlug = getTextSeriesSlug(entry);
  const docId = entry.id.startsWith(`${seriesSlug}/`) ? entry.id.slice(seriesSlug.length + 1) : entry.id;
  return docId.startsWith('part/') ? docId.slice('part/'.length) : docId;
}

export function getTextEntryUrl(entry: TextEntry): string {
  return `/text/${getTextSeriesSlug(entry)}/${getTextDocSlug(entry)}`;
}

export function formatSeries(key: string, fallback?: string): string {
  if (fallback) return fallback;
  if (key === STANDALONE_SERIES) return '독립 문서';
  return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatGroup(key: string): string {
  if (key === UNGROUPED_TEXT) return '기타 문서';
  return key;
}

export function formatPart(key: string): string {
  if (key === UNPARTED_TEXT) return '기타 부';
  return key;
}

export function sortTextEntries(entries: TextEntry[]): TextEntry[] {
  return [...entries].sort((a, b) => {
    const orderDiff = (a.data.order ?? 0) - (b.data.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const chapterA = a.data.chapter ?? Number.MAX_SAFE_INTEGER;
    const chapterB = b.data.chapter ?? Number.MAX_SAFE_INTEGER;
    if (chapterA !== chapterB) return chapterA - chapterB;

    return a.data.title.localeCompare(b.data.title, 'ko');
  });
}

export function buildTextHierarchy(entries: TextEntry[]): TextSeries[] {
  const seriesMap = new Map<string, TextEntry[]>();

  for (const entry of entries) {
    const seriesKey = getTextSeriesSlug(entry);
    const seriesEntries = seriesMap.get(seriesKey) ?? [];
    seriesEntries.push(entry);
    seriesMap.set(seriesKey, seriesEntries);
  }

  return Array.from(seriesMap.entries())
    .map(([seriesKey, seriesEntries]) => {
      const meta = seriesEntries.find(isTextSeriesEntry);
      const documentEntries = seriesEntries.filter(isTextDocumentEntry);
      const partMap = new Map<string, TextEntry[]>();

      for (const entry of documentEntries) {
        const partKey = entry.data.part ?? UNPARTED_TEXT;
        const partEntries = partMap.get(partKey) ?? [];
        partEntries.push(entry);
        partMap.set(partKey, partEntries);
      }

      const parts = Array.from(partMap.entries())
        .map(([partKey, partEntries]) => {
          const groupMap = new Map<string, TextEntry[]>();

          for (const entry of partEntries) {
            const groupKey = entry.data.group ?? UNGROUPED_TEXT;
            const groupEntries = groupMap.get(groupKey) ?? [];
            groupEntries.push(entry);
            groupMap.set(groupKey, groupEntries);
          }

          const groups = Array.from(groupMap.entries())
            .map(([groupKey, groupEntries]) => ({
              key: groupKey,
              label: formatGroup(groupKey),
              order: groupEntries[0]?.data.groupOrder ?? 0,
              entries: sortTextEntries(groupEntries),
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
        slug: seriesKey,
        label: formatSeries(seriesKey, meta?.data.series ?? meta?.data.title ?? documentEntries[0]?.data.series),
        order: meta?.data.seriesOrder ?? documentEntries[0]?.data.seriesOrder ?? 0,
        meta,
        parts,
        count: documentEntries.length,
        entries: sortTextEntries(documentEntries),
      };
    })
    .sort((a, b) => {
      const orderDiff = a.order - b.order;
      if (orderDiff !== 0) return orderDiff;
      return a.label.localeCompare(b.label, 'ko');
    });
}

export function getTextSeries(entries: TextEntry[], seriesSlug: string): TextSeries | undefined {
  return buildTextHierarchy(entries).find(series => series.slug === seriesSlug);
}

export function formatTextTag(tag: string): { prefix: string; label: string } {
  const [prefix, ...rest] = tag.split('/');
  return {
    prefix: rest.length > 0 ? prefix : '태그',
    label: rest.length > 0 ? rest.join('/') : tag,
  };
}
