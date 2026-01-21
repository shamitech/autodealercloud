import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface Domain {
  id: string;
  companyId: string;
  environmentId: string;
  domainName: string;
  isPrimary: boolean;
  dnsConfigured: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DomainModel {
  constructor(private db: Database) {}

  /**
   * Create a new domain
   */
  async create(
    companyId: string,
    environmentId: string,
    domainName: string,
    isPrimary: boolean = false
  ): Promise<Domain> {
    const id = uuid();

    const query = `
      INSERT INTO domains (
        id, company_id, environment_id, domain_name, is_primary
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      companyId,
      environmentId,
      domainName,
      isPrimary,
    ]);

    return this.mapRow(result.rows[0]);
  }

  /**
   * Find domain by name
   */
  async findByName(domainName: string): Promise<Domain | null> {
    const result = await this.db.query(
      'SELECT * FROM domains WHERE domain_name = $1',
      [domainName]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  /**
   * Find all domains for a company
   */
  async findByCompanyId(companyId: string): Promise<Domain[]> {
    const result = await this.db.query(
      'SELECT * FROM domains WHERE company_id = $1 ORDER BY is_primary DESC, created_at ASC',
      [companyId]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  /**
   * Find all domains for an environment
   */
  async findByEnvironmentId(environmentId: string): Promise<Domain[]> {
    const result = await this.db.query(
      'SELECT * FROM domains WHERE environment_id = $1',
      [environmentId]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  /**
   * Mark domain as verified
   */
  async markAsVerified(id: string): Promise<Domain> {
    const query = `
      UPDATE domains
      SET dns_configured = true, verified_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await this.db.query(query, [id]);
    return this.mapRow(result.rows[0]);
  }

  /**
   * Delete domain
   */
  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM domains WHERE id = $1', [id]);
  }

  private mapRow(row: any): Domain {
    return {
      id: row.id,
      companyId: row.company_id,
      environmentId: row.environment_id,
      domainName: row.domain_name,
      isPrimary: row.is_primary,
      dnsConfigured: row.dns_configured,
      verifiedAt: row.verified_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
