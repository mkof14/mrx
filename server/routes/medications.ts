import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { resolveMedication, resolveBarcode, extractRxcuis } from '../services/rxnorm.js';
import { fetchVerifiedInteractions } from '../services/drugInteractions.js';

const router = Router();

router.post('/resolve', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Medication name required' });
    }
    const resolved = await resolveMedication(name);
    res.json(resolved);
  } catch (err) {
    console.error('Resolve error:', err);
    res.status(500).json({ error: 'Failed to resolve medication' });
  }
});

router.post('/resolve-barcode', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Barcode required' });
    }
    const resolved = await resolveBarcode(code);
    res.json(resolved);
  } catch (err) {
    console.error('Barcode resolve error:', err);
    res.status(500).json({ error: 'Failed to resolve barcode' });
  }
});

router.post('/interactions', authMiddleware, async (req, res) => {
  try {
    const { medications } = req.body;
    const rxcuis = extractRxcuis(medications || []);
    const interactions = await fetchVerifiedInteractions(rxcuis);
    res.json({ interactions, rxcui_count: rxcuis.length });
  } catch (err) {
    console.error('Interactions error:', err);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

export default router;
