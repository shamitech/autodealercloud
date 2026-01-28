import { query } from '../database/connection';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '@shared/types';
import { generateId } from '../utils/crypto';

export async function createTenant(data: CreateTenantRequest): Promise<Tenant> {
  const id = generateId();
  const now = new Date();

  const result = await query(
    'INSERT INTO tenants (id, name, slug, email, contact_first_name, contact_last_name, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [id, data.name, data.slug, data.email, data.contact_first_name, data.contact_last_name, 'active', now, now]
  );

  return result.rows[0] as Tenant;
}

export async function getTenants(): Promise<Tenant[]> {
  const result = await query('SELECT * FROM tenants WHERE status != $1 ORDER BY created_at DESC', ['deleted']);
  return result.rows as Tenant[];
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const result = await query('SELECT * FROM tenants WHERE id = $1', [id]);
  return result.rows.length > 0 ? (result.rows[0] as Tenant) : null;
}

export async function updateTenant(id: string, data: UpdateTenantRequest): Promise<Tenant | null> {
  const now = new Date();
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(data.email);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  updates.push(`updated_at = $${paramCount++}`);
  values.push(now);
  values.push(id);

  const result = await query(
    `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows.length > 0 ? (result.rows[0] as Tenant) : null;
}

export async function deleteTenant(id: string): Promise<boolean> {
  const now = new Date();
  const result = await query('UPDATE tenants SET status = $1, updated_at = $2 WHERE id = $3', ['deleted', now, id]);
  return result.rowCount! > 0;
}
