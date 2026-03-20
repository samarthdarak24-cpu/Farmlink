import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderTimeline extends Document {
  status: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

export interface IOrder extends Document {
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  trackingNumber?: string;
  deliveryAddress?: string;
  timeline: IOrderTimeline[];
  rating?: number;
  review?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderTimelineSchema = new Schema<IOrderTimeline>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, required: true },
    notes: { type: String },
  },
  { _id: true }
);

const orderSchema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    deliveryAddress: { type: String },
    timeline: [orderTimelineSchema],
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// To avoid recompiling model errors in dev
const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
