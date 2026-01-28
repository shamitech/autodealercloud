import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto';

declare global {
  namespace Express {
    interface Request {
      admin?: any;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload || payload.type !== 'admin') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.admin = payload;
  next();
}
