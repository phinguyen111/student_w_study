import express from 'express';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Simple CORS middleware for R2 routes
router.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all Vercel domains and localhost
  if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Require authentication for actual requests (not OPTIONS)
router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  return authenticate(req, res, next);
});

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Initialize R2 client
const createS3Client = () => {
  const config = {
    region: process.env.R2_REGION || 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  };
  
  console.log('R2 Client Config:', {
    region: config.region,
    endpoint: config.endpoint ? 'CONFIGURED' : 'MISSING',
    accessKeyId: config.credentials.accessKeyId ? 'CONFIGURED' : 'MISSING',
    secretAccessKey: config.credentials.secretAccessKey ? 'CONFIGURED' : 'MISSING',
    bucket: process.env.R2_BUCKET ? 'CONFIGURED' : 'MISSING',
  });

  return new S3Client(config);
};

// Generate presigned download URL
router.get('/presign-download', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }

    const s3Client = createS3Client();

    const getObjectParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
    };

    const downloadUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getObjectParams),
      { expiresIn: 3600 } // 1 hour expiration
    );

    res.json({ downloadUrl });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    res.status(500).json({ message: 'Failed to generate download URL', error: error.message });
  }
});

// Generate presigned upload URL
router.post('/presign-upload', async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName) {
      return res.status(400).json({ message: 'fileName is required' });
    }

    // Validate environment variables
    const missingEnvs = [];
    if (!process.env.R2_ENDPOINT) missingEnvs.push('R2_ENDPOINT');
    if (!process.env.R2_ACCESS_KEY_ID) missingEnvs.push('R2_ACCESS_KEY_ID');
    if (!process.env.R2_SECRET_ACCESS_KEY) missingEnvs.push('R2_SECRET_ACCESS_KEY');
    if (!process.env.R2_BUCKET) missingEnvs.push('R2_BUCKET');

    if (missingEnvs.length > 0) {
      console.error('Missing R2 environment variables:', missingEnvs);
      return res.status(500).json({ 
        message: 'R2 configuration is incomplete',
        missing: missingEnvs
      });
    }

    const s3Client = createS3Client();

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = fileName.split('.').pop();
    const nameWithoutExt = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]*$/, '');
    const key = `submissions/${nameWithoutExt}-${uniqueSuffix}.${ext}`;

    const putObjectParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    };

    console.log('Creating presigned upload URL for:', key);

    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(putObjectParams),
      { expiresIn: 3600 } // 1 hour expiration
    );

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;

    console.log('Presigned upload URL generated successfully');

    res.json({
      uploadUrl,
      key,
      fileUrl,
    });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    res.status(500).json({ 
      message: 'Failed to generate upload URL',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Upload file directly to R2 (bypass presigned URL to avoid CORS issues)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Validate environment variables
    const missingEnvs = [];
    if (!process.env.R2_ENDPOINT) missingEnvs.push('R2_ENDPOINT');
    if (!process.env.R2_ACCESS_KEY_ID) missingEnvs.push('R2_ACCESS_KEY_ID');
    if (!process.env.R2_SECRET_ACCESS_KEY) missingEnvs.push('R2_SECRET_ACCESS_KEY');
    if (!process.env.R2_BUCKET) missingEnvs.push('R2_BUCKET');

    if (missingEnvs.length > 0) {
      console.error('Missing R2 environment variables:', missingEnvs);
      return res.status(500).json({ 
        message: 'R2 configuration is incomplete',
        missing: missingEnvs
      });
    }

    const s3Client = createS3Client();

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = req.file.originalname.split('.').pop();
    const nameWithoutExt = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]*$/, '');
    const key = `submissions/${nameWithoutExt}-${uniqueSuffix}.${ext}`;

    const putObjectParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || 'application/octet-stream',
    };

    console.log('Uploading file to R2:', key);

    await s3Client.send(new PutObjectCommand(putObjectParams));

    const fileUrl = `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`;

    console.log('File uploaded successfully to R2:', fileUrl);

    res.json({
      success: true,
      key,
      fileUrl,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

export default router;
