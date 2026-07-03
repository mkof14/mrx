import type { Request, Response, NextFunction } from 'express';
import { isAdminEmail } from '../lib/admin.js';

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.email || !isAdminEmail(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}
