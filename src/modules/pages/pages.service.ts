import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import type { CreatePageInput, UpdatePageInput } from './pages.schema';

export interface Page {
  page_id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  sort_order: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PublicPage {
  page_id: string;
  slug: string;
  title: string;
  content: string;
  sort_order: number;
  updated_at: string | null;
}

interface PageRow extends RowDataPacket, Page {}
interface SlugCheckRow extends RowDataPacket { page_id: string; }

export async function listPublicPages(): Promise<PublicPage[]> {
  const [rows] = await pool.execute<PageRow[]>(
    `SELECT page_id, slug, title, content, sort_order, updated_at
     FROM page
     WHERE is_published = 1
     ORDER BY sort_order ASC, title ASC`,
  );
  return rows as unknown as PublicPage[];
}

export async function getPublicPageBySlug(slug: string): Promise<PublicPage> {
  const [rows] = await pool.execute<PageRow[]>(
    `SELECT page_id, slug, title, content, sort_order, updated_at
     FROM page
     WHERE slug = ? AND is_published = 1`,
    [slug],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('Stranica nije pronađena'), { status: 404 });
  }
  return rows[0] as unknown as PublicPage;
}

export async function adminListPages(): Promise<Page[]> {
  const [rows] = await pool.execute<PageRow[]>(
    `SELECT page_id, slug, title, content, is_published, sort_order, updated_by, created_at, updated_at
     FROM page
     ORDER BY sort_order ASC, title ASC`,
  );
  return rows as unknown as Page[];
}

export async function createPage(adminId: string, input: CreatePageInput): Promise<{ page_id: string }> {
  const [existing] = await pool.execute<SlugCheckRow[]>(
    'SELECT page_id FROM page WHERE slug = ?',
    [input.slug],
  );
  if (existing.length > 0) {
    throw Object.assign(new Error('Stranica sa ovim slug-om već postoji'), { status: 409 });
  }

  const pageId = uuidv4();
  await pool.execute(
    `INSERT INTO page (page_id, slug, title, content, is_published, sort_order, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [pageId, input.slug, input.title, input.content ?? '', input.is_published ? 1 : 0, input.sort_order ?? 0, adminId],
  );
  return { page_id: pageId };
}

export async function updatePage(pageId: string, adminId: string, input: UpdatePageInput): Promise<void> {
  const [rows] = await pool.execute<PageRow[]>(
    'SELECT page_id FROM page WHERE page_id = ?',
    [pageId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('Stranica nije pronađena'), { status: 404 });
  }

  if (input.slug !== undefined) {
    const [slugRows] = await pool.execute<SlugCheckRow[]>(
      'SELECT page_id FROM page WHERE slug = ? AND page_id != ?',
      [input.slug, pageId],
    );
    if (slugRows.length > 0) {
      throw Object.assign(new Error('Stranica sa ovim slug-om već postoji'), { status: 409 });
    }
  }

  const fields: string[] = ['updated_by = ?'];
  const values: (string | number)[] = [adminId];

  if (input.slug !== undefined)         { fields.push('slug = ?');         values.push(input.slug); }
  if (input.title !== undefined)        { fields.push('title = ?');        values.push(input.title); }
  if (input.content !== undefined)      { fields.push('content = ?');      values.push(input.content); }
  if (input.is_published !== undefined) { fields.push('is_published = ?'); values.push(input.is_published ? 1 : 0); }
  if (input.sort_order !== undefined)   { fields.push('sort_order = ?');   values.push(input.sort_order); }

  values.push(pageId);
  await pool.execute(
    `UPDATE page SET ${fields.join(', ')} WHERE page_id = ?`,
    values,
  );
}

export async function deletePage(pageId: string): Promise<void> {
  const [rows] = await pool.execute<PageRow[]>(
    'SELECT page_id FROM page WHERE page_id = ?',
    [pageId],
  );
  if (rows.length === 0) {
    throw Object.assign(new Error('Stranica nije pronađena'), { status: 404 });
  }
  await pool.execute('DELETE FROM page WHERE page_id = ?', [pageId]);
}
