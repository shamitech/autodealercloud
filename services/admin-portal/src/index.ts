import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Database } from './database/db';
import { AdminAuthRoutes } from './routes/admin-auth-routes';
import { TenantManagementRoutes } from './routes/tenant-management-routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3003;

// Database initialization
const db = new Database(
  process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5434/autodealercloud_admin'
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Admin Portal is running' });
});

// Admin auth routes
const authRoutes = new AdminAuthRoutes(db);
app.use('/auth', authRoutes.getRouter());

// Tenant management routes
const tenantRoutes = new TenantManagementRoutes(db);
app.use('/api/tenants', tenantRoutes.getRouter());

app.listen(PORT, () => {
  console.log(`Admin Portal is running on port ${PORT}`);
});

