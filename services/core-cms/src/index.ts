import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Database } from './database/db';
import { PageRoutes } from './routes/page-routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Database initialization
const db = new Database(
  process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/autodealercloud'
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Core CMS is running' });
});

// Page routes
const pageRoutes = new PageRoutes(db);
app.use('/api/pages', pageRoutes.getRouter());

app.listen(PORT, () => {
  console.log(`Core CMS is running on port ${PORT}`);
});

