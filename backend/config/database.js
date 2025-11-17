import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cache connection to avoid multiple connections
let cachedConnection = null;
let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  // Return cached connection if exists and ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learncode', {
        serverSelectionTimeoutMS: 10000, // Increase to 10s
        socketTimeoutMS: 45000, // Socket timeout
        connectTimeoutMS: 10000, // Connection timeout
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 1, // Minimum number of connections
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      cachedConnection = conn;
      isConnecting = false;
      return conn;
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}`);
      isConnecting = false;
      connectionPromise = null;
      // Don't exit process in serverless environment
      if (process.env.VERCEL !== '1') {
        process.exit(1);
      }
      // In Vercel, throw error instead of exiting
      throw error;
    }
  })();

  return connectionPromise;
};

// Middleware to ensure DB connection before handling requests
export const ensureConnection = async (req, res, next) => {
  // Skip DB check for health endpoint
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return next();
    }

    // Try to connect
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed in middleware:', error.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default connectDB;



