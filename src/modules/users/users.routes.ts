import { Router } from 'express';
import { getMe, patchMe, adminListUsers, adminToggleActive } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { updateProfileSchema } from './users.schema';

export const usersRouter = Router();

usersRouter.get('/users/me', authenticate, getMe);
usersRouter.patch('/users/me', authenticate, validate(updateProfileSchema), patchMe);

usersRouter.get('/admin/users', authenticate, requireRole('admin'), adminListUsers);
usersRouter.patch('/admin/users/:id', authenticate, requireRole('admin'), adminToggleActive);
