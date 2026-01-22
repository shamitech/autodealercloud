import { getPool } from './connection';
import { hashPassword, generateId } from '../utils/crypto';

export async function seedInitialAdmin(email: string, password: string) {
  const pool = getPool();

  try {
    // Check if admin already exists
    const existingAdmin = await pool.query('SELECT id FROM admin_users WHERE email = $1', [email]);

    if (existingAdmin.rows.length > 0) {
      console.log(`Admin user ${email} already exists, skipping seed`);
      return;
    }

    const passwordHash = await hashPassword(password);
    const id = generateId();

    await pool.query(
      `INSERT INTO admin_users (id, email, password_hash, first_name, last_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, email, passwordHash, 'Admin', 'User']
    );

    console.log(`✅ Seeded initial admin user: ${email}`);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    throw error;
  }
}
