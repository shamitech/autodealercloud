import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface Company {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class CompanyModel {
  constructor(private db: Database) {}

  /**
   * Create a new company
   */
  async create(
    companyId: string,
    name: string,
    email: string,
    phone?: string,
    website?: string
  ): Promise<Company> {
    const id = uuid();

    const query = `
      INSERT INTO companies (
        id, company_id, name, email, phone, website, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      companyId,
      name,
      email,
      phone,
      website,
      'active',
    ]);

    return this.mapRow(result.rows[0]);
  }

  /**
   * Find company by ID
   */
  async findById(id: string): Promise<Company | null> {
    const result = await this.db.query('SELECT * FROM companies WHERE id = $1', [
      id,
    ]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Find company by company_id
   */
  async findByCompanyId(companyId: string): Promise<Company | null> {
    const result = await this.db.query(
      'SELECT * FROM companies WHERE company_id = $1',
      [companyId]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Update company
   */
  async update(id: string, updates: Partial<Company>): Promise<Company> {
    const allowedFields = [
      'name',
      'email',
      'phone',
      'website',
      'status',
      'subscription_plan',
      'subscription_expires_at',
    ];
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
      return this.findById(id) as Promise<Company>;
    }

    values.push(id);
    const query = `
      UPDATE companies
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  /**
   * Get all companies
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<Company[]> {
    const result = await this.db.query(
      'SELECT * FROM companies ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  private mapRow(row: any): Company {
    return {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      website: row.website,
      status: row.status,
      subscriptionPlan: row.subscription_plan,
      subscriptionExpiresAt: row.subscription_expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
