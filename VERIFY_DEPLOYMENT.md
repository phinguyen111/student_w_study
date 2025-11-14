# Kiểm tra Deployment - Code Catalyst

## ✅ Environment Variables (Đã cấu hình đúng)

Từ Vercel Dashboard, bạn đã có:

1. **MONGODB_URI** ✅
   - Format: `mongodb+srv://student-w-study:7q...`
   - Đảm bảo connection string đầy đủ (có thể bị cắt trong preview)
   - Kiểm tra: MongoDB Atlas → Network Access → Cho phép tất cả IPs hoặc Vercel IPs

2. **JWT_SECRET** ✅
   - Value: `learncode-secret-key-change-in-p...`
   - Đảm bảo secret key đủ dài và an toàn
   - Khuyến nghị: Dùng chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)

3. **FRONTEND_URL** ✅
   - Value: `https://codecatalyst.vercel.app`
   - Đúng với domain frontend của bạn

## 🧪 Kiểm tra Backend

### 1. Test Health Check (Không cần auth)

Mở browser và truy cập:
```
https://codecatalyst-azure.vercel.app/api/health
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "API is running"
}
```

**Nếu lỗi:**
- 500 Error: Kiểm tra Vercel Logs → Xem lỗi MongoDB connection
- 404 Error: Kiểm tra vercel.json routing
- Timeout: Kiểm tra MongoDB Network Access

### 2. Test với cURL

```bash
curl https://codecatalyst-azure.vercel.app/api/health
```

### 3. Kiểm tra Vercel Logs

1. Vào Vercel Dashboard
2. Chọn project `codecatalyst-azure`
3. Vào tab **Functions** hoặc **Deployments**
4. Click vào deployment mới nhất
5. Xem **Function Logs**

**Tìm các lỗi:**
- `MongoDB connection error` → Kiểm tra MONGODB_URI
- `JWT_SECRET is not defined` → Kiểm tra JWT_SECRET
- `Cannot connect to MongoDB` → Kiểm tra Network Access

## 🔍 Troubleshooting

### Nếu Health Check vẫn lỗi 500:

1. **Kiểm tra MongoDB URI:**
   - Đảm bảo format đúng: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
   - Kiểm tra username/password có đúng không
   - Kiểm tra database name có tồn tại không

2. **Kiểm tra MongoDB Atlas:**
   - Vào MongoDB Atlas Dashboard
   - Network Access → Add IP Address → `0.0.0.0/0` (cho phép tất cả) hoặc Vercel IPs
   - Database Access → Kiểm tra user có quyền read/write

3. **Kiểm tra Vercel Logs:**
   - Xem chi tiết lỗi trong Function Logs
   - Tìm dòng có `Error:` hoặc `Failed`

### Nếu Health Check thành công nhưng API khác lỗi:

1. **Test Login:**
   ```bash
   curl -X POST https://codecatalyst-azure.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@learncode.com","password":"user123"}'
   ```

2. **Kiểm tra JWT_SECRET:**
   - Đảm bảo JWT_SECRET đã được set
   - Nếu login fail với "Token is not valid", JWT_SECRET có thể sai

## 📝 Checklist

- [x] MONGODB_URI đã được set
- [x] JWT_SECRET đã được set  
- [x] FRONTEND_URL đã được set
- [ ] Health check trả về success
- [ ] MongoDB connection thành công (kiểm tra logs)
- [ ] Login API hoạt động
- [ ] Frontend có thể kết nối với backend

## 🚀 Next Steps

1. **Redeploy nếu cần:**
   - Nếu vừa thêm/sửa environment variables, cần redeploy
   - Vercel → Project → Deployments → Click "Redeploy"

2. **Test tất cả endpoints:**
   - Health check
   - Login
   - Get languages (cần token)
   - Get lessons (cần token)

3. **Kiểm tra Frontend:**
   - Đảm bảo `NEXT_PUBLIC_API_URL=https://codecatalyst-azure.vercel.app/api`
   - Test login từ frontend
   - Test các chức năng khác

