import { Router, Response } from 'express';
import { Database } from '../database/db';
import { AuthenticatedRequest, authMiddleware } from '../auth/middleware';
import { PageModel } from '../models/page-model';

export class PageRoutes {
  private router: Router;
  private db: Database;
  private pageModel: PageModel;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.pageModel = new PageModel(db);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Get all pages for environment
    this.router.get(
      '/env/:environmentId',
      authMiddleware,
      this.getPages.bind(this)
    );

    // Get page by ID
    this.router.get(
      '/:pageId',
      authMiddleware,
      this.getPage.bind(this)
    );

    // Get page by slug
    this.router.get(
      '/env/:environmentId/slug/:slug',
      authMiddleware,
      this.getPageBySlug.bind(this)
    );

    // Create page
    this.router.post(
      '/',
      authMiddleware,
      this.createPage.bind(this)
    );

    // Update page
    this.router.put(
      '/:pageId',
      authMiddleware,
      this.updatePage.bind(this)
    );

    // Publish page
    this.router.post(
      '/:pageId/publish',
      authMiddleware,
      this.publishPage.bind(this)
    );

    // Delete page
    this.router.delete(
      '/:pageId',
      authMiddleware,
      this.deletePage.bind(this)
    );
  }

  private async getPages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { environmentId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const pages = await this.pageModel.findByEnvironmentId(environmentId, limit, offset);

      res.json({
        data: pages,
        limit,
        offset,
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getPage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;

      const page = await this.pageModel.findById(pageId);
      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async getPageBySlug(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { environmentId, slug } = req.params;

      const page = await this.pageModel.findBySlug(environmentId, slug);
      if (!page) {
        res.status(404).json({ error: 'Page not found' });
        return;
      }

      res.json(page);
    } catch (error) {
      console.error('Error fetching page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async createPage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { environmentId, title, slug, sections } = req.body;

      if (!environmentId || !title || !slug) {
        res.status(400).json({ error: 'Environment ID, title, and slug are required' });
        return;
      }

      // Check if slug already exists
      const existing = await this.pageModel.findBySlug(environmentId, slug);
      if (existing) {
        res.status(400).json({ error: 'Page with this slug already exists' });
        return;
      }

      const page = await this.pageModel.create(
        environmentId,
        title,
        slug,
        req.user.userId,
        sections || []
      );

      res.status(201).json(page);
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async updatePage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;
      const updates = req.body;

      const page = await this.pageModel.update(pageId, updates);

      res.json(page);
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async publishPage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { pageId } = req.params;

      const page = await this.pageModel.publish(pageId, req.user.userId);

      res.json({
        page,
        message: 'Page published successfully',
      });
    } catch (error) {
      console.error('Error publishing page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private async deletePage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { pageId } = req.params;

      await this.pageModel.delete(pageId);

      res.json({ message: 'Page deleted' });
    } catch (error) {
      console.error('Error deleting page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}
