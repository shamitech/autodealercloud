import { Router, Response } from 'express';
import { Database } from '../database/db';
import { AdminAuthenticatedRequest, adminAuthMiddleware, requireAdminRole } from '../auth/admin-middleware';
import { ManagedTenantModel } from '../models/managed-tenant-model';
import { v4 as uuid } from 'uuid';

export class TenantManagementRoutes {
  private router: Router;
  private db: Database;
  private tenantModel: ManagedTenantModel;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.tenantModel = new ManagedTenantModel(db);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get all tenants
    this.router.get(
      '/',
      adminAuthMiddleware,
      requireAdminRole('super_admin', 'admin'),
      this.getAllTenants.bind(this)
    );

    // Get tenant details
    this.router.get(
      '/:tenantId',
      adminAuthMiddleware,
      requireAdminRole('super_admin', 'admin'),
      this.getTenant.bind(this)
    );

    // Create tenant
    this.router.post(
      '/',
      adminAuthMiddleware,
      requireAdminRole('super_admin', 'admin'),
      this.createTenant.bind(this)
    );

    // Update tenant
    this.router.put(
      '/:tenantId',
      adminAuthMiddleware,
      requireAdminRole('super_admin', 'admin'),
      this.updateTenant.bind(this)
    );

    // Suspend tenant
    this.router.post(
      '/:tenantId/suspend',
      adminAuthMiddleware,
      requireAdminRole('super_admin'),
      this.suspendTenant.bind(this)
    );

    // Activate tenant
    this.router.post(
      '/:tenantId/activate',
      adminAuthMiddleware,
      requireAdminRole('super_admin'),
      this.activateTenant.bind(this)
    );
  }

  private async getAllTenants(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const tenants = await this.tenantModel.findAll(limit, offset);

      res.json({
        data: tenants,
        limit,
        offset,
        total: tenants.length,
      });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getTenant(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;

      const tenant = await this.tenantModel.findByExternalId(tenantId);
      if (!tenant) {
        res.status(404).json({ error: 'Tenant not found' });
        return;
      }

      res.json(tenant);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createTenant(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, contactEmail, contactPhone, subscriptionPlan } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required' });
        return;
      }

      // Generate company ID
      const externalCompanyId = `c${Date.now()}`;

      const tenant = await this.tenantModel.create(
        externalCompanyId,
        name,
        email,
        contactEmail,
        contactPhone
      );

      // TODO: Create company in account-portal database

      res.status(201).json(tenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updateTenant(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const updates = req.body;

      const tenant = await this.tenantModel.update(tenantId, updates);

      res.json(tenant);
    } catch (error) {
      console.error('Error updating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async suspendTenant(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;

      const tenant = await this.tenantModel.update(tenantId, {
        status: 'suspended',
      });

      res.json({
        tenant,
        message: 'Tenant suspended',
      });
    } catch (error) {
      console.error('Error suspending tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async activateTenant(req: AdminAuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;

      const tenant = await this.tenantModel.update(tenantId, {
        status: 'active',
      });

      res.json({
        tenant,
        message: 'Tenant activated',
      });
    } catch (error) {
      console.error('Error activating tenant:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
