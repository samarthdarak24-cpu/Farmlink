import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import rfqRoutes from './routes/rfqs';
import messageRoutes from './routes/messages';
import aiRoutes from './routes/ai';
import blockchainRoutes from './routes/blockchain';
import notificationRoutes from './routes/notifications';
import negotiationRoutes from './routes/negotiations';
import contractRoutes from './routes/contracts';
import paymentsRoutes from './routes/payments';
import supplierRatingsRoutes from './routes/supplierRatings';
import buyerCartRoutes from './routes/buyerCart';
import logisticsRoutes from './routes/logistics';
import samplesRoutes from './routes/samples';
import tendersRoutes from './routes/tenders';
import path from 'path';
import { connectDB } from './config/db';
import { initializeRedis, pubClient } from './config/redis';
import { setSocketServer } from './realtime/socket';
import { startInventoryMonitor } from './jobs/inventoryMonitor';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

setSocketServer(io);
initializeRedis(io);
startInventoryMonitor();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/suppliers', supplierRatingsRoutes);
app.use('/api/buyer/cart', buyerCartRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/samples', samplesRoutes);
app.use('/api/tenders', tendersRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Socket.io for real-time messaging
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', async (payload: string | { token?: string; userId?: string }) => {
    try {
      let userId: string | undefined;
      if (typeof payload === 'string') {
        userId = payload;
      } else if (payload?.token) {
        const decoded = require('jsonwebtoken').verify(payload.token, process.env.JWT_SECRET || 'odop-connect-secret-key') as { userId: string };
        userId = decoded.userId;
      } else {
        userId = payload?.userId;
      }
      if (!userId) return;
      userSockets.set(userId, socket.id);
      socket.join(`user:${userId}`);
      await pubClient.set(`presence:${userId}`, 'online');
      await pubClient.set(`lastseen:${userId}`, new Date().toISOString());
      socket.broadcast.emit('user_status_change', { userId, status: 'online' });
    } catch {
      socket.emit('auth_error', { error: 'Invalid socket authentication' });
    }
  });

  socket.on('send_message', async (data: any) => {
    // Save to DB first in the route controller context, but here we emit
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receive_message', data);
      
      // Auto-acknowledge delivery if recipient is online
      socket.emit('message_delivered', { messageId: data.id, conversationId: data.conversationId });
    }
  });

  socket.on('message_seen', (data: { messageId: string; conversationId: string; senderId: string }) => {
    const senderSocketId = userSockets.get(data.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('message_seen_update', data);
    }
  });

  socket.on('typing_start', (data: { conversationId: string; recipientId: string }) => {
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { ...data, isTyping: true });
    }
  });

  socket.on('typing_stop', (data: { conversationId: string; recipientId: string }) => {
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { ...data, isTyping: false });
    }
  });

  socket.on('negotiation_update', (data: { recipientId: string; negotiation: any }) => {
    const recipientSocketId = userSockets.get(data.recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('negotiation_update', data);
    }
  });

  socket.on('disconnect', async () => {
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSockets.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      const lastSeen = new Date().toISOString();
      await pubClient.set(`presence:${disconnectedUserId}`, 'offline');
      await pubClient.set(`lastseen:${disconnectedUserId}`, lastSeen);
      
      socket.broadcast.emit('user_status_change', { 
        userId: disconnectedUserId, 
        status: 'offline',
        lastSeen 
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`
  🚀 ODOP Connect API Server
  ───────────────────────────
  Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});

export { io };