import cron from 'node-cron';
import Product from '../models/Product';
import StockAlert from '../models/StockAlert';
import { cacheClient, isRedisReady } from '../config/redis';

const DEFAULT_LOW_STOCK = 10;

export const startInventoryMonitor = (): void => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const products = await Product.find({
        $or: [{ quantity: { $lte: DEFAULT_LOW_STOCK } }, { quantity: 0 }],
      }).select('_id farmerId name quantity lowStockThreshold');

      for (const product of products) {
        const threshold = product.lowStockThreshold ?? DEFAULT_LOW_STOCK;
        const isOut = product.quantity <= 0;
        const alertType = isOut ? 'out-of-stock' : 'low-stock';

        await StockAlert.findOneAndUpdate(
          {
            productId: product._id.toString(),
            farmerId: product.farmerId,
            alertType,
            status: 'active',
          },
          {
            productName: product.name,
            currentStock: product.quantity,
            thresholdLevel: threshold,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (isRedisReady()) {
          await cacheClient.hSet(`inventory:${product._id.toString()}`, {
            quantity: String(product.quantity),
            threshold: String(threshold),
            status: isOut ? 'out-of-stock' : 'low-stock',
          });
        }
      }
    } catch (error) {
      console.error('Inventory monitor failed:', error);
    }
  });
};
