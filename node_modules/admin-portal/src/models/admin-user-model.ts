import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUserModel {
  constructor(private db: Database) {}

  async create(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: string = 'admin'
  ): Promise<AdminUser> {
    const id = uuid();

    const query = `
      INSERT INTO admin_users (
        id, email, password_hash, first_name, last_name, role, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      'active',
    ]);

    return this.mapRow(result.rows[0]);
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const result = await this.db.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async findById(id: string): Promise<AdminUser | null> {
    const result = await this.db.query('SELECT * FROM admin_users WHERE id = $1', [
      id,
    ]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async getPasswordHash(email: string): Promise<string | null> {
    const result = await this.db.query(
      'SELECT password_hash FROM admin_users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? result.rows[0].password_hash : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = $1', [
      id,
    ]);
  }

  private mapRow(row: any): AdminUser {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      status: row.status,
      lastLoginAt: row.last_login_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
