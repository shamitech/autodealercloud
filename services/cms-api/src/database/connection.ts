import { Pool, PoolClient } from 'pg';

let pool: Pool;
const tenantPools: Map<string, Pool> = new Map();

export async function initializeDatabase() {
  pool = new Pool({
    user: process.env.CMS_DB_USER || 'cms_user',
    password: process.env.CMS_DB_PASSWORD || 'cms_password',
    host: process.env.CMS_DB_HOST || 'localhost',
    port: parseInt(process.env.CMS_DB_PORT || '5432'),
    database: process.env.CMS_DB_NAME || 'cms_db',
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to CMS Database');
    client.release();
  } catch (err) {
    console.error('❌ Failed to connect to CMS Database:', err);
    throw err;
  }
}

// Get connection to admin database (for checking tenant slug)
export async function getAdminPool(): Promise<Pool> {
  const adminPool = new Pool({
    user: process.env.ADMIN_DB_USER || 'admin_user',
    password: process.env.ADMIN_DB_PASSWORD || 'admin_password',
    host: process.env.ADMIN_DB_HOST || 'localhost',
    port: parseInt(process.env.ADMIN_DB_PORT || '5434'),
    database: process.env.ADMIN_DB_NAME || 'admin_db',
  });
  return adminPool;
}

export function getMainPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const result = await getMainPool().query(text, params);
  return result;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('✅ Database connection closed');
  }

  for (const [tenantId, tenantPool] of tenantPools) {
    await tenantPool.end();
  }
  tenantPools.clear();
}
