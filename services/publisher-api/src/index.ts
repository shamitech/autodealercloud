import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'publisher-api' });
});

// Published pages routes (placeholder)
app.get('/api/pages/:slug', (req, res) => {
  res.json({ message: 'Get published page by slug' });
});

app.listen(PORT, () => {
  console.log(`Publisher API listening on port ${PORT}`);
});
