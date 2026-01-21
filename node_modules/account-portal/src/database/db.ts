import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { DatabaseMigration } from './migration';

export class Database {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getClient() {
    return this.pool.connect();
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async queryOne(text: string, params?: any[]) {
    const result = await this.pool.query(text, params);
    return result.rows[0];
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

export async function initializeDatabase(connectionString: string, serviceName: string) {
  const db = new Database(connectionString);

  // Determine migrations path based on service name
  let migrationsPath = '';
  if (serviceName === 'account-portal') {
    migrationsPath = path.join(__dirname, '../../migrations');
  } else if (serviceName === 'admin-portal') {
    migrationsPath = path.join(__dirname, '../../migrations');
  }

  if (migrationsPath) {
    const migration = new DatabaseMigration(connectionString, migrationsPath, serviceName);
    await migration.runMigrations();
  }

  return db;
}
