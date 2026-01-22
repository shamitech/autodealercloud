// Shared TypeScript types for AutoDealerCloud

export interface Tenant {
  id: string
  name: string
  slug: string
  description?: string
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'tenant-admin' | 'editor'
  status: 'active' | 'inactive'
  tenantId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Component {
  id: string
  type: 'atom' | 'molecule' | 'organism'
  name: string
  slug: string
  description?: string
  category?: string
  metadata: Record<string, any>
  status: 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface ComponentVersion {
  id: string
  version: string
  htmlContent?: string
  cssContent?: string
  jsContent?: string
  status: 'draft' | 'published'
  componentId: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomComponent {
  id: string
  tenantId: string
  name: string
  slug: string
  description?: string
  metadata: Record<string, any>
  status: 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface Page {
  id: string
  tenantId: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  content: PageContent
  metadata: Record<string, any>
  templateId?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface PageTemplate {
  id: string
  tenantId: string
  name: string
  slug: string
  description?: string
  content: PageContent
  status: 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface PageContent {
  sections: Section[]
}

export interface Section {
  id: string
  type: string // "hero", "features", "content", etc.
  components: ComponentInstance[]
  metadata?: Record<string, any>
}

export interface ComponentInstance {
  id: string
  componentId: string // Reference to core Component
  customComponentId?: string // Reference to CustomComponent if using custom
  metadata?: Record<string, any>
}

export interface Content {
  id: string
  tenantId: string
  pageId: string
  componentPath: string
  componentType: string
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsEvent {
  id: string
  tenantId: string
  eventType: string
  data: Record<string, any>
  createdAt: Date
}

export interface AuthDomain {
  id: string
  tenantId: string
  subdomain: string
  domain: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface PublishDomain {
  id: string
  tenantId: string
  subdomain: string
  domain: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface CustomDomain {
  id: string
  tenantId: string
  domain: string
  type: 'www' | 'root'
  ssl: boolean
  verified: boolean
  status: 'pending' | 'verified' | 'failed'
  createdAt: Date
  updatedAt: Date
}
