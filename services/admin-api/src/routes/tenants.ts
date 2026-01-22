import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as TenantService from '../services/TenantService';
import { CreateTenantRequest, UpdateTenantRequest } from '../../../shared/types';

const router = Router();

router.use(authMiddleware);

// Get all tenants
router.get('/', async (req: Request, res: Response) => {
  try {
    const tenants = await TenantService.getAllTenants();
    res.json(tenants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tenant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await TenantService.getTenantById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create tenant
router.post('/', async (req: Request, res: Response) => {
  try {
    const tenantData: CreateTenantRequest = req.body;

    if (!tenantData.name || !tenantData.slug || !tenantData.email) {
      return res.status(400).json({ error: 'Name, slug, and email are required' });
    }

    const result = await TenantService.createTenant(tenantData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update tenant
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tenantData: UpdateTenantRequest = req.body;
    const tenant = await TenantService.updateTenant(req.params.id, tenantData);
    res.json(tenant);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete tenant
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await TenantService.deleteTenant(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Tenant not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset temporary password
router.post('/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const result = await TenantService.resetTempPassword(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
