const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  type: { type: String, enum: ['theory','demo'], required: true },
  heading: { type: String, required: true },
  content: { type: String }, // markdown cho theory
  demoPayload: {
    html: String,
    css: String,
    js: String
  }
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },   // ví dụ 'html-02-tags'
  langId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  level: { type: Number, default: 1 },               // gắn với levels của Language
  order: { type: Number, default: 1 },
  sections: [SectionSchema]
}, { timestamps: true });

LessonSchema.index({ langId: 1, order: 1 });         // list theo thứ tự

module.exports = mongoose.model('Lesson', LessonSchema);
