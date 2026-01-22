import { query } from '../database/connection';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../../shared/types';
import { generateTempPassword, generateId } from '../utils/crypto';

export async function getAllTenants(): Promise<Tenant[]> {
  const result = await query(
    'SELECT id, name, slug, email, contact_first_name, contact_last_name, status, created_at, updated_at FROM tenants WHERE status != $1 ORDER BY created_at DESC',
    ['deleted']
  );
  return result.rows;
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const result = await query(
    'SELECT id, name, slug, email, contact_first_name, contact_last_name, status, temp_password, temp_password_expires_at, created_at, updated_at FROM tenants WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const result = await query(
    'SELECT id, name, slug, email, contact_first_name, contact_last_name, status, created_at, updated_at FROM tenants WHERE slug = $1 AND status != $2',
    [slug, 'deleted']
  );
  return result.rows[0] || null;
}

export async function createTenant(tenantData: CreateTenantRequest): Promise<{ tenant: Tenant; tempPassword: string }> {
  // Check if slug already exists
  const existingSlug = await query('SELECT id FROM tenants WHERE slug = $1', [tenantData.slug]);
  if (existingSlug.rows.length > 0) {
    throw new Error('Slug already exists');
  }

  const id = generateId();
  const tempPassword = generateTempPassword();
  const tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const result = await query(
    `INSERT INTO tenants (id, name, slug, email, contact_first_name, contact_last_name, status, temp_password, temp_password_expires_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     RETURNING id, name, slug, email, contact_first_name, contact_last_name, status, created_at, updated_at`,
    [
      id,
      tenantData.name,
      tenantData.slug,
      tenantData.email,
      tenantData.contact_first_name,
      tenantData.contact_last_name,
      'active',
      tempPassword,
      tempPasswordExpiresAt,
    ]
  );

  return {
    tenant: result.rows[0],
    tempPassword,
  };
}

export async function updateTenant(id: string, tenantData: UpdateTenantRequest): Promise<Tenant> {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const updateFields: string[] = [];
  const updateValues: any[] = [];
  let paramIndex = 1;

  if (tenantData.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    updateValues.push(tenantData.name);
  }
  if (tenantData.email !== undefined) {
    updateFields.push(`email = $${paramIndex++}`);
    updateValues.push(tenantData.email);
  }
  if (tenantData.contact_first_name !== undefined) {
    updateFields.push(`contact_first_name = $${paramIndex++}`);
    updateValues.push(tenantData.contact_first_name);
  }
  if (tenantData.contact_last_name !== undefined) {
    updateFields.push(`contact_last_name = $${paramIndex++}`);
    updateValues.push(tenantData.contact_last_name);
  }
  if (tenantData.status !== undefined) {
    updateFields.push(`status = $${paramIndex++}`);
    updateValues.push(tenantData.status);
  }

  if (updateFields.length === 0) {
    return tenant;
  }

  updateFields.push(`updated_at = NOW()`);
  updateValues.push(id);

  const result = await query(
    `UPDATE tenants SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    updateValues
  );

  return result.rows[0];
}

export async function deleteTenant(id: string): Promise<boolean> {
  const result = await query('UPDATE tenants SET status = $1, updated_at = NOW() WHERE id = $2', [
    'deleted',
    id,
  ]);
  return result.rowCount! > 0;
}

export async function resetTempPassword(id: string): Promise<{ tempPassword: string; expiresAt: Date }> {
  const tenant = await getTenantById(id);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const tempPassword = generateTempPassword();
  const tempPasswordExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await query(
    'UPDATE tenants SET temp_password = $1, temp_password_expires_at = $2, updated_at = NOW() WHERE id = $3',
    [tempPassword, tempPasswordExpiresAt, id]
  );

  return {
    tempPassword,
    expiresAt: tempPasswordExpiresAt,
  };
}
