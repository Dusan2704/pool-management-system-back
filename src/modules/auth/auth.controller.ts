import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from './auth.service';

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

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tokens = await loginUser(req.body);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refresh_token } = req.body as { refresh_token: string };
    const tokens = await refreshAccessToken(refresh_token);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refresh_token } = req.body as { refresh_token: string };
    if (refresh_token) {
      await logoutUser(refresh_token);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
