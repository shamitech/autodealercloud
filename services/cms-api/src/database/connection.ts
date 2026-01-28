import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.CMS_DB_USER || 'cms_user',
  password: process.env.CMS_DB_PASSWORD || 'cms_password',
  host: process.env.CMS_DB_HOST || 'localhost',
  port: parseInt(process.env.CMS_DB_PORT || '5433'),
  database: process.env.CMS_DB_NAME || 'cms_db',
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function initializeDatabase(): Promise<void> {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to CMS Database', res.rows[0]);
  } catch (error) {
    console.error('❌ Failed to connect to CMS Database:', error);
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
