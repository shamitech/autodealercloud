import { Router, Request, Response } from 'express';
import { Database } from '../database/db';
import { AuthenticatedRequest, authMiddleware } from '../auth/middleware';
import { AuthService } from '../auth/auth-service';
import { UserModel } from '../models/user-model';
import { CompanyModel } from '../models/company-model';
import { v4 as uuid } from 'uuid';

export class AuthRoutes {
  private router: Router;
  private db: Database;
  private authService: AuthService;
  private userModel: UserModel;
  private companyModel: CompanyModel;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.authService = new AuthService();
    this.userModel = new UserModel(db);
    this.companyModel = new CompanyModel(db);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', authMiddleware, this.refreshToken.bind(this));
    this.router.get('/me', authMiddleware, this.getCurrentUser.bind(this));
  }

  private async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, companyName } = req.body;

      if (!email || !password || !companyName) {
        res.status(400).json({
          error: 'Email, password, and company name are required',
        });
        return;
      }

      // Check if email already exists
      const existing = await this.userModel.findByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Create company
      const companyId = `c${Date.now()}`;
      const company = await this.companyModel.create(
        companyId,
        companyName,
        email
      );

      // Create user
      const passwordHash = await this.authService.hashPassword(password);
      const user = await this.userModel.create(
        company.id,
        email,
        passwordHash,
        firstName || '',
        lastName || '',
        'owner'
      );

      // Generate token
      const token = this.authService.generateToken({
        userId: user.id,
        companyId: company.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        token,
        user,
        company,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      // Find user
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Get password hash
      const passwordHash = await this.userModel.getPasswordHash(email);
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
      await this.userModel.updateLastLogin(user.id);

      // Generate token
      const token = this.authService.generateToken({
        userId: user.id,
        companyId: user.companyId,
        email: user.email,
        role: user.role,
      });

      res.json({
        token,
        user,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const newToken = this.authService.generateToken({
        userId: req.user.userId,
        companyId: req.user.companyId,
        email: req.user.email,
        role: req.user.role,
      });

      res.json({ token: newToken });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await this.userModel.findById(req.user.userId);
      const company = await this.companyModel.findById(req.user.companyId);

      res.json({
        user,
        company,
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
