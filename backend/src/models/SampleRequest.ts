import mongoose, { Document, Schema } from 'mongoose';

export interface ISampleRequest extends Document {
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'rejected';
  notes?: string;
  deliveryAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sampleRequestSchema = new Schema<ISampleRequest>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'sample' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'shipped', 'delivered', 'rejected'],
      default: 'pending',
    },
    notes: { type: String },
    deliveryAddress: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const SampleRequest = mongoose.models.SampleRequest || mongoose.model<ISampleRequest>('SampleRequest', sampleRequestSchema);

export default SampleRequest;
