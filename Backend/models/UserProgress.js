// Backend/models/UserProgress.js
const mongoose = require('mongoose');

const TimeStatSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, index: true },
  totalSeconds: { type: Number, default: 0 },
}, { _id: false });

const DailySchema = new mongoose.Schema({
  date: { type: String, required: true },  // YYYY-MM-DD
  seconds: { type: Number, default: 0 },
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  langId: { type: String, required: true, index: true },
  completedLessonIds: { type: [String], default: [] },

  // thời gian học
  timeStats: { type: [TimeStatSchema], default: [] }, // tổng theo bài
  daily: { type: [DailySchema], default: [] },        // tổng theo ngày

  // heartbeat gần nhất
  lastHeartbeatAt: { type: Date, default: null },
  lastLessonId: { type: String, default: null },
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, langId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
