# Environment Variables Setup - Code Catalyst

## Backend (codecatalyst-azure.vercel.app)

Đã deploy tại: `https://codecatalyst-azure.vercel.app`

### Environment Variables cần thiết:

Vào Vercel Dashboard → Project Settings → Environment Variables, thêm:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learncode
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://codecatalyst.vercel.app
```

**Lưu ý:** 
- `MONGODB_URI` và `JWT_SECRET` là bắt buộc
- `FRONTEND_URL` nên set để CORS hoạt động đúng
- Sau khi thêm/sửa environment variables, cần redeploy backend

---

## Frontend (codecatalyst.vercel.app)

### Environment Variable cần thiết:

Vào Vercel Dashboard → Project Settings → Environment Variables, thêm:

```
NEXT_PUBLIC_API_URL=https://codecatalyst-azure.vercel.app/api
```

**Lưu ý:**
- Đảm bảo có `/api` ở cuối URL
- Sau khi thêm/sửa environment variable, cần redeploy frontend

---

## Kiểm tra

1. **Backend Health Check:**
   ```
   https://codecatalyst-azure.vercel.app/api/health
   ```
   Kết quả mong đợi: `{"success":true,"message":"API is running"}`

2. **Frontend:**
   ```
   https://codecatalyst.vercel.app
   ```

3. **Test kết nối:**
   - Mở browser console
   - Kiểm tra network requests đến `codecatalyst-azure.vercel.app`
   - Nếu có lỗi CORS, kiểm tra `FRONTEND_URL` trong backend

---

## Troubleshooting

### Lỗi CORS
- Kiểm tra `FRONTEND_URL` trong backend có đúng URL frontend không
- Redeploy backend sau khi sửa `FRONTEND_URL`

### Lỗi API không kết nối được
- Kiểm tra `NEXT_PUBLIC_API_URL` trong frontend
- Đảm bảo URL có `/api` ở cuối
- Kiểm tra backend có đang chạy: `https://codecatalyst-azure.vercel.app/api/health`

