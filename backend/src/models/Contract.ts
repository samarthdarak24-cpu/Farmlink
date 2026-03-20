import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  totalAmount: number;
  farmerName: string;
  buyerName: string;
  deliveryAddress?: string;
  terms?: string;
  pdfUrl?: string;
  status: 'draft' | 'signed' | 'void';
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    agreedPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    farmerName: { type: String, required: true },
    buyerName: { type: String, required: true },
    deliveryAddress: { type: String },
    terms: { type: String },
    pdfUrl: { type: String },
    status: { type: String, enum: ['draft', 'signed', 'void'], default: 'draft' },
    signedAt: { type: Date },
  },
  { timestamps: true }
);

contractSchema.index({ orderId: 1 });
contractSchema.index({ buyerId: 1 });
contractSchema.index({ farmerId: 1 });

const Contract = mongoose.models.Contract || mongoose.model<IContract>('Contract', contractSchema);
export default Contract;
