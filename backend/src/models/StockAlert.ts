import mongoose, { Document, Schema } from 'mongoose';

export interface IStockAlert extends Document {
  productId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productName: string;
  currentStock: number;
  thresholdLevel: number;
  alertType: 'low-stock' | 'out-of-stock';
  status: 'active' | 'resolved';
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stockAlertSchema = new Schema<IStockAlert>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productName: { type: String, required: true },
    currentStock: { type: Number, required: true },
    thresholdLevel: { type: Number, required: true },
    alertType: {
      type: String,
      enum: ['low-stock', 'out-of-stock'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active',
    },
    acknowledgedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
stockAlertSchema.index({ farmerId: 1, status: 1 });
stockAlertSchema.index({ productId: 1 });
stockAlertSchema.index({ alertType: 1 });

const StockAlert =
  mongoose.models.StockAlert || mongoose.model<IStockAlert>('StockAlert', stockAlertSchema);

export default StockAlert;
