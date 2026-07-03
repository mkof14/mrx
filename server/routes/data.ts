import { Router } from 'express';
import { db } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { resolveProfile } from '../lib/profile.js';

const router = Router();
router.use(authMiddleware);

router.get('/bootstrap', (req, res) => {
  const userId = req.user!.userId;
  const storedProfile = db.getProfile(userId);

  res.json({
    profile: resolveProfile(userId, req.user!.email, storedProfile),
    medications: db.getMedications(userId),
    medicationEvents: db.getMedicationEvents(userId),
    checkins: db.getCheckins(userId),
    analysisResult: db.getLatestAnalysis(userId),
    chatMessages: db.getChatMessages(userId)
  });
});

router.put('/sync', async (req, res) => {
  const userId = req.user!.userId;
  const { profile, medications, medicationEvents, checkins } = req.body;

  await db.syncAll(userId, {
    profile: { ...profile, id: userId, email: req.user!.email },
    medications: medications || [],
    medicationEvents: medicationEvents || [],
    checkins: checkins || []
  });

  res.json({ ok: true });
});

router.put('/profile', async (req, res) => {
  const profile = { ...req.body, id: req.user!.userId, email: req.user!.email };
  await db.saveProfile(req.user!.userId, profile);
  res.json({ profile });
});

router.put('/medications', async (req, res) => {
  await db.saveMedications(req.user!.userId, req.body);
  res.json({ ok: true });
});

router.put('/medication-events', async (req, res) => {
  await db.saveMedicationEvents(req.user!.userId, req.body);
  res.json({ ok: true });
});

router.put('/checkins', async (req, res) => {
  await db.saveCheckins(req.user!.userId, req.body);
  res.json({ ok: true });
});

router.put('/chat-messages', async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : req.body;
  await db.saveChatMessages(req.user!.userId, messages || []);
  res.json({ ok: true });
});

router.put('/analysis', async (req, res) => {
  await db.saveAnalysis(req.user!.userId, req.body);
  res.json({ ok: true });
});

router.get('/export', (req, res) => {
  const userId = req.user!.userId;
  const storedProfile = db.getProfile(userId);

  res.json({
    exported_at: new Date().toISOString(),
    profile: resolveProfile(userId, req.user!.email, storedProfile),
    medications: db.getMedications(userId),
    medicationEvents: db.getMedicationEvents(userId),
    checkins: db.getCheckins(userId),
    analysisResult: db.getLatestAnalysis(userId),
    chatMessages: db.getChatMessages(userId)
  });
});

router.delete('/account', async (req, res) => {
  await db.deleteUser(req.user!.userId);
  res.json({ ok: true });
});

export default router;
