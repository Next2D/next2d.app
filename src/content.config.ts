import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const playerSpecsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/player-specs' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().optional()
  }).optional()
});

const frameworkSpecsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/framework-specs' }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().optional()
  }).optional()
});

export const collections = {
  'player-specs': playerSpecsCollection,
  'framework-specs': frameworkSpecsCollection
};
