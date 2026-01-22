import { Pool } from 'pg';

let pool: Pool;

export async function initializeDatabase() {
  pool = new Pool({
    user: process.env.PUBLISHER_DB_USER || 'publisher_user',
    password: process.env.PUBLISHER_DB_PASSWORD || 'publisher_password',
    host: process.env.PUBLISHER_DB_HOST || 'localhost',
    port: parseInt(process.env.PUBLISHER_DB_PORT || '5432'),
    database: process.env.PUBLISHER_DB_NAME || 'publisher_db',
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Publisher Database');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to Publisher Database:', err);
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
