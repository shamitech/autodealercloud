import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './database/connection';
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';

dotenv.config();

const app = express();
const PORT = process.env.ADMIN_API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-api' });
});

async function start(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Admin API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Admin API:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

start();
