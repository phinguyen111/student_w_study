// Backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không được ủy quyền, thiếu Bearer token' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) return res.status(401).json({ message: 'Token hợp lệ nhưng người dùng không tồn tại' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Không được ủy quyền, Token không hợp lệ/đã hết hạn' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới được phép' });
  }
  next();
};

module.exports = { protect, adminOnly };
