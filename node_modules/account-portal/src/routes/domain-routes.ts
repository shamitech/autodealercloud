import { Router, Response } from 'express';
import { Database } from '../database/db';
import { AuthenticatedRequest, authMiddleware, verifyTenantAccess } from '../auth/middleware';
import { DomainModel } from '../models/domain-model';

export class DomainRoutes {
  private router: Router;
  private db: Database;
  private domainModel: DomainModel;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.domainModel = new DomainModel(db);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get all domains for company
    this.router.get(
      '/company/:companyId',
      authMiddleware,
      verifyTenantAccess,
      this.getDomains.bind(this)
    );

    // Add custom domain
    this.router.post(
      '/',
      authMiddleware,
      this.addDomain.bind(this)
    );

    // Verify domain ownership
    this.router.post(
      '/:domainId/verify',
      authMiddleware,
      this.verifyDomain.bind(this)
    );

    // Delete domain
    this.router.delete(
      '/:domainId',
      authMiddleware,
      this.deleteDomain.bind(this)
    );

    // Get DNS instructions
    this.router.get(
      '/:domainId/dns-instructions',
      authMiddleware,
      this.getDnsInstructions.bind(this)
    );
  }

  private async getDomains(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const domains = await this.domainModel.findByCompanyId(companyId);

      res.json(domains);
    } catch (error) {
      console.error('Error fetching domains:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async addDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { environmentId, domainName, isPrimary } = req.body;

      if (!domainName || !environmentId) {
        res.status(400).json({ error: 'Domain name and environment ID are required' });
        return;
      }

      // Validate domain format
      if (!this.isValidDomain(domainName)) {
        res.status(400).json({ error: 'Invalid domain format' });
        return;
      }

      // Check if domain already exists
      const existing = await this.domainModel.findByName(domainName);
      if (existing) {
        res.status(400).json({ error: 'Domain already registered' });
        return;
      }

      const domain = await this.domainModel.create(
        req.user.companyId,
        environmentId,
        domainName,
        isPrimary || false
      );

      res.status(201).json(domain);
    } catch (error) {
      console.error('Error adding domain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async verifyDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { domainId } = req.params;

      // TODO: Implement actual DNS verification
      // For now, just mark as verified
      const domain = await this.domainModel.markAsVerified(domainId);

      res.json({
        domain,
        message: 'Domain verified successfully',
      });
    } catch (error) {
      console.error('Error verifying domain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async deleteDomain(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { domainId } = req.params;

      await this.domainModel.delete(domainId);

      res.json({ message: 'Domain deleted' });
    } catch (error) {
      console.error('Error deleting domain:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getDnsInstructions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { domainId } = req.params;

      // Return DNS setup instructions
      res.json({
        instructions: [
          {
            type: 'CNAME',
            name: 'www',
            value: 'autodealercloud.com',
            ttl: 3600,
          },
          {
            type: 'A',
            name: '@',
            value: '1.2.3.4', // Replace with actual IP
            ttl: 3600,
          },
        ],
        timeToPropagate: '24-48 hours',
      });
    } catch (error) {
      console.error('Error getting DNS instructions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    return domainRegex.test(domain);
  }

  getRouter(): Router {
    return this.router;
  }
}
