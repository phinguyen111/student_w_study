import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  levelNumber: {
    type: Number,
    required: true
  },
  title: {
    vi: { type: String },
    en: { type: String }
  },
  description: {
    vi: { type: String },
    en: { type: String }
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique level number per language
levelSchema.index({ languageId: 1, levelNumber: 1 }, { unique: true });

export default mongoose.model('Level', levelSchema);



