import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import BuyerCart, { type IBuyerCartItem } from '../models/BuyerCart';
import Product from '../models/Product';
import Order from '../models/Order';
import InventoryLog from '../models/InventoryLog';
import StockAlert from '../models/StockAlert';
import { cacheClient, isRedisReady } from '../config/redis';
import { getSocketServer } from '../realtime/socket';
import Notification from '../models/Notification';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';
const LOW_STOCK_THRESHOLD = 10;

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

const notify = async (userId: string, type: string, title: string, body?: string, data?: Record<string, unknown>) => {
  await Notification.create({ userId, type: type as any, title, body, data });
  getSocketServer()?.to(`user:${userId}`).emit('notification', { type, title, body, data });
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const cart = await BuyerCart.findOne({ buyerId: decoded.userId });
    if (!cart?.items?.length) return res.json({ items: [] });

    const productIds = cart.items.map((i: IBuyerCartItem) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productById = new Map(products.map((p: any) => [p._id?.toString(), p]));

    const items = cart.items.map((it: IBuyerCartItem) => {
      const p = productById.get(it.productId) || productById.get(String(it.productId));
      return {
        productId: it.productId,
        productName: p?.name || 'Product',
        farmerId: p?.farmerId,
        farmerName: p?.farmerName,
        category: p?.category,
        location: p?.location,
        unit: p?.unit || 'kg',
        price: p?.price || 0,
        quantity: it.quantity,
      };
    });

    res.json({ items });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to fetch cart' });
  }
});

router.post('/items', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const { productId, quantity = 1 } = req.body as { productId: string; quantity?: number };
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ error: 'quantity must be >= 1' });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });

    // Keep cart manipulation simple (MVP): load/save doc.
    let cart = await BuyerCart.findOne({ buyerId: decoded.userId });
    if (!cart) {
      cart = new BuyerCart({ buyerId: decoded.userId, items: [{ productId, quantity: qty }] });
    } else {
      const existing = cart.items.find((i: IBuyerCartItem) => i.productId === productId);
      if (existing) existing.quantity += qty;
      else cart.items.push({ productId, quantity: qty });
    }

    await cart.save();
    const updated = await BuyerCart.findOne({ buyerId: decoded.userId });
    res.json({ cart: updated?.toObject?.() || null });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to add to cart' });
  }
});

router.put('/items/:productId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const qty = Number(req.body?.quantity);
    if (!Number.isFinite(qty) || qty < 0) return res.status(400).json({ error: 'quantity must be >= 0' });

    const cart = await BuyerCart.findOne({ buyerId: decoded.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const idx = cart.items.findIndex((i: IBuyerCartItem) => i.productId === req.params.productId);
    if (idx === -1) return res.status(404).json({ error: 'Item not found in cart' });

    if (qty === 0) cart.items.splice(idx, 1);
    else cart.items[idx].quantity = qty;

    if (!cart.items.length) {
      await BuyerCart.deleteOne({ buyerId: decoded.userId });
      return res.json({ cart: null });
    }

    await cart.save();
    res.json({ cart: cart.toObject() });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to update cart item' });
  }
});

router.delete('/items/:productId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    await BuyerCart.updateOne({ buyerId: decoded.userId }, { $pull: { items: { productId: req.params.productId } } });
    res.json({ message: 'Removed from cart' });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Failed to remove from cart' });
  }
});

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });

    const cart = await BuyerCart.findOne({ buyerId: decoded.userId });
    if (!cart?.items?.length) return res.status(400).json({ error: 'Cart is empty' });

    const createdOrders: any[] = [];

    // Create orders sequentially; each item is protected by atomic stock reservation.
    for (const it of cart.items) {
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty < 1) continue;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: it.productId, quantity: { $gte: qty }, isActive: true },
        { $inc: { quantity: -qty, reservedQuantity: qty, inventoryVersion: 1 } },
        { new: true },
      );

      if (!updatedProduct) {
        return res.status(400).json({ error: 'Insufficient stock for one or more items' });
      }

      const unitPrice = updatedProduct.price;
      const order = new Order({
        buyerId: decoded.userId,
        farmerId: updatedProduct.farmerId,
        productId: it.productId,
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
            notes: 'Order created from cart checkout',
          },
        ],
      });
      const savedOrder = await order.save();
      createdOrders.push(savedOrder);

      const previousQuantity = updatedProduct.quantity + qty;
      await InventoryLog.create({
        productId: it.productId,
        farmerId: updatedProduct.farmerId,
        transactionType: 'order',
        quantityChange: -qty,
        previousQuantity,
        currentQuantity: updatedProduct.quantity,
        relatedOrderId: savedOrder._id.toString(),
        notes: `Reserved stock for pending order ${savedOrder._id}`,
      });

      if (updatedProduct.quantity <= LOW_STOCK_THRESHOLD && updatedProduct.quantity > 0) {
        const existingAlert = await StockAlert.findOne({
          productId: it.productId,
          farmerId: updatedProduct.farmerId,
          status: 'active',
          alertType: 'low-stock',
        });
        if (!existingAlert) {
          await StockAlert.create({
            productId: it.productId,
            farmerId: updatedProduct.farmerId,
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
          productId: it.productId,
          farmerId: updatedProduct.farmerId,
          productName: updatedProduct.name,
          currentStock: 0,
          thresholdLevel: 0,
          alertType: 'out-of-stock',
          status: 'active',
        });
      }

      if (isRedisReady()) {
        await cacheClient.hSet(`inventory:${it.productId}`, {
          quantity: String(updatedProduct.quantity),
          reservedQuantity: String(updatedProduct.reservedQuantity),
          version: String(updatedProduct.inventoryVersion),
        });
      }

      getSocketServer()?.to(`user:${updatedProduct.farmerId}`).emit('inventory_updated', {
        productId: it.productId,
        quantity: updatedProduct.quantity,
        reservedQuantity: updatedProduct.reservedQuantity,
        orderId: savedOrder._id.toString(),
      });

      getSocketServer()?.to(`user:${savedOrder.buyerId}`).emit('order_update', { order: savedOrder, orderId: savedOrder._id.toString() });
      getSocketServer()?.to(`user:${savedOrder.farmerId}`).emit('order_update', { order: savedOrder, orderId: savedOrder._id.toString() });

      await notify(savedOrder.buyerId, 'order_update', 'Order created', `Checkout created order ${savedOrder._id}.`, {
        orderId: savedOrder._id.toString(),
      });
      await notify(savedOrder.farmerId, 'order_update', 'New order', `You received order ${savedOrder._id}.`, {
        orderId: savedOrder._id.toString(),
      });
    }

    // Clear cart after successful checkout.
    await BuyerCart.deleteOne({ buyerId: decoded.userId });

    res.status(201).json({ orders: createdOrders });
  } catch (e: any) {
    if (e.message === 'Authentication required') return res.status(401).json({ error: e.message });
    res.status(400).json({ error: e.message || 'Checkout failed' });
  }
});

export default router;

