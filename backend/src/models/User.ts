import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'farmer' | 'buyer';
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'buyer'], required: true, index: true },
    phone: { type: String },
    location: { type: String }, // Simplification for MVP, can be Object later
    bio: { type: String },
    avatar: { type: String },
    certifications: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
