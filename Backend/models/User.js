const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') 

const UserSchema = new mongoose.Schema(
{
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    sparse: true 
  },
  password: { 
    type: String, 
    required: true
  },
  name: { type: String, required: true },
  avatar: { type: String, default: 'https://i.pravatar.cc/150?img=default' },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // ------------------------------------------
  // BỔ SUNG TRƯỜNG LƯU TIẾN TRÌNH HỌC CÁ NHÂN
  // ------------------------------------------
  totalXp: { 
    type: Number, 
    default: 0 
  }, // Tổng điểm kinh nghiệm
  currentStreak: { 
    type: Number, 
    default: 0 
  }, // Số ngày học liên tiếp
  lastActivityDate: { 
    type: Date, 
    default: null 
  }, // Ngày hoạt động cuối cùng (dùng tính streak)
  lessonsCompletedCount: { 
    type: Number, 
    default: 0 
  }, // Tổng số bài học đã hoàn thành
  // ------------------------------------------

},
{ timestamps: true }
)

// Middleware: Mã hóa mật khẩu trước khi lưu (Giữ nguyên)
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method: So sánh mật khẩu (Giữ nguyên)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.models.User || mongoose.model('User', UserSchema)