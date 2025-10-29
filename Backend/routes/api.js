const express = require('express');
const Language = require('../models/Language');
const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress'); // model mới
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User'); // Import User Model
const jwt = require('jsonwebtoken');   // Import JWT
// RẤT QUAN TRỌNG: Đảm bảo file này tồn tại và export { protect }

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
// 3. PROTECTED ROUTES - requires JWT via protect
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
router.post('/progress/track-heartbeat', protect, async (req, res, next) => {
  try {
    const { langId, lessonId } = req.body;
    const userId = req.user._id;
    if (!langId || !lessonId) return res.status(400).json({ message: 'Thiếu langId hoặc lessonId' });

    const now = new Date();
    const MAX_STEP = 30000; // tối đa 30s/nhịp (chống gian lận)
    const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

    const doc = await UserProgress.findOneAndUpdate(
      { userId, langId },
      { $setOnInsert: { userId, langId } },
      { new: true, upsert: true }
    );

    let delta = 0;
    if (doc.lastHeartbeatAt && doc.lastLessonId === lessonId) {
      delta = now - new Date(doc.lastHeartbeatAt);
      if (delta < 0) delta = 0;
      if (delta > MAX_STEP) delta = MAX_STEP;
    }
    const deltaSec = Math.floor(delta / 1000);

    // cập nhật “vết” heartbeat
    doc.lastHeartbeatAt = now;
    doc.lastLessonId = lessonId;

    if (deltaSec > 0) {
      // theo bài
      const tIdx = doc.timeStats.findIndex(t => t.lessonId === lessonId);
      if (tIdx >= 0) doc.timeStats[tIdx].totalSeconds += deltaSec;
      else doc.timeStats.push({ lessonId, totalSeconds: deltaSec });
      // theo ngày
      const dIdx = doc.daily.findIndex(d => d.date === dateKey);
      if (dIdx >= 0) doc.daily[dIdx].seconds += deltaSec;
      else doc.daily.push({ date: dateKey, seconds: deltaSec });
    }

    await doc.save();
    res.json({
      addedSeconds: deltaSec,
      totalLessonSeconds: doc.timeStats.find(t => t.lessonId === lessonId)?.totalSeconds || 0,
    });
  } catch (e) { next(e); }
});

// === Báo cáo thời gian học (chỉ admin) ===
router.get('/admin/usage', protect, adminOnly, async (_req, res, next) => {
  try {
    const docs = await UserProgress.find().populate('userId', 'name email role').lean();
    const report = docs.map(d => ({
      user: d.userId,
      langId: d.langId,
      totalSecondsAllLessons: (d.timeStats || []).reduce((s, t) => s + (t.totalSeconds || 0), 0),
      byLesson: (d.timeStats || []).map(t => ({ lessonId: t.lessonId, seconds: t.totalSeconds })),
      byDay: d.daily || [],
    }));
    res.json(report);
  } catch (e) { next(e); }
});
// ------------------------------------------
// 4. TRACK TIME & ADMIN REPORT
// ------------------------------------------

// Lưu thời gian học (heartbeat)
router.post('/progress/track-heartbeat', protect, async (req, res, next) => {
  try {
    const { langId, lessonId } = req.body;
    if (!langId || !lessonId) return res.status(400).json({ message: 'Thiếu langId hoặc lessonId' });

    const userId = req.user._id;
    const now = new Date();
    const MAX_STEP = 30000;
    const dateKey = now.toISOString().slice(0, 10);

    console.log('[HB] req', { userId: String(userId), langId, lessonId, at: now.toISOString() });

    let doc = await UserProgress.findOne({ userId, langId });
    if (!doc) {
      doc = await UserProgress.create({
        userId, langId, timeStats: [], daily: [],
        lastHeartbeatAt: now, lastLessonId: lessonId,
      });
      console.log('[HB] first doc created');
      return res.json({ addedSeconds: 0, totalLessonSeconds: 0 });
    }

    let delta = 0;
    if (doc.lastHeartbeatAt && doc.lastLessonId === lessonId) {
      delta = now - new Date(doc.lastHeartbeatAt);
      if (delta < 0) delta = 0;
      if (delta > MAX_STEP) delta = MAX_STEP;
    }
    const deltaSec = Math.floor(delta / 1000);

    doc.lastHeartbeatAt = now;
    doc.lastLessonId = lessonId;

    if (deltaSec > 0) {
      const t = doc.timeStats.find(x => x.lessonId === lessonId);
      if (t) t.totalSeconds += deltaSec;
      else doc.timeStats.push({ lessonId, totalSeconds: deltaSec });

      const d = doc.daily.find(x => x.date === dateKey);
      if (d) d.seconds += deltaSec;
      else doc.daily.push({ date: dateKey, seconds: deltaSec });
    }

    await doc.save();
    const totalForLesson = doc.timeStats.find(t => t.lessonId === lessonId)?.totalSeconds || 0;
    console.log('[HB] saved', { deltaSec, totalForLesson });
    res.json({ addedSeconds: deltaSec, totalLessonSeconds: totalForLesson });
  } catch (e) { 
    console.error('[HB] error', e);
    next(e);
  }
});


// ========== 2) User xem tiến trình của chính mình ==========
router.get('/progress/me', protect, async (req, res, next) => {
  try {
    const { langId } = req.query;
    if (!langId) return res.status(400).json({ message: 'Thiếu langId' });
    const doc = await UserProgress.findOne({ userId: req.user._id, langId }).lean();
    res.json(doc || {});
  } catch (e) { next(e); }
});

// ========== 3) Admin dashboard tổng hợp ==========
// GET /api/admin/usage
router.get('/admin/usage', protect, adminOnly, async (req, res, next) => {
  try {
    const { from, to, langId, userId } = req.query;
    const match = {};
    if (langId) match.langId = String(langId);
    if (userId) match.userId = new mongoose.Types.ObjectId(String(userId));

    const progress = await UserProgress.find(match).lean();

    // lọc daily theo khoảng ngày (nếu có)
    const inRange = (d) => {
      if (from && d.date < from) return false;
      if (to && d.date > to) return false;
      return true;
    };

    const byKey = new Map();
    for (const p of progress) {
      const daily = (p.daily || []).filter(inRange);
      const totalSecondsAllLessons = (p.timeStats || []).reduce((s, t) => s + (t.totalSeconds || 0), 0);
      byKey.set(`${p.userId}-${p.langId}`, {
        userId: p.userId, langId: p.langId,
        totalSecondsAllLessons,
        byLesson: p.timeStats || [],
        byDay: daily,
        lastHeartbeatAt: p.lastHeartbeatAt,
        lastLessonId: p.lastLessonId,
      });
    }

    const userIds = [...new Set(progress.map(p => String(p.userId)))];
    const users = await User.find({ _id: { $in: userIds } }, '_id name email role').lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const report = [...byKey.values()].map(r => ({
      ...r,
      user: userMap.get(String(r.userId)) || null,
    }));

    res.json({ report }); // <- QUAN TRỌNG: luôn trả {report}
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