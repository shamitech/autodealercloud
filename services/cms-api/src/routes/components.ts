import { Router, Request, Response } from 'express';
import { tenantAuthMiddleware } from '../middleware/tenant-auth';
import * as ComponentService from '../services/ComponentService';

const router = Router();

router.use(tenantAuthMiddleware);

// Get all components
router.get('/', async (req: Request, res: Response) => {
  try {
    const components = await ComponentService.getAllComponents(req.tenantId!);
    res.json(components);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get component by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const component = await ComponentService.getComponentById(req.tenantId!, req.params.id);
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create component
router.post('/', async (req: Request, res: Response) => {
  try {
    const componentData = {
      ...req.body,
      created_by_user_id: req.tenant!.id,
    };
    const component = await ComponentService.createComponent(req.tenantId!, componentData);
    res.status(201).json(component);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update component
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const component = await ComponentService.updateComponent(req.tenantId!, req.params.id, req.body);
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    res.json(component);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete component
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await ComponentService.deleteComponent(req.tenantId!, req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Component not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
