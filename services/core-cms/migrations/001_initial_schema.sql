-- Core CMS Database Schema
-- Tables for pages, templates, components, and published content

-- Environments table
CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR(50) NOT NULL,
  environment_id VARCHAR(50) NOT NULL,
  environment_type VARCHAR(20) NOT NULL CHECK (environment_type IN ('auth', 'stage', 'pub')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, environment_id, environment_type)
);

-- Pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID NOT NULL,
  published_by UUID,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(environment_id, slug)
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(environment_id, name)
);

-- Components table (pre-built components that can be customized)
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  component_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(environment_id, name)
);

-- Sections (groups of components)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets table (images, files)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  alt_text VARCHAR(255),
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Revisions/History
CREATE TABLE page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  sections JSONB NOT NULL,
  created_by UUID NOT NULL,
  revision_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_id, revision_number)
);

-- Indices for performance
CREATE INDEX idx_pages_environment ON pages(environment_id);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_templates_environment ON templates(environment_id);
CREATE INDEX idx_components_environment ON components(environment_id);
CREATE INDEX idx_sections_page ON sections(page_id);
CREATE INDEX idx_sections_template ON sections(template_id);
CREATE INDEX idx_assets_environment ON assets(environment_id);
CREATE INDEX idx_revisions_page ON page_revisions(page_id);
