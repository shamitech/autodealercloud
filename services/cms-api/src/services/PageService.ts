import { query } from '../database/connection';
import { generateId } from '../utils/crypto';

export async function getAllPages(tenantId: string, status?: string) {
  let sql = 'SELECT id, title, slug, status, published_at, created_at FROM pages WHERE tenant_id = $1';
  const params: any[] = [tenantId];

  if (status) {
    sql += ' AND status = $2';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const result = await query(sql, params);
  return result.rows;
}

export async function getPageById(tenantId: string, pageId: string) {
  const result = await query(
    `SELECT id, title, slug, description, content, meta_title, meta_description, meta_keywords, status, published_at, created_at, updated_at
     FROM pages WHERE id = $1 AND tenant_id = $2`,
    [pageId, tenantId]
  );
  return result.rows[0] || null;
}

export async function getPageBySlug(tenantId: string, slug: string) {
  const result = await query(
    `SELECT id, title, slug, description, content, meta_title, meta_description, meta_keywords, status, published_at
     FROM pages WHERE slug = $1 AND tenant_id = $2`,
    [slug, tenantId]
  );
  return result.rows[0] || null;
}

export async function createPage(tenantId: string, pageData: any, userId: string) {
  const id = generateId();

  const result = await query(
    `INSERT INTO pages (id, tenant_id, title, slug, description, content, meta_title, meta_description, meta_keywords, status, created_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING id, title, slug, status, created_at`,
    [
      id,
      tenantId,
      pageData.title,
      pageData.slug,
      pageData.description,
      pageData.content ? JSON.stringify(pageData.content) : null,
      pageData.meta_title,
      pageData.meta_description,
      pageData.meta_keywords,
      'draft',
      userId,
    ]
  );

  return result.rows[0];
}

export async function updatePage(tenantId: string, pageId: string, pageData: any) {
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  const allowedFields = ['title', 'slug', 'description', 'content', 'meta_title', 'meta_description', 'meta_keywords'];

  for (const field of allowedFields) {
    if (pageData[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex++}`);
      updateValues.push(field === 'content' ? JSON.stringify(pageData[field]) : pageData[field]);
    }
  }

  if (updateFields.length === 0) {
    return getPageById(tenantId, pageId);
  }

  updateFields.push(`updated_at = NOW()`);
  updateValues.push(pageId);
  updateValues.push(tenantId);

  const result = await query(
    `UPDATE pages SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} RETURNING *`,
    updateValues
  );

  return result.rows[0] || null;
}

export async function deletePage(tenantId: string, pageId: string) {
  const result = await query('DELETE FROM pages WHERE id = $1 AND tenant_id = $2', [pageId, tenantId]);
  return result.rowCount! > 0;
}

export async function publishPage(tenantId: string, pageId: string) {
  const result = await query(
    `UPDATE pages SET status = 'published', published_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND tenant_id = $2
     RETURNING id, slug, status, published_at`,
    [pageId, tenantId]
  );

  return result.rows[0] || null;
}

export async function unpublishPage(tenantId: string, pageId: string) {
  const result = await query(
    `UPDATE pages SET status = 'draft', updated_at = NOW() WHERE id = $1 AND tenant_id = $2
     RETURNING id, slug, status`,
    [pageId, tenantId]
  );

  return result.rows[0] || null;
}
