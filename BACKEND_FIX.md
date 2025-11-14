# Backend Fix cho Vercel Deployment

## Vấn đề

Backend đang gặp lỗi 500 INTERNAL_SERVER_ERROR khi deploy lên Vercel. Nguyên nhân có thể:

1. **MongoDB Connection**: `connectDB()` được gọi ngay khi import và có thể fail nếu:
   - `MONGODB_URI` không được set trong Vercel environment variables
   - MongoDB connection timeout
   - `process.exit(1)` crash serverless function

2. **Serverless Function Handler**: Cần async handler cho Vercel

## Đã sửa

### 1. `backend/config/database.js`
- Thêm connection caching để tránh multiple connections
- Không `process.exit()` trong Vercel environment
- Thêm timeout ngắn hơn (5s thay vì 30s)

### 2. `backend/app.js`
- Không block server startup khi connect DB
- Catch error và log thay vì crash

### 3. `backend/api/index.js`
- Tạo async handler cho Vercel serverless function
- Ensure DB connection trước khi handle request
- Handle connection errors gracefully

## Kiểm tra

Sau khi push code và redeploy, kiểm tra:

1. **Environment Variables trong Vercel:**
   - ✅ `MONGODB_URI` - MongoDB connection string (BẮT BUỘC)
   - ✅ `JWT_SECRET` - Secret key cho JWT (BẮT BUỘC)
   - ✅ `FRONTEND_URL` - URL frontend cho CORS (khuyến nghị)

2. **Test Health Check:**
   ```
   https://codecatalyst-azure.vercel.app/api/health
   ```
   → Nên trả về: `{"success": true, "message": "API is running"}`

3. **Kiểm tra Logs trong Vercel:**
   - Vào Vercel Dashboard → Project → Functions → View Logs
   - Tìm lỗi MongoDB connection nếu có

## Nếu vẫn lỗi

1. **Kiểm tra MongoDB URI:**
   - Đảm bảo format đúng: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
   - Kiểm tra MongoDB Atlas Network Access cho phép Vercel IPs
   - Kiểm tra MongoDB user có quyền đọc/ghi

2. **Kiểm tra Vercel Logs:**
   - Vào Vercel Dashboard → Project → Deployments → Click vào deployment mới nhất
   - Xem Function Logs để tìm lỗi cụ thể

3. **Test MongoDB Connection:**
   - Có thể test connection string bằng MongoDB Compass hoặc `mongosh`

## Next Steps

1. Push code lên GitHub
2. Vercel sẽ tự động redeploy
3. Kiểm tra `/api/health` endpoint
4. Nếu vẫn lỗi, xem logs trong Vercel Dashboard

