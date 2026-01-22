import { query } from '../database/connection';
import { AdminUser, LoginRequest } from '../../../shared/types';
import { hashPassword, comparePasswords, generateToken } from '../utils/crypto';

export async function loginAdmin(loginData: LoginRequest) {
  const { email, password } = loginData;

  const result = await query(
    'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const admin = result.rows[0];
  const passwordMatch = await comparePasswords(password, admin.password_hash);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    type: 'admin',
  });

  return { token, admin: { id: admin.id, email: admin.email } };
}

export async function registerAdmin(email: string, password: string, firstName?: string, lastName?: string) {
  const existingAdmin = await query('SELECT id FROM admin_users WHERE email = $1', [email]);

  if (existingAdmin.rows.length > 0) {
    throw new Error('Admin user already exists');
  }

  const passwordHash = await hashPassword(password);
  const id = require('uuid').v4();

  const result = await query(
    `INSERT INTO admin_users (id, email, password_hash, first_name, last_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, email, first_name, last_name`,
    [id, email, passwordHash, firstName, lastName]
  );

  return result.rows[0];
}
