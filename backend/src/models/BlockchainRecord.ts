import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IBlockchainRecord extends Document {
  productId: mongoose.Types.ObjectId;
  previousHash?: string;
  hash: string;
  action: string;
  details: Record<string, unknown>;
  actor: string;
  txHash: string;
  createdAt: Date;
}

const blockchainRecordSchema = new Schema<IBlockchainRecord>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    previousHash: { type: String },
    hash: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed, required: true },
    actor: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

blockchainRecordSchema.index({ productId: 1, createdAt: 1 });

export const computeHash = (data: string): string =>
  crypto.createHash('sha256').update(data).digest('hex');

const BlockchainRecord =
  mongoose.models.BlockchainRecord || mongoose.model<IBlockchainRecord>('BlockchainRecord', blockchainRecordSchema);
export default BlockchainRecord;
