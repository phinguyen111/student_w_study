import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Helper to check DB connection
const checkDBConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected');
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    checkDBConnection();
    
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password, name });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    checkDBConnection();
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    checkDBConnection();
    // Query lại từ database để đảm bảo có đầy đủ thông tin
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar || null
      }
    });
  } catch (error) {
    res.status(503).json({ message: 'Database connection error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    checkDBConnection();
    
    const { name, email } = req.body;
    const userId = req.user._id;

    if (!name && !email) {
      return res.status(400).json({ message: 'Please provide name or email to update' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      updateData.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    checkDBConnection();
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Lưu thông tin avatar cũ để xóa sau
    const oldAvatarUrl = user.avatar;

    // Upload lên Cloudinary
    const cloudinary = (await import('../config/cloudinary.js')).default;
    
    // Kiểm tra nếu Cloudinary chưa được config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
      });
    }
    
    // Convert buffer to base64 string
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        {
          folder: 'avatars',
          public_id: `avatar-${userId}-${Date.now()}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    const avatarUrl = uploadResult.secure_url;
    
    console.log('File uploaded to Cloudinary:', {
      url: avatarUrl,
      public_id: uploadResult.public_id,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Update user với avatar mới
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      // Xóa ảnh trên Cloudinary nếu không update được
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (deleteError) {
        console.error('Error deleting uploaded image from Cloudinary:', deleteError);
      }
      return res.status(500).json({ message: 'Failed to update user avatar' });
    }
    
    // Xóa avatar cũ trên Cloudinary nếu có
    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl && oldAvatarUrl.includes('cloudinary.com')) {
      try {
        // Extract public_id từ URL cũ
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        // Hoặc: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{format}
        const urlMatch = oldAvatarUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        if (urlMatch && urlMatch[1]) {
          const publicId = urlMatch[1];
          await cloudinary.uploader.destroy(publicId);
          console.log('Deleted old avatar from Cloudinary:', publicId);
        } else {
          console.log('Could not extract public_id from old avatar URL:', oldAvatarUrl);
        }
      } catch (deleteError) {
        console.error('Error deleting old avatar from Cloudinary:', deleteError);
        // Không throw error, avatar mới đã được lưu thành công
      }
    }

    // Lấy user mới nhất từ database để đảm bảo có avatar
    const finalUser = await User.findById(userId);
    
    res.json({
      success: true,
      avatar: finalUser.avatar || avatarUrl,
      user: {
        id: finalUser._id,
        email: finalUser.email,
        name: finalUser.name,
        role: finalUser.role,
        avatar: finalUser.avatar || avatarUrl
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: error.message || 'Failed to upload avatar' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    checkDBConnection();
    
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;



