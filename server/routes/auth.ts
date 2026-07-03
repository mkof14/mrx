import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db, generateId } from '../db.js';
import { authMiddleware, signToken } from '../middleware/auth.js';
import { defaultProfile, resolveProfile, isValidProfile } from '../lib/profile.js';

import { isGoogleAuthConfigured, verifyGoogleCredential } from '../services/googleAuth.js';

const router = Router();

router.get('/google/status', (_req, res) => {
  res.json({ configured: isGoogleAuthConfigured() });
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const googleUser = await verifyGoogleCredential(String(credential));
    let user = db.findUserByGoogleId(googleUser.sub) || db.findUserByEmail(googleUser.email);

    if (!user) {
      const userId = generateId();
      const passwordHash = await bcrypt.hash(generateId() + generateId(), 12);
      const profile = defaultProfile(userId, googleUser.email, googleUser.name?.split(' ')[0]);
      await db.createUser(userId, googleUser.email, passwordHash, googleUser.sub);
      await db.saveProfile(userId, profile);
      user = db.findUserByEmail(googleUser.email)!;
    } else if (!user.google_id) {
      await db.linkGoogleAccount(user.id, googleUser.sub);
      user = db.findUserByGoogleId(googleUser.sub) || user;
    }

    const storedProfile = db.getProfile(user.id);
    const profile = resolveProfile(user.id, user.email, storedProfile);
    if (!isValidProfile(storedProfile)) {
      await db.saveProfile(user.id, profile);
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email }, profile });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: err instanceof Error ? err.message : 'Google sign-in failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (db.findUserByEmail(normalizedEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const userId = generateId();
    const passwordHash = await bcrypt.hash(password, 12);
    const profile = defaultProfile(userId, normalizedEmail, name);

    await db.createUser(userId, normalizedEmail, passwordHash);
    await db.saveProfile(userId, profile);

    const token = signToken({ userId, email: normalizedEmail });
    res.status(201).json({ token, user: { id: userId, email: normalizedEmail }, profile });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const storedProfile = db.getProfile(user.id);
    const profile = resolveProfile(user.id, user.email, storedProfile);
    if (!isValidProfile(storedProfile)) {
      await db.saveProfile(user.id, profile);
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email },
      profile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const storedProfile = db.getProfile(req.user!.userId);
  const profile = resolveProfile(req.user!.userId, req.user!.email, storedProfile);

  res.json({
    user: { id: req.user!.userId, email: req.user!.email },
    profile
  });
});

export default router;
