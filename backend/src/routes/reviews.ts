import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Review from '../models/Review';
import Order from '../models/Order';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string; role: string };
};

// Get reviews for a farmer
router.get('/farmer/:farmerId', async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ farmerId: req.params.farmerId, status: 'active' })
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name avatar');
    
    // Calculate stats
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;
    const breakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({ reviews, stats: { total, avg: Number(avg), breakdown } });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

// Create review (buyer only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    if (decoded.role !== 'buyer') return res.status(403).json({ error: 'Only buyers can review' });

    const { farmerId, orderId, rating, comment, media, tags } = req.body;

    // Verify order exists and belongs to buyer
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, buyerId: decoded.userId });
      if (!order) return res.status(403).json({ error: 'Order not found' });
    }

    const review = new Review({
      farmerId,
      buyerId: decoded.userId,
      orderId,
      rating: Number(rating),
      comment,
      media: media || [],
      tags: tags || [],
      isVerified: !!orderId,
      sentiment: Number(rating) >= 4 ? 'positive' : Number(rating) <= 2 ? 'negative' : 'neutral'
    });

    await review.save();
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Vote helpful
router.put('/:reviewId/helpful', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { $inc: { helpfulVotes: 1 } }, { new: true });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

// Report review
router.put('/:reviewId/report', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.reviewId, { status: 'reported' }, { new: true });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
});

export default router;
