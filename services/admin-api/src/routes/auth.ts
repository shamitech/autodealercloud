import { Router, Request, Response } from 'express';
import { loginAdmin } from '../services/AuthService';
import { LoginRequest } from '../../../shared/types';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData: LoginRequest = req.body;

    if (!loginData.email || !loginData.password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await loginAdmin(loginData);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
