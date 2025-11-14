import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cache connection to avoid multiple connections
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if exists
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learncode', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't exit process in serverless environment
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
    // In Vercel, throw error instead of exiting
    throw error;
  }
};

export default connectDB;



