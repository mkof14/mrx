import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  analyzeMedicationData,
  getAssistantResponseStream,
  isGeminiConfigured,
  runDiagnosticPing,
  scanMedicationImage,
  parseMedicationText
} from '../services/gemini.js';
import {
  generateSpeech,
  getAvailableVoices,
  getTtsProvider,
  isTtsConfigured
} from '../services/tts.js';
import { isElevenLabsConfigured } from '../services/elevenlabs.js';
import { db } from '../db.js';
import { normalizeAiError } from '../lib/aiErrors.js';
import { normalizeChatHistory } from '../lib/chatHistory.js';
import { resolveProfile } from '../lib/profile.js';
import { appendAiAudit } from '../lib/aiAudit.js';

function maybeAudit(
  userId: string,
  profile: unknown,
  kind: 'assistant' | 'analyze' | 'scan' | 'tts',
  prompt: string,
  response: string
) {
  const consent = (profile as { ai_audit_consent?: boolean })?.ai_audit_consent;
  if (!consent) return;
  appendAiAudit(userId, {
    ts: new Date().toISOString(),
    kind,
    promptPreview: prompt.slice(0, 240),
    responsePreview: response.slice(0, 240)
  });
}

const router = Router();

router.get('/status', (_req, res) => {
  const ttsProvider = getTtsProvider();
  res.json({
    configured: isGeminiConfigured(),
    gemini: {
      configured: isGeminiConfigured(),
      message: isGeminiConfigured()
        ? 'Gemini AI available'
        : 'GEMINI_API_KEY not configured on server'
    },
    tts: {
      configured: isTtsConfigured(),
      provider: ttsProvider,
      elevenlabs: isElevenLabsConfigured(),
      message: isTtsConfigured()
        ? `TTS via ${ttsProvider}`
        : 'Set ELEVENLABS_API_KEY (recommended) or GEMINI_API_KEY for speech'
    }
  });
});

router.get('/voices', authMiddleware, (_req, res) => {
  res.json({ provider: getTtsProvider(), voices: getAvailableVoices() });
});

router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const profile = db.getProfile(req.user!.userId) || {};
    if (!profile.is_subscribed) {
      return res.status(403).json({ error: 'Active subscription required for AI analysis' });
    }

    const { medications, medicationEvents, checkins, viewpoint } = req.body;
    const result = await analyzeMedicationData(
      medications || [],
      medicationEvents || [],
      checkins || [],
      profile,
      viewpoint || 'BALANCED'
    );

    maybeAudit(
      req.user!.userId,
      profile,
      'analyze',
      JSON.stringify({ medCount: (medications || []).length, checkinCount: (checkins || []).length }),
      JSON.stringify(result?.executive_summary || {})
    );

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.post('/scan', authMiddleware, async (req, res) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }
    const { base64, mimeType } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'Image data required' });
    }
    const result = await scanMedicationImage(base64, mimeType || 'image/jpeg');
    const profile = db.getProfile(req.user!.userId) || {};
    maybeAudit(req.user!.userId, profile, 'scan', 'image scan', JSON.stringify(result || {}));
    res.json(result);
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.post('/parse-medication', authMiddleware, async (req, res) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }
    const { text, locale } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Text required' });
    }
    const result = await parseMedicationText(String(text), locale || 'en');
    res.json(result);
  } catch (err) {
    console.error('Parse medication error:', err);
    res.status(500).json({ error: 'Parse failed' });
  }
});

router.post('/assistant/stream', authMiddleware, async (req, res) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const { query, context, history } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    const userId = req.user!.userId;
    const storedProfile = db.getProfile(userId);
    const profile = resolveProfile(userId, req.user!.email, storedProfile);
    const dbHistory = db.getChatMessages(userId);
    const chatHistory = normalizeChatHistory(
      Array.isArray(history) && history.length > 0 ? history : dbHistory
    );
    const serverContext = {
      locale: context?.locale,
      capabilities: context?.capabilities ?? true,
      profile,
      medications: db.getMedications(userId),
      logs: db.getCheckins(userId).slice(0, 10),
      analysisResult: db.getLatestAnalysis(userId),
      history: chatHistory
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await getAssistantResponseStream(String(query), serverContext);

    let fullResponse = '';
    for await (const chunk of stream) {
      const text = chunk.text || '';
      fullResponse += text;
      const payload = {
        text,
        groundingMetadata: chunk.candidates?.[0]?.groundingMetadata || null
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }

    maybeAudit(userId, profile, 'assistant', String(query), fullResponse);

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Assistant stream error:', err);
    const { status, message, code } = normalizeAiError(err);
    if (!res.headersSent) {
      res.status(status).json({ error: message, code });
    } else {
      res.end();
    }
  }
});

router.post('/tts', authMiddleware, async (req, res) => {
  try {
    if (!isTtsConfigured()) {
      return res.status(503).json({ error: 'TTS not configured. Set ELEVENLABS_API_KEY or GEMINI_API_KEY.' });
    }
    const { text, voice } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }
    const result = await generateSpeech(String(text), voice);
    const profile = db.getProfile(req.user!.userId) || {};
    maybeAudit(req.user!.userId, profile, 'tts', String(text).slice(0, 120), result.provider);
    res.json(result);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'TTS failed' });
  }
});

router.post('/diagnostic', authMiddleware, async (_req, res) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ configured: false, error: 'AI service not configured' });
    }
    const latency = await runDiagnosticPing();
    res.json({ configured: true, status: 'STABLE', latency });
  } catch (err) {
    console.error('Diagnostic error:', err);
    res.status(500).json({ configured: true, status: 'FAILED', error: 'Diagnostic failed' });
  }
});

export default router;
