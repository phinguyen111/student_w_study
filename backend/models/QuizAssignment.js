import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.Mixed, // Support both string and {vi, en} format
    required: true
  },
  options: {
    type: [mongoose.Schema.Types.Mixed], // Support both string[] and [{vi, en}] format
    required: true
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: {
    type: mongoose.Schema.Types.Mixed // Support both string and {vi, en} format
  }
});

const quizAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    default: 7,
    min: 0,
    max: 10
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  deadline: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
quizAssignmentSchema.index({ assignedTo: 1, status: 1, deadline: 1 });
quizAssignmentSchema.index({ assignedBy: 1, createdAt: -1 });

// Auto-update status based on deadline
quizAssignmentSchema.methods.updateStatus = function() {
  const now = new Date();
  if (this.deadline < now && this.status === 'active') {
    this.status = 'expired';
  }
};

// Pre-save hook to update status
quizAssignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.updateStatus();
  next();
});

export default mongoose.model('QuizAssignment', quizAssignmentSchema);

