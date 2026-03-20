import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import RFQ from '../models/RFQ';
import Product from '../models/Product';
import Notification from '../models/Notification';
import Order from '../models/Order';
import InventoryLog from '../models/InventoryLog';
import StockAlert from '../models/StockAlert';
import { cacheClient, isRedisReady } from '../config/redis';
import { getSocketServer } from '../realtime/socket';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

const notify = async (userId: string, type: string, title: string, body?: string, data?: Record<string, unknown>) => {
  await Notification.create({ userId, type, title, body, data });
  getSocketServer()?.to(`user:${userId}`).emit('notification', { type, title, body, data });
};

// Match farmers to RFQ (by category, location)
router.get('/match-farmers/:rfqId', async (req: Request, res: Response) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    const products = await Product.find({
      category: rfq.productCategory,
      isActive: true,
      quantity: { $gte: rfq.quantity },
      farmerId: { $nin: (rfq.responses || []).map((r: any) => r.farmerId) },
    })
      .select('farmerId farmerName name location price quantity')
      .limit(20)
      .lean();

    const farmers = [...new Map(products.map((p: any) => [p.farmerId, { farmerId: p.farmerId, farmerName: p.farmerName, location: p.location, products: [] }])).values()];
    for (const p of products) {
      const f = farmers.find((x: any) => x.farmerId === (p as any).farmerId);
      if (f) (f as any).products.push(p);
    }

    res.json({ farmers });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed' });
  }
});

// Get all RFQs (with filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (category) query.productCategory = category;
    const skip = (Number(page) - 1) * Number(limit);
    const [rfqs, total] = await Promise.all([
      RFQ.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      RFQ.countDocuments(query),
    ]);
    res.json({ rfqs, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (e: any) {
    res.status(400).json({ error: 'Failed to fetch RFQs' });
  }
});

// Get RFQs for authenticated buyer (must be before /:id)
router.get('/buyer/my-rfqs', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });
    const rfqs = await RFQ.find({ buyerId: decoded.userId }).sort({ createdAt: -1 });
    res.json(rfqs);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

// Get RFQs where farmer has responded (must be before /:id)
router.get('/farmer/my-responses', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });
    const rfqs = await RFQ.find({ 'responses.farmerId': decoded.userId }).sort({ createdAt: -1 });
    res.json(rfqs);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

// Filter and rank responses for an RFQ
router.get('/:id/responses/ranked', async (req: Request, res: Response) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    const responses = (rfq.responses || []).map((r: any) => {
      let score = 50;
      if (rfq.targetPrice && r.pricePerUnit <= rfq.targetPrice) score += 20;
      if (r.deliveryDays <= 3) score += 15;
      if (r.deliveryDays <= 7) score += 5;
      if (rfq.deliveryLocation && r.farmerLocation && String(r.farmerLocation).toLowerCase().includes(String(rfq.deliveryLocation).toLowerCase())) score += 10;
      return { ...r.toObject?.() || r, rankScore: score };
    });

    responses.sort((a: any, b: any) => (b.rankScore || 0) - (a.rankScore || 0));
    res.json({ responses });
  } catch (e: any) {
    res.status(400).json({ error: 'Failed' });
  }
});

// Get RFQ by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(rfq);
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid RFQ ID' });
  }
});

// Create RFQ (buyer only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const {
      productCategory,
      productName,
      quantity,
      unit,
      targetPrice,
      deliveryLocation,
      notes,
      buyerName,
      expiresAt,
      deadline,
    } = req.body;
    if (!productCategory || !productName || !quantity || !unit) return res.status(400).json({ error: 'Missing required fields' });

    const expires = expiresAt ? new Date(expiresAt) : deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(expires.getTime())) return res.status(400).json({ error: 'Invalid expiresAt/deadline' });

    const rfq = new RFQ({
      buyerId: decoded.userId,
      buyerName,
      productCategory,
      productName,
      quantity,
      unit,
      targetPrice,
      deliveryLocation,
      notes,
      expiresAt: expires,
      status: 'open',
      responses: [],
    });
    const saved = await rfq.save();

    // Notify matching farmers (in production: query farmers by category/location)
    await notify(decoded.userId, 'rfq_created', 'RFQ created', `Your RFQ for ${productName} has been created.`, { rfqId: saved._id });
    res.status(201).json(saved);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

// Respond to RFQ (farmer only)
router.post('/:id/respond', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'farmer') return res.status(403).json({ error: 'Farmers only' });

    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status !== 'open') return res.status(400).json({ error: 'RFQ closed for responses' });

    const { quantity, pricePerUnit, deliveryDays, notes, farmerName, productId, farmerLocation } = req.body;
    if (!quantity || !pricePerUnit || !deliveryDays) return res.status(400).json({ error: 'Missing required fields' });

    const response: any = {
      farmerId: decoded.userId,
      farmerName: farmerName || 'Farmer',
      productId,
      farmerLocation,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      totalPrice: Number(quantity) * Number(pricePerUnit),
      deliveryDays: Number(deliveryDays),
      notes,
    };

    rfq.responses.push(response);
    await rfq.save();

    await notify(rfq.buyerId, 'rfq_response', 'New RFQ response', `${response.farmerName} responded to your RFQ for ${rfq.productName}.`, { rfqId: rfq._id, responseId: response._id });
    getSocketServer()?.to(`user:${rfq.buyerId}`).emit('proposal_update', { rfqId: rfq._id, proposal: response });
    res.json(rfq);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

// Close RFQ
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
    rfq.status = 'closed';
    await rfq.save();
    res.json(rfq);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

// Award RFQ
router.put('/:id/award/:responseId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.buyerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
    if (rfq.status !== 'open') return res.status(400).json({ error: 'RFQ not open' });

    const response = rfq.responses.find((r: any) => r._id?.toString() === req.params.responseId);
    if (!response) return res.status(404).json({ error: 'Response not found' });

    const productId: string | undefined = response.productId;
    const qty = Number(response.quantity);
    const unitPrice = Number(response.pricePerUnit);
    if (!productId) return res.status(400).json({ error: 'Missing response.productId' });
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Invalid response quantity/price' });
    }

    // Atomic inventory reservation to avoid overselling.
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: qty }, isActive: true },
      { $inc: { quantity: -qty, reservedQuantity: qty, inventoryVersion: 1 } },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(400).json({ error: 'Insufficient stock for selected proposal' });
    }

    const order = new Order({
      buyerId: rfq.buyerId,
      farmerId: response.farmerId,
      productId,
      quantity: qty,
      price: unitPrice,
      totalAmount: qty * unitPrice,
      status: 'pending',
      paymentStatus: 'pending',
      timeline: [
        {
          status: 'pending',
          timestamp: new Date(),
          updatedBy: decoded.userId,
          notes: 'Order created from awarded RFQ',
        },
      ],
    });
    const savedOrder = await order.save();

    const previousQuantity = updatedProduct.quantity + qty;
    await InventoryLog.create({
      productId,
      farmerId: response.farmerId,
      transactionType: 'order',
      quantityChange: -qty,
      previousQuantity,
      currentQuantity: updatedProduct.quantity,
      relatedOrderId: savedOrder._id.toString(),
      notes: `Reserved stock for pending order ${savedOrder._id}`,
    });

    const LOW_STOCK_THRESHOLD = 10;
    if (updatedProduct.quantity <= LOW_STOCK_THRESHOLD && updatedProduct.quantity > 0) {
      const existingAlert = await StockAlert.findOne({
        productId,
        farmerId: response.farmerId,
        status: 'active',
        alertType: 'low-stock',
      });
      if (!existingAlert) {
        await StockAlert.create({
          productId,
          farmerId: response.farmerId,
          productName: updatedProduct.name,
          currentStock: updatedProduct.quantity,
          thresholdLevel: LOW_STOCK_THRESHOLD,
          alertType: 'low-stock',
          status: 'active',
        });
      }
    }

    if (updatedProduct.quantity === 0) {
      await StockAlert.create({
        productId,
        farmerId: response.farmerId,
        productName: updatedProduct.name,
        currentStock: 0,
        thresholdLevel: 0,
        alertType: 'out-of-stock',
        status: 'active',
      });
    }

    if (isRedisReady()) {
      await cacheClient.hSet(`inventory:${productId}`, {
        quantity: String(updatedProduct.quantity),
        reservedQuantity: String(updatedProduct.reservedQuantity),
        version: String(updatedProduct.inventoryVersion),
      });
    }

    getSocketServer()?.to(`user:${response.farmerId}`).emit('inventory_updated', {
      productId,
      quantity: updatedProduct.quantity,
      reservedQuantity: updatedProduct.reservedQuantity,
      orderId: savedOrder._id.toString(),
    });

    // Finalize RFQ state.
    rfq.status = 'awarded';
    rfq.selectedResponseId = req.params.responseId;
    await rfq.save();

    // Notify both parties.
    await notify(rfq.buyerId, 'order_update', 'Order created', `Your awarded proposal created order ${savedOrder._id}.`, {
      orderId: savedOrder._id.toString(),
      rfqId: rfq._id.toString(),
    });
    await notify(response.farmerId, 'order_update', 'New order created', `You were awarded an RFQ and created order ${savedOrder._id}.`, {
      orderId: savedOrder._id.toString(),
      rfqId: rfq._id.toString(),
    });

    getSocketServer()?.to(`user:${savedOrder.buyerId}`).emit('order_update', { order: savedOrder, orderId: savedOrder._id.toString() });
    getSocketServer()?.to(`user:${savedOrder.farmerId}`).emit('order_update', { order: savedOrder, orderId: savedOrder._id.toString() });

    getSocketServer()?.to(`user:${(response as any).farmerId}`).emit('proposal_update', { rfqId: rfq._id, awarded: true });
    res.json({ rfq, order: savedOrder });
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

export default router;
