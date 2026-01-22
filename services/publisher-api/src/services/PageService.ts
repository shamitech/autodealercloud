import { query } from '../database/connection';
import { Page } from '@shared/types';

export async function getPublishedPage(tenantSlug: string, pageSlug: string): Promise<Page | null> {
  const result = await query(
    'SELECT * FROM pages WHERE tenant_slug = $1 AND slug = $2 AND published = true',
    [tenantSlug, pageSlug]
  );
  return result.rows.length > 0 ? (result.rows[0] as Page) : null;
}

export async function getTenantPages(tenantSlug: string): Promise<Page[]> {
  const result = await query(
    'SELECT * FROM pages WHERE tenant_slug = $1 AND published = true ORDER BY created_at DESC',
    [tenantSlug]
  );
  return result.rows as Page[];
}
