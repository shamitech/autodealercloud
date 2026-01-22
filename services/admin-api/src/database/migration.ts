import fs from 'fs';
import path from 'path';
import { getPool } from './connection';

export async function runMigrations(dbType: 'admin' | 'cms' | 'publisher') {
  const pool = getPool();
  let migrationFile = '';

  if (dbType === 'admin') {
    migrationFile = path.join(__dirname, '../../database/migrations/001_admin_db_schema.sql');
  } else if (dbType === 'cms') {
    migrationFile = path.join(__dirname, '../../database/migrations/002_cms_db_schema.sql');
  } else if (dbType === 'publisher') {
    migrationFile = path.join(__dirname, '../../database/migrations/003_publisher_db_schema.sql');
  }

  try {
    const sql = fs.readFileSync(migrationFile, 'utf-8');
    await pool.query(sql);
    console.log(`✅ Migration completed for ${dbType} database`);
  } catch (error) {
    console.error(`❌ Migration failed for ${dbType} database:`, error);
    throw error;
  }
}
