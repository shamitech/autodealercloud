-- CMS Database Schema
-- This schema will be created per tenant

-- Tenants reference table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Users Table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'editor',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_email ON tenant_users(email);

-- Components (Atoms) Table
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  thumbnail_url VARCHAR(500),
  html_template TEXT,
  css_template TEXT,
  js_template TEXT,
  props_schema JSONB,
  version INT NOT NULL DEFAULT 1,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID REFERENCES tenant_users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_components_tenant ON components(tenant_id);
CREATE INDEX IF NOT EXISTS idx_components_slug ON components(slug);

-- Organisms (Molecules) Table
CREATE TABLE IF NOT EXISTS organisms (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  composition JSONB,
  created_by_user_id UUID REFERENCES tenant_users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organisms_tenant ON organisms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organisms_slug ON organisms(slug);

-- Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  published_version INT,
  created_by_user_id UUID REFERENCES tenant_users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_pages_tenant ON pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- DMS Lightspeed Config Table
CREATE TABLE IF NOT EXISTS dms_lightspeed_config (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  api_key_encrypted VARCHAR(500),
  api_secret_encrypted VARCHAR(500),
  account_id VARCHAR(100),
  last_synced_at TIMESTAMP,
  sync_status VARCHAR(20),
  sync_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dms_config_tenant ON dms_lightspeed_config(tenant_id);

-- Vehicles Table (synced from DMS)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dms_vehicle_id VARCHAR(100),
  year INT,
  make VARCHAR(100),
  model VARCHAR(100),
  trim VARCHAR(100),
  vin VARCHAR(100),
  price DECIMAL(12, 2),
  mileage INT,
  exterior_color VARCHAR(50),
  interior_color VARCHAR(50),
  transmission VARCHAR(50),
  engine VARCHAR(100),
  fuel_type VARCHAR(50),
  image_urls JSONB,
  features JSONB,
  status VARCHAR(20),
  last_synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_dms_id ON vehicles(dms_vehicle_id);
