import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from './database/connection';
import pageRoutes from './routes/pages';

dotenv.config();

const app = express();
const PORT = process.env.PUBLISHER_API_PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/pages', pageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'publisher-api' });
});

async function start(): Promise<void> {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Publisher API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Publisher API:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});

start();
