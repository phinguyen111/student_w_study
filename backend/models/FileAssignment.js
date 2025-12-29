import mongoose from 'mongoose';

const fileAssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileKey: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
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
fileAssignmentSchema.index({ assignedTo: 1, status: 1, deadline: 1 });
fileAssignmentSchema.index({ assignedBy: 1, createdAt: -1 });

// Auto-update status based on deadline
fileAssignmentSchema.methods.updateStatus = function() {
  const now = new Date();
  if (this.deadline < now && this.status === 'active') {
    this.status = 'expired';
  }
};

// Pre-save hook to update status
fileAssignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.updateStatus();
  next();
});

export default mongoose.model('FileAssignment', fileAssignmentSchema);





