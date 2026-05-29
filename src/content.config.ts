import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const OL_ONTOLOGY_VERSION = '0.1.0';

// ─── 공통 relation 스키마 ─────────────────────────────────
const RelationSchema = z.object({
  subject: z.string(),
  predicate: z.string(),
  object: z.string(),
  source: z.string().optional(),
  note: z.string().optional(),
});

// ─── Entity 공통 스키마 ──────────────────────────────────
const EntityBaseSchema = z.object({
  id: z.string(),
  type: z.enum([
    'person', 'place', 'concept',
    'text', 'event', 'practice', 'school',
  ]),
  name: z.object({
    ko: z.string(),
    en: z.string().optional(),
    pali: z.string().optional(),
    sanskrit: z.string().optional(),
    chinese: z.string().optional(),
  }),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
  relations: z.array(RelationSchema).default([]),
  tags: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
  external_ids: z.object({
    wikidata: z.string().optional(),
    cbeta: z.string().optional(),
    suttacentral: z.string().optional(),
    wikipedia_ko: z.string().optional(),
  }).optional(),
  published: z.boolean().default(true),
});

// ─── Entity 유형별 확장 스키마 ────────────────────────────

const PersonSchema = EntityBaseSchema.extend({
  type: z.literal('person'),
  era: z.object({
    born: z.string().optional(),
    died: z.string().optional(),
    active: z.string().optional(),
  }).optional(),
  tradition: z.string().optional(),
  nationality: z.string().optional(),
});

const PlaceSchema = EntityBaseSchema.extend({
  type: z.literal('place'),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  era: z.string().optional(),
});

const ConceptSchema = EntityBaseSchema.extend({
  type: z.literal('concept'),
  tradition: z.string().optional(),
  complexity: z.enum(['introductory', 'intermediate', 'advanced']).optional(),
});

const TextSchema = EntityBaseSchema.extend({
  type: z.literal('text'),
  author: z.string().optional(),
  tradition: z.string().optional(),
  language: z.object({
    original: z.string().optional(),
    translations: z.array(z.string()).default([]),
  }).optional(),
  era: z.string().optional(),
});

const EventSchema = EntityBaseSchema.extend({
  type: z.literal('event'),
  date: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).default([]),
});

const PracticeSchema = EntityBaseSchema.extend({
  type: z.literal('practice'),
  tradition: z.string().optional(),
  level: z.string().optional(),
});

const SchoolSchema = EntityBaseSchema.extend({
  type: z.literal('school'),
  tradition: z.string().optional(),
  founded: z.string().optional(),
  era: z.string().optional(),
  region: z.string().optional(),
});

// ─── Collections ──────────────────────────────────────────

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    readingTime: z.number().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    entities: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  }),
});

const bookCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/book' }),
  schema: z.object({
    title: z.string(),
    series: z.string().optional(),
    chapter: z.number().optional(),
    order: z.number().default(0),
    date: z.coerce.date().optional(),
    entities: z.array(z.string()).default([]),
    relations: z.array(RelationSchema).default([]),
    primary_entity: z.string().optional(),
    sources: z.array(z.object({
      text: z.string(),
      ref: z.string().optional(),
      passage: z.string().optional(),
    })).default([]),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  }),
});

const designCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/design' }),
  schema: z.object({
    title: z.string(),
    category: z.string().optional(),
    type: z.enum([
      'costume', 'architecture', 'portrait',
      'artifact', 'landscape', 'manuscript', 'other',
    ]).optional(),
    era: z.string().optional(),
    region: z.string().optional(),
    tradition: z.string().optional(),
    entities: z.array(z.string()).default([]),
    image: z.string().optional(),
    source: z.string().optional(),
    license: z.string().default('CC0'),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  }),
});

const aiCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ai' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(['experiment', 'workflow', 'prompt', 'result', 'reflection']),
    tags: z.array(z.string()).default([]),
    published: z.boolean().default(false),
  }),
});

const entitiesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/entities' }),
  schema: z.discriminatedUnion('type', [
    PersonSchema,
    PlaceSchema,
    ConceptSchema,
    TextSchema,
    EventSchema,
    PracticeSchema,
    SchoolSchema,
  ]),
});

const ontologyCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/ontology' }),
  schema: z.object({
    title: z.string(),
    version: z.string().default('0.1'),
    published: z.boolean().optional(),
    date: z.coerce.date().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  book: bookCollection,
  design: designCollection,
  ai: aiCollection,
  entities: entitiesCollection,
  ontology: ontologyCollection,
};
