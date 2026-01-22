-- Publisher Database Schema

-- Published Pages Table
CREATE TABLE IF NOT EXISTS published_pages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  cms_page_id UUID,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content JSONB,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_published_pages_tenant ON published_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_published_pages_slug ON published_pages(slug);
CREATE INDEX IF NOT EXISTS idx_published_pages_published_at ON published_pages(published_at);
