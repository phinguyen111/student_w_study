const express = require('express');
const Language = require('../models/Language');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User'); // Import User Model
const jwt = require('jsonwebtoken');   // Import JWT
// RẤT QUAN TRỌNG: Đảm bảo file này tồn tại và export { protect }
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// ------------------------------------------
// HELPER: Hàm tạo JSON Web Token (JWT)
// ------------------------------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};


// ------------------------------------------
// 1. AUTH ROUTES: Xử lý Đăng nhập
// ------------------------------------------
router.post('/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // 1. Tìm User
        const user = await User.findOne({ email });

        // 2. Kiểm tra User và Mật khẩu (dùng matchPassword từ User Model)
        if (user && (await user.matchPassword(password))) {
            
            // Đăng nhập thành công
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user._id), // Tạo Token
            });
            
        } else {
            // Đăng nhập thất bại: Lỗi 401
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }
    } catch (e) {
        next(e);
    }
});


// ------------------------------------------
// 2. PUBLIC/READ ROUTES (Không cần xác thực)
// ------------------------------------------

// health
router.get('/healthz', (req, res) => res.json({ ok: true }));

// languages (lấy danh sách ngôn ngữ)
router.get('/languages', async (req, res, next) => {
    try {
        const langs = await Language.find({}).lean();
        res.json(langs);
    } catch (e) { next(e); }
});

// languages (lấy chi tiết ngôn ngữ)
router.get('/languages/:langId', async (req, res, next) => {
    try {
        const lang = await Language.findOne({ id: req.params.langId }).lean();
        if (!lang) return res.status(404).json({ message: 'Language not found' });
        res.json(lang);
    } catch (e) { next(e); }
});

// lessons (lấy danh sách bài học theo ngôn ngữ, hỗ trợ ?level=1|2|3)
router.get('/languages/:langId/lessons', async (req, res, next) => {
    try {
        const q = { langId: req.params.langId };
        if (req.query.level) q.level = Number(req.query.level);
        const lessons = await Lesson.find(q).sort({ order: 1 }).lean();
        res.json(lessons);
    } catch (e) { next(e); }
});

// lessons (lấy chi tiết bài học)
router.get('/lessons/:lessonId', async (req, res, next) => {
    try {
        const lesson = await Lesson.findOne({ id: req.params.lessonId }).lean();
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        res.json(lesson);
    } catch (e) { next(e); }
});

// ------------------------------------------
// 3. PROTECTED ROUTES (Cần xác thực JWT bằng middleware protect)
// ------------------------------------------

// progress (Lấy tiến độ cá nhân)
router.get('/progress/:langId', protect, async (req, res, next) => { 
    try {
        // req.user được gán từ middleware 'protect'
        const userId = req.user._id; 
        const langId = req.params.langId;
        const progress = await UserProgress.findOne({ userId, langId }).lean();
        const total = await Lesson.countDocuments({ langId });
        const completed = progress ? progress.completedLessonIds.length : 0;
        const percent = total ? Math.round((completed / total) * 100) : 0;
        
        res.json({ userId, completed, total, percent, completedLessonIds: progress ? progress.completedLessonIds : [] });
    } catch (e) { next(e); }
});

// mark-complete (Lưu tiến độ bài học đã hoàn thành)
router.post('/progress/mark-complete', protect, async (req, res, next) => { 
    try {
        // req.user được gán từ middleware 'protect'
        const userId = req.user._id; 
        const { lessonId } = req.body;
        
        const lesson = await Lesson.findOne({ id: lessonId }).lean();
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        
        const doc = await UserProgress.findOneAndUpdate(
            { userId, langId: lesson.langId },
            { $addToSet: { completedLessonIds: lessonId } },
            { upsert: true, new: true } // upsert: nếu chưa có thì tạo mới
        );
        
        res.json(doc);
    } catch (e) { next(e); }
});

module.exports = router;