import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433'),
  database: process.env.CMS_DATABASE || 'cms_db',
});

export async function createTenantDatabase(tenantId: string, tenantSlug: string): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Create schema for tenant
    const schemaName = `tenant_${tenantSlug.replace(/-/g, '_')}`;
    
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // Initialize tenant schema tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50),
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.organisms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        components_ids UUID[] DEFAULT ARRAY[]::UUID[],
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        content JSONB DEFAULT '{}',
        is_published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_by UUID REFERENCES ${schemaName}.tenant_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.dms_lightspeed_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        api_key VARCHAR(255),
        api_secret VARCHAR(255),
        is_configured BOOLEAN DEFAULT false,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ${schemaName}.vehicles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dms_id VARCHAR(255),
        year INT,
        make VARCHAR(100),
        model VARCHAR(100),
        trim VARCHAR(100),
        vin VARCHAR(17),
        price DECIMAL(10, 2),
        mileage INT,
        exterior_color VARCHAR(50),
        interior_color VARCHAR(50),
        image_url TEXT,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_${schemaName}_pages_slug ON ${schemaName}.pages(slug);
      CREATE INDEX idx_${schemaName}_vehicles_dms_id ON ${schemaName}.vehicles(dms_id);
    `);

    console.log(`✓ Tenant database schema created for ${tenantSlug}`);
  } catch (error) {
    console.error(`✗ Failed to create tenant schema for ${tenantSlug}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export async function dropTenantDatabase(tenantSlug: string): Promise<void> {
  const client = await pool.connect();
  
  try {
    const schemaName = `tenant_${tenantSlug.replace(/-/g, '_')}`;
    await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    console.log(`✓ Tenant database schema dropped for ${tenantSlug}`);
  } catch (error) {
    console.error(`✗ Failed to drop tenant schema for ${tenantSlug}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
