import './env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import aiRoutes from './routes/ai.js';
import medicationsRoutes from './routes/medications.js';
import shareRoutes from './routes/share.js';
import billingRoutes from './routes/billing.js';
import { initDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbReady = false;

function ensureDataDir() {
  const dataDir = process.env.DATABASE_PATH
    ? path.dirname(process.env.DATABASE_PATH)
    : path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function createApp() {
  if (!dbReady) {
    ensureDataDir();
    initDatabase();
    dbReady = true;
  }

  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
  const app = express();

  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mrx-api', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/medications', medicationsRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/billing', billingRoutes);

  // Self-hosted production only — Vercel serves `dist/` separately
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
