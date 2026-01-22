import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './database/connection';
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenants';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-api' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeDatabase();
  process.exit(0);
});

// Start server
async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Admin API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start Admin API:', err);
    process.exit(1);
  }
}

start();
