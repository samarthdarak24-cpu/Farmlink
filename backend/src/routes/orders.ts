import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order';
import Product from '../models/Product';
import InventoryLog from '../models/InventoryLog';
import StockAlert from '../models/StockAlert';
import { cacheClient, isRedisReady } from '../config/redis';
import { getSocketServer } from '../realtime/socket';
import Contract from '../models/Contract';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';
const LOW_STOCK_THRESHOLD = 10; // Alert when stock falls below 10 units

// Helper to extract and verify JWT
const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) {
    throw new Error('Authentication required');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
};

// Get all orders for the authenticated user
router.get('/', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    let query: any = {};
    if (decoded.role === 'buyer') {
      query.buyerId = decoded.userId;
    } else if (decoded.role === 'farmer') {
      query.farmerId = decoded.userId;
    }

    const userOrders = await Order.find(query).sort({ createdAt: -1 });
    res.json(userOrders);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid order ID' });
  }
});

// Create order (buyer only) with inventory management
router.post('/', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can create orders' });
    }

    const { farmerId, productId, quantity, price } = req.body;

    if (!farmerId || !productId || !quantity || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const qty = Number(quantity);
    const unitPrice = Number(price);
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      return res.status(400).json({ error: 'Quantity and price must be positive numbers' });
    }

    // Atomic inventory reservation to prevent overselling under concurrency.
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, quantity: { $gte: qty } },
      { $inc: { quantity: -qty, reservedQuantity: qty, inventoryVersion: 1 } },
      { new: true }
    );
    if (!updatedProduct) {
      const latest = await Product.findById(productId);
      if (!latest) return res.status(404).json({ error: 'Product not found' });
      return res.status(400).json({
        error: `Insufficient stock. Available: ${latest.quantity}, Requested: ${qty}`,
      });
    }

    // Create order
    const order = new Order({
      buyerId: decoded.userId,
      farmerId,
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
          notes: 'Order created',
        },
      ],
    });

    const savedOrder = await order.save();

    const previousQuantity = updatedProduct.quantity + qty;

    // Create inventory log
    await InventoryLog.create({
      productId,
      farmerId,
      transactionType: 'order',
      quantityChange: -qty,
      previousQuantity,
      currentQuantity: updatedProduct.quantity,
      relatedOrderId: savedOrder._id.toString(),
      notes: `Reserved stock for pending order ${savedOrder._id}`,
    });

    // Check for low stock alert
    if (updatedProduct.quantity <= LOW_STOCK_THRESHOLD && updatedProduct.quantity > 0) {
      // Check if alert already exists
      const existingAlert = await StockAlert.findOne({
        productId,
        farmerId,
        status: 'active',
        alertType: 'low-stock',
      });

      if (!existingAlert) {
        await StockAlert.create({
          productId,
          farmerId,
          productName: updatedProduct.name,
          currentStock: updatedProduct.quantity,
          thresholdLevel: LOW_STOCK_THRESHOLD,
          alertType: 'low-stock',
          status: 'active',
        });
      }
    }

    // Check for out of stock
    if (updatedProduct.quantity === 0) {
      await StockAlert.create({
        productId,
        farmerId,
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

    getSocketServer()?.to(`user:${farmerId}`).emit('inventory_updated', {
      productId,
      quantity: updatedProduct.quantity,
      reservedQuantity: updatedProduct.reservedQuantity,
      orderId: savedOrder._id.toString(),
    });

    // Push order update to both buyer and farmer for immediate UI refresh.
    getSocketServer()?.to(`user:${savedOrder.buyerId}`).emit('order_update', {
      order: savedOrder,
      orderId: savedOrder._id.toString(),
    });
    getSocketServer()?.to(`user:${savedOrder.farmerId}`).emit('order_update', {
      order: savedOrder,
      orderId: savedOrder._id.toString(),
    });

    res.status(201).json(savedOrder);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// Update order status (farmer or buyer)
router.put('/:id/status', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify authorization
    if (decoded.role === 'buyer' && order.buyerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }
    if (decoded.role === 'farmer' && order.farmerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      pending: ['accepted', 'rejected', 'cancelled'],
      accepted: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      rejected: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    const prevStatus = order.status;
    if (prevStatus === 'pending' && status === 'accepted') {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { reservedQuantity: -order.quantity, inventoryVersion: 1 },
      });
    }

    if ((prevStatus === 'pending' || prevStatus === 'accepted') && status === 'rejected') {
      const product = await Product.findByIdAndUpdate(
        order.productId,
        { $inc: { quantity: order.quantity, reservedQuantity: prevStatus === 'pending' ? -order.quantity : 0, inventoryVersion: 1 } },
        { new: true }
      );
      if (product) {
        await InventoryLog.create({
          productId: order.productId,
          farmerId: order.farmerId,
          transactionType: 'adjustment',
          quantityChange: order.quantity,
          previousQuantity: product.quantity - order.quantity,
          currentQuantity: product.quantity,
          relatedOrderId: order._id.toString(),
          notes: `Stock returned due to order rejection (${order._id})`,
        });
      }
    }
    order.status = status;

    order.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: decoded.userId,
      notes,
    } as any);

    const updatedOrder = await order.save();
    getSocketServer()?.to(`user:${updatedOrder.buyerId}`).emit('order_update', { order: updatedOrder, orderId: updatedOrder._id.toString() });
    getSocketServer()?.to(`user:${updatedOrder.farmerId}`).emit('order_update', { order: updatedOrder, orderId: updatedOrder._id.toString() });

    // Trigger contract generation after deal finalization.
    if (status === 'delivered') {
      try {
        const existing = await Contract.findOne({ orderId: updatedOrder._id.toString() });
        if (!existing) {
          const product = await Product.findById(updatedOrder.productId);
          const farmerName = product?.farmerName || 'Farmer';
          const unit = product?.unit || 'kg';
          const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'contracts');
          if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
          const pdfPath = path.join(UPLOAD_DIR, `contract-${updatedOrder._id}.pdf`);

          const contract = new Contract({
            orderId: updatedOrder._id.toString(),
            buyerId: updatedOrder.buyerId,
            farmerId: updatedOrder.farmerId,
            productId: updatedOrder.productId,
            productName: product?.name || 'Product',
            quantity: updatedOrder.quantity,
            unit,
            agreedPrice: updatedOrder.price,
            totalAmount: updatedOrder.totalAmount,
            farmerName,
            buyerName: 'Buyer',
            deliveryAddress: updatedOrder.deliveryAddress,
            terms: 'Standard terms: Quality as described. Delivery per agreed schedule. Payment per agreed terms.',
            status: 'draft',
          });
          await contract.save();

          const doc = new PDFDocument({ margin: 50 });
          const writeStream = fs.createWriteStream(pdfPath);
          doc.pipe(writeStream);

          doc.fontSize(20).text('Supply Agreement', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Order ID: ${updatedOrder._id}`, { align: 'left' });
          doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
          doc.moveDown();
          doc.text(`Seller (Farmer): ${farmerName}`, { align: 'left' });
          doc.text(`Buyer: Buyer`, { align: 'left' });
          doc.moveDown();
          doc.text(`Product: ${product?.name || 'Product'}`, { align: 'left' });
          doc.text(`Quantity: ${updatedOrder.quantity} ${unit}`, { align: 'left' });
          doc.text(`Price per unit: $${updatedOrder.price}`, { align: 'left' });
          doc.text(`Total: $${updatedOrder.totalAmount}`, { align: 'left' });
          doc.moveDown();
          if (updatedOrder.deliveryAddress) doc.text(`Delivery: ${updatedOrder.deliveryAddress}`, { align: 'left' });
          doc.moveDown();
          doc.text('Terms:', { align: 'left' });
          doc.text(contract.terms || '', { align: 'left' });
          doc.end();

          await new Promise<void>((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', reject);
          });

          contract.pdfUrl = `/uploads/contracts/contract-${updatedOrder._id}.pdf`;
          await contract.save();
        }
      } catch {
        // Contract generation should not block order updates.
      }
    }
    res.json(updatedOrder);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to update order' });
  }
});

// Cancel order (buyer or farmer)
router.post('/:id/cancel', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify authorization
    if (decoded.role === 'buyer' && order.buyerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }
    if (decoded.role === 'farmer' && order.farmerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'pending' && order.status !== 'accepted') {
      return res.status(400).json({
        error: `Can only cancel pending or accepted orders, current status: ${order.status}`,
      });
    }

    order.status = 'cancelled';
    const product = await Product.findByIdAndUpdate(
      order.productId,
      {
        $inc: {
          quantity: order.quantity,
          reservedQuantity: order.timeline.some((t: any) => t.status === 'accepted') ? 0 : -order.quantity,
          inventoryVersion: 1,
        },
      },
      { new: true }
    );

    if (product) {
      await InventoryLog.create({
        productId: order.productId,
        farmerId: order.farmerId,
        transactionType: 'adjustment',
        quantityChange: order.quantity,
        previousQuantity: product.quantity - order.quantity,
        currentQuantity: product.quantity,
        relatedOrderId: order._id.toString(),
        notes: `Stock returned due to cancellation (${order._id})`,
      });
    }

    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      updatedBy: decoded.userId,
      notes: 'Order cancelled',
    } as any);

    const updatedOrder = await order.save();
    getSocketServer()?.to(`user:${updatedOrder.buyerId}`).emit('order_update', { order: updatedOrder, orderId: updatedOrder._id.toString() });
    getSocketServer()?.to(`user:${updatedOrder.farmerId}`).emit('order_update', { order: updatedOrder, orderId: updatedOrder._id.toString() });
    res.json(updatedOrder);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to cancel order' });
  }
});

// Submit rating for an order (buyer only)
router.put('/:id/rate', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.buyerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Only the buyer can rate this order' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only rate delivered orders' });
    }

    if (order.rating && order.rating >= 1) {
      return res.status(409).json({ error: 'This order has already been rated' });
    }

    order.rating = rating;
    order.review = review || '';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to submit rating' });
  }
});

// ======== INVENTORY MANAGEMENT ENDPOINTS ========

// Get inventory logs for a product (farmer only)
router.get('/inventory/logs/:productId', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can view inventory logs' });
    }

    const logs = await InventoryLog.find({
      productId: req.params.productId,
      farmerId: decoded.userId,
    }).sort({ createdAt: -1 });

    res.json(logs);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch inventory logs' });
  }
});

// Get stock alerts for farmer
router.get('/inventory/alerts', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can view alerts' });
    }

    const alerts = await StockAlert.find({
      farmerId: decoded.userId,
    }).sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch alerts' });
  }
});

// Get active alerts only
router.get('/inventory/alerts/active', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can view alerts' });
    }

    const alerts = await StockAlert.find({
      farmerId: decoded.userId,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch active alerts' });
  }
});

// Acknowledge/resolve stock alert (farmer only)
router.put('/inventory/alerts/:alertId/acknowledge', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can acknowledge alerts' });
    }

    const alert = await StockAlert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    if (alert.farmerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    alert.status = 'resolved';
    alert.acknowledgedAt = new Date();
    const updatedAlert = await alert.save();

    res.json(updatedAlert);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to acknowledge alert' });
  }
});

// Manual inventory adjustment (farmer only) - for restocking
router.post('/inventory/adjust', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can adjust inventory' });
    }

    const { productId, quantityAdjustment, notes } = req.body;

    if (!productId || !quantityAdjustment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmerId.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized to adjust this product' });
    }

    const previousQuantity = product.quantity;
    product.quantity += quantityAdjustment;

    if (product.quantity < 0) {
      return res.status(400).json({ error: 'Adjustment would result in negative stock' });
    }

    await product.save();

    // Create inventory log
    await InventoryLog.create({
      productId,
      farmerId: decoded.userId,
      transactionType: quantityAdjustment > 0 ? 'restock' : 'adjustment',
      quantityChange: quantityAdjustment,
      previousQuantity,
      currentQuantity: product.quantity,
      notes: notes || (quantityAdjustment > 0 ? 'Restocked' : 'Inventory adjusted'),
    });

    // Resolve low-stock alerts if stock is now above threshold
    if (product.quantity > LOW_STOCK_THRESHOLD) {
      await StockAlert.updateMany(
        {
          productId,
          farmerId: decoded.userId,
          alertType: 'low-stock',
          status: 'active',
        },
        {
          status: 'resolved',
          acknowledgedAt: new Date(),
        }
      );
    }

    // Resolve out-of-stock alerts if stock is > 0
    if (product.quantity > 0) {
      await StockAlert.updateMany(
        {
          productId,
          farmerId: decoded.userId,
          alertType: 'out-of-stock',
          status: 'active',
        },
        {
          status: 'resolved',
          acknowledgedAt: new Date(),
        }
      );
    }

    res.json({
      message: 'Inventory adjusted successfully',
      product: {
        id: product._id,
        name: product.name,
        previousQuantity,
        currentQuantity: product.quantity,
        adjustment: quantityAdjustment,
      },
    });
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to adjust inventory' });
  }
});

// Get inventory summary for farmer
router.get('/inventory/summary', async (req, res) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can view summary' });
    }

    const cacheKey = `inventory:summary:${decoded.userId}`;
    if (isRedisReady()) {
      const cached = await cacheClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const products = await Product.find({ farmerId: decoded.userId });
    const activeAlerts = await StockAlert.countDocuments({
      farmerId: decoded.userId,
      status: 'active',
    });

    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD).length;

    const payload = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.quantity, 0),
      outOfStockCount: outOfStock,
      lowStockCount: lowStock,
      activeAlertsCount: activeAlerts,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        quantity: p.quantity,
        status: p.quantity === 0 ? 'out-of-stock' : p.quantity <= LOW_STOCK_THRESHOLD ? 'low-stock' : 'in-stock',
      })),
    };

    if (isRedisReady()) {
      await cacheClient.set(cacheKey, JSON.stringify(payload), { EX: 60 });
    }

    res.json(payload);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch inventory summary' });
  }
});

export default router;