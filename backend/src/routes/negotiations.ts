import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Negotiation from '../models/Negotiation';
import { getSocketServer } from '../realtime/socket';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string; role: string };
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const query: any = decoded.role === 'buyer' ? { buyerId: decoded.userId } : { farmerId: decoded.userId };
    const negs = await Negotiation.find(query).sort({ updatedAt: -1 });
    res.json(negs);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const n = await Negotiation.findById(req.params.id);
    if (!n) return res.status(404).json({ error: 'Not found' });
    if (n.buyerId.toString() !== decoded.userId && n.farmerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
    res.json(n);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { buyerId, farmerId, orderId, rfqId, productId, initialPrice, quantity } = req.body;
    if (!buyerId || !farmerId || !initialPrice || !quantity) return res.status(400).json({ error: 'Missing fields' });
    if (decoded.role !== 'buyer' && decoded.userId !== buyerId) return res.status(403).json({ error: 'Not authorized' });

    const n = new Negotiation({
      buyerId,
      farmerId,
      orderId,
      rfqId,
      productId,
      initialPrice: Number(initialPrice),
      quantity: Number(quantity),
      status: 'active',
      offers: [{ type: 'offer', price: Number(initialPrice), quantity: Number(quantity), fromUserId: buyerId, toUserId: farmerId }],
    });
    await n.save();
    getSocketServer()?.to(`user:${farmerId}`).emit('negotiation_update', { negotiation: n });
    res.status(201).json(n);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

router.post('/:id/offer', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const n = await Negotiation.findById(req.params.id);
    if (!n) return res.status(404).json({ error: 'Not found' });
    if (n.status !== 'active') return res.status(400).json({ error: 'Negotiation closed' });

    const { type, price, quantity, notes } = req.body;
    const isBuyer = n.buyerId.toString() === decoded.userId;
    const otherId = isBuyer ? n.farmerId : n.buyerId;

    if (type === 'accept') {
      n.status = 'accepted';
      n.finalPrice = price ?? n.offers[n.offers.length - 1]?.price ?? n.initialPrice;
      n.offers.push({ type: 'accept', price: n.finalPrice, fromUserId: decoded.userId, toUserId: otherId, notes } as any);
    } else if (type === 'reject') {
      n.status = 'rejected';
      n.offers.push({ type: 'reject', fromUserId: decoded.userId, toUserId: otherId, notes } as any);
    } else {
      const offerType = n.offers.length === 1 ? 'counter' : 'counter';
      n.offers.push({ type: offerType, price: Number(price), quantity: quantity ? Number(quantity) : n.quantity, fromUserId: decoded.userId, toUserId: otherId, notes } as any);
    }

    await n.save();
    getSocketServer()?.to(`user:${otherId}`).emit('negotiation_update', { negotiation: n });
    res.json(n);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

router.get('/ai/suggest-price/:category', async (req: Request, res: Response) => {
  const bases: Record<string, number> = { Vegetables: 5, Fruits: 10, Grains: 4, Spices: 15 };
  const base = bases[req.params.category] ?? 5;
  const suggested = base * (0.9 + Math.random() * 0.2);
  res.json({ suggestedPrice: Math.round(suggested * 100) / 100, confidence: 0.85 });
});

export default router;
