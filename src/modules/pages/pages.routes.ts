import { Router } from 'express';
import {
  getPublicPages,
  getPublicPage,
  adminGetPages,
  adminCreatePage,
  adminUpdatePage,
  adminDeletePage,
} from './pages.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { createPageSchema, updatePageSchema } from './pages.schema';

export const pagesRouter = Router();

// Public routes
pagesRouter.get('/pages', getPublicPages);
pagesRouter.get('/pages/:slug', getPublicPage);

// Admin routes
pagesRouter.get('/admin/pages', authenticate, requireRole('admin'), adminGetPages);
pagesRouter.post('/admin/pages', authenticate, requireRole('admin'), validate(createPageSchema), adminCreatePage);
pagesRouter.patch('/admin/pages/:id', authenticate, requireRole('admin'), validate(updatePageSchema), adminUpdatePage);
pagesRouter.delete('/admin/pages/:id', authenticate, requireRole('admin'), adminDeletePage);
