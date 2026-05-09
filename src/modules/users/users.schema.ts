import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    phone: z.string().regex(/^\+?[0-9]+$/).min(6).max(20).optional(),
    email: z.string().email().max(120).optional(),
    current_password: z.string().min(1).optional(),
    new_password: z.string().min(8).max(72).optional(),
  })
  .refine(
    (d) => {
      if (d.new_password && !d.current_password) return false;
      if (d.current_password && !d.new_password) return false;
      return true;
    },
    { message: 'Both current_password and new_password are required to change password' },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
