# MongoDB Connection Troubleshooting Guide

## Lỗi: "Database connection failed. Please try again later."

### Bước 1: Kiểm tra Environment Variables

Đảm bảo `MONGODB_URI` đã được set trong environment variables:

**Local Development:**
```bash
# Tạo file .env trong thư mục backend/
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learncode
```

**Vercel Deployment:**
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Kiểm tra `MONGODB_URI` có tồn tại không
3. Đảm bảo format đúng: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### Bước 2: Kiểm tra MongoDB Connection String

Format đúng của MongoDB URI:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Lưu ý:**
- Username và password không được chứa ký tự đặc biệt (nếu có, cần URL encode)
- Database name thường là `learncode` hoặc tên database của bạn
- Đảm bảo không có khoảng trắng trong connection string

### Bước 3: Kiểm tra MongoDB Atlas Network Access

Nếu dùng MongoDB Atlas:

1. Vào MongoDB Atlas Dashboard
2. Chọn project → Network Access
3. Kiểm tra IP Whitelist:
   - **Cho Development:** Thêm `0.0.0.0/0` (cho phép tất cả IPs)
   - **Cho Production:** Thêm Vercel IP ranges hoặc specific IPs

### Bước 4: Kiểm tra MongoDB User Permissions

1. Vào MongoDB Atlas → Database Access
2. Kiểm tra user có quyền:
   - `readWrite` hoặc `readAnyDatabase` và `readWriteAnyDatabase`
   - Đảm bảo password đúng

### Bước 5: Kiểm tra Logs

**Local Development:**
```bash
cd backend
npm start
# Xem console logs để thấy chi tiết lỗi
```

**Vercel:**
1. Vào Vercel Dashboard → Project → Deployments
2. Click vào deployment mới nhất
3. Xem Function Logs
4. Tìm các log messages:
   - `🔄 Attempting to connect to MongoDB`
   - `❌ MongoDB connection attempt X/3 failed`
   - `✅ MongoDB Connected successfully!`

### Bước 6: Test Connection Manually

**Với MongoDB Compass:**
1. Mở MongoDB Compass
2. Paste connection string vào
3. Test connection
4. Nếu fail, sẽ thấy lỗi chi tiết

**Với mongosh (command line):**
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/learncode"
```

### Bước 7: Common Errors và Solutions

#### Error: "MONGODB_URI is not set"
**Solution:** Set environment variable `MONGODB_URI`

#### Error: "MongoServerSelectionError"
**Causes:**
- MongoDB server không reachable
- Network access bị block
- Connection string sai

**Solutions:**
1. Kiểm tra MongoDB Atlas Network Access
2. Kiểm tra connection string format
3. Kiểm tra MongoDB cluster có đang chạy không

#### Error: "MongoAuthenticationError"
**Causes:**
- Username/password sai
- User không có quyền

**Solutions:**
1. Kiểm tra username/password trong MONGODB_URI
2. Reset password trong MongoDB Atlas nếu cần
3. Kiểm tra user permissions

#### Error: "buffering timed out after 10000ms"
**Causes:**
- Connection chưa được establish nhưng đã có query
- Network quá chậm

**Solutions:**
- Đã được fix trong code với `bufferCommands: false`
- Đảm bảo connection được establish trước khi query

### Bước 8: Test Health Check

Test endpoint không cần DB:
```bash
curl https://your-backend-url.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### Bước 9: Test với cURL

Test login endpoint (sẽ trigger DB connection):
```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

Nếu lỗi 503 với message "Database connection failed", xem logs để biết chi tiết.

### Bước 10: Redeploy sau khi sửa Environment Variables

**Quan trọng:** Sau khi thêm/sửa environment variables trong Vercel:
1. Vào Deployments
2. Click "Redeploy" hoặc push code mới
3. Đợi deployment hoàn thành
4. Test lại

## Quick Checklist

- [ ] `MONGODB_URI` được set trong environment variables
- [ ] Connection string format đúng
- [ ] MongoDB Atlas Network Access cho phép IPs (hoặc 0.0.0.0/0)
- [ ] MongoDB user có quyền read/write
- [ ] Password không có ký tự đặc biệt (hoặc đã URL encode)
- [ ] Đã redeploy sau khi sửa environment variables
- [ ] Đã kiểm tra logs để xem lỗi chi tiết

## Still Having Issues?

1. Copy full error message từ logs
2. Kiểm tra MongoDB Atlas status
3. Test connection với MongoDB Compass
4. Kiểm tra Vercel Function Logs để xem chi tiết

