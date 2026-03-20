import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import SampleRequest from '../models/SampleRequest';
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

// Get requests for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    let query: any = {};
    if (decoded.role === 'buyer') query.buyerId = decoded.userId;
    else if (decoded.role === 'farmer') query.farmerId = decoded.userId;
    
    const requests = await SampleRequest.find(query).sort({ createdAt: -1 });
    res.json(requests);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// Create request (Buyer)
router.post('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Only buyers can request samples' });
    
    const { farmerId, productId, productName, quantity, notes, deliveryAddress } = req.body;
    const request = new SampleRequest({
      buyerId: decoded.userId,
      farmerId,
      productId,
      productName,
      quantity,
      notes,
      deliveryAddress,
    });
    await request.save();
    
    await notify(farmerId, 'sample_request', 'New Sample Request', `A buyer requested a sample of ${productName}.`);
    
    res.status(201).json(request);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Update status (Farmer)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'farmer') return res.status(403).json({ error: 'Only farmers can update sample status' });
    
    const { status } = req.body;
    const request = await SampleRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (request.farmerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
    
    request.status = status;
    await request.save();
    
    await notify(request.buyerId, 'sample_update', 'Sample Request Updated', `Your sample request for ${request.productName} is now ${status}.`);
    
    res.json(request);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
