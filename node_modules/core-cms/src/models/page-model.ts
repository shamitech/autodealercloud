import { Database } from '../database/db';
import { v4 as uuid } from 'uuid';

export interface Page {
  id: string;
  environmentId: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: any[];
  status: string;
  createdBy: string;
  publishedBy?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PageModel {
  constructor(private db: Database) {}

  async create(
    environmentId: string,
    title: string,
    slug: string,
    createdBy: string,
    sections: any[] = []
  ): Promise<Page> {
    const id = uuid();

    const query = `
      INSERT INTO pages (
        id, environment_id, title, slug, sections, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await this.db.query(query, [
      id,
      environmentId,
      title,
      slug,
      JSON.stringify(sections),
      'draft',
      createdBy,
    ]);

    return this.mapRow(result.rows[0]);
  }

  async findById(id: string): Promise<Page | null> {
    const result = await this.db.query('SELECT * FROM pages WHERE id = $1', [id]);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async findBySlug(environmentId: string, slug: string): Promise<Page | null> {
    const result = await this.db.query(
      'SELECT * FROM pages WHERE environment_id = $1 AND slug = $2',
      [environmentId, slug]
    );
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  async findByEnvironmentId(environmentId: string, limit: number = 100, offset: number = 0): Promise<Page[]> {
    const result = await this.db.query(
      'SELECT * FROM pages WHERE environment_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [environmentId, limit, offset]
    );
    return result.rows.map((row: any) => this.mapRow(row));
  }

  async update(id: string, updates: Partial<Page>): Promise<Page> {
    const allowedFields = ['title', 'slug', 'meta_title', 'meta_description', 'sections', 'status'];
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const dbKey = this.camelToSnake(key);
      if (allowedFields.includes(dbKey)) {
        if (key === 'sections') {
          fields.push(`${dbKey} = $${paramIndex}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${dbKey} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id) as Promise<Page>;
    }

    values.push(id);
    const query = `
      UPDATE pages
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await this.db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  async publish(id: string, publishedBy: string): Promise<Page> {
    const query = `
      UPDATE pages
      SET status = 'published', published_by = $2, published_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;

    const result = await this.db.query(query, [id, publishedBy]);
    return this.mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM pages WHERE id = $1', [id]);
  }

  private mapRow(row: any): Page {
    return {
      id: row.id,
      environmentId: row.environment_id,
      title: row.title,
      slug: row.slug,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      sections: row.sections || [],
      status: row.status,
      createdBy: row.created_by,
      publishedBy: row.published_by,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
