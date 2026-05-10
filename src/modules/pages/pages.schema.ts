import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createPageSchema = z.object({
  slug:         z.string().regex(slugRegex, 'Slug mora biti u formatu: mala-slova-sa-crticom').max(80),
  title:        z.string().min(1).max(120),
  content:      z.string().optional().default(''),
  is_published: z.boolean().optional().default(true),
  sort_order:   z.number().int().min(0).optional().default(0),
});

export const updatePageSchema = z.object({
  slug:         z.string().regex(slugRegex, 'Slug mora biti u formatu: mala-slova-sa-crticom').max(80).optional(),
  title:        z.string().min(1).max(120).optional(),
  content:      z.string().optional(),
  is_published: z.boolean().optional(),
  sort_order:   z.number().int().min(0).optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
