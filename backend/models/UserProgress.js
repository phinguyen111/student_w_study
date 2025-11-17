import mongoose from 'mongoose';

const timeStatSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  minutes: {
    type: Number,
    default: 0
  }
});

const levelScoreSchema = new mongoose.Schema({
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  averageScore: {
    type: Number,
    default: 0
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  unlockedBy: {
    type: String,
    enum: ['auto', 'admin'],
    default: 'auto'
  },
  unlockedAt: {
    type: Date
  },
  adminApproved: {
    type: Boolean,
    default: false
  }
});

const lessonScoreSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  codeScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 20,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  quizAttempts: {
    type: Number,
    default: 0
  },
  codeAttempts: {
    type: Number,
    default: 0
  },
  // Track quiz session ID for detailed tracking analysis
  quizSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSessionTracking',
    default: null
  },
  // Track time spent on quiz (in milliseconds)
  quizTimeSpent: {
    type: Number,
    default: null
  }
});

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedLessonIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  lessonScores: [lessonScoreSchema],
  levelScores: [levelScoreSchema],
  timeStats: [timeStatSchema],
  currentStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date
  },
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
userProgressSchema.index({ userId: 1 });

export default mongoose.model('UserProgress', userProgressSchema);



