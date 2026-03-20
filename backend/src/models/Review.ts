import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  farmerId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  media: string[]; // images/videos
  tags: string[]; // ['quality', 'delivery', 'communication']
  isVerified: boolean;
  helpfulVotes: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'active' | 'reported' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    media: [{ type: String }],
    tags: [{ type: String }],
    isVerified: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    status: { type: String, enum: ['active', 'reported', 'removed'], default: 'active' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ farmerId: 1, rating: -1 });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
export default Review;
