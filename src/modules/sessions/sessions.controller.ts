import { Request, Response, NextFunction } from 'express';
import {
  createSession,
  listOpenSessions,
  getSessionById,
  updateSession,
  deleteSession,
  cancelSession,
  getSessionReservations,
  adminListAllSessions,
} from './sessions.service';
import type { CreateSessionInput, UpdateSessionInput } from './sessions.schema';

export async function userListSessions(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessions = await listOpenSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function userGetSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await getSessionById(req.params.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function adminCreateSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await createSession(req.body as CreateSessionInput, req.user!.userId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await updateSession(req.params.id, req.body as UpdateSessionInput);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteSession(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function adminCancelSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await cancelSession(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function adminGetReservations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reservations = await getSessionReservations(req.params.id);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

export async function adminListSessions(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessions = await adminListAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}
