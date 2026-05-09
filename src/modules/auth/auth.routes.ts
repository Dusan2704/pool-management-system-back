import { Router } from 'express';
import { register, login, refresh, logout } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { authenticate } from '../../middleware/auth';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), register);
authRouter.post('/login', authLimiter, validate(loginSchema), login);
authRouter.post('/refresh', authLimiter, validate(refreshSchema), refresh);
authRouter.post('/logout', authenticate, logout);
