import { getCollection } from 'astro:content';

export type Triple = {
  subject: string;
  predicate: string;
  object: string;
  source?: string;
  note?: string;
};

/**
 * 모든 collection에서 triple을 수집하여 지식그래프 데이터 반환
 * build 시에만 실행됨 (Astro SSG)
 */
export async function buildKnowledgeGraph() {
  const [books, entities, designs, blogs] = await Promise.all([
    getCollection('book'),
    getCollection('entities'),
    getCollection('design'),
    getCollection('blog'),
  ]);

  const triples: Triple[] = [];
  const entityMap = new Map<string, any>();

  for (const entity of entities) {
    entityMap.set(entity.data.id, entity);
    for (const rel of entity.data.relations ?? []) {
      triples.push(rel);
    }
  }

  for (const book of books) {
    for (const rel of book.data.relations ?? []) {
      triples.push({ ...rel, source: book.slug });
    }
  }

  return { triples, entityMap };
}

/**
 * 특정 entity의 모든 관계 반환 (양방향)
 */
export async function getEntityRelations(entityId: string) {
  const { triples } = await buildKnowledgeGraph();

  const outgoing = triples.filter(t => t.subject === entityId);
  const incoming = triples.filter(t => t.object === entityId);

  return { outgoing, incoming };
}

/**
 * 특정 entity를 언급하는 모든 문서 반환 (backlinks)
 */
export async function getBacklinks(entityId: string) {
  const [books, designs, blogs] = await Promise.all([
    getCollection('book'),
    getCollection('design'),
    getCollection('blog'),
  ]);

  const allDocs = [...books, ...designs, ...blogs];

  return allDocs.filter(doc =>
    (doc.data.entities ?? []).includes(entityId)
  );
}

/**
 * entity 연결망 순회 (순환 참조 방지)
 * 불교 연기론상 순환은 자연스럽지만, 렌더링 시 무한 루프 방지
 */
export function traverseRelations(
  entityId: string,
  triples: Triple[],
  maxDepth: number = 2,
  visited = new Set<string>()
): Triple[] {
  if (visited.has(entityId) || maxDepth === 0) return [];
  visited.add(entityId);

  const direct = triples.filter(t => t.subject === entityId);
  const nested = direct.flatMap(t =>
    traverseRelations(t.object, triples, maxDepth - 1, visited)
  );

  return [...direct, ...nested];
}
