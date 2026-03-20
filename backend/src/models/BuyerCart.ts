import mongoose, { Document, Schema } from 'mongoose';

export interface IBuyerCartItem {
  productId: string;
  quantity: number;
}

export interface IBuyerCart extends Document {
  buyerId: string;
  items: IBuyerCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const buyerCartSchema = new Schema<IBuyerCart>(
  {
    buyerId: { type: String, required: true, unique: true, index: true },
    items: [
      {
        productId: { type: String, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

buyerCartSchema.index({ buyerId: 1 });

const BuyerCart = mongoose.models.BuyerCart || mongoose.model<IBuyerCart>('BuyerCart', buyerCartSchema);
export default BuyerCart;

