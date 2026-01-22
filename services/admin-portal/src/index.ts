import express, { Express, Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import bcryptjs from 'bcryptjs';
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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Admin Portal API', status: 'running', port: PORT });
});

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

// Initialize default admin user on startup
async function initializeAdminUser() {
  try {
    // Check if admin user already exists
    const result = await db.query(
      'SELECT id FROM admin_users WHERE email = $1',
      ['jaredshami@autodealercloud.com']
    );

    if (result.rows.length === 0) {
      // For now, store plain password (temporary)
      const password = 'Children$6';

      // Insert admin user
      await db.query(
        'INSERT INTO admin_users (email, password_hash, first_name, last_name, role, status) VALUES ($1, $2, $3, $4, $5, $6)',
        ['jaredshami@autodealercloud.com', password, 'Jared', 'Shami', 'super_admin', 'active']
      );

      console.log('✓ Default admin user created');
    }
  } catch (error) {
    console.error('Warning: Could not initialize admin user:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Admin Portal is running on port ${PORT}`);
  await initializeAdminUser();
});

