CREATE SCHEMA IF NOT EXISTS tenant_mountainvalleymotorsports;

CREATE TABLE IF NOT EXISTS tenant_mountainvalleymotorsports.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tenant_mountainvalleymotorsports.tenant_users 
(tenant_id, email, password_hash, first_name, last_name, role, status)
VALUES 
('cmkx2iwzr0000twwr0apzuv7e', 'test@mountainvalley.com', '$2b$10$4vWH8dQVzI.hJ3Lj6F4P2uEn2U8H0H.OhvbX5eU7Y6Z4Z8Z4Z8Z4Z', 'Test', 'User', 'admin', 'active');
