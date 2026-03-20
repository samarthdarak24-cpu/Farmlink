import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLog extends Document {
  productId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  transactionType: 'order' | 'adjustment' | 'restock';
  quantityChange: number; // positive for restock, negative for order
  previousQuantity: number;
  currentQuantity: number;
  relatedOrderId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionType: {
      type: String,
      enum: ['order', 'adjustment', 'restock'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    currentQuantity: { type: Number, required: true },
    relatedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryLogSchema.index({ farmerId: 1, createdAt: -1 });
inventoryLogSchema.index({ transactionType: 1 });

const InventoryLog =
  mongoose.models.InventoryLog ||
  mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);

export default InventoryLog;
