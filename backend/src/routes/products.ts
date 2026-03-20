import mongoose from 'mongoose';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Product from '../models/Product';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Order from '../models/Order';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware to verify farmer token
const verifyFarmer = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    if (decoded.role !== 'farmer') {
      return res.status(403).json({ error: 'Only farmers can perform this action' });
    }
    
    // Attach user to req for downstream use
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all products with filters & pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, location, page = 1, limit = 12, sortBy = 'newest' } = req.query;
    
    const query: any = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const mongoSort: Record<string, 1 | -1> =
      sortBy === 'price_asc' ? { price: 1 } : sortBy === 'price_desc' ? { price: -1 } : { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limitNum).sort(mongoSort).lean(),
      Product.countDocuments(query),
    ]);

    // Attach farmer rating summary based on delivered orders.
    const farmerIds = Array.from(new Set(products.map((p: any) => p.farmerId).filter(Boolean)));
    const farmerObjectIds = farmerIds.map(id => new mongoose.Types.ObjectId(String(id)));

    const ratingRows = farmerObjectIds.length
      ? await Order.aggregate([
          {
            $match: {
              farmerId: { $in: farmerObjectIds },
              status: 'delivered',
              rating: { $exists: true, $ne: null },
            },
          },
          { $group: { _id: '$farmerId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        ])
      : [];
    const ratingMap = new Map(ratingRows.map((r: any) => [String(r._id), { avg: r.avgRating, count: r.count }]));

    let hydrated = products.map((p: any) => {
      const r = ratingMap.get(String(p.farmerId));
      return {
        ...p,
        farmerRatingAvg: r?.avg ?? null,
        farmerRatingCount: r?.count ?? 0,
      };
    });

    if (sortBy === 'rating_desc' || sortBy === 'rating_asc') {
      const dir = sortBy === 'rating_asc' ? 1 : -1;
      hydrated = hydrated.sort((a: any, b: any) => {
        const av = a.farmerRatingAvg ?? -1;
        const bv = b.farmerRatingAvg ?? -1;
        if (bv === av) return 0;
        return (av - bv) * dir;
      });
    }

    // Get 6 random for featured if we want to mimic previous behavior
    const featured = await Product.find().limit(6).sort({ qualityGrade: -1 });

    res.json({
      products: hydrated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      featured
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// Search products
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const results = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { farmerName: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const featured = await Product.find().sort({ qualityGrade: -1, createdAt: -1 }).limit(6);
    res.json(featured);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get unique categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get farmer's products (The prompt mentions GET /products/:farmerId, handling carefully)
router.get('/farmer/:farmerId', async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: 'Invalid product ID or server error' });
  }
});

// ==========================================
// PROTECTED FARMER ROUTES (CRUD)
// ==========================================

// Create product
router.post('/', verifyFarmer, [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('images').optional().isArray({ max: 6 }).withMessage('Up to 6 images allowed'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = (req as any).user;
    
    const newProduct = new Product({
      ...req.body,
      farmerId: user.userId, // Tied strictly to the authenticated farmer
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// Update product
router.put('/:id', verifyFarmer, [
  body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
  body('images').optional().isArray({ max: 6 }).withMessage('Up to 6 images allowed'),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = (req as any).user;
    
    // Verify the product belongs to this farmer before updating
    const product = await Product.findOne({ _id: req.params.id, farmerId: user.userId });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// Upload image to Cloudinary via backend
router.post('/upload-image', verifyFarmer, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary is not configured on server' });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'odop/products',
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      stream.end(req.file?.buffer);
    });

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Cloudinary upload failed', details: error.message });
  }
});

// Delete product
router.delete('/:id', verifyFarmer, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Verify ownership before deleting
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: user.userId });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product successfully deleted', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

export default router;