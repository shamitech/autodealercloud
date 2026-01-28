import { Router, Request, Response } from 'express';
import { query } from '../database/connection';
import { generateId } from '../utils/crypto';

const router = Router();

// Middleware to verify internal secret
const verifyInternalSecret = (req: Request, res: Response, next: Function) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Publish page to publisher database
router.post('/internal/publish-page', verifyInternalSecret, async (req: Request, res: Response) => {
  try {
    const { pageId, tenantId, title, slug, description, content, publishedAt, expiresAt } = req.body;

    const id = generateId();

    const result = await query(
      `INSERT INTO published_pages (id, page_id, tenant_id, title, slug, description, content, published_at, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (page_id) DO UPDATE SET
         title = $4,
         content = $7,
         published_at = $8,
         expires_at = $9,
         updated_at = NOW()
       RETURNING id`,
      [id, pageId, tenantId, title, slug, description, JSON.stringify(content), publishedAt, expiresAt]
    );

    res.json({ success: true, publishedPageId: result.rows[0]?.id });
  } catch (error: any) {
    console.error('Failed to publish page:', error);
    res.status(500).json({ error: 'Failed to publish page' });
  }
});

// Unpublish page from publisher database
router.delete('/internal/publish-page/:pageId', verifyInternalSecret, async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;

    const result = await query('DELETE FROM published_pages WHERE page_id = $1', [pageId]);

    res.json({ success: true, rowsDeleted: result.rowCount });
  } catch (error: any) {
    console.error('Failed to unpublish page:', error);
    res.status(500).json({ error: 'Failed to unpublish page' });
  }
});

export default router;
