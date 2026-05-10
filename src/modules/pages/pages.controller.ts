import { Request, Response, NextFunction } from 'express';
import {
  listPublicPages,
  getPublicPageBySlug,
  adminListPages,
  createPage,
  updatePage,
  deletePage,
} from './pages.service';

export async function getPublicPages(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pages = await listPublicPages();
    res.json(pages);
  } catch (error) {
    next(error);
  }
}

export async function getPublicPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = await getPublicPageBySlug(req.params.slug);
    res.json(page);
  } catch (error) {
    next(error);
  }
}

export async function adminGetPages(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pages = await adminListPages();
    res.json(pages);
  } catch (error) {
    next(error);
  }
}

export async function adminCreatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await createPage(req.user!.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdatePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await updatePage(req.params.id, req.user!.userId, req.body);
    res.json({ message: 'Stranica je ažurirana' });
  } catch (error) {
    next(error);
  }
}

export async function adminDeletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deletePage(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
