import { Router, Request, Response } from 'express';
import { createTenant, getTenants, getTenantById, updateTenant, deleteTenant } from '../services/TenantService';
import { CreateTenantRequest, UpdateTenantRequest } from '@shared/types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateTenantRequest = req.body;
    const tenant = await createTenant(data);
    res.status(201).json(tenant);
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const tenants = await getTenants();
    res.json(tenants);
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Failed to get tenants' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tenant = await getTenantById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const data: UpdateTenantRequest = req.body;
    const tenant = await updateTenant(req.params.id, data);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await deleteTenant(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

export default router;
