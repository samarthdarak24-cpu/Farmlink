import mongoose, { Document, Schema } from 'mongoose';

export interface ILogistics extends Document {
  orderId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  route?: string[];
  lastLocation?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const logisticsSchema = new Schema<ILogistics>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, indexed: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, indexed: true },
    status: {
      type: String,
      enum: ['pending', 'in-transit', 'delivered', 'delayed'],
      default: 'pending',
    },
    carrier: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    route: [{ type: String }],
    lastLocation: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

logisticsSchema.index({ orderId: 1 });
logisticsSchema.index({ farmerId: 1 });
logisticsSchema.index({ buyerId: 1 });

const Logistics = mongoose.models.Logistics || mongoose.model<ILogistics>('Logistics', logisticsSchema);

export default Logistics;
