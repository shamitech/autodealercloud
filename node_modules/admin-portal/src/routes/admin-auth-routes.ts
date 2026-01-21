import { Router, Request, Response } from 'express';
import { Database } from '../database/db';
import { AdminAuthenticatedRequest, adminAuthMiddleware, requireAdminRole } from '../auth/admin-middleware';
import { AdminAuthService } from '../auth/admin-auth-service';
import { AdminUserModel } from '../models/admin-user-model';

export class AdminAuthRoutes {
  private router: Router;
  private db: Database;
  private authService: AdminAuthService;
  private adminUserModel: AdminUserModel;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.authService = new AdminAuthService();
    this.adminUserModel = new AdminUserModel(db);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', adminAuthMiddleware, this.refreshToken.bind(this));
    this.router.get('/me', adminAuthMiddleware, this.getCurrentAdmin.bind(this));
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find admin user
      const admin = await this.adminUserModel.findByEmail(email);
      if (!admin) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Get password hash
      const passwordHash = await this.adminUserModel.getPasswordHash(email);
      if (!passwordHash) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValid = await this.authService.comparePassword(password, passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Update last login
      await this.adminUserModel.updateLastLogin(admin.id);

      // Generate token
      const token = this.authService.generateToken({
        adminUserId: admin.id,
        email: admin.email,
        role: admin.role,
      });

      res.json({
        token,
        admin,
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async refreshToken(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const newToken = this.authService.generateToken({
        adminUserId: req.admin.adminUserId,
        email: req.admin.email,
        role: req.admin.role,
      });

      res.json({ token: newToken });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getCurrentAdmin(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const admin = await this.adminUserModel.findById(req.admin.adminUserId);

      res.json(admin);
    } catch (error) {
      console.error('Error fetching admin user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
