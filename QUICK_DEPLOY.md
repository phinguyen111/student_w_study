# Quick Deploy Guide - Code Catalyst

## Deploy nhanh lên Vercel

### Bước 1: Deploy Backend

1. Vào [vercel.com](https://vercel.com) → New Project
2. Import repository, chọn **Root Directory: `backend`**
3. Thêm Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/learncode
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=https://codecatalyst.vercel.app
   ```
4. Deploy → Copy URL (ví dụ: `https://codecatalyst-backend.vercel.app`)

### Bước 2: Deploy Frontend

1. Vào [vercel.com](https://vercel.com) → New Project
2. Import repository, chọn **Root Directory: `frontend`**
3. Thêm Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://codecatalyst-backend.vercel.app/api
   ```
   (Thay bằng URL backend thực tế của bạn)
4. Deploy → Đặt tên project: `codecatalyst`

### Bước 3: Cập nhật Backend CORS

Sau khi có URL frontend, cập nhật `FRONTEND_URL` trong backend environment variables:
```
FRONTEND_URL=https://codecatalyst.vercel.app
```

### Xong! 🎉

Truy cập: `https://codecatalyst.vercel.app`

---

**Lưu ý:**
- Cần có MongoDB Atlas hoặc MongoDB database
- Đảm bảo backend URL có `/api` ở cuối trong `NEXT_PUBLIC_API_URL`
- Có thể cần redeploy backend sau khi cập nhật `FRONTEND_URL`

