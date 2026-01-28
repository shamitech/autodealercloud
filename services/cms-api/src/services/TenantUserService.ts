import { query } from '../database/connection';
import { TenantJWT } from '../middleware/tenant-auth';
import { hashPassword, comparePasswords, generateToken, generateId } from '../utils/crypto';

export async function loginTenantUser(tenantId: string, email: string, password: string) {
  const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, role FROM tenant_users WHERE tenant_id = $1 AND email = $2',
    [tenantId, email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];
  const passwordMatch = await comparePasswords(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'active') {
    throw new Error('User account is inactive');
  }

  const payload: TenantJWT = {
    id: user.id,
    email: user.email,
    tenant_id: tenantId,
    type: 'tenant',
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  };
}

export async function createTenantUser(
  tenantId: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  role: string = 'editor'
) {
  const existingUser = await query('SELECT id FROM tenant_users WHERE tenant_id = $1 AND email = $2', [
    tenantId,
    email,
  ]);

  if (existingUser.rows.length > 0) {
    throw new Error('User already exists for this tenant');
  }

  const passwordHash = await hashPassword(password);
  const id = generateId();

  const result = await query(
    `INSERT INTO tenant_users (id, tenant_id, email, password_hash, first_name, last_name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING id, email, first_name, last_name, role`,
    [id, tenantId, email, passwordHash, firstName, lastName, role]
  );

  return result.rows[0];
}

export async function updateTenantUserPassword(tenantId: string, userId: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);

  const result = await query(
    'UPDATE tenant_users SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING id, email',
    [passwordHash, userId, tenantId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0];
}
