import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import Order from '../models/Order';
import Contract from '../models/Contract';
import Product from '../models/Product';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string };
};

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'contracts');

router.post('/generate/:orderId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== decoded.userId && order.farmerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });

    let contract = await Contract.findOne({ orderId: order._id.toString() });
    if (contract) return res.json(contract);

    const product = await Product.findById(order.productId);
    const productName = product?.name ?? 'Product';

    contract = new Contract({
      orderId: order._id.toString(),
      buyerId: order.buyerId,
      farmerId: order.farmerId,
      productId: order.productId,
      productName,
      quantity: order.quantity,
      unit: product?.unit ?? 'kg',
      agreedPrice: order.price,
      totalAmount: order.totalAmount,
      farmerName: req.body.farmerName ?? 'Farmer',
      buyerName: req.body.buyerName ?? 'Buyer',
      deliveryAddress: order.deliveryAddress ?? req.body.deliveryAddress,
      terms: 'Standard terms: Quality as described. Delivery per agreed schedule. Payment per agreed terms.',
      status: 'draft',
    });
    await contract.save();

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const pdfPath = path.join(UPLOAD_DIR, `contract-${order._id}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text('Supply Agreement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`, { align: 'left' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' });
    doc.moveDown();
    doc.text(`Seller (Farmer): ${contract.farmerName}`, { align: 'left' });
    doc.text(`Buyer: ${contract.buyerName}`, { align: 'left' });
    doc.moveDown();
    doc.text(`Product: ${contract.productName}`, { align: 'left' });
    doc.text(`Quantity: ${contract.quantity} ${contract.unit}`, { align: 'left' });
    doc.text(`Price per unit: $${contract.agreedPrice}`, { align: 'left' });
    doc.text(`Total: $${contract.totalAmount}`, { align: 'left' });
    doc.moveDown();
    if (contract.deliveryAddress) doc.text(`Delivery: ${contract.deliveryAddress}`, { align: 'left' });
    doc.moveDown();
    doc.text('Terms:', { align: 'left' });
    doc.text(contract.terms ?? '', { align: 'left' });
    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    contract.pdfUrl = `/uploads/contracts/contract-${order._id}.pdf`;
    await contract.save();

    res.status(201).json(contract);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const c = await Contract.findOne({ orderId: req.params.orderId });
    if (!c) return res.status(404).json({ error: 'Not found' });
    if (c.buyerId.toString() !== decoded.userId && c.farmerId.toString() !== decoded.userId) return res.status(403).json({ error: 'Not authorized' });
    res.json(c);
  } catch (e: any) {
    if ((e as Error).message === 'Authentication required') return res.status(401).json({ error: (e as Error).message });
    res.status(400).json({ error: 'Failed' });
  }
});

export default router;
