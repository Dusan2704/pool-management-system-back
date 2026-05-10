import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReservationSchema } from './reservations.schema';
import {
  createReservationHandler,
  listMyReservationsHandler,
  cancelReservationHandler,
} from './reservations.controller';

export const reservationsRouter = Router();

reservationsRouter.post(
  '/reservations',
  authenticate,
  validate(createReservationSchema),
  createReservationHandler,
);
reservationsRouter.get('/reservations/me', authenticate, listMyReservationsHandler);
reservationsRouter.delete('/reservations/:id', authenticate, cancelReservationHandler);
