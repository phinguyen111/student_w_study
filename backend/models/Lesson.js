import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.Mixed, // Support both string and {vi, en} format
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'code'],
    default: 'multiple-choice'
  },
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
  explanation: {
    type: mongoose.Schema.Types.Mixed // Support both string and {vi, en} format
  },
  // Code question fields
  codeType: {
    type: String,
    enum: ['html', 'css', 'javascript', 'html-css-js'],
    required: function() {
      return this.type === 'code';
    }
  },
  starterCode: {
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    javascript: { type: String, default: '' }
  },
  expectedOutput: {
    type: String,
    required: function() {
      return this.type === 'code';
    }
  }
});

const lessonSchema = new mongoose.Schema({
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  lessonNumber: {
    type: Number,
    required: true
  },
  title: {
    vi: { type: String },
    en: { type: String }
  },
  content: {
    vi: { type: String },
    en: { type: String }
  },
  codeExample: {
    type: String
  },
  codeExercise: {
    starterCode: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      enum: ['html', 'javascript', 'css', 'python'],
      default: 'html'
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' }
    }
  },
  quiz: {
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 7
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique lesson number per level
lessonSchema.index({ levelId: 1, lessonNumber: 1 }, { unique: true });

export default mongoose.model('Lesson', lessonSchema);



