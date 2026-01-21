import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface User {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModel {
  constructor(private db: Database) {}

  /**
   * Create a new user
   */
  async create(
    companyId: string,
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    role: string = 'editor'
  ): Promise<User> {
    const userId = uuid();

    const query = `
      INSERT INTO users (
        id, company_id, email, password_hash,
        first_name, last_name, role, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      userId,
      companyId,
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      'active',
    ]);

    return this.mapRow(result.rows[0]);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, companyId?: string): Promise<User | null> {
    let query = 'SELECT * FROM users WHERE email = $1';
    const params: any[] = [email];

    if (companyId) {
      query += ' AND company_id = $2';
      params.push(companyId);
    }

    const result = await this.db.query(query, params);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [
      userId,
    ]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Get all users for a company
   */
  async findByCompanyId(companyId: string): Promise<User[]> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  /**
   * Update user
   */
  async update(userId: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['first_name', 'last_name', 'role', 'status'];
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = this.camelToSnake(key);
      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(userId) as Promise<User>;
    }

    values.push(userId);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [
      userId,
    ]);
  }

  /**
   * Delete user
   */
  async delete(userId: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  /**
   * Get password hash for authentication
   */
  async getPasswordHash(email: string): Promise<string | null> {
    const result = await this.db.query(
      'SELECT password_hash FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? result.rows[0].password_hash : null;
  }

  private mapRow(row: any): User {
    return {
      id: row.id,
      companyId: row.company_id,
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

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
