import mongoose from 'mongoose';
import { createClient } from 'redis';

async function testConnections() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odop';
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');
    await mongoose.disconnect();
  } catch (err: any) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }

  console.log('Testing Redis connection...');
  try {
    const client = createClient({ url: redisUrl });
    await client.connect();
    console.log('✅ Redis Connected');
    await client.disconnect();
  } catch (err: any) {
    console.error('❌ Redis Connection Failed:', err.message);
  }
}

testConnections();
