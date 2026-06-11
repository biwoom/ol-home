import { getCollection } from 'astro:content';
import { isTextDocumentEntry } from './text';

export type Triple = {
  subject: string;
  predicate: string;
  object: string;
  source?: string;
  note?: string;
};

export async function buildKnowledgeGraph() {
  const [text, entities, designs, blogs] = await Promise.all([
    getCollection('text', isTextDocumentEntry),
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

  for (const work of text) {
    for (const rel of work.data.relations ?? []) {
      triples.push({ ...rel, source: work.id });
    }
  }

  return { triples, entityMap };
}

export async function getEntityRelations(entityId: string, triples: Triple[]) {
  const outgoing = triples.filter(t => t.subject === entityId);
  const incoming = triples.filter(t => t.object === entityId);
  return { outgoing, incoming };
}

export function getBacklinks(entityId: string, triples: Triple[]) {
  return triples.filter(t => t.object === entityId);
}

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
