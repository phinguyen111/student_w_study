# LearnCode - Full Stack Learning Platform

Nền tảng học lập trình web full-stack với các tính năng học theo level, quiz, và theo dõi tiến độ.

## 🚀 Tính Năng

- ✅ Học HTML, CSS, JavaScript theo level (Level 1-3)
- ✅ Mỗi bài học có quiz riêng
- ✅ Tính điểm trung bình để mở khóa level tiếp theo
- ✅ Theo dõi tiến độ học, thời gian học, streak
- ✅ Admin dashboard quản lý người dùng và cấp phép mở level

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Dark mode support

## 📦 Cài Đặt

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI và JWT_SECRET của bạn
npm run seed  # Tạo dữ liệu mẫu
npm run dev   # Chạy server (port 5000)
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Chỉnh sửa .env.local nếu cần
npm run dev   # Chạy Next.js (port 3000)
```

## 👤 Tài Khoản Mẫu

Sau khi chạy seed:

- **Admin**: admin@learncode.com / admin123
- **User**: user@learncode.com / user123

## 📁 Cấu Trúc Dự Án

```
learncode/
├── backend/
│   ├── api/          # API routes
│   ├── models/       # MongoDB models
│   ├── middleware/   # Auth & error handling
│   ├── config/       # Database config
│   ├── seed.js       # Seed data
│   └── app.js        # Express app
│
└── frontend/
    ├── app/          # Next.js pages
    ├── components/   # React components
    ├── hooks/        # Custom hooks
    └── lib/          # Utilities
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Languages
- `GET /api/languages` - Lấy danh sách ngôn ngữ
- `GET /api/languages/:id` - Lấy chi tiết ngôn ngữ

### Lessons
- `GET /api/lessons/level/:levelId` - Lấy lessons của level
- `GET /api/lessons/:lessonId` - Lấy chi tiết lesson

### Progress
- `GET /api/progress` - Lấy tiến độ của user
- `POST /api/progress/quiz/:lessonId` - Nộp điểm quiz
- `POST /api/progress/time` - Cập nhật thời gian học

### Admin
- `GET /api/admin/users` - Lấy danh sách users
- `GET /api/admin/users/:userId/progress` - Lấy tiến độ user
- `POST /api/admin/users/:userId/unlock-level/:levelId` - Mở khóa level cho user

## 📝 Logic Quiz & Level Unlock

- Mỗi lesson có quiz riêng (multiple choice)
- Điểm mỗi bài lưu trong UserProgress
- Tính trung bình theo level
- Trung bình >= 7: tự động mở level tiếp theo
- Nếu không đạt: admin có thể phê duyệt mở level

## 📚 Importing Lessons from CodeSignal Learn

CodeSignal Learn không có public API. Để thêm bài học từ CodeSignal:

1. **Cách 1: Thêm vào seed.js**
   - Mở `backend/seed.js`
   - Thêm lesson mới vào phần tương ứng
   - Chạy `npm run seed`

2. **Cách 2: Sử dụng import script**
   - Mở `backend/scripts/import-codesignal.js`
   - Điền thông tin lesson
   - Chạy script

3. **Cách 3: Thêm qua Admin Dashboard**
   - Đăng nhập với tài khoản admin
   - Vào Admin Dashboard
   - Sử dụng API để thêm lesson mới

## 🎨 UI/UX

- Responsive design
- Dark mode (next-themes)
- shadcn/ui components
- Loading/Error states

## 📈 Mở Rộng

- Thêm nhiều ngôn ngữ (Python, React, NodeJS)
- Hệ thống achievements & ranking
- Forum cộng đồng
- Code editor tích hợp
- Video tutorials



