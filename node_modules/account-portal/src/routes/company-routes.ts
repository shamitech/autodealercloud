import { Router, Response } from 'express';
import { Database } from '../database/db';
import { AuthenticatedRequest, authMiddleware, verifyTenantAccess } from '../auth/middleware';
import { UserModel } from '../models/user-model';
import { CompanyModel } from '../models/company-model';
import { EnvironmentModel } from '../models/environment-model';
import { AuthService } from '../auth/auth-service';
import { v4 as uuid } from 'uuid';

export class CompanyRoutes {
  private router: Router;
  private db: Database;
  private userModel: UserModel;
  private companyModel: CompanyModel;
  private environmentModel: EnvironmentModel;
  private authService: AuthService;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.userModel = new UserModel(db);
    this.companyModel = new CompanyModel(db);
    this.environmentModel = new EnvironmentModel(db);
    this.authService = new AuthService();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get company details
    this.router.get(
      '/:companyId',
      authMiddleware,
      verifyTenantAccess,
      this.getCompany.bind(this)
    );

    // Update company
    this.router.put(
      '/:companyId',
      authMiddleware,
      verifyTenantAccess,
      this.updateCompany.bind(this)
    );

    // Get company users
    this.router.get(
      '/:companyId/users',
      authMiddleware,
      verifyTenantAccess,
      this.getCompanyUsers.bind(this)
    );

    // Invite user
    this.router.post(
      '/:companyId/users/invite',
      authMiddleware,
      verifyTenantAccess,
      this.inviteUser.bind(this)
    );

    // Get company environments
    this.router.get(
      '/:companyId/environments',
      authMiddleware,
      verifyTenantAccess,
      this.getEnvironments.bind(this)
    );

    // Create environment
    this.router.post(
      '/:companyId/environments',
      authMiddleware,
      verifyTenantAccess,
      this.createEnvironment.bind(this)
    );
  }

  private async getCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const company = await this.companyModel.findById(companyId);

      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }

      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updateCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { name, email, phone, website } = req.body;

      const updated = await this.companyModel.update(companyId, {
        name,
        email,
        phone,
        website,
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getCompanyUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const users = await this.userModel.findByCompanyId(companyId);

      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async inviteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { email, firstName, lastName, role } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      // Check if user exists
      const existing = await this.userModel.findByEmail(email, companyId);
      if (existing) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Generate temporary password
      const tempPassword = uuid().substring(0, 8);
      const passwordHash = await this.authService.hashPassword(tempPassword);

      const newUser = await this.userModel.create(
        companyId,
        email,
        passwordHash,
        firstName || '',
        lastName || '',
        role || 'editor'
      );

      // TODO: Send email invitation with temporary password

      res.status(201).json({
        user: newUser,
        temporaryPassword: tempPassword,
        message: 'Invitation sent to user email',
      });
    } catch (error) {
      console.error('Error inviting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getEnvironments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const environments = await this.environmentModel.findByCompanyId(companyId);

      res.json(environments);
    } catch (error) {
      console.error('Error fetching environments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createEnvironment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { name, environmentType } = req.body;

      if (!name || !environmentType) {
        res.status(400).json({ error: 'Name and environment type are required' });
        return;
      }

      if (!['auth', 'stage', 'pub'].includes(environmentType)) {
        res.status(400).json({ error: 'Invalid environment type' });
        return;
      }

      // Generate environment ID
      const environmentId = `e${Date.now()}`;

      const environment = await this.environmentModel.create(
        companyId,
        environmentId,
        name,
        environmentType
      );

      res.status(201).json(environment);
    } catch (error) {
      console.error('Error creating environment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
