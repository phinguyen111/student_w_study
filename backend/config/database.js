import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Cache connection to avoid multiple connections
let cachedConnection = null;
let isConnecting = false;
let connectionPromise = null;

const connectDB = async (retries = 3) => {
  // Return cached connection if exists and ready
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // If already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Check if MONGODB_URI is set
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    const error = new Error('MONGODB_URI is not set in environment variables');
    console.error('❌ MongoDB Configuration Error:', error.message);
    console.error('💡 Please set MONGODB_URI in your environment variables');
    throw error;
  }

  // Log connection attempt (without exposing full URI)
  const uriPreview = mongoUri.includes('@') 
    ? mongoUri.split('@')[1] 
    : mongoUri.substring(0, 30) + '...';
  console.log(`🔄 Attempting to connect to MongoDB: ${uriPreview}`);

  isConnecting = true;
  connectionPromise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📡 MongoDB connection attempt ${attempt}/${retries}...`);
        
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 15000, // 15 seconds
          socketTimeoutMS: 45000, // Socket timeout
          connectTimeoutMS: 15000, // Connection timeout
          maxPoolSize: 10, // Maximum number of connections
          minPoolSize: 1, // Minimum number of connections
          retryWrites: true,
          w: 'majority',
        });
        
        // Disable mongoose buffering after connection
        mongoose.set('bufferCommands', false);
        
        console.log(`✅ MongoDB Connected successfully!`);
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Ready State: ${mongoose.connection.readyState}`);
        
        cachedConnection = conn;
        isConnecting = false;
        return conn;
      } catch (error) {
        console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`);
        console.error(`   Error: ${error.message}`);
        
        if (error.name === 'MongoServerSelectionError') {
          console.error(`   💡 This usually means:`);
          console.error(`      - MongoDB server is not reachable`);
          console.error(`      - Network access is blocked (check MongoDB Atlas Network Access)`);
          console.error(`      - Connection string is incorrect`);
        } else if (error.name === 'MongoAuthenticationError') {
          console.error(`   💡 Authentication failed - check username/password in MONGODB_URI`);
        }
        
        // If this is the last attempt, throw error
        if (attempt === retries) {
          isConnecting = false;
          connectionPromise = null;
          // Don't exit process in serverless environment
          if (process.env.VERCEL !== '1') {
            console.error('💥 Exiting process due to MongoDB connection failure');
            process.exit(1);
          }
          // In Vercel, throw error instead of exiting
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`   ⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
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

    // Check connection state
    const readyState = mongoose.connection.readyState;
    const stateNames = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`🔍 Current MongoDB state: ${stateNames[readyState]} (${readyState})`);

    // Try to connect
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ Database connection failed in middleware:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Error Name: ${error.name}`);
    
    // Provide more helpful error messages
    let errorMessage = 'Database connection failed. Please try again later.';
    let errorDetails = null;

    if (error.message.includes('MONGODB_URI is not set')) {
      errorMessage = 'Database configuration error: MONGODB_URI is not set.';
      errorDetails = 'Please configure MONGODB_URI in environment variables.';
    } else if (error.name === 'MongoServerSelectionError') {
      errorMessage = 'Cannot connect to MongoDB server.';
      errorDetails = 'Please check: 1) MongoDB server is running, 2) Network access is allowed, 3) Connection string is correct.';
    } else if (error.name === 'MongoAuthenticationError') {
      errorMessage = 'MongoDB authentication failed.';
      errorDetails = 'Please check username and password in MONGODB_URI.';
    }

    return res.status(503).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? errorDetails || error.message : undefined,
      errorName: process.env.NODE_ENV === 'development' ? error.name : undefined
    });
  }
};

export default connectDB;



