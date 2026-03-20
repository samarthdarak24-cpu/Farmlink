import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Logistics from '../models/Logistics';
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

// Get logistics for user
router.get('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    let query: any = {};
    if (decoded.role === 'buyer') query.buyerId = decoded.userId;
    else if (decoded.role === 'farmer') query.farmerId = decoded.userId;
    
    const logs = await Logistics.find(query).sort({ updatedAt: -1 });
    res.json(logs);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

// Update logistics status (Farmer or Carrier/Admin)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { status, lastLocation, notes, trackingNumber, carrier } = req.body;
    
    const log = await Logistics.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Logistics record not found' });
    
    if (decoded.role === 'farmer' && log.farmerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (status) log.status = status;
    if (lastLocation) {
        log.lastLocation = lastLocation;
        log.route.push(lastLocation);
    }
    if (notes) log.notes = notes;
    if (trackingNumber) log.trackingNumber = trackingNumber;
    if (carrier) log.carrier = carrier;

    await log.save();
    
    await notify(log.buyerId, 'logistics_update', 'Logistics Update', `Order ${log.orderId} is now ${log.status}. Current location: ${log.lastLocation || 'N/A'}`);
    
    res.json(log);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
