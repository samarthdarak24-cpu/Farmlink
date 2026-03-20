import { createClient } from 'redis';
import type { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const pubClient = createClient({ url: redisUrl });
export const subClient = pubClient.duplicate();
export const cacheClient = pubClient.duplicate();

let redisReady = false;

export const initializeRedis = async (io: SocketIOServer): Promise<void> => {
  try {
    await Promise.all([pubClient.connect(), subClient.connect(), cacheClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    redisReady = true;
    console.log('Redis connected: pub/sub/cache ready');
  } catch (error) {
    redisReady = false;
    console.warn('Redis unavailable, running without cache/adapter');
  }
};

export const isRedisReady = (): boolean => redisReady;
