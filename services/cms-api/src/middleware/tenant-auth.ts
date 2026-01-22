import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto';
import { query, getAdminPool } from '../database/connection';

export interface TenantJWT {
  id: string;
  email: string;
  tenant_id: string;
  type: 'tenant';
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantJWT;
      tenantId?: string;
    }
  }
}

export async function tenantAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload || payload.type !== 'tenant') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify tenant exists and is active
  try {
    const adminPool = await getAdminPool();
    const result = await adminPool.query('SELECT id, status FROM tenants WHERE id = $1', [payload.tenant_id]);
    adminPool.end();

    if (result.rows.length === 0 || result.rows[0].status !== 'active') {
      return res.status(401).json({ error: 'Tenant not found or inactive' });
    }

    req.tenant = payload as TenantJWT;
    req.tenantId = payload.tenant_id;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify tenant' });
  }
}

export async function extractTenantFromSlug(req: Request, res: Response, next: NextFunction) {
  const slug = req.params.slug || req.query.tenant_slug;

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug is required' });
  }

  try {
    const adminPool = await getAdminPool();
    const result = await adminPool.query('SELECT id FROM tenants WHERE slug = $1 AND status = $1', [
      slug,
      'active',
    ]);
    adminPool.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    req.tenantId = result.rows[0].id;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve tenant' });
  }
}
