import { Router, Request, Response } from 'express';
import { getPublishedPage, getTenantPages } from '../services/PageService';

const router = Router();

router.get('/tenant/:tenantSlug', async (req: Request, res: Response) => {
  try {
    const pages = await getTenantPages(req.params.tenantSlug);
    res.json(pages);
  } catch (error) {
    console.error('Get tenant pages error:', error);
    res.status(500).json({ error: 'Failed to get pages' });
  }
});

router.get('/tenant/:tenantSlug/:pageSlug', async (req: Request, res: Response) => {
  try {
    const page = await getPublishedPage(req.params.tenantSlug, req.params.pageSlug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

export default router;
