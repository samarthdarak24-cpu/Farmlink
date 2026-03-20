import mongoose, { Document, Schema } from 'mongoose';

export interface IRFQResponse extends Document {
  farmerId: mongoose.Types.ObjectId;
  farmerName?: string;
  productId?: mongoose.Types.ObjectId;
  farmerLocation?: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  deliveryDays: number;
  notes?: string;
  rankScore?: number;
  createdAt: Date;
}

export interface IRFQ extends Document {
  buyerId: mongoose.Types.ObjectId;
  buyerName?: string;
  productCategory: string;
  productName: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  deliveryLocation?: string;
  expiresAt?: Date;
  status: 'open' | 'closed' | 'awarded';
  responses: IRFQResponse[];
  selectedResponseId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rfqResponseSchema = new Schema<IRFQResponse>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    farmerLocation: { type: String },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    notes: { type: String },
    rankScore: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const rfqSchema = new Schema<IRFQ>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerName: { type: String },
    productCategory: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    targetPrice: { type: Number },
    deliveryLocation: { type: String },
    expiresAt: { type: Date },
    status: {
      type: String,
      enum: ['open', 'closed', 'awarded'],
      default: 'open',
    },
    responses: [rfqResponseSchema],
    selectedResponseId: { type: String }, // Keep as string if it's an ID from subdocument
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
rfqSchema.index({ buyerId: 1, createdAt: -1 });
rfqSchema.index({ status: 1 });
rfqSchema.index({ productCategory: 1 });

// To avoid recompiling model errors in dev
const RFQ = mongoose.models.RFQ || mongoose.model<IRFQ>('RFQ', rfqSchema);

export default RFQ;
