import express from 'express';
import { notFound } from './middleware/notFound';

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFound);
