export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  contact_first_name?: string;
  contact_last_name?: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: Date;
  updated_at: Date;
}

export interface TokenPayload {
  id: string;
  email: string;
  type: 'admin' | 'tenant';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  email: string;
  contact_first_name?: string;
  contact_last_name?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  contact_first_name?: string;
  contact_last_name?: string;
  status?: 'active' | 'suspended' | 'deleted';
}

export interface Page {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PublishRequest {
  page_id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
}
