import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = express.Router();

// Initialize R2 client
const s3Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Generate presigned download URL
router.get('/presign-download', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: 'key is required' });
    }

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
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ message: 'Failed to generate download URL' });
  }
});

// Generate presigned upload URL
router.post('/presign-upload', async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName) {
      return res.status(400).json({ message: 'fileName is required' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = fileName.split('.').pop();
    const name = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]*$/, '');
    const key = `submissions/${name}-${uniqueSuffix}.${ext}`;

    const putObjectParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    };

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand(putObjectParams),
      { expiresIn: 3600 } // 1 hour expiration
    );

    res.json({
      uploadUrl,
      key,
      fileUrl: `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET}/${key}`,
    });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
});

export default router;
