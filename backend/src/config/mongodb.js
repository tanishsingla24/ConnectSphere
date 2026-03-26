import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);

    const fallbackUri = process.env.MONGODB_FALLBACK_URI || 'mongodb://localhost:27017/interest-video-chat';
    if (process.env.MONGO_URI !== fallbackUri) {
      console.warn(`⚠️ Attempting fallback MongoDB URI: ${fallbackUri}`);
      try {
        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log(`✓ MongoDB Connected (fallback): ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`✗ Fallback MongoDB Connection Error: ${fallbackError.message}`);
        console.error('Full fallback error:', fallbackError);
      }
    }

    process.exit(1);
  }
};

export default connectDB;
