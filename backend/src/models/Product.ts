import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  inventoryVersion: number;
  isActive: boolean;
  lastRestockedAt?: Date;
  images: string[];
  farmerId: mongoose.Types.ObjectId;
  farmerName?: string;
  location?: string;
  certifications?: string[];
  qualityGrade?: number;
  aiPriceSuggestion?: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    inventoryVersion: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    lastRestockedAt: { type: Date },
    images: [{ type: String }],
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String },
    location: { type: String },
    certifications: [{ type: String }],
    qualityGrade: { type: Number },
    aiPriceSuggestion: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ farmerId: 1, isActive: 1, createdAt: -1 });
productSchema.index({ category: 1, price: 1 });

// To avoid recompiling model errors in dev
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
