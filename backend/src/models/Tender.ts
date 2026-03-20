import mongoose, { Document, Schema } from 'mongoose';

export interface ITenderBid extends Document {
  farmerId: mongoose.Types.ObjectId;
  farmerName: string;
  bidAmount: number;
  deliveryTimeline: string;
  notes?: string;
  createdAt: Date;
}

export interface ITender extends Document {
  buyerId: mongoose.Types.ObjectId;
  buyerName: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget?: number;
  deadline: Date;
  status: 'open' | 'closed' | 'awarded';
  bids: ITenderBid[];
  selectedBidId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tenderBidSchema = new Schema<ITenderBid>({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  deliveryTimeline: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const tenderSchema = new Schema<ITender>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    budget: { type: Number },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['open', 'closed', 'awarded'],
      default: 'open',
    },
    bids: [tenderBidSchema],
    selectedBidId: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Tender = mongoose.models.Tender || mongoose.model<ITender>('Tender', tenderSchema);

export default Tender;
