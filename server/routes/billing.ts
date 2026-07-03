import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null
  });
});

router.post('/checkout', authMiddleware, async (req, res) => {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const origin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

  if (!secret || !priceId) {
    return res.json({
      mock: true,
      message: 'Stripe not configured — use trial mode'
    });
  }

  try {
    const params = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${origin}?billing=success`,
      cancel_url: `${origin}?billing=cancel`,
      client_reference_id: req.user!.userId,
      customer_email: req.user!.email
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const data = (await stripeRes.json()) as { url?: string; error?: { message: string } };
    if (!stripeRes.ok) {
      return res.status(502).json({ error: data.error?.message || 'Stripe error' });
    }
    res.json({ url: data.url, mock: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

router.post('/confirm-mock', authMiddleware, async (req, res) => {
  const profile = db.getProfile(req.user!.userId) || {};
  const updated = {
    ...profile,
    is_subscribed: true,
    subscription_end_date: new Date(Date.now() + 7 * 86400000).toISOString()
  };
  await db.saveProfile(req.user!.userId, updated);
  res.json({ ok: true, profile: updated });
});

export default router;
