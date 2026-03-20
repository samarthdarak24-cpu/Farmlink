import mongoose, { Document, Schema } from 'mongoose';

export interface INegotiationOffer extends Document {
  type: 'offer' | 'counter' | 'accept' | 'reject';
  price?: number;
  quantity?: number;
  notes?: string;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface INegotiation extends Document {
  orderId?: mongoose.Types.ObjectId;
  rfqId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  initialPrice: number;
  finalPrice?: number;
  quantity: number;
  offers: INegotiationOffer[];
  aiSuggestedPrice?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<INegotiationOffer>(
  {
    type: { type: String, enum: ['offer', 'counter', 'accept', 'reject'], required: true },
    price: { type: Number },
    quantity: { type: Number },
    notes: { type: String },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const negotiationSchema = new Schema<INegotiation>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['active', 'accepted', 'rejected', 'expired'], default: 'active' },
    initialPrice: { type: Number, required: true },
    finalPrice: { type: Number },
    quantity: { type: Number, required: true },
    offers: [offerSchema],
    aiSuggestedPrice: { type: Number },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

negotiationSchema.index({ buyerId: 1, status: 1 });
negotiationSchema.index({ farmerId: 1, status: 1 });
negotiationSchema.index({ orderId: 1 });
negotiationSchema.index({ rfqId: 1 });

const Negotiation = mongoose.models.Negotiation || mongoose.model<INegotiation>('Negotiation', negotiationSchema);
export default Negotiation;
