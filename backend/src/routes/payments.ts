import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/Payment';
import Order from '../models/Order';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

router.post('/mock/create-intent', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const { orderId, currency = 'USD', amount } = req.body as { orderId: string; currency?: string; amount?: number };
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });

    if (order.paymentStatus === 'completed') {
      return res.json({ paymentIntent: { orderId: order._id.toString(), status: 'completed' }, alreadyCompleted: true });
    }

    const existing = await Payment.findOne({ orderId: order._id.toString() });
    if (existing) {
      return res.json({ paymentIntent: existing, alreadyCreated: true });
    }

    const payment = await Payment.create({
      orderId: order._id.toString(),
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      amount: amount ?? order.totalAmount,
      currency,
      provider: 'mock',
      providerPaymentId: 'pay_' + uuidv4(),
      status: 'pending',
      metadata: {},
    });

    res.status(201).json({
      paymentIntent: payment,
      clientSecret: 'mock_client_secret_' + payment.providerPaymentId,
    });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to create intent' });
  }
});

router.post('/:paymentId/confirm', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const { paymentId } = req.params;
    const { status } = req.body as { status: 'success' | 'failed' };
    if (!status) return res.status(400).json({ error: 'status is required' });

    const payment = await Payment.findOne({ providerPaymentId: paymentId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });

    const nextStatus = status === 'success' ? 'completed' : 'failed';

    payment.status = nextStatus;
    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = nextStatus === 'completed' ? 'completed' : 'failed';
      await order.save();
    }

    res.json({ payment, orderPaymentStatus: order?.paymentStatus });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to confirm payment' });
  }
});

// Convenience endpoint for MVP UI.
router.post('/orders/:orderId/mark-paid', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });

    let payment = await Payment.findOne({ orderId });
    if (!payment) {
      payment = await Payment.create({
        orderId,
        buyerId: order.buyerId,
        farmerId: order.farmerId,
        amount: order.totalAmount,
        currency: 'USD',
        provider: 'mock',
        providerPaymentId: 'pay_' + uuidv4(),
        status: 'completed',
        metadata: { confirmedBy: decoded.userId },
      });
    } else {
      payment.status = 'completed';
      await payment.save();
    }

    order.paymentStatus = 'completed';
    await order.save();

    res.json({ payment, order });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to mark paid' });
  }
});

export default router;

