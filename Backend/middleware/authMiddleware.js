const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User Model

// Hàm middleware để bảo vệ các route (kiểm tra token JWT)
const protect = async (req, res, next) => {
    let token;

    // 1. Kiểm tra header Authorization (ví dụ: 'Bearer <token>')
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ chuỗi 'Bearer '
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token (verify)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm user dựa trên ID trong token và loại bỏ mật khẩu
            req.user = await User.findById(decoded.id).select('-password');

            // Nếu không tìm thấy user, trả lỗi 401
            if (!req.user) {
                return res.status(401).json({ message: 'Token không hợp lệ, người dùng không tồn tại' });
            }
            
            // Chuyển sang middleware/route tiếp theo
            next();
        } catch (error) {
            console.error(error);
            // Token không hợp lệ (hết hạn, sai secret,...)
            return res.status(401).json({ message: 'Không được ủy quyền, Token thất bại' });
        }
    }

    // 2. Nếu không có token trong header
    if (!token) {
        return res.status(401).json({ message: 'Không được ủy quyền, không có Token' });
    }
};

module.exports = { protect };