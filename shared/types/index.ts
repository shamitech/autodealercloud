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
  temp_password?: string;
  temp_password_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TenantDMSCredentials {
  id: string;
  tenant_id: string;
  dms_provider: string;
  credentials_encrypted: Record<string, any>;
  last_synced_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  created_at: Date;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  type: 'admin';
}
