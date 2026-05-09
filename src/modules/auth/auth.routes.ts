import { Router } from 'express';
import { register } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { registerSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), register);
