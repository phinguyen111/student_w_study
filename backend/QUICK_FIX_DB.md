# Quick Fix: Database Connection Failed

## Bước 1: Kiểm tra bạn đang chạy ở đâu?

### Nếu đang chạy LOCAL:

1. **Tạo file `.env` trong thư mục `backend/`:**

```bash
cd backend
```

Tạo file `.env` với nội dung:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learncode
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:** Thay `username`, `password`, và `cluster.mongodb.net` bằng thông tin MongoDB của bạn.

2. **Test connection:**

```bash
cd backend
node test-connection.js
```

Nếu thành công, bạn sẽ thấy:
```
✅ MongoDB Connected Successfully!
🎉 All tests passed!
```

### Nếu đang chạy trên VERCEL:

1. **Vào Vercel Dashboard:**
   - Chọn project backend của bạn
   - Vào **Settings** → **Environment Variables**

2. **Kiểm tra có `MONGODB_URI` không:**
   - Nếu không có → Thêm mới:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://username:password@cluster.mongodb.net/learncode`
   - Nếu có → Kiểm tra format đúng

3. **Redeploy:**
   - Sau khi thêm/sửa environment variables
   - Vào **Deployments** → Click **Redeploy**

4. **Kiểm tra Logs:**
   - Vào **Deployments** → Click deployment mới nhất
   - Xem **Function Logs**
   - Tìm các log:
     - `🔄 Attempting to connect to MongoDB`
     - `❌ MongoDB connection attempt X/3 failed` (nếu lỗi)
     - `✅ MongoDB Connected successfully!` (nếu thành công)

## Bước 2: Kiểm tra MongoDB Atlas

### 1. Network Access

1. Vào [MongoDB Atlas](https://cloud.mongodb.com/)
2. Chọn project → **Network Access**
3. Click **Add IP Address**
4. Chọn:
   - **Allow Access from Anywhere** (0.0.0.0/0) - cho development
   - Hoặc thêm Vercel IP ranges - cho production

### 2. Database Access

1. Vào **Database Access**
2. Kiểm tra user có:
   - Username đúng
   - Password đúng
   - Role: `Atlas admin` hoặc `readWrite` cho database

### 3. Connection String

1. Vào **Database** → **Connect**
2. Chọn **Connect your application**
3. Copy connection string
4. Format: `mongodb+srv://username:password@cluster.mongodb.net/learncode?retryWrites=true&w=majority`

## Bước 3: Test Connection

### Local:

```bash
cd backend
node test-connection.js
```

### Vercel:

1. Test health check (không cần DB):
```bash
curl https://your-backend-url.vercel.app/api/health
```

2. Test login (cần DB):
```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

## Common Errors

### Error: "MONGODB_URI is not set"
**Solution:** Tạo file `.env` hoặc set environment variable

### Error: "MongoServerSelectionError"
**Solution:** 
- Kiểm tra Network Access trong MongoDB Atlas
- Thêm IP address (0.0.0.0/0 cho development)

### Error: "MongoAuthenticationError"
**Solution:**
- Kiểm tra username/password trong connection string
- Reset password trong MongoDB Atlas nếu cần

### Error: "buffering timed out"
**Solution:** Đã được fix trong code, nhưng đảm bảo:
- Connection được establish trước khi query
- MONGODB_URI được set đúng

## Still Having Issues?

1. **Copy full error message** từ logs
2. **Check MongoDB Atlas status** - đảm bảo cluster đang chạy
3. **Test với MongoDB Compass** - paste connection string vào
4. **Check Vercel Logs** - xem chi tiết lỗi

