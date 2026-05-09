import { Request, Response, NextFunction } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  listAllUsers,
  toggleUserActive,
} from './users.service';
import type { UpdateProfileInput } from './users.schema';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getProfile(req.user!.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function patchMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, email, current_password, new_password } = req.body as UpdateProfileInput;
    const userId = req.user!.userId;

    if (current_password && new_password) {
      await changePassword(userId, current_password, new_password);
    }

    const updated = await updateProfile(userId, { phone, email });
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function adminListUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await listAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function adminToggleActive(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await toggleUserActive(id, req.user!.userId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}
