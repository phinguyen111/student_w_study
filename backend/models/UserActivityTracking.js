import mongoose from 'mongoose';

const userActivityTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['tab_switch_away', 'tab_switch_back', 'page_leave', 'page_visit', 'window_blur', 'window_focus'],
    required: true
  },
  pageUrl: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  duration: {
    type: Number, // Duration in milliseconds
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // For any additional data
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userActivityTrackingSchema.index({ userId: 1, timestamp: -1 });
userActivityTrackingSchema.index({ action: 1, timestamp: -1 });

// TTL index to auto-delete old records after 90 days
userActivityTrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('UserActivityTracking', userActivityTrackingSchema);

