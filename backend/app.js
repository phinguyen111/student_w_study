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

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
// CORS configuration - allow all origins in development, specific origins in production
const corsOptions = {
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:3000', 'https://codecatalyst.vercel.app'],
  credentials: true,
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



