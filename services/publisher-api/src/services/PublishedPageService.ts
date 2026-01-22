import { query } from '../database/connection';

export async function getPublishedPageBySlug(tenantId: string, slug: string) {
  const result = await query(
    `SELECT id, tenant_id, title, slug, content, meta_title, meta_description, meta_keywords, published_at
     FROM published_pages WHERE tenant_id = $1 AND slug = $2 AND (expires_at IS NULL OR expires_at > NOW())`,
    [tenantId, slug]
  );
  return result.rows[0] || null;
}

export async function getPublishedPagesByTenant(tenantId: string, limit: number = 100, offset: number = 0) {
  const result = await query(
    `SELECT id, tenant_id, title, slug, meta_title, meta_description, published_at
     FROM published_pages WHERE tenant_id = $1 AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY published_at DESC LIMIT $2 OFFSET $3`,
    [tenantId, limit, offset]
  );
  return result.rows;
}

export async function publishPageSnapshot(
  tenantId: string,
  cmsPageId: string,
  title: string,
  slug: string,
  content: any,
  metaTitle?: string,
  metaDescription?: string,
  metaKeywords?: string
) {
  // Check if page already exists with this slug
  const existing = await query(
    'SELECT id FROM published_pages WHERE tenant_id = $1 AND slug = $2',
    [tenantId, slug]
  );

  if (existing.rows.length > 0) {
    // Update existing
    const result = await query(
      `UPDATE published_pages SET content = $1, meta_title = $2, meta_description = $3, meta_keywords = $4, published_at = NOW(), updated_at = NOW()
       WHERE tenant_id = $5 AND slug = $6
       RETURNING *`,
      [
        JSON.stringify(content),
        metaTitle,
        metaDescription,
        metaKeywords,
        tenantId,
        slug,
      ]
    );
    return result.rows[0];
  } else {
    // Create new
    const result = await query(
      `INSERT INTO published_pages (tenant_id, cms_page_id, title, slug, content, meta_title, meta_description, meta_keywords, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        tenantId,
        cmsPageId,
        title,
        slug,
        JSON.stringify(content),
        metaTitle,
        metaDescription,
        metaKeywords,
      ]
    );
    return result.rows[0];
  }
}

export async function unpublishPage(tenantId: string, slug: string) {
  const result = await query(
    `UPDATE published_pages SET expires_at = NOW() WHERE tenant_id = $1 AND slug = $2
     RETURNING id`,
    [tenantId, slug]
  );
  return result.rowCount! > 0;
}
