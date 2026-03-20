import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import BlockchainRecord, { computeHash } from '../models/BlockchainRecord';

const router = Router();

router.get('/verify/:productId', async (req: Request, res: Response) => {
  try {
    const records = await BlockchainRecord.find({ productId: req.params.productId }).sort({ createdAt: 1 });
    if (!records.length) {
      return res.json({ verified: false, message: 'Product not found in blockchain', productId: req.params.productId });
    }
    const last = records[records.length - 1];
    res.json({ verified: true, productId: req.params.productId, recordCount: records.length, latestRecord: last });
  } catch (e: any) {
    res.status(400).json({ error: 'Failed' });
  }
});

router.get('/history/:productId', async (req: Request, res: Response) => {
  try {
    const records = await BlockchainRecord.find({ productId: req.params.productId }).sort({ createdAt: 1 });
    res.json({ productId: req.params.productId, history: records.map(r => ({ id: r._id, action: r.action, details: r.details, actor: r.actor, timestamp: r.createdAt, txHash: r.txHash })), totalRecords: records.length });
  } catch (e: any) {
    res.status(400).json({ error: 'Failed' });
  }
});

const createRecord = async (productId: string, action: string, details: Record<string, unknown>, actor: string) => {
  const prev = await BlockchainRecord.findOne({ productId }).sort({ createdAt: -1 });
  const prevHash = prev?.hash ?? 'genesis';
  const payload = JSON.stringify({ productId, action, details, actor, timestamp: new Date().toISOString(), prevHash });
  const hash = computeHash(payload);
  const txHash = '0x' + uuidv4().replace(/-/g, '');
  await BlockchainRecord.create({ productId, previousHash: prevHash, hash, action, details, actor, txHash });
  return { hash, txHash };
};

router.post('/record', async (req: Request, res: Response) => {
  try {
    const { productId, action, details, actor } = req.body;
    if (!productId || !action || !actor) return res.status(400).json({ error: 'Missing fields' });
    const { hash, txHash } = await createRecord(productId, action, details ?? {}, actor);
    res.status(201).json({ success: true, record: { hash, txHash } });
  } catch (e: any) {
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

router.get('/qr/:productId', (req: Request, res: Response) => {
  const base = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.json({ productId: req.params.productId, verifyUrl: `${base}/verify/${req.params.productId}`, timestamp: new Date().toISOString() });
});

router.post('/product-created', async (req: Request, res: Response) => {
  try {
    const { productId, farmerId, farmerName, productDetails, location } = req.body;
    if (!productId || !farmerId) return res.status(400).json({ error: 'Missing fields' });
    const { hash, txHash } = await createRecord(productId, 'PRODUCT_CREATED', {
      farmerId,
      farmerName,
      productName: productDetails?.name,
      category: productDetails?.category,
      certifications: productDetails?.certifications,
      location,
    }, farmerId);
    res.status(201).json({ success: true, record: { hash, txHash }, blockchainId: txHash });
  } catch (e: any) {
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { productId, from, to, quantity, orderId } = req.body;
    if (!productId || !from || !to) return res.status(400).json({ error: 'Missing fields' });
    const { hash, txHash } = await createRecord(productId, 'PRODUCT_TRANSFERRED', { from, to, quantity, orderId }, from);
    res.status(201).json({ success: true, record: { hash, txHash } });
  } catch (e: any) {
    res.status(400).json({ error: (e as Error).message || 'Failed' });
  }
});

export default router;
