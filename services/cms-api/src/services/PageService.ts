import { query } from '../database/connection';
import { Page, PublishRequest } from '@shared/types';
import { generateId } from '../utils/crypto';

export async function createPage(tenantId: string, title: string, slug: string, content: Record<string, unknown>): Promise<Page> {
  const id = generateId();
  const now = new Date();

  const result = await query(
    'INSERT INTO pages (id, tenant_id, title, slug, content, published, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [id, tenantId, title, slug, JSON.stringify(content), false, now, now]
  );

  return result.rows[0] as Page;
}

export async function getPages(tenantId: string): Promise<Page[]> {
  const result = await query('SELECT * FROM pages WHERE tenant_id = $1 ORDER BY created_at DESC', [tenantId]);
  return result.rows as Page[];
}

export async function getPageById(id: string): Promise<Page | null> {
  const result = await query('SELECT * FROM pages WHERE id = $1', [id]);
  return result.rows.length > 0 ? (result.rows[0] as Page) : null;
}

export async function updatePage(id: string, title?: string, content?: Record<string, unknown>): Promise<Page | null> {
  const now = new Date();
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (content !== undefined) {
    updates.push(`content = $${paramCount++}`);
    values.push(JSON.stringify(content));
  }

  updates.push(`updated_at = $${paramCount++}`);
  values.push(now);
  values.push(id);

  const result = await query(
    `UPDATE pages SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows.length > 0 ? (result.rows[0] as Page) : null;
}

export async function publishPage(data: PublishRequest): Promise<boolean> {
  const now = new Date();
  const result = await query(
    'UPDATE pages SET published = true, updated_at = $1 WHERE id = $2',
    [now, data.page_id]
  );
  return result.rowCount! > 0;
}

export async function deletePage(id: string): Promise<boolean> {
  const result = await query('DELETE FROM pages WHERE id = $1', [id]);
  return result.rowCount! > 0;
}
