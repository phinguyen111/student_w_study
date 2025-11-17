import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './api/auth.js';
import languagesRoutes from './api/languages.js';
import lessonsRoutes from './api/lessons.js';
import progressRoutes from './api/progress.js';
import adminRoutes from './api/admin.js';
import activityRoutes from './api/activity.js';
import quizTrackingRoutes from './api/quizTracking.js';

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
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : [
          'http://localhost:3000',
          'https://codecatalyst.vercel.app',
          'https://code-catalyst-sigma.vercel.app',
          /^https:\/\/.*\.vercel\.app$/, // Allow all Vercel preview deployments
        ];
    
    // Check if origin matches allowed origins
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/quiz-tracking', quizTrackingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

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



