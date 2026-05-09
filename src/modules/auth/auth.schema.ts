import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name:  z.string().min(1).max(50),
  email:      z.string().email().max(120),
  phone:      z.string().regex(/^\+?[0-9]+$/).min(6).max(20),
  password:   z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type RefreshInput  = z.infer<typeof refreshSchema>;
