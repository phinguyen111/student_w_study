import mongoose from 'mongoose';

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileAssignment',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileKey: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed'],
    default: 'submitted'
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now,
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
assignmentSubmissionSchema.index({ assignmentId: 1, userId: 1 });
assignmentSubmissionSchema.index({ userId: 1, submittedAt: -1 });

// Pre-save hook
assignmentSubmissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

