import './env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import aiRoutes from './routes/ai.js';
import medicationsRoutes from './routes/medications.js';
import shareRoutes from './routes/share.js';
import billingRoutes from './routes/billing.js';
import adminRoutes from './routes/admin.js';
import { attachDatabase, initDatabase } from './db.js';
import { ensureStorageReady, getStorageMode } from './storage.js';
import { isGeminiConfigured } from './services/gemini.js';
import { isElevenLabsConfigured } from './services/elevenlabs.js';
import { isGoogleAuthConfigured } from './services/googleAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbReady = false;

function resolveClientOrigin(): string {
  if (process.env.CLIENT_ORIGIN) return process.env.CLIENT_ORIGIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function createApp() {
  const CLIENT_ORIGIN = resolveClientOrigin();
  const app = express();

  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    const jwtOk = Boolean(
      process.env.JWT_SECRET && process.env.JWT_SECRET !== 'mrx-dev-secret-change-in-production'
    );
    res.json({
      status: 'ok',
      service: 'mrx-api',
      version: '1.2.0',
      storage: getStorageMode(),
      clientOrigin: CLIENT_ORIGIN,
      ready: {
        gemini: isGeminiConfigured(),
        elevenlabs: isElevenLabsConfigured(),
        googleAuth: isGoogleAuthConfigured(),
        jwt: jwtOk,
        persistentDb: getStorageMode() === 'redis'
      },
      warnings: [
        !isGeminiConfigured() ? 'Set GEMINI_API_KEY for AI chat, analysis, and label scan' : null,
        !jwtOk ? 'Set JWT_SECRET to a long random string in production' : null,
        !isGoogleAuthConfigured() ? 'Set GOOGLE_CLIENT_ID for Google Sign-In' : null,
        process.env.VERCEL && getStorageMode() !== 'redis'
          ? 'Connect Upstash Redis on Vercel — file storage is wiped on redeploy'
          : null
      ].filter(Boolean)
    });
  });

  app.get('/api/auth/google/status', (_req, res) => {
    res.json({
      configured: isGoogleAuthConfigured(),
      clientId: process.env.GOOGLE_CLIENT_ID || null
    });
  });

  app.use('/api', async (_req, _res, next) => {
    try {
      if (!dbReady) {
        ensureStorageReady();
        await initDatabase();
        dbReady = true;
      } else {
        await attachDatabase();
      }
      next();
    } catch (err) {
      console.error('Database load failed:', err);
      next(err);
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/medications', medicationsRoutes);
  app.use('/api/share', shareRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/admin', adminRoutes);

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
