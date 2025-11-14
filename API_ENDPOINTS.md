# API Endpoints - Code Catalyst Backend

Backend URL: `https://codecatalyst-azure.vercel.app`

## ✅ Health Check (Public - Không cần auth)

Test xem backend có chạy không:

```
GET https://codecatalyst-azure.vercel.app/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "API is running"
}
```

---

## 🔐 Authentication Endpoints (Public)

### 1. Register (Đăng ký)
```
POST https://codecatalyst-azure.vercel.app/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### 2. Login (Đăng nhập)
```
POST https://codecatalyst-azure.vercel.app/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

### 3. Get Current User (Cần token)
```
GET https://codecatalyst-azure.vercel.app/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📚 Languages Endpoints (Cần auth)

### Get All Languages
```
GET https://codecatalyst-azure.vercel.app/api/languages?lang=en
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "languages": [
    {
      "_id": "...",
      "name": "HTML",
      "description": "...",
      "levels": [...]
    }
  ]
}
```

### Get Single Language
```
GET https://codecatalyst-azure.vercel.app/api/languages/:languageId?lang=en
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📖 Lessons Endpoints (Cần auth)

### Get Lessons by Level
```
GET https://codecatalyst-azure.vercel.app/api/lessons/level/:levelId?lang=en
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Single Lesson
```
GET https://codecatalyst-azure.vercel.app/api/lessons/:lessonId?lang=en
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📊 Progress Endpoints (Cần auth)

### Get User Progress
```
GET https://codecatalyst-azure.vercel.app/api/progress
Authorization: Bearer YOUR_TOKEN_HERE
```

### Submit Quiz Score
```
POST https://codecatalyst-azure.vercel.app/api/progress/quiz/:lessonId
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "quizScore": 8.5
}
```

### Submit Code Score
```
POST https://codecatalyst-azure.vercel.app/api/progress/code/:lessonId
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "codeScore": 10,
  "code": "console.log('Hello World');"
}
```

---

## 👨‍💼 Admin Endpoints (Cần auth + admin role)

### Get Dashboard Stats
```
GET https://codecatalyst-azure.vercel.app/api/admin/stats
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

### Get All Users
```
GET https://codecatalyst-azure.vercel.app/api/admin/users
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

---

## 🧪 Cách Test API

### 1. Test Health Check (Không cần token)
Mở browser và truy cập:
```
https://codecatalyst-azure.vercel.app/api/health
```

### 2. Test với cURL

**Health Check:**
```bash
curl https://codecatalyst-azure.vercel.app/api/health
```

**Login:**
```bash
curl -X POST https://codecatalyst-azure.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@learncode.com","password":"user123"}'
```

**Get Languages (sau khi có token):**
```bash
curl https://codecatalyst-azure.vercel.app/api/languages?lang=en \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test với Postman/Thunder Client

1. Import collection hoặc tạo request mới
2. Set URL: `https://codecatalyst-azure.vercel.app/api/...`
3. Với endpoints cần auth, thêm header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### 4. Test trong Browser Console

```javascript
// Health check
fetch('https://codecatalyst-azure.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)

// Login
fetch('https://codecatalyst-azure.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@learncode.com',
    password: 'user123'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('Token:', data.token)
    // Lưu token để dùng cho các request khác
    localStorage.setItem('token', data.token)
  })
```

---

## ⚠️ Lưu ý

1. **Lỗi "Not Found - /" là bình thường**: Backend không có route cho root path `/`, chỉ có `/api/*`

2. **CORS**: Backend đã cấu hình CORS để cho phép:
   - `http://localhost:3000` (local development)
   - `https://codecatalyst.vercel.app` (production frontend)

3. **Authentication**: Hầu hết endpoints (trừ `/api/health`, `/api/auth/register`, `/api/auth/login`) đều cần token trong header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

4. **Language Parameter**: Các endpoints có thể nhận `?lang=en` hoặc `?lang=vi` để lấy dữ liệu đã được localize

---

## 🔍 Debugging

Nếu gặp lỗi:

1. **Kiểm tra backend có chạy:**
   ```
   https://codecatalyst-azure.vercel.app/api/health
   ```

2. **Kiểm tra token có hợp lệ:**
   - Token phải được lấy từ `/api/auth/login`
   - Token có thời hạn 7 ngày
   - Header phải có format: `Authorization: Bearer TOKEN`

3. **Kiểm tra CORS:**
   - Nếu gọi từ browser, đảm bảo frontend URL được thêm vào `FRONTEND_URL` trong backend env vars

4. **Kiểm tra MongoDB:**
   - Đảm bảo `MONGODB_URI` đã được set đúng trong Vercel environment variables

