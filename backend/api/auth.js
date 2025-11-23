import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // Xóa file vừa upload nếu user không tồn tại
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }

    // Xóa avatar cũ nếu có (sau khi upload thành công)
    // Lưu thông tin avatar cũ để xóa sau
    const oldAvatarPath = user.avatar;

    // Lưu path avatar mới (relative từ public)
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    // Verify file đã được lưu
    console.log('File uploaded:', {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      exists: fs.existsSync(req.file.path)
    });
    
    // Save và log để debug
    console.log('Saving avatar path to database:', avatarPath);
    console.log('User before update:', { 
      id: user._id.toString(), 
      email: user.email,
      avatar: user.avatar 
    });
    
    // Update user với avatar mới
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      console.error('Failed to update user - user not found after update');
      // Xóa file nếu không update được
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: 'Failed to update user avatar' });
    }
    
    // Verify sau khi save - query lại từ database
    const verifyUser = await User.findById(userId);
    console.log('User after update (from DB):', { 
      id: verifyUser._id.toString(), 
      email: verifyUser.email,
      avatar: verifyUser.avatar 
    });
    
    // Đảm bảo avatar được set đúng
    if (!verifyUser.avatar || verifyUser.avatar !== avatarPath) {
      console.error('Avatar not saved correctly! Expected:', avatarPath, 'Got:', verifyUser.avatar);
      // Thử update lại
      verifyUser.avatar = avatarPath;
      await verifyUser.save();
      console.log('Retried saving avatar');
    }

    // Xóa avatar cũ sau khi đã lưu thành công avatar mới
    if (oldAvatarPath && oldAvatarPath !== avatarPath) {
      try {
        // Tạo thư mục backup nếu chưa có
        const backupDir = path.join(__dirname, '..', 'public', 'uploads', 'avatars', 'backup');
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        // Tìm file avatar cũ
        const possiblePaths = [
          path.join(__dirname, '..', 'public', oldAvatarPath),
          path.join(process.cwd(), 'backend', 'public', oldAvatarPath),
          path.join(process.cwd(), 'public', oldAvatarPath),
        ];
        
        let oldFileFound = false;
        for (const oldAvatarFullPath of possiblePaths) {
          if (fs.existsSync(oldAvatarFullPath)) {
            // Backup ảnh cũ vào thư mục backup (giữ lại) trước khi xóa
            const backupFileName = `backup-${Date.now()}-${path.basename(oldAvatarFullPath)}`;
            const backupPath = path.join(backupDir, backupFileName);
            
            try {
              fs.copyFileSync(oldAvatarFullPath, backupPath);
              console.log('Backed up old avatar to:', backupPath);
            } catch (backupError) {
              console.error('Error backing up old avatar:', backupError);
            }
            
            // Xóa ảnh cũ từ thư mục chính
            fs.unlinkSync(oldAvatarFullPath);
            console.log('Deleted old avatar from main directory:', oldAvatarFullPath);
            oldFileFound = true;
            break;
          }
        }
        
        if (!oldFileFound) {
          console.log('Old avatar file not found, may have been already deleted');
        }
        
        // Cleanup: Giữ lại tối đa 5 backup gần nhất, xóa các backup cũ hơn
        try {
          const backupFiles = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('backup-'))
            .map(file => ({
              name: file,
              path: path.join(backupDir, file),
              time: fs.statSync(path.join(backupDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Sắp xếp mới nhất trước
          
          // Xóa các backup cũ hơn 5 file gần nhất
          if (backupFiles.length > 5) {
            const filesToDelete = backupFiles.slice(5);
            filesToDelete.forEach(file => {
              try {
                fs.unlinkSync(file.path);
                console.log('Deleted old backup (keeping only 5 most recent):', file.name);
              } catch (err) {
                console.error('Error deleting old backup:', err);
              }
            });
          }
        } catch (cleanupError) {
          console.error('Error during backup cleanup:', cleanupError);
        }
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
        // Không throw error, avatar mới đã được lưu thành công
      }
    }

    // Lấy user mới nhất từ database để đảm bảo có avatar
    const finalUser = await User.findById(userId);
    
    res.json({
      success: true,
      avatar: finalUser.avatar || avatarPath,
      user: {
        id: finalUser._id,
        email: finalUser.email,
        name: finalUser.name,
        role: finalUser.role,
        avatar: finalUser.avatar || avatarPath
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    // Xóa file nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
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



