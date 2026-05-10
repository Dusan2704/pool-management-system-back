import { Request, Response, NextFunction } from 'express';
import { createReservation, listMyReservations, cancelReservation } from './reservations.service';
import type { CreateReservationInput } from './reservations.schema';

export async function createReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { session_id } = req.body as CreateReservationInput;
    const result = await createReservation(req.user!.userId, session_id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMyReservationsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reservations = await listMyReservations(req.user!.userId);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export async function cancelReservationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await cancelReservation(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
