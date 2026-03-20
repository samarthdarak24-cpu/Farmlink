import mongoose, { Document, Schema } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface IPayment extends Document {
  orderId: string;
  buyerId: string;
  farmerId: string;
  amount: number;
  currency: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    buyerId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    provider: { type: String, default: 'mock' },
    providerPaymentId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;

