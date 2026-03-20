import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // Array of userIds
  orderId?: mongoose.Types.ObjectId;
  rfqId?: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCounts: Map<string, number>; // userId -> count
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    rfqId: { type: Schema.Types.ObjectId, ref: 'RFQ' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for finding conversations by participants
conversationSchema.index({ participants: 1, createdAt: -1 });

// To avoid recompiling model errors in dev
const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', conversationSchema);

export default Conversation;
