import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'code'],
    required: true,
    default: 'multiple-choice'
  },
  question: {
    type: mongoose.Schema.Types.Mixed, // Support both string and {vi, en} format
    required: true
  },
  // Fields for multiple-choice questions
  options: {
    type: [mongoose.Schema.Types.Mixed], // Support both string[] and [{vi, en}] format
    required: function() {
      return this.type === 'multiple-choice';
    }
  },
  correctAnswer: {
    type: Number,
    required: function() {
      return this.type === 'multiple-choice';
    },
    min: 0
  },
  // Fields for code questions
  codeType: {
    type: String,
    enum: ['html', 'css', 'javascript', 'html-css-js'],
    required: function() {
      return this.type === 'code';
    }
  },
  starterCode: {
    type: {
      html: String,
      css: String,
      javascript: String
    },
    required: function() {
      return this.type === 'code';
    }
  },
  expectedOutput: {
    type: String,
    required: function() {
      return this.type === 'code';
    }
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

