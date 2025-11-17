import mongoose from 'mongoose';

const tabSwitchSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // Duration in milliseconds spent on this tab/website
    default: 0
  },
  action: {
    type: String,
    enum: ['switch_away', 'switch_back', 'window_blur', 'window_focus', 'navigation'],
    required: true
  },
  domain: {
    type: String,
    default: ''
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  route: {
    type: String, // Path/route of the external website (e.g., /chat, /search)
    default: ''
  },
  pageInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const quizSessionTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAssignment',
    index: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    index: true
  },
  quizType: {
    type: String,
    enum: ['assignment', 'lesson'],
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  submitTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  // Total time from start to submit (including away time)
  totalDuration: {
    type: Number, // in milliseconds
    default: 0
  },
  // Actual time spent actively on quiz (excluding away time)
  activeDuration: {
    type: Number, // in milliseconds
    default: 0
  },
  // Total time away from quiz (tab switches, window blur, etc.)
  awayDuration: {
    type: Number, // in milliseconds
    default: 0
  },
  // Detailed tracking of tab switches
  tabSwitches: [tabSwitchSchema],
  // Count of different events
  tabSwitchCount: {
    type: Number,
    default: 0
  },
  windowBlurCount: {
    type: Number,
    default: 0
  },
  visibilityChangeCount: {
    type: Number,
    default: 0
  },
  // Track suspicious activities
  suspiciousActivities: [{
    type: {
      type: String,
      enum: ['rapid_tab_switch', 'long_away_time', 'multiple_blur', 'unusual_pattern']
    },
    timestamp: Date,
    description: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  // URL domains visited (to detect ChatGPT, Facebook, etc.)
  visitedDomains: [{
    domain: String,
    count: Number,
    totalDuration: Number, // Total time spent on this domain
    firstVisit: Date,
    lastVisit: Date
  }],
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Is this session still active
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
quizSessionTrackingSchema.index({ userId: 1, createdAt: -1 });
quizSessionTrackingSchema.index({ assignmentId: 1, userId: 1 });
quizSessionTrackingSchema.index({ lessonId: 1, userId: 1 });
quizSessionTrackingSchema.index({ quizType: 1, isActive: 1 });

// Method to extract domain from URL
quizSessionTrackingSchema.methods.extractDomain = function(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
};

// Method to update visited domain
quizSessionTrackingSchema.methods.updateVisitedDomain = function(domain, duration) {
  const existing = this.visitedDomains.find(d => d.domain === domain);
  if (existing) {
    existing.count += 1;
    existing.totalDuration += duration;
    existing.lastVisit = new Date();
  } else {
    this.visitedDomains.push({
      domain,
      count: 1,
      totalDuration: duration,
      firstVisit: new Date(),
      lastVisit: new Date()
    });
  }
};

export default mongoose.model('QuizSessionTracking', quizSessionTrackingSchema);

