import { Pool } from 'pg';

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

  /**
   * Get a client from the pool
   */
  async getClient() {
    return this.pool.connect();
  }

  /**
   * Execute a query
   */
  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  /**
   * Execute a query and return first row
   */
  async queryOne(text: string, params?: any[]) {
    const result = await this.pool.query(text, params);
    return result.rows[0];
  }

  /**
   * Execute a transaction
   */
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

  /**
   * Close the pool
   */
  async close() {
    await this.pool.end();
  }
}
