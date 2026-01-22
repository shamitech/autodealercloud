import { Router, Request, Response } from 'express';
import * as PublishedPageService from '../services/PublishedPageService';

const router = Router();

// Get published page by slug (public route)
router.get('/:tenantSlug/:pageSlug', async (req: Request, res: Response) => {
  try {
    const { tenantSlug, pageSlug } = req.params;

    // TODO: Convert tenant slug to tenant ID
    // For now, we'll assume tenantSlug is the tenant ID

    const page = await PublishedPageService.getPublishedPageBySlug(tenantSlug, pageSlug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all published pages for tenant
router.get('/:tenantSlug', async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const pages = await PublishedPageService.getPublishedPagesByTenant(tenantSlug, limit, offset);
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
