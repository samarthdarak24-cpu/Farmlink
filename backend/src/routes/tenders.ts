import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Tender from '../models/Tender';
import Notification from '../models/Notification';
import { getSocketServer } from '../realtime/socket';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

const notify = async (userId: string, type: string, title: string, body?: string, data?: Record<string, unknown>) => {
  await Notification.create({ userId, type: type as any, title, body, data });
  getSocketServer()?.to(`user:${userId}`).emit('notification', { type, title, body, data });
};

    // Get all open tenders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status = 'open' } = req.query;
    let query: any = { status };
    if (category) query.category = category;
    
    const tenders = await Tender.find(query).sort({ deadline: 1 });
    res.json(tenders);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Get my tenders (Buyer) or tenders I bid on (Farmer)
router.get('/my', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    let query: any = {};
    if (decoded.role === 'buyer') query.buyerId = decoded.userId;
    else if (decoded.role === 'farmer') query['bids.farmerId'] = decoded.userId;
    
    const tenders = await Tender.find(query).sort({ createdAt: -1 });
    res.json(tenders);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// Create Tender (Buyer)
router.post('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Only buyers can create tenders' });
    
    const { title, description, category, quantity, unit, budget, deadline, buyerName } = req.body;
    const tender = new Tender({
      buyerId: decoded.userId,
      buyerName: buyerName || 'Buyer',
      title,
      description,
      category,
      quantity,
      unit,
      budget,
      deadline,
    });
    await tender.save();
    res.status(201).json(tender);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Submit Bid (Farmer)
router.post('/:id/bid', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'farmer') return res.status(403).json({ error: 'Only farmers can bid' });
    
    const { bidAmount, deliveryTimeline, notes, farmerName } = req.body;
    const tender = await Tender.findById(req.params.id);
    if (!tender) return res.status(404).json({ error: 'Tender not found' });
    if (tender.status !== 'open') return res.status(400).json({ error: 'Tender closed' });
    
    // Remove existing bid from same farmer if any
    tender.bids = tender.bids.filter((b: any) => b.farmerId.toString() !== decoded.userId);
    
    tender.bids.push({
      farmerId: decoded.userId,
      farmerName: farmerName || 'Farmer',
      bidAmount,
      deliveryTimeline,
      notes,
      createdAt: new Date()
    } as any);
    
    await tender.save();
    await notify(tender.buyerId, 'tender_bid', 'New Tender Bid', `A farmer bid on your tender: ${tender.title}`);
    
    res.json(tender);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Award Tender (Buyer)
router.post('/:id/award/:bidId', async (req: Request, res: Response) => {
    try {
      const decoded = verifyToken(req.headers.authorization);
      const tender = await Tender.findById(req.params.id);
      if (!tender) return res.status(404).json({ error: 'Tender not found' });
      if (tender.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
      
      const bid = tender.bids.find((b: any) => b._id?.toString() === req.params.bidId);
      if (!bid) return res.status(404).json({ error: 'Bid not found' });
      
      tender.status = 'awarded';
      tender.selectedBidId = req.params.bidId;
      await tender.save();
      
      await notify(bid.farmerId, 'tender_awarded', 'Tender Awarded!', `Congratulations! You won the tender: ${tender.title}`);
      
      res.json(tender);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
});

export default router;
