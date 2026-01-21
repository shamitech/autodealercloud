import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Database } from './database/db';
import { AuthRoutes } from './routes/auth-routes';
import { CompanyRoutes } from './routes/company-routes';
import { DomainRoutes } from './routes/domain-routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3002;

// Database initialization
const db = new Database(
  process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5433/autodealercloud_account'
);

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Account Portal API', status: 'running', port: PORT });
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Account Portal is running' });
});

// Auth routes
const authRoutes = new AuthRoutes(db);
app.use('/auth', authRoutes.getRouter());

// Company routes
const companyRoutes = new CompanyRoutes(db);
app.use('/api/companies', companyRoutes.getRouter());

// Domain routes
const domainRoutes = new DomainRoutes(db);
app.use('/api/domains', domainRoutes.getRouter());

app.listen(PORT, () => {
  console.log(`Account Portal is running on port ${PORT}`);
});

