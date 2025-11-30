# Tóm Tắt Backend - LearnCode Platform

## 📋 Tổng Quan
Backend được xây dựng bằng **Node.js** với **Express.js**, sử dụng **MongoDB** (Mongoose) làm database. Hệ thống hỗ trợ học lập trình với quiz, bài tập code, tracking user activity, và quản lý admin.

---

## 🛠️ Công Nghệ & Dependencies

### Core Dependencies
- **express** (^4.18.2) - Web framework
- **mongoose** (^8.0.3) - MongoDB ODM
- **jsonwebtoken** (^9.0.2) - JWT authentication
- **bcryptjs** (^2.4.3) - Password hashing
- **cors** (^2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (^16.3.1) - Environment variables
- **multer** (^2.0.2) - File upload middleware
- **cloudinary** (^2.8.0) - Cloud image storage

### CodeMirror (Code Editor)
- @codemirror/autocomplete
- @codemirror/commands
- @codemirror/language
- @codemirror/lint

---

## 📁 Cấu Trúc Thư Mục

```
backend/
├── api/                    # API routes
│   ├── auth.js            # Authentication & user management
│   ├── languages.js       # Language endpoints
│   ├── lessons.js         # Lesson endpoints
│   ├── progress.js        # User progress & quiz submission
│   ├── admin.js           # Admin management endpoints
│   ├── activity.js        # User activity tracking
│   └── quizTracking.js    # Quiz session tracking
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection
│   └── cloudinary.js      # Cloudinary config
├── middleware/            # Express middleware
│   ├── auth.js            # JWT authentication & admin check
│   ├── upload.js          # Multer file upload config
│   └── errorHandler.js    # Error handling
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Language.js
│   ├── Level.js
│   ├── Lesson.js
│   ├── UserProgress.js
│   ├── QuizAssignment.js
│   ├── QuizAssignmentResult.js
│   ├── QuizSessionTracking.js
│   └── UserActivityTracking.js
└── utils/
    └── i18n.js            # Internationalization helper
```

---

## 🔌 API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /register` - Đăng ký user mới
- `POST /login` - Đăng nhập, trả về JWT token
- `GET /me` - Lấy thông tin user hiện tại (authenticate)
- `PUT /profile` - Cập nhật name, email (authenticate)
- `PUT /change-password` - Đổi mật khẩu (authenticate)
- `POST /avatar` - Upload avatar lên Cloudinary (authenticate, multer)

### 2. Languages (`/api/languages`)
- `GET /` - Lấy tất cả languages (authenticate)
- `GET /:langId` - Lấy language với levels và unlock status (authenticate)

### 3. Lessons (`/api/lessons`)
- `GET /level/:levelId` - Lấy tất cả lessons của một level (authenticate)
- `GET /:lessonId` - Lấy chi tiết một lesson (authenticate)

### 4. Progress (`/api/progress`)
- `GET /` - Lấy user progress (authenticate)
- `GET /leaderboard` - Public leaderboard theo language
- `POST /quiz/:lessonId` - Submit quiz score cho lesson (authenticate)
- `POST /code/:lessonId` - Submit code exercise score (authenticate)
- `POST /time` - Update study time (authenticate)
- `GET /quiz-assignments` - Lấy quiz assignments của user (authenticate)
- `GET /quiz-assignments/:id` - Lấy chi tiết quiz assignment (authenticate)
- `POST /quiz-assignments/:id/submit` - Submit quiz assignment (authenticate)
- `POST /quiz-assignments/:id/abandon` - Abandon quiz assignment (authenticate)
- `GET /quiz-assignments/results` - Lấy kết quả quiz assignments (authenticate)

### 5. Admin (`/api/admin`)
**Tất cả endpoints yêu cầu authenticate + admin role**

#### User Management
- `GET /users` - Lấy tất cả users
- `GET /users/:userId/progress` - Lấy progress của user
- `POST /users/:userId/unlock-level/:levelId` - Unlock level cho user
- `POST /users/:userId/lock-level/:levelId` - Lock level cho user
- `PUT /users/:userId/role` - Update user role
- `POST /users/bulk` - Bulk create users
- `DELETE /users/:userId` - Xóa user

#### Content Management
- `GET /lessons` - Lấy tất cả lessons
- `POST /lessons` - Tạo lesson mới
- `PUT /lessons/:lessonId` - Update lesson
- `DELETE /lessons/:lessonId` - Xóa lesson
- `GET /levels` - Lấy tất cả levels
- `POST /levels` - Tạo level mới
- `PUT /levels/:levelId` - Update level
- `DELETE /levels/:levelId` - Xóa level
- `GET /languages` - Lấy tất cả languages
- `POST /languages` - Tạo language mới
- `PUT /languages/:languageId` - Update language
- `DELETE /languages/:languageId` - Xóa language

#### Quiz Assignment Management
- `POST /quiz-assignments` - Tạo quiz assignment
- `GET /quiz-assignments` - Lấy tất cả quiz assignments
- `GET /quiz-assignments/:id` - Lấy chi tiết quiz assignment
- `PUT /quiz-assignments/:id` - Update quiz assignment
- `DELETE /quiz-assignments/:id` - Xóa quiz assignment
- `GET /quiz-assignments/:id/tracking` - Lấy tracking sessions
- `GET /quiz-assignments/:id/results` - Lấy kết quả quiz assignment

#### Analytics & Tracking
- `GET /stats` - Dashboard statistics
- `GET /tracking-stats` - Quiz tracking statistics
- `GET /activity-log` - Activity log với filtering (tab switches, suspicious activities)
- `DELETE /activity-log/:sessionId` - Xóa activity log session

### 6. Activity Tracking (`/api/activity`)
- `POST /track` - Track user activity (authenticate)
- `GET /logs` - Lấy activity logs (authenticate)
- `GET /stats` - Activity statistics (authenticate)

### 7. Quiz Tracking (`/api/quiz-tracking`)
- `POST /start` - Bắt đầu tracking session (authenticate)
- `POST /track-event` - Track tab switch, window blur, etc. (authenticate)
- `POST /end` - Kết thúc session và tính toán durations (authenticate)
- `GET /session/:sessionId` - Lấy session data (authenticate)
- `GET /sessions` - Lấy tất cả sessions (authenticate, admin có thể xem của user khác)

---

## 🔐 Authentication & Authorization

### JWT Authentication
- Token được tạo khi login/register, expire sau 7 ngày
- Token được gửi trong header: `Authorization: Bearer <token>`
- Middleware `authenticate` verify token và attach user vào `req.user`

### Roles
- **user** (default) - User thường
- **admin** - Admin có quyền quản lý toàn bộ hệ thống

### Middleware
- `authenticate` - Verify JWT token
- `adminOnly` - Chỉ cho phép admin access

---

## 💾 Database Models

### User
```javascript
{
  email: String (unique, required),
  password: String (hashed, required, min 6),
  name: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  avatar: String (Cloudinary URL, default: null),
  createdAt: Date
}
```

### Language
- Chứa thông tin ngôn ngữ lập trình (HTML, CSS, JavaScript, etc.)
- Có nhiều levels

### Level
- Thuộc về một language
- Có nhiều lessons
- Có unlock status cho từng user

### Lesson
- Thuộc về một level
- Có quiz questions và code exercises
- Hỗ trợ đa ngôn ngữ (vi/en)

### UserProgress
- Track progress của user:
  - `lessonScores[]` - Điểm quiz và code cho từng lesson
  - `levelScores[]` - Average score và unlock status cho từng level
  - `completedLessonIds[]` - Danh sách lesson đã hoàn thành
  - `timeStats[]` - Thống kê thời gian học theo ngày
  - `totalStudyTime` - Tổng thời gian học
  - `currentStreak` - Chuỗi ngày học liên tiếp

### QuizAssignment
- Quiz được admin tạo và assign cho users
- Có deadline, passing score
- Questions có thể là multiple-choice hoặc code

### QuizAssignmentResult
- Kết quả quiz assignment của user
- Track answers, score, time taken, status (submitted/abandoned)

### QuizSessionTracking
- Track chi tiết session khi user làm quiz:
  - `tabSwitches[]` - Lịch sử chuyển tab
  - `visitedDomains[]` - Domains đã visit (external)
  - `suspiciousActivities[]` - Hoạt động đáng nghi
  - `totalDuration`, `activeDuration`, `awayDuration`
  - `tabSwitchCount`, `windowBlurCount`, `visibilityChangeCount`

### UserActivityTracking
- Track các activity của user (tab switch, page leave, etc.)

---

## 🌐 Internationalization (i18n)

### Hỗ trợ đa ngôn ngữ
- Hệ thống hỗ trợ tiếng Việt (vi) và tiếng Anh (en)
- Data được lưu dạng object: `{ vi: "...", en: "..." }`
- API nhận query param `?lang=vi` hoặc `?lang=en`
- Utility function `localizeData()` tự động transform data theo language

### Fields được localize
- `title`, `content`, `description`, `name`, `question`, `explanation`
- `options[]` trong quiz questions

---

## 📤 File Upload (Avatar)

### Cloudinary Integration
- Sử dụng **Cloudinary** để lưu avatar (thay vì local file system)
- Multer sử dụng `memoryStorage` (tương thích serverless)
- Upload endpoint: `POST /api/auth/avatar`
- File được convert sang base64 và upload lên Cloudinary
- Tự động xóa avatar cũ khi upload avatar mới
- Transform: resize 400x400, auto quality, auto format

### File Restrictions
- Chỉ cho phép: jpeg, jpg, png, gif, webp
- Max size: 5MB

---

## 🔍 Activity Tracking & Anti-Cheating

### Tab Switch Tracking
- Track khi user chuyển tab/window
- Phân biệt internal vs external domains
- Track duration ở mỗi domain
- Detect suspicious domains (ChatGPT, Google, Stack Overflow, etc.)

### Suspicious Activity Detection
- **Rapid tab switch**: >5 switches trong 30 giây
- **Long away time**: >5 phút away
- **Multiple blur**: >10 window blur events
- **Unusual pattern**: Visit suspicious websites

### Tracking Data
- `tabSwitchCount` - Số lần chuyển tab
- `windowBlurCount` - Số lần window blur
- `visitedDomains[]` - Danh sách external domains đã visit
- `suspiciousActivities[]` - Danh sách hoạt động đáng nghi
- `activeDuration` - Thời gian active (total - away)

---

## ⚙️ Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000,https://your-domain.vercel.app

# Server
PORT=5000
NODE_ENV=development|production
VERCEL=1 (nếu deploy trên Vercel)
```

### CORS Configuration
- Development: Allow all origins
- Production: Chỉ allow origins trong `FRONTEND_URL` hoặc Vercel domains
- Credentials: enabled

---

## 🚀 Deployment

### Vercel Serverless
- Backend được deploy trên Vercel dưới dạng serverless functions
- MongoDB connection được cache để tránh multiple connections
- File system là read-only → Sử dụng Cloudinary cho file uploads
- `vercel.json` config routing

### Database Connection
- Connection được cache và reuse
- Auto-retry với exponential backoff (3 lần)
- Middleware `ensureConnection` đảm bảo DB connected trước khi xử lý request

---

## 📊 Scoring System

### Lesson Scoring
- **Quiz Score**: 0-10 (multiple-choice questions)
- **Code Score**: 0-10 (code exercises)
- **Total Score**: Quiz + Code (max 20)
- Lesson được coi là completed nếu Total Score >= 14

### Level Scoring
- Average score = (sum of all lesson totalScores) / lessonCount / 2
- Level tự động unlock nếu average >= 9
- Admin có thể manually unlock/lock level

### Leaderboard
- Sắp xếp theo average score (descending)
- Nếu average bằng nhau → sort theo completed lessons
- Nếu vẫn bằng → sort theo total points

---

## 🔧 Utilities

### i18n.js
- `localizeData(data, lang)` - Transform data object theo language
- `extractLocalizedString(field, lang)` - Extract string từ localized field

### Error Handling
- Centralized error handler middleware
- Development: Show stack trace
- Production: Chỉ show error message

---

## 📝 Notes

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **JWT Expiration**: 7 ngày
3. **File Upload**: Chỉ hỗ trợ images, max 5MB
4. **Database**: MongoDB Atlas (cloud) hoặc local MongoDB
5. **Serverless**: Tương thích với Vercel serverless functions
6. **CORS**: Flexible CORS config cho development và production

---

## 🎯 Main Features

✅ User authentication & authorization  
✅ Multi-language support (vi/en)  
✅ Quiz & code exercise system  
✅ Progress tracking & leaderboard  
✅ Quiz assignment system với deadline  
✅ Activity tracking & anti-cheating  
✅ Admin dashboard & management  
✅ Avatar upload (Cloudinary)  
✅ Study time tracking & streaks  
✅ Level unlock system (auto & manual)






## 📋 Tổng Quan
Backend được xây dựng bằng **Node.js** với **Express.js**, sử dụng **MongoDB** (Mongoose) làm database. Hệ thống hỗ trợ học lập trình với quiz, bài tập code, tracking user activity, và quản lý admin.

---

## 🛠️ Công Nghệ & Dependencies

### Core Dependencies
- **express** (^4.18.2) - Web framework
- **mongoose** (^8.0.3) - MongoDB ODM
- **jsonwebtoken** (^9.0.2) - JWT authentication
- **bcryptjs** (^2.4.3) - Password hashing
- **cors** (^2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (^16.3.1) - Environment variables
- **multer** (^2.0.2) - File upload middleware
- **cloudinary** (^2.8.0) - Cloud image storage

### CodeMirror (Code Editor)
- @codemirror/autocomplete
- @codemirror/commands
- @codemirror/language
- @codemirror/lint

---

## 📁 Cấu Trúc Thư Mục

```
backend/
├── api/                    # API routes
│   ├── auth.js            # Authentication & user management
│   ├── languages.js       # Language endpoints
│   ├── lessons.js         # Lesson endpoints
│   ├── progress.js        # User progress & quiz submission
│   ├── admin.js           # Admin management endpoints
│   ├── activity.js        # User activity tracking
│   └── quizTracking.js    # Quiz session tracking
├── config/                 # Configuration files
│   ├── database.js        # MongoDB connection
│   └── cloudinary.js      # Cloudinary config
├── middleware/            # Express middleware
│   ├── auth.js            # JWT authentication & admin check
│   ├── upload.js          # Multer file upload config
│   └── errorHandler.js    # Error handling
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Language.js
│   ├── Level.js
│   ├── Lesson.js
│   ├── UserProgress.js
│   ├── QuizAssignment.js
│   ├── QuizAssignmentResult.js
│   ├── QuizSessionTracking.js
│   └── UserActivityTracking.js
└── utils/
    └── i18n.js            # Internationalization helper
```

---

## 🔌 API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /register` - Đăng ký user mới
- `POST /login` - Đăng nhập, trả về JWT token
- `GET /me` - Lấy thông tin user hiện tại (authenticate)
- `PUT /profile` - Cập nhật name, email (authenticate)
- `PUT /change-password` - Đổi mật khẩu (authenticate)
- `POST /avatar` - Upload avatar lên Cloudinary (authenticate, multer)

### 2. Languages (`/api/languages`)
- `GET /` - Lấy tất cả languages (authenticate)
- `GET /:langId` - Lấy language với levels và unlock status (authenticate)

### 3. Lessons (`/api/lessons`)
- `GET /level/:levelId` - Lấy tất cả lessons của một level (authenticate)
- `GET /:lessonId` - Lấy chi tiết một lesson (authenticate)

### 4. Progress (`/api/progress`)
- `GET /` - Lấy user progress (authenticate)
- `GET /leaderboard` - Public leaderboard theo language
- `POST /quiz/:lessonId` - Submit quiz score cho lesson (authenticate)
- `POST /code/:lessonId` - Submit code exercise score (authenticate)
- `POST /time` - Update study time (authenticate)
- `GET /quiz-assignments` - Lấy quiz assignments của user (authenticate)
- `GET /quiz-assignments/:id` - Lấy chi tiết quiz assignment (authenticate)
- `POST /quiz-assignments/:id/submit` - Submit quiz assignment (authenticate)
- `POST /quiz-assignments/:id/abandon` - Abandon quiz assignment (authenticate)
- `GET /quiz-assignments/results` - Lấy kết quả quiz assignments (authenticate)

### 5. Admin (`/api/admin`)
**Tất cả endpoints yêu cầu authenticate + admin role**

#### User Management
- `GET /users` - Lấy tất cả users
- `GET /users/:userId/progress` - Lấy progress của user
- `POST /users/:userId/unlock-level/:levelId` - Unlock level cho user
- `POST /users/:userId/lock-level/:levelId` - Lock level cho user
- `PUT /users/:userId/role` - Update user role
- `POST /users/bulk` - Bulk create users
- `DELETE /users/:userId` - Xóa user

#### Content Management
- `GET /lessons` - Lấy tất cả lessons
- `POST /lessons` - Tạo lesson mới
- `PUT /lessons/:lessonId` - Update lesson
- `DELETE /lessons/:lessonId` - Xóa lesson
- `GET /levels` - Lấy tất cả levels
- `POST /levels` - Tạo level mới
- `PUT /levels/:levelId` - Update level
- `DELETE /levels/:levelId` - Xóa level
- `GET /languages` - Lấy tất cả languages
- `POST /languages` - Tạo language mới
- `PUT /languages/:languageId` - Update language
- `DELETE /languages/:languageId` - Xóa language

#### Quiz Assignment Management
- `POST /quiz-assignments` - Tạo quiz assignment
- `GET /quiz-assignments` - Lấy tất cả quiz assignments
- `GET /quiz-assignments/:id` - Lấy chi tiết quiz assignment
- `PUT /quiz-assignments/:id` - Update quiz assignment
- `DELETE /quiz-assignments/:id` - Xóa quiz assignment
- `GET /quiz-assignments/:id/tracking` - Lấy tracking sessions
- `GET /quiz-assignments/:id/results` - Lấy kết quả quiz assignment

#### Analytics & Tracking
- `GET /stats` - Dashboard statistics
- `GET /tracking-stats` - Quiz tracking statistics
- `GET /activity-log` - Activity log với filtering (tab switches, suspicious activities)
- `DELETE /activity-log/:sessionId` - Xóa activity log session

### 6. Activity Tracking (`/api/activity`)
- `POST /track` - Track user activity (authenticate)
- `GET /logs` - Lấy activity logs (authenticate)
- `GET /stats` - Activity statistics (authenticate)

### 7. Quiz Tracking (`/api/quiz-tracking`)
- `POST /start` - Bắt đầu tracking session (authenticate)
- `POST /track-event` - Track tab switch, window blur, etc. (authenticate)
- `POST /end` - Kết thúc session và tính toán durations (authenticate)
- `GET /session/:sessionId` - Lấy session data (authenticate)
- `GET /sessions` - Lấy tất cả sessions (authenticate, admin có thể xem của user khác)

---

## 🔐 Authentication & Authorization

### JWT Authentication
- Token được tạo khi login/register, expire sau 7 ngày
- Token được gửi trong header: `Authorization: Bearer <token>`
- Middleware `authenticate` verify token và attach user vào `req.user`

### Roles
- **user** (default) - User thường
- **admin** - Admin có quyền quản lý toàn bộ hệ thống

### Middleware
- `authenticate` - Verify JWT token
- `adminOnly` - Chỉ cho phép admin access

---

## 💾 Database Models

### User
```javascript
{
  email: String (unique, required),
  password: String (hashed, required, min 6),
  name: String (required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  avatar: String (Cloudinary URL, default: null),
  createdAt: Date
}
```

### Language
- Chứa thông tin ngôn ngữ lập trình (HTML, CSS, JavaScript, etc.)
- Có nhiều levels

### Level
- Thuộc về một language
- Có nhiều lessons
- Có unlock status cho từng user

### Lesson
- Thuộc về một level
- Có quiz questions và code exercises
- Hỗ trợ đa ngôn ngữ (vi/en)

### UserProgress
- Track progress của user:
  - `lessonScores[]` - Điểm quiz và code cho từng lesson
  - `levelScores[]` - Average score và unlock status cho từng level
  - `completedLessonIds[]` - Danh sách lesson đã hoàn thành
  - `timeStats[]` - Thống kê thời gian học theo ngày
  - `totalStudyTime` - Tổng thời gian học
  - `currentStreak` - Chuỗi ngày học liên tiếp

### QuizAssignment
- Quiz được admin tạo và assign cho users
- Có deadline, passing score
- Questions có thể là multiple-choice hoặc code

### QuizAssignmentResult
- Kết quả quiz assignment của user
- Track answers, score, time taken, status (submitted/abandoned)

### QuizSessionTracking
- Track chi tiết session khi user làm quiz:
  - `tabSwitches[]` - Lịch sử chuyển tab
  - `visitedDomains[]` - Domains đã visit (external)
  - `suspiciousActivities[]` - Hoạt động đáng nghi
  - `totalDuration`, `activeDuration`, `awayDuration`
  - `tabSwitchCount`, `windowBlurCount`, `visibilityChangeCount`

### UserActivityTracking
- Track các activity của user (tab switch, page leave, etc.)

---

## 🌐 Internationalization (i18n)

### Hỗ trợ đa ngôn ngữ
- Hệ thống hỗ trợ tiếng Việt (vi) và tiếng Anh (en)
- Data được lưu dạng object: `{ vi: "...", en: "..." }`
- API nhận query param `?lang=vi` hoặc `?lang=en`
- Utility function `localizeData()` tự động transform data theo language

### Fields được localize
- `title`, `content`, `description`, `name`, `question`, `explanation`
- `options[]` trong quiz questions

---

## 📤 File Upload (Avatar)

### Cloudinary Integration
- Sử dụng **Cloudinary** để lưu avatar (thay vì local file system)
- Multer sử dụng `memoryStorage` (tương thích serverless)
- Upload endpoint: `POST /api/auth/avatar`
- File được convert sang base64 và upload lên Cloudinary
- Tự động xóa avatar cũ khi upload avatar mới
- Transform: resize 400x400, auto quality, auto format

### File Restrictions
- Chỉ cho phép: jpeg, jpg, png, gif, webp
- Max size: 5MB

---

## 🔍 Activity Tracking & Anti-Cheating

### Tab Switch Tracking
- Track khi user chuyển tab/window
- Phân biệt internal vs external domains
- Track duration ở mỗi domain
- Detect suspicious domains (ChatGPT, Google, Stack Overflow, etc.)

### Suspicious Activity Detection
- **Rapid tab switch**: >5 switches trong 30 giây
- **Long away time**: >5 phút away
- **Multiple blur**: >10 window blur events
- **Unusual pattern**: Visit suspicious websites

### Tracking Data
- `tabSwitchCount` - Số lần chuyển tab
- `windowBlurCount` - Số lần window blur
- `visitedDomains[]` - Danh sách external domains đã visit
- `suspiciousActivities[]` - Danh sách hoạt động đáng nghi
- `activeDuration` - Thời gian active (total - away)

---

## ⚙️ Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
FRONTEND_URL=http://localhost:3000,https://your-domain.vercel.app

# Server
PORT=5000
NODE_ENV=development|production
VERCEL=1 (nếu deploy trên Vercel)
```

### CORS Configuration
- Development: Allow all origins
- Production: Chỉ allow origins trong `FRONTEND_URL` hoặc Vercel domains
- Credentials: enabled

---

## 🚀 Deployment

### Vercel Serverless
- Backend được deploy trên Vercel dưới dạng serverless functions
- MongoDB connection được cache để tránh multiple connections
- File system là read-only → Sử dụng Cloudinary cho file uploads
- `vercel.json` config routing

### Database Connection
- Connection được cache và reuse
- Auto-retry với exponential backoff (3 lần)
- Middleware `ensureConnection` đảm bảo DB connected trước khi xử lý request

---

## 📊 Scoring System

### Lesson Scoring
- **Quiz Score**: 0-10 (multiple-choice questions)
- **Code Score**: 0-10 (code exercises)
- **Total Score**: Quiz + Code (max 20)
- Lesson được coi là completed nếu Total Score >= 14

### Level Scoring
- Average score = (sum of all lesson totalScores) / lessonCount / 2
- Level tự động unlock nếu average >= 9
- Admin có thể manually unlock/lock level

### Leaderboard
- Sắp xếp theo average score (descending)
- Nếu average bằng nhau → sort theo completed lessons
- Nếu vẫn bằng → sort theo total points

---

## 🔧 Utilities

### i18n.js
- `localizeData(data, lang)` - Transform data object theo language
- `extractLocalizedString(field, lang)` - Extract string từ localized field

### Error Handling
- Centralized error handler middleware
- Development: Show stack trace
- Production: Chỉ show error message

---

## 📝 Notes

1. **Password Hashing**: Sử dụng bcrypt với salt rounds = 10
2. **JWT Expiration**: 7 ngày
3. **File Upload**: Chỉ hỗ trợ images, max 5MB
4. **Database**: MongoDB Atlas (cloud) hoặc local MongoDB
5. **Serverless**: Tương thích với Vercel serverless functions
6. **CORS**: Flexible CORS config cho development và production

---

## 🎯 Main Features

✅ User authentication & authorization  
✅ Multi-language support (vi/en)  
✅ Quiz & code exercise system  
✅ Progress tracking & leaderboard  
✅ Quiz assignment system với deadline  
✅ Activity tracking & anti-cheating  
✅ Admin dashboard & management  
✅ Avatar upload (Cloudinary)  
✅ Study time tracking & streaks  
✅ Level unlock system (auto & manual)













