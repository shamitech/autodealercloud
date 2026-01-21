import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  companyId: string;
  email: string;
  role: string;
}

export class AuthService {
  private jwtSecret: string;

  constructor(jwtSecret: string = process.env.JWT_SECRET || 'dev-secret') {
    this.jwtSecret = jwtSecret;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  generateToken(payload: JWTPayload, expiresIn: string = '7d'): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as any);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }
}
