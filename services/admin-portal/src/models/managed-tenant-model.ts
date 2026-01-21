import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface ManagedTenant {
  id: string;
  externalCompanyId: string;
  name: string;
  email: string;
  status: string;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: Date;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ManagedTenantModel {
  constructor(private db: Database) {}

  async create(
    externalCompanyId: string,
    name: string,
    email: string,
    contactEmail?: string,
    contactPhone?: string
  ): Promise<ManagedTenant> {
    const id = uuid();

    const query = `
      INSERT INTO managed_tenants (
        id, external_company_id, name, email, contact_email, contact_phone, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      externalCompanyId,
      name,
      email,
      contactEmail,
      contactPhone,
      'active',
    ]);

    return this.mapRow(result.rows[0]);
  }

  async findByExternalId(externalCompanyId: string): Promise<ManagedTenant | null> {
    const result = await this.db.query(
      'SELECT * FROM managed_tenants WHERE external_company_id = $1',
      [externalCompanyId]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<ManagedTenant[]> {
    const result = await this.db.query(
      'SELECT * FROM managed_tenants ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  async update(id: string, updates: Partial<ManagedTenant>): Promise<ManagedTenant> {
    const allowedFields = [
      'name',
      'email',
      'status',
      'subscription_plan',
      'subscription_expires_at',
      'contact_email',
      'contact_phone',
      'notes',
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
      const result = await this.db.query(
        'SELECT * FROM managed_tenants WHERE id = $1',
        [id]
      );
      return this.mapRow(result.rows[0]);
    }

    values.push(id);
    const query = `
      UPDATE managed_tenants
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  private mapRow(row: any): ManagedTenant {
    return {
      id: row.id,
      externalCompanyId: row.external_company_id,
      name: row.name,
      email: row.email,
      status: row.status,
      subscriptionPlan: row.subscription_plan,
      subscriptionExpiresAt: row.subscription_expires_at,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
