import { Router, Request, Response } from 'express';
import Order from '../models/Order';

const router = Router();

router.get('/:farmerId/ratings/summary', async (req: Request, res: Response) => {
  try {
    const { farmerId } = req.params;
    const result = await Order.aggregate([
      { $match: { farmerId, rating: { $exists: true, $ne: null }, status: 'delivered' } },
      {
        $group: {
          _id: '$farmerId',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    if (!result.length) {
      return res.json({ farmerId, averageRating: null, count: 0 });
    }

    const r = result[0];
    res.json({
      farmerId,
      averageRating: r.averageRating,
      count: r.count,
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to fetch ratings summary' });
  }
});

export default router;

