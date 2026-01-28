import { Router, Request, Response } from 'express';
import { tenantAuthMiddleware } from '../middleware/tenant-auth';
import * as TenantUserService from '../services/TenantUserService';

const router = Router();

// Login endpoint (public)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { tenant_slug, email, password } = req.body;

    if (!tenant_slug || !email || !password) {
      return res.status(400).json({ error: 'tenant_slug, email, and password are required' });
    }

    // TODO: Get tenant ID from slug
    // For now, we'll need to implement this with a reference table

    const result = await TenantUserService.loginTenantUser(tenant_slug, email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Change password endpoint (protected)
router.post('/change-password', tenantAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    // TODO: Verify current password matches

    const result = await TenantUserService.updateTenantUserPassword(req.tenantId!, req.tenant!.id, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
