// api/index.js - Vercel Serverless Function Handler
import express from 'express';
import cors from 'cors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export para Vercel
export default app;