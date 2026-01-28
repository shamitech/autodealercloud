import { Router, Request, Response } from 'express';
import { loginAdmin } from '../services/AuthService';
import { LoginRequest } from '@shared/types';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const loginData: LoginRequest = req.body;
    const result = await loginAdmin(loginData.email, loginData.password);

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
