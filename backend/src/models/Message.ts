import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'document' | 'voice' | 'negotiation';
  status: 'sent' | 'delivered' | 'seen';
  negotiationData?: {
    type: 'offer' | 'counter' | 'accept' | 'reject';
    price: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered';
  };
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  attachments?: string[]; 
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'document', 'voice', 'negotiation'],
      default: 'text',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    negotiationData: {
      type: { type: String, enum: ['offer', 'counter', 'accept', 'reject'] },
      price: { type: Number },
      status: { type: String, enum: ['pending', 'accepted', 'rejected', 'countered'] },
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDelivered: { type: Boolean, default: true },
    deliveredAt: { type: Date, default: Date.now },
    attachments: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// To avoid recompiling model errors in dev
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;
