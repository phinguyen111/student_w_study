import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB, { ensureConnection } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './api/auth.js';
import languagesRoutes from './api/languages.js';
import lessonsRoutes from './api/lessons.js';
import progressRoutes from './api/progress.js';
import adminRoutes from './api/admin.js';
import activityRoutes from './api/activity.js';
import quizTrackingRoutes from './api/quizTracking.js';
import r2Routes from './api/r2.js';

dotenv.config();

const app = express();

// Connect to database (async, but don't block server startup)
// In Vercel serverless, connection will be established on first request
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  // Don't crash the server, let it try to connect on first request
});

// Middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: No origin header, allowing request');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    // Allow specific Vercel domains
    const allowedOrigins = [
      /^https:\/\/.*\.vercel\.app$/, // All Vercel domains
      /^http:\/\/localhost/, // Local development
      /^http:\/\/127\.0\.0\.1/, // Local development
    ];
    
    const isAllowed = allowedOrigins.some(pattern => 
      pattern instanceof RegExp ? pattern.test(origin) : pattern === origin
    );
    
    if (isAllowed) {
      console.log('CORS: Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Origin not allowed:', origin);
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
const publicUploadsPath = path.join(__dirname, 'public', 'uploads');
console.log('Static files path:', publicUploadsPath);
console.log('Static files exists:', fs.existsSync(publicUploadsPath));

app.use('/uploads', express.static(publicUploadsPath, {
  setHeaders: (res, filePath) => {
    // Set CORS headers for images
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=31536000');
    console.log('Serving static file:', filePath);
  }
}));

// Health check (no DB required)
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// Test endpoint để kiểm tra static files
app.get('/api/test-uploads', (req, res) => {
  const avatarsDir = path.join(__dirname, 'public', 'uploads', 'avatars');
  try {
    const files = fs.readdirSync(avatarsDir).filter(f => !f.startsWith('backup'));
    res.json({ 
      success: true, 
      path: avatarsDir,
      exists: fs.existsSync(avatarsDir),
      files: files 
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message,
      path: avatarsDir,
      exists: fs.existsSync(avatarsDir)
    });
  }
});

// Ensure DB connection for all API routes (except health check)
app.use('/api', ensureConnection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/quiz-tracking', quizTrackingRoutes);
app.use('/api/r2', r2Routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Export app for Vercel serverless functions
export default app;



