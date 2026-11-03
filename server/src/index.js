import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import caseRoutes from './routes/caseRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server folder and root directory for maximum reliability
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware — flexible CORS that works on localhost AND across LAN / deployed environments
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Allow the explicitly configured CLIENT_URL (e.g. deployed Vercel/Netlify URL)
    if (CLIENT_URL && origin === CLIENT_URL) return callback(null, true);

    // Always allow localhost and 127.0.0.1 on any port (local dev)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow any LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x) — fixes "other device" issue
    if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('CORS: Origin not allowed: ' + origin));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/cases', caseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Mystery Room Backend API'
  });
});

// Serve frontend static build if present (e.g., in production or unified build)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root friendly welcome if frontend is running separately
  app.get('/', (req, res) => {
    res.send('🕵️ AI Mystery Room API is running. Point your client to /api/cases.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Initialize Database & Start Server
async function startServer() {
  try {
    await connectDB();
    // Listen on 0.0.0.0 so the server is reachable from other devices on the same network
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🕵️ AI Mystery Room Server running on http://0.0.0.0:${PORT}`);
      console.log(`   -> Local:   http://localhost:${PORT}`);
      console.log(`   -> Network: accessible on all interfaces (LAN + deployed)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
