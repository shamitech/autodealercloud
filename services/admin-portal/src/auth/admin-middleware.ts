import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from './admin-auth-service';

export interface AdminAuthenticatedRequest extends Request {
  admin?: {
    adminUserId: string;
    email: string;
    role: string;
  };
}

const authService = new AdminAuthService();

export const adminAuthMiddleware = (
  req: AdminAuthenticatedRequest,
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
    req.admin = payload;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireAdminRole = (...allowedRoles: string[]) => {
  return (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res
        .status(403)
        .json({ error: 'Insufficient permissions for this action' });
    }

    next();
  };
};

export { AdminAuthService };
