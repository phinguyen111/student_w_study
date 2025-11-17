import mongoose from 'mongoose';

const quizAssignmentResultSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAssignment',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  passingScore: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  timeTaken: {
    type: Number, // in milliseconds
    default: 0
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['submitted', 'abandoned'],
    default: 'submitted'
  },
  abandonReason: {
    type: String,
    enum: ['user_choice', 'tab_switch', 'tab_switch_timeout', 'tab_close', 'browser_leave', 'no_choice', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true
});

// Ensure one result per user per assignment (latest attempt)
quizAssignmentResultSchema.index({ assignmentId: 1, userId: 1 });

// Compound index for queries
quizAssignmentResultSchema.index({ userId: 1, submittedAt: -1 });
quizAssignmentResultSchema.index({ assignmentId: 1, score: -1 });

export default mongoose.model('QuizAssignmentResult', quizAssignmentResultSchema);

