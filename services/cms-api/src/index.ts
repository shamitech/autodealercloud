import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cms-api' });
});

// Components routes (placeholder)
app.get('/api/components', (req, res) => {
  res.json({ message: 'Get all components' });
});

app.post('/api/components', (req, res) => {
  res.json({ message: 'Create component' });
});

// Pages routes (placeholder)
app.get('/api/pages', (req, res) => {
  res.json({ message: 'Get all pages' });
});

app.listen(PORT, () => {
  console.log(`CMS API listening on port ${PORT}`);
});
