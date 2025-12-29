import express from 'express';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = express.Router();

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

export default router;
