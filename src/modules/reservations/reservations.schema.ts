import { z } from 'zod';

export const createReservationSchema = z.object({
  session_id: z.string().min(1),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
