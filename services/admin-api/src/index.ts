import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-api' });
});

// Tenants routes (placeholder)
app.get('/api/tenants', (req, res) => {
  res.json({ message: 'Get all tenants' });
});

app.post('/api/tenants', (req, res) => {
  res.json({ message: 'Create tenant' });
});

app.listen(PORT, () => {
  console.log(`Admin API listening on port ${PORT}`);
});
