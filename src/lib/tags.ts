export interface PrefixTagGroup {
  prefix: string;
  tags: {
    tag: string;
    label: string;
    count: number;
  }[];
}

export function parsePrefixTag(tag: string): { prefix: string; label: string } {
  const [prefix, ...rest] = tag.split('/');
  return {
    prefix: rest.length > 0 ? prefix : '태그',
    label: rest.length > 0 ? rest.join('/') : tag,
  };
}

export function groupTagsByPrefix(tags: string[]): PrefixTagGroup[] {
  const prefixMap = new Map<string, Map<string, { tag: string; label: string; count: number }>>();

  for (const tag of tags) {
    const parsed = parsePrefixTag(tag);
    const tagMap = prefixMap.get(parsed.prefix) ?? new Map();
    const current = tagMap.get(tag) ?? { tag, label: parsed.label, count: 0 };
    current.count += 1;
    tagMap.set(tag, current);
    prefixMap.set(parsed.prefix, tagMap);
  }

  return Array.from(prefixMap.entries())
    .map(([prefix, tagMap]) => ({
      prefix,
      tags: Array.from(tagMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'ko')),
    }))
    .sort((a, b) => a.prefix.localeCompare(b.prefix, 'ko'));
}
