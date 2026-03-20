import mongoose from 'mongoose';

export const connectDB = async () => {
  const dbUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/odop';
  
  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(dbUrl);
      console.log(`\n🌿 MongoDB Connected successfully: ${conn.connection.host}`);
    } catch (error: any) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      console.warn('⚠️ Database not ready yet. Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    }
  };

  await connectWithRetry();
};
