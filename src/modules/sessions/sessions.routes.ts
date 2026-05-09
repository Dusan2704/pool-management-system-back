import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createSessionSchema, updateSessionSchema } from './sessions.schema';
import {
  userListSessions,
  userGetSession,
  adminCreateSession,
  adminUpdateSession,
  adminDeleteSession,
  adminCancelSession,
  adminGetReservations,
  adminListSessions,
} from './sessions.controller';

export const sessionsRouter = Router();

// User routes
sessionsRouter.get('/sessions', authenticate, userListSessions);
sessionsRouter.get('/sessions/:id', authenticate, userGetSession);

// Admin routes
sessionsRouter.get('/admin/sessions', authenticate, requireRole('admin'), adminListSessions);
sessionsRouter.post(
  '/admin/sessions',
  authenticate,
  requireRole('admin'),
  validate(createSessionSchema),
  adminCreateSession,
);
sessionsRouter.patch(
  '/admin/sessions/:id',
  authenticate,
  requireRole('admin'),
  validate(updateSessionSchema),
  adminUpdateSession,
);
sessionsRouter.delete('/admin/sessions/:id', authenticate, requireRole('admin'), adminDeleteSession);
sessionsRouter.post(
  '/admin/sessions/:id/cancel',
  authenticate,
  requireRole('admin'),
  adminCancelSession,
);
sessionsRouter.get(
  '/admin/sessions/:id/reservations',
  authenticate,
  requireRole('admin'),
  adminGetReservations,
);
