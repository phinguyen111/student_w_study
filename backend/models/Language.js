import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  name: {
    vi: { type: String },
    en: { type: String }
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    vi: { type: String },
    en: { type: String }
  },
  icon: {
    type: String
  },
  levels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Language', languageSchema);



