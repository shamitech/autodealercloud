import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface Environment {
  id: string;
  companyId: string;
  environmentId: string;
  name: string;
  environmentType: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EnvironmentModel {
  constructor(private db: Database) {}

  /**
   * Create a new environment
   */
  async create(
    companyId: string,
    environmentId: string,
    name: string,
    environmentType: string,
    description?: string
  ): Promise<Environment> {
    const id = uuid();

    const query = `
      INSERT INTO environments (
        id, company_id, environment_id, name, environment_type, description
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      companyId,
      environmentId,
      name,
      environmentType,
      description,
    ]);

    return this.mapRow(result.rows[0]);
  }

  /**
   * Find environment by ID
   */
  async findById(id: string): Promise<Environment | null> {
    const result = await this.db.query('SELECT * FROM environments WHERE id = $1', [
      id,
    ]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Find environments by company
   */
  async findByCompanyId(companyId: string): Promise<Environment[]> {
    const result = await this.db.query(
      'SELECT * FROM environments WHERE company_id = $1 ORDER BY environment_type',
      [companyId]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  /**
   * Find environment by company + environment_id
   */
  async findByCompanyAndEnvId(
    companyId: string,
    environmentId: string
  ): Promise<Environment | null> {
    const result = await this.db.query(
      'SELECT * FROM environments WHERE company_id = $1 AND environment_id = $2',
      [companyId, environmentId]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Update environment
   */
  async update(id: string, updates: Partial<Environment>): Promise<Environment> {
    const allowedFields = ['name', 'description'];
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
      return this.findById(id) as Promise<Environment>;
    }

    values.push(id);
    const query = `
      UPDATE environments
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  /**
   * Delete environment
   */
  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM environments WHERE id = $1', [id]);
  }

  private mapRow(row: any): Environment {
    return {
      id: row.id,
      companyId: row.company_id,
      environmentId: row.environment_id,
      name: row.name,
      environmentType: row.environment_type,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
