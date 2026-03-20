import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'rfq_created' | 'rfq_response' | 'rfq_awarded' | 'order_update' | 'negotiation' | 'chat';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: ['rfq_created', 'rfq_response', 'rfq_awarded', 'order_update', 'negotiation', 'chat'] },
    title: { type: String, required: true },
    body: { type: String },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
