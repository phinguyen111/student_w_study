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
// CORS configuration - allow all origins in development, specific origins in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: No origin header, allowing request');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    // Vercel pattern to match all vercel.app domains
    const vercelPattern = /^https:\/\/.*\.vercel\.app$/;
    
    // Check if it's a Vercel domain
    const isVercelDomain = vercelPattern.test(origin);
    
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : [
          'http://localhost:3000',
          'https://codecatalyst.vercel.app',
          'https://code-catalyst-sigma.vercel.app',
          'https://student-w-study.vercel.app', // Frontend domain
          'https://codecatalyst-azure.vercel.app', // Backend domain (for same-origin requests)
        ];
    
    // Check if origin matches allowed origins
    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    
    // Allow if explicitly in list OR matches Vercel pattern
    const isAllowed = isExplicitlyAllowed || isVercelDomain;
    
    console.log('CORS: isVercelDomain:', isVercelDomain, 'isExplicitlyAllowed:', isExplicitlyAllowed, 'isAllowed:', isAllowed);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        console.log('CORS: Development mode, allowing all origins');
        callback(null, true);
      } else {
        console.log('CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
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

// Only listen if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}



