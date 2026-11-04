import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import caseRoutes from '../server/src/routes/caseRoutes.js';
import { connectDB } from '../server/src/config/db.js';
import { generateMysteryWithGemini } from '../server/src/services/geminiService.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Ensure MongoDB is connected before handling any request
let isConnecting = false;
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 && !isConnecting) {
      isConnecting = true;
      await connectDB();
      isConnecting = false;
    }
    next();
  } catch (err) {
    isConnecting = false;
    console.error('Database connection error in serverless function:', err);
    res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

// All case routes — Vercel strips /api prefix, so we mount at /cases
app.use('/api/cases', caseRoutes);
app.use('/cases', caseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'AI Mystery Room API (Vercel Serverless)' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'AI Mystery Room API (Vercel Serverless)' });
});

export default app;
