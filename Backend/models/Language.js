const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true }, // ví dụ 'html', 'css', 'js'
  name: { type: String, required: true },
  summary: { type: String, default: '' },
  icon: { type: String, default: 'code' }, // Thêm trường icon để hiển thị trên UI
  levels: [{
    level: { type: Number, required: true },        // 1,2,3...
    title: { type: String, required: true },         // "Cơ bản", "Nâng cao"...
    description: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Language', LanguageSchema);