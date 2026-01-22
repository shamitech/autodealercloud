import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  user: process.env.ADMIN_DB_USER || 'admin_user',
  password: process.env.ADMIN_DB_PASSWORD || 'admin_password',
  host: process.env.ADMIN_DB_HOST || 'localhost',
  port: parseInt(process.env.ADMIN_DB_PORT || '5432'),
  database: process.env.ADMIN_DB_NAME || 'admin_db',
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase(): Promise<void> {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to Admin Database', res.rows[0]);
  } catch (error) {
    console.error('❌ Failed to connect to Admin Database:', error);
    process.exit(1);
  }
}

export async function query(text: string, params?: unknown[]): Promise<any> {
  return pool.query(text, params);
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('✅ Database connection closed');
}
