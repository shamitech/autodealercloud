import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth-service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    companyId: string;
    email: string;
    role: string;
  };
}

const authService = new AuthService();

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.get('Authorization');
    const token = authService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = authService.verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.get('Authorization');
    const token = authService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = authService.verifyToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Silently fail
  }

  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'Insufficient permissions for this action' });
    }

    next();
  };
};

export const verifyTenantAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.params.companyId || req.query.companyId;

  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (req.user.companyId !== tenantId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

export { AuthService };
