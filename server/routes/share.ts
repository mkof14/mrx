import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db, generateId } from '../db.js';

const router = Router();

const SHARE_DAYS = 7;

router.post('/report', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { reportData, patientName } = req.body;
    if (!reportData) return res.status(400).json({ error: 'Report data required' });

    const token = generateId() + generateId();
    const expiresAt = new Date(Date.now() + SHARE_DAYS * 86400000).toISOString();
    await db.createShareLink(token, {
      userId,
      patientName: patientName || 'Patient',
      reportData,
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    });

    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    res.json({
      token,
      url: `${origin}/share/${token}`,
      expires_at: expiresAt,
      expires_days: SHARE_DAYS
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create share link' });
  }
});

router.get('/report/:token', async (req, res) => {
  const link = db.getShareLink(req.params.token);
  if (!link) return res.status(404).json({ error: 'Link not found or expired' });
  if (new Date(link.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Link expired' });
  }
  res.json({
    patientName: link.patientName,
    reportData: link.reportData,
    expires_at: link.expires_at
  });
});

router.post('/caregiver', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const label = String(req.body?.label || 'Family').slice(0, 40);
    const token = generateId() + generateId();
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();

    const profile = db.getProfile(userId);
    const meds = db.getMedications(userId);
    const checkins = db.getCheckins(userId);
    const analysis = db.getLatestAnalysis(userId);

    await db.createCaregiverInvite(token, {
      userId,
      label,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      snapshot: {
        patientName: profile?.name || 'Patient',
        medCount: meds.length,
        lastCheckin: checkins[0]?.log_iso || null,
        wellness: analysis?.executive_summary?.wellness_score ?? null,
        warningCount: analysis?.safety_flags?.length ?? 0
      }
    });

    const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    res.json({
      token,
      url: `${origin}/caregiver/${token}`,
      expires_at: expiresAt,
      label
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create invite' });
  }
});

router.get('/caregiver/:token', async (req, res) => {
  const invite = db.getCaregiverInvite(req.params.token);
  if (!invite) return res.status(404).json({ error: 'Invite not found or expired' });
  if (new Date(invite.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Invite expired' });
  }

  const meds = db.getMedications(invite.userId).filter((m: { status: string }) => m.status === 'ACTIVE');
  const analysis = db.getLatestAnalysis(invite.userId);

  res.json({
    label: invite.label,
    expires_at: invite.expires_at,
    patientName: invite.snapshot?.patientName,
    medications: meds.map((m: { display_name: string; current_dose: unknown }) => ({
      name: m.display_name,
      dose: m.current_dose
    })),
    lastCheckin: invite.snapshot?.lastCheckin,
    wellness: invite.snapshot?.wellness,
    warnings: (analysis?.safety_flags || []).slice(0, 5),
    disclaimer: 'Read-only view for caregivers. Not medical advice.'
  });
});

export default router;
