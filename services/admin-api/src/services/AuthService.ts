import { query } from '../database/connection';
import { AdminUser, LoginRequest, TokenPayload } from '@shared/types';
import { hashPassword, comparePasswords, generateToken, generateId } from '../utils/crypto';

export async function loginAdmin(email: string, password: string): Promise<{ user: AdminUser; token: string } | null> {
  const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0] as AdminUser;
  const passwordMatch = await comparePasswords(password, user.password_hash);

  if (!passwordMatch) {
    return null;
  }

  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    type: 'admin',
  };

  const token = generateToken(payload);
  return { user, token };
}

export async function createAdmin(email: string, password: string, firstName?: string, lastName?: string): Promise<AdminUser> {
  const id = generateId();
  const passwordHash = await hashPassword(password);
  const now = new Date();

  const result = await query(
    'INSERT INTO admin_users (id, email, password_hash, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [id, email, passwordHash, firstName, lastName, now, now]
  );

  return result.rows[0] as AdminUser;
}
