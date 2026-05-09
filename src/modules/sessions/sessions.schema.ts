import { z } from 'zod';

export const createSessionSchema = z.object({
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format datuma mora biti YYYY-MM-DD'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format vremena mora biti HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Format vremena mora biti HH:MM'),
  capacity: z.number().int().min(1).max(1000),
});

export const updateSessionSchema = z
  .object({
    session_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format datuma mora biti YYYY-MM-DD')
      .optional(),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format vremena mora biti HH:MM')
      .optional(),
    end_time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Format vremena mora biti HH:MM')
      .optional(),
    capacity: z.number().int().min(1).max(1000).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'At least one field is required' });

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
