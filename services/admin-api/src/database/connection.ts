import { Pool, PoolClient } from 'pg';

let pool: Pool;

export async function initializeDatabase() {
  pool = new Pool({
    user: process.env.ADMIN_DB_USER || 'admin_user',
    password: process.env.ADMIN_DB_PASSWORD || 'admin_password',
    host: process.env.ADMIN_DB_HOST || 'localhost',
    port: parseInt(process.env.ADMIN_DB_PORT || '5432'),
    database: process.env.ADMIN_DB_NAME || 'admin_db',
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Admin Database');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to Admin Database:', err);
    throw err;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const result = await getPool().query(text, params);
  return result;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }
}
