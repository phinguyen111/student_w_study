# Troubleshooting Login/Register Issues

## Vấn đề: Không thể login hoặc register

### Nguyên nhân có thể:

1. **Database chưa có dữ liệu user**
2. **CORS error** - Frontend không thể gọi backend
3. **API URL sai** - Frontend gọi sai endpoint
4. **MongoDB connection issue** - Backend không kết nối được database

## 🔍 Kiểm tra từng bước:

### 1. Kiểm tra Browser Console

Mở browser console (F12) và xem lỗi:

**Nếu thấy lỗi CORS:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
→ **Giải pháp:** Kiểm tra `FRONTEND_URL` trong backend env vars

**Nếu thấy lỗi Network:**
```
Failed to fetch
NetworkError
```
→ **Giải pháp:** Kiểm tra backend có đang chạy không

**Nếu thấy lỗi 401/400:**
```
Invalid credentials
User already exists
```
→ **Giải pháp:** Kiểm tra database có dữ liệu không

### 2. Test API trực tiếp

**Test Login API:**
```bash
curl -X POST https://codecatalyst-azure.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@learncode.com","password":"user123"}'
```

**Test Register API:**
```bash
curl -X POST https://codecatalyst-azure.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

### 3. Kiểm tra Database có dữ liệu

Database có thể chưa có user. Cần seed data:

**Option 1: Seed từ local (nếu có MongoDB local)**
```bash
cd backend
npm run seed
```

**Option 2: Tạo user qua Register API**
- Thử register user mới
- Nếu thành công, user sẽ được tạo trong database

**Option 3: Tạo user trực tiếp trong MongoDB Atlas**
- Vào MongoDB Atlas Dashboard
- Collections → users
- Insert document mới với password đã hash

### 4. Kiểm tra Environment Variables

**Frontend:**
- `NEXT_PUBLIC_API_URL=https://codecatalyst-azure.vercel.app/api`
- Đảm bảo có `/api` ở cuối

**Backend:**
- `MONGODB_URI` - Đúng connection string
- `JWT_SECRET` - Đã được set
- `FRONTEND_URL=https://codecatalyst.vercel.app` - Đúng URL frontend

### 5. Kiểm tra CORS

Nếu frontend URL là `https://codecatalyst.vercel.app`, backend cần có:
```
FRONTEND_URL=https://codecatalyst.vercel.app
```

Nếu có nhiều domain, dùng dấu phẩy:
```
FRONTEND_URL=https://codecatalyst.vercel.app,http://localhost:3000
```

## 🛠️ Giải pháp:

### Giải pháp 1: Seed Database

Nếu database trống, cần seed data. Tuy nhiên, seed script cần chạy local với MongoDB connection.

**Tạo user thủ công qua API:**
```bash
# Register user mới
curl -X POST https://codecatalyst-azure.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codecatalyst.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

### Giải pháp 2: Fix CORS

Nếu gặp lỗi CORS, cập nhật `FRONTEND_URL` trong backend:
1. Vercel Dashboard → Backend Project → Settings → Environment Variables
2. Sửa `FRONTEND_URL` thành URL frontend chính xác
3. Redeploy backend

### Giải pháp 3: Kiểm tra Network Tab

1. Mở browser DevTools (F12)
2. Vào tab **Network**
3. Thử login
4. Xem request đến `/api/auth/login`
5. Kiểm tra:
   - Status code (200 = OK, 401 = Unauthorized, 500 = Server Error)
   - Response body (xem lỗi cụ thể)
   - Request URL (đúng endpoint không)

## 📝 Test Cases:

### Test 1: Health Check
```
GET https://codecatalyst-azure.vercel.app/api/health
```
→ Phải trả về: `{"success": true, "message": "API is running"}`

### Test 2: Register New User
```
POST https://codecatalyst-azure.vercel.app/api/auth/register
Body: {"email":"test@test.com","password":"test123","name":"Test"}
```
→ Phải trả về token và user info

### Test 3: Login với user vừa tạo
```
POST https://codecatalyst-azure.vercel.app/api/auth/login
Body: {"email":"test@test.com","password":"test123"}
```
→ Phải trả về token và user info

## 🚨 Lỗi thường gặp:

### "Invalid credentials"
- User không tồn tại trong database
- Password sai
- **Giải pháp:** Register user mới hoặc seed database

### "User already exists"
- Email đã được sử dụng
- **Giải pháp:** Dùng email khác hoặc login với email đó

### CORS Error
- `FRONTEND_URL` không đúng
- **Giải pháp:** Cập nhật `FRONTEND_URL` và redeploy

### 500 Internal Server Error
- MongoDB connection failed
- JWT_SECRET không được set
- **Giải pháp:** Kiểm tra Vercel logs và environment variables

