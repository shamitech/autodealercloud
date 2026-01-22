import { Router, Request, Response } from 'express';
import { createPage, getPages, getPageById, updatePage, publishPage, deletePage } from '../services/PageService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { tenant_id, title, slug, content } = req.body;
    const page = await createPage(tenant_id, title, slug, content);
    res.status(201).json(page);
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.get('/tenant/:tenant_id', async (req: Request, res: Response) => {
  try {
    const pages = await getPages(req.params.tenant_id);
    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Failed to get pages' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const page = await getPageById(req.params.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Failed to get page' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const page = await updatePage(req.params.id, title, content);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const success = await publishPage({ page_id: req.params.id, title: '', slug: '', content: {} });
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ message: 'Page published' });
  } catch (error) {
    console.error('Publish page error:', error);
    res.status(500).json({ error: 'Failed to publish page' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await deletePage(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;
