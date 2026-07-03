import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminAuth.js';
import { db } from '../db.js';
import { getDatabasePathLabel, isRedisConfigured } from '../storage.js';
import { isAdminEmail, maskSecret } from '../lib/admin.js';
import { isGeminiConfigured } from '../services/gemini.js';
import { isElevenLabsConfigured } from '../services/elevenlabs.js';
import { isGoogleAuthConfigured } from '../services/googleAuth.js';

const router = Router();
router.use(authMiddleware);

router.get('/whoami', (req, res) => {
  res.json({ isAdmin: isAdminEmail(req.user!.email), email: req.user!.email });
});

router.use(adminMiddleware);

router.get('/overview', (_req, res) => {
  res.json(db.getAdminOverview());
});

router.get('/integrations', (_req, res) => {
  res.json({
    gemini: { configured: isGeminiConfigured(), key: maskSecret(process.env.GEMINI_API_KEY) },
    elevenlabs: { configured: isElevenLabsConfigured(), key: maskSecret(process.env.ELEVENLABS_API_KEY) },
    google: { configured: isGoogleAuthConfigured(), clientId: maskSecret(process.env.GOOGLE_CLIENT_ID, 8) },
    stripe: {
      configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
      priceId: process.env.STRIPE_PRICE_ID || null
    },
    clientOrigin: process.env.CLIENT_ORIGIN || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null),
    databasePath: getDatabasePathLabel(),
    redisConfigured: isRedisConfigured(),
    jwtSecretSet: Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET !== 'mrx-dev-secret-change-in-production'),
    adminEmailsConfigured: Boolean(process.env.ADMIN_EMAILS)
  });
});

export default router;
