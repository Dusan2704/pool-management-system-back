import { Request, Response, NextFunction } from 'express';
import { registerUser } from './auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'Registration successful', userId: user.userId });
  } catch (error) {
    next(error);
  }
}
