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
    prefixTags: z.array(z.string()).default([]),
    category: z.string().optional(),
    entities: z.array(z.string()).default([]),
    license: z.string().default('CC0'),
    licenseUrl: z.string().optional(),
    rightsHolder: z.string().optional(),
    copyrightNotice: z.string().optional(),
    published: z.boolean().default(false),
  }),
});

// works — 번역, 주석, 연구 노트를 담는 살아 있는 문서
const worksCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    series: z.string().optional(),
    seriesOrder: z.number().default(0),
    part: z.string().optional(),
    partOrder: z.number().default(0),
    group: z.string().optional(),
    groupOrder: z.number().default(0),
    category: z.string().optional(),
    chapter: z.number().optional(),
    order: z.number().default(0),
    date: z.coerce.date().optional(),
    status: z.enum(['draft', 'revising', 'ready', 'published']).default('draft'),
    entities: z.array(z.string()).default([]),
    relations: z.array(RelationSchema).default([]),
    primary_entity: z.string().optional(),
    sources: z.array(z.object({
      text: z.string(),
      ref: z.string().optional(),
      passage: z.string().optional(),
    })).default([]),
    tags: z.array(z.string()).default([]),
    prefixTags: z.array(z.string()).default([]),
    authors: z.array(z.string()).default([]),
    license: z.string().default('CC0'),
    licenseUrl: z.string().optional(),
    rightsHolder: z.string().optional(),
    copyrightNotice: z.string().optional(),
    published: z.boolean().default(false),
    excerpt: z.string().optional(),
  }),
});

// book — 완결된 출판물 메타데이터 (서지 정보)
const bookCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/book' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    series: z.string().optional(),
    category: z.string().optional(),
    version: z.string().default('v1.0'),
    status: z.enum(['draft', 'revising', 'ready', 'published']).default('draft'),
    publishedAt: z.coerce.date(),
    htmlPath: z.string(),
    primaryEntities: z.array(z.string()).default([]),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    prefixTags: z.array(z.string()).default([]),
    license: z.string().default('CC0'),
    licenseUrl: z.string().optional(),
    rightsHolder: z.string().optional(),
    copyrightNotice: z.string().optional(),
    lang: z.string().default('ko'),
    level: z.number().min(1).max(5).optional(),
    published: z.boolean().default(true),
  }),
});

const designCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/design' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    summary: z.string().optional(),
    primaryKind: z.enum([
      'infographic', 'illustration', 'style-sheet', 'reference',
    ]).default('infographic'),
    category: z.string().optional(),
    type: z.enum([
      'infographic', 'timeline', 'diagram', 'map', 'comparison',
      'flowchart', 'concept-map', 'poster',
      'illustration', 'style-sheet', 'turnaround',
      'portrait', 'costume', 'architecture',
      'landscape', 'manuscript', 'artifact', 'other',
    ]).optional(),
    series: z.string().optional(),
    medium: z.string().optional(),
    format: z.enum(['html', 'pdf', 'image', 'mixed']).default('image'),
    scriptureRef: z.string().optional(),
    dimensions: z.string().optional(),
    pageSize: z.string().optional(),
    orientation: z.enum(['portrait', 'landscape', 'square']).optional(),
    version: z.string().default('0.1.0'),
    status: z.enum(['draft', 'review', 'published', 'archived']).default('published'),
    date: z.coerce.date().optional(),
    era: z.string().optional(),
    region: z.string().optional(),
    tradition: z.string().optional(),
    entities: z.array(z.string()).default([]),
    relatedWorks: z.array(z.string()).default([]),
    thumbnailPath: z.string().optional(),
    imagePath: z.string().optional(),
    previewPaths: z.array(z.string()).default([]),
    imageAlt: z.string().optional(),
    htmlPath: z.string().optional(),
    pdfPath: z.string().optional(),
    source: z.string().optional(),
    sourceUrl: z.string().optional(),
    credits: z.array(z.string()).default([]),
    license: z.string().default('CC0'),
    tags: z.array(z.string()).default([]),
    prefixTags: z.array(z.string()).default([]),
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

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    published: z.boolean().default(true),
  }),
});

export const collections = {
  works: worksCollection,
  book: bookCollection,
  blog: blogCollection,
  design: designCollection,
  ai: aiCollection,
  entities: entitiesCollection,
  ontology: ontologyCollection,
  pages: pagesCollection,
};
