import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string };
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { unreadOnly, limit = 50 } = req.query;
    const query: any = { userId: decoded.userId };
    if (unreadOnly === 'true') query.isRead = false;
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(notifications);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: decoded.userId }, { isRead: true, readAt: new Date() }, { new: true });
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json(n);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    await Notification.updateMany({ userId: decoded.userId, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true });
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

export default router;
