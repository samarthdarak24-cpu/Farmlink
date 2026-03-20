import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { getSocketServer } from '../realtime/socket';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'odop-connect-secret-key';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'chat');
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 10 * 1024 * 1024 } });

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const verifyToken = (authHeader: string | undefined) => {
  if (!authHeader) throw new Error('Authentication required');
  return jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as { userId: string };
};

// Get all conversations for authenticated user
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    const conversations = await Conversation.find({
      participants: decoded.userId,
    })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    res.json(conversations);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch conversations' });
  }
});

// Start new conversation or get existing one
router.post('/start', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { recipientId, initialMessage, orderId, rfqId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ error: 'Recipient ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [decoded.userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [decoded.userId, recipientId],
        orderId,
        rfqId,
      });
      await conversation.save();
    }

    // Add initial message if provided
    if (initialMessage) {
      const message = new Message({
        conversationId: conversation._id.toString(),
        senderId: decoded.userId,
        recipientId,
        content: initialMessage,
        isRead: false,
        isDelivered: true,
        deliveredAt: new Date(),
      });
      await message.save();

      // Update conversation's last message
      conversation.lastMessage = initialMessage;
      conversation.lastMessageAt = new Date();
      await conversation.save();
    }

    res.status(201).json(conversation);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to start conversation' });
  }
});

// Get messages for a conversation
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);

    // DEMO SUPPORT
    if (req.params.conversationId === 'demo-conv-id') {
      return res.json([
        {
          id: 'm1',
          conversationId: 'demo-conv-id',
          senderId: 'other-user',
          recipientId: decoded.userId,
          content: 'Hello! Is this product still available?',
          type: 'text',
          status: 'seen',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'm2',
          conversationId: 'demo-conv-id',
          senderId: decoded.userId,
          recipientId: 'other-user',
          content: 'Yes, it is! Are you interested in a bulk order?',
          type: 'text',
          status: 'seen',
          createdAt: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 'm3',
          conversationId: 'demo-conv-id',
          senderId: 'other-user',
          recipientId: decoded.userId,
          content: 'I was thinking about a price discount.',
          type: 'negotiation',
          negotiationData: { price: 450, status: 'pending' },
          status: 'delivered',
          createdAt: new Date(Date.now() - 3400000).toISOString(),
        }
      ]);
    }

    // Normal behavior
    let conversation;
    try {
      conversation = await Conversation.findById(req.params.conversationId);
    } catch {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation || !conversation.participants.includes(decoded.userId)) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: 'Failed to fetch messages' });
  }
});

// Upload file for chat (image, document, voice)
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File required' });
    const url = `/uploads/chat/${req.file.filename}`;
    res.status(201).json({ url, filename: req.file.originalname, size: req.file.size });
  } catch (e: any) {
    res.status(400).json({ error: 'Upload failed' });
  }
});

// Send message
router.post('/:conversationId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { content, recipientId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // DEMO SUPPORT
    if (req.params.conversationId === 'demo-conv-id') {
      return res.status(201).json({
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        conversationId: 'demo-conv-id',
        senderId: decoded.userId,
        recipientId: recipientId || 'demo-recipient-id',
        content,
        type: req.body.type || 'text',
        status: 'sent',
        createdAt: new Date().toISOString()
      });
    }

    // Normal behavior
    let conversation;
    try {
      conversation = await Conversation.findById(req.params.conversationId);
    } catch {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (!conversation || !conversation.participants.includes(decoded.userId)) {
      return res.status(403).json({ error: 'Not authorized to send messages to this conversation' });
    }

    const message = new Message({
      conversationId: req.params.conversationId,
      senderId: decoded.userId,
      recipientId:
        recipientId ||
        conversation.participants.find((p: string) => p !== decoded.userId),
      content,
      type: req.body.type || 'text',
      negotiationData: req.body.negotiationData,
      attachments: req.body.attachments || [],
      isRead: false,
      isDelivered: false,
      status: 'sent',
    });

    const savedMessage = await message.save();
    const recipientTarget = message.recipientId;

    getSocketServer()?.to(`user:${recipientTarget}`).emit('receive_message', {
      id: savedMessage._id,
      conversationId: savedMessage.conversationId,
      senderId: savedMessage.senderId,
      recipientId: savedMessage.recipientId,
      content: savedMessage.content,
      type: savedMessage.type,
      status: savedMessage.status,
      attachments: savedMessage.attachments,
      createdAt: savedMessage.createdAt,
    });

    // Update conversation's last message
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentCount = conversation.unreadCounts.get(recipientTarget) || 0;
    conversation.unreadCounts.set(recipientTarget, currentCount + 1);
    
    await conversation.save();

    res.status(201).json(savedMessage);
  } catch (error: any) {
    if (error.message === 'Authentication required') {
      return res.status(401).json({ error: error.message });
    }
    res.status(400).json({ error: error.message || 'Failed to send message' });
  }
});

// Update message status to seen
router.put('/seen/:conversationId', async (req: Request, res: Response) => {
  try {
    const decoded = verifyToken(req.headers.authorization);
    const { conversationId } = req.params;

    if (conversationId === 'demo-conv-id') return res.json({ success: true });

    await Message.updateMany(
      { conversationId, recipientId: decoded.userId, status: { $ne: 'seen' } },
      { $set: { status: 'seen', isRead: true, readAt: new Date() } }
    );

    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCounts.set(decoded.userId, 0);
      await conversation.save();
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update seen status' });
  }
});

// AI Smart Replies (integrate with ai-service when available)
router.post('/ai/smart-replies', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const r = await fetch(`${aiUrl}/api/chat/smart-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content || '' }),
      });
      if (r.ok) {
        const data: any = await r.json();
        return res.json({ suggestions: data.suggestions || [] });
      }
    } catch { /* fallback */ }
    const suggestions = ["Is the price negotiable?", "Can you provide more photos?", "When can you deliver?", "Sounds good, I'll take it."];
    res.json({ suggestions });
  } catch (error: any) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// AI Translation
router.post('/ai/translate', async (req: Request, res: Response) => {
  try {
    const { content, targetLang } = req.body;
    res.json({ translated: `[Translated to ${targetLang}]: ${content}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;