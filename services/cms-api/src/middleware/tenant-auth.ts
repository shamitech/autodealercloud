import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto';
import { query } from '../database/connection';

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

  // Tenant verified by JWT signature
  req.tenant = payload as TenantJWT;
  req.tenantId = payload.tenant_id;
  next();
}

export async function extractTenantFromSlug(req: Request, res: Response, next: NextFunction) {
  const slug = req.params.slug || (req.query.tenant_slug as string);

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug is required' });
  }

  // Store slug in request for use in routes
  req.tenantId = slug;
  next();
}
