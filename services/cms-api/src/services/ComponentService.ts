import { query } from '../database/connection';
import { generateId } from '../utils/crypto';

export interface Component {
  id: string;
  name: string;
  slug: string;
  category?: string;
  html_template: string;
  css_template: string;
  js_template: string;
  props_schema: any;
}

export async function getAllComponents(tenantId: string) {
  const result = await query(
    `SELECT id, name, slug, category, thumbnail_url, props_schema, version, is_global, created_at, updated_at
     FROM components WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  return result.rows;
}

export async function getComponentById(tenantId: string, componentId: string) {
  const result = await query(
    `SELECT id, name, slug, category, description, thumbnail_url, html_template, css_template, js_template, props_schema, version, is_global, created_at, updated_at
     FROM components WHERE id = $1 AND tenant_id = $2`,
    [componentId, tenantId]
  );
  return result.rows[0] || null;
}

export async function createComponent(tenantId: string, componentData: any) {
  const id = generateId();

  const result = await query(
    `INSERT INTO components (id, tenant_id, name, slug, category, description, thumbnail_url, html_template, css_template, js_template, props_schema, created_by_user_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
     RETURNING id, name, slug, category, created_at`,
    [
      id,
      tenantId,
      componentData.name,
      componentData.slug,
      componentData.category,
      componentData.description,
      componentData.thumbnail_url,
      componentData.html_template,
      componentData.css_template,
      componentData.js_template,
      componentData.props_schema ? JSON.stringify(componentData.props_schema) : null,
      componentData.created_by_user_id,
    ]
  );

  return result.rows[0];
}

export async function updateComponent(tenantId: string, componentId: string, componentData: any) {
  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  const allowedFields = [
    'name',
    'category',
    'description',
    'thumbnail_url',
    'html_template',
    'css_template',
    'js_template',
    'props_schema',
  ];

  for (const field of allowedFields) {
    if (componentData[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex++}`);
      updateValues.push(componentData[field]);
    }
  }

  if (updateFields.length === 0) {
    return getComponentById(tenantId, componentId);
  }

  updateFields.push(`updated_at = NOW()`);
  updateValues.push(componentId);
  updateValues.push(tenantId);

  const result = await query(
    `UPDATE components SET ${updateFields.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} RETURNING *`,
    updateValues
  );

  return result.rows[0] || null;
}

export async function deleteComponent(tenantId: string, componentId: string) {
  const result = await query('DELETE FROM components WHERE id = $1 AND tenant_id = $2', [componentId, tenantId]);
  return result.rowCount! > 0;
}
