const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },        // sau này gắn auth thật
  langId: { type: String, required: true },
  completedLessonIds: { type: [String], default: [] }
}, { timestamps: true });

ProgressSchema.index({ userId: 1, langId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', ProgressSchema);
