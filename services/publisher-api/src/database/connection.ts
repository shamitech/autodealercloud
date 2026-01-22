import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PUBLISHER_DB_USER || 'publisher_user',
  password: process.env.PUBLISHER_DB_PASSWORD || 'publisher_password',
  host: process.env.PUBLISHER_DB_HOST || 'localhost',
  port: parseInt(process.env.PUBLISHER_DB_PORT || '5434'),
  database: process.env.PUBLISHER_DB_NAME || 'publisher_db',
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase(): Promise<void> {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to Publisher Database', res.rows[0]);
  } catch (error) {
    console.error('❌ Failed to connect to Publisher Database:', error);
    process.exit(1);
  }
}

export async function query(text: string, params?: unknown[]): Promise<any> {
  return pool.query(text, params);
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('✅ Database connection closed');
}
