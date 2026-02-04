import { defineCollection, z } from 'astro:content';

const specsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().optional()
  }).optional()
});

export const collections = {
  'player-specs': specsCollection,
  'framework-specs': specsCollection
};
