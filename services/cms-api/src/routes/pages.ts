import { Router, Request, Response } from 'express';
import { tenantAuthMiddleware } from '../middleware/tenant-auth';
import * as PageService from '../services/PageService';

const router = Router();

router.use(tenantAuthMiddleware);

// Get all pages
router.get('/', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const pages = await PageService.getAllPages(req.tenantId!, status);
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get page by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const page = await PageService.getPageById(req.tenantId!, req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create page
router.post('/', async (req: Request, res: Response) => {
  try {
    const page = await PageService.createPage(req.tenantId!, req.body, req.tenant!.id);
    res.status(201).json(page);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update page
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const page = await PageService.updatePage(req.tenantId!, req.params.id, req.body);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete page
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await PageService.deletePage(req.tenantId!, req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Publish page
router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const page = await PageService.publishPage(req.tenantId!, req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Unpublish page
router.post('/:id/unpublish', async (req: Request, res: Response) => {
  try {
    const page = await PageService.unpublishPage(req.tenantId!, req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
