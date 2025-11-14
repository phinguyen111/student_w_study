# Hướng dẫn Deploy Code Catalyst lên Vercel

## Bước 1: Chuẩn bị Backend

Backend cần được deploy riêng trên một service khác (Vercel Serverless Functions, Railway, Render, MongoDB Atlas, etc.)

### Option 1: Deploy Backend lên Vercel (Recommended)

1. Tạo project mới trên Vercel cho backend
2. Chọn folder `backend` làm root directory
3. Cấu hình environment variables:
   - `MONGODB_URI`: MongoDB connection string (ví dụ: `mongodb+srv://user:pass@cluster.mongodb.net/learncode`)
   - `JWT_SECRET`: Secret key cho JWT (tạo một chuỗi ngẫu nhiên)
   - `FRONTEND_URL`: `https://codecatalyst.vercel.app` (hoặc URL frontend của bạn)

4. Deploy backend và lấy URL (ví dụ: `https://codecatalyst-backend.vercel.app`)
5. **Lưu ý:** URL backend sẽ là `https://your-project.vercel.app/api/...` (không cần `/api` trong FRONTEND_URL)

### Option 2: Deploy Backend lên Railway/Render

1. Tạo project trên Railway hoặc Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy và lấy URL

## Bước 2: Deploy Frontend lên Vercel

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import project vào Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import repository từ GitHub
4. Chọn folder `frontend` làm root directory

### 3. Cấu hình Environment Variables

Trong Vercel project settings, thêm:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
```

**Lưu ý:** 
- Thay `your-backend-url.vercel.app` bằng URL backend thực tế của bạn
- Nếu backend deploy trên Vercel, URL sẽ có dạng: `https://codecatalyst-backend.vercel.app/api`
- Đảm bảo có `/api` ở cuối URL

### 4. Cấu hình Build Settings

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (mặc định)
- **Output Directory:** `.next` (mặc định)

### 5. Deploy

Click "Deploy" và đợi build hoàn tất.

### 6. Đặt tên domain

Sau khi deploy thành công:
1. Vào Project Settings > Domains
2. Thêm domain: `codecatalyst.vercel.app`
3. Hoặc sử dụng domain mặc định: `your-project-name.vercel.app`

## Bước 3: Kiểm tra

1. Truy cập `https://codecatalyst.vercel.app`
2. Kiểm tra xem frontend có kết nối được với backend không
3. Test các chức năng: login, register, learn, quiz, etc.

## Troubleshooting

### Lỗi CORS

Nếu gặp lỗi CORS, kiểm tra backend có cấu hình CORS đúng không:

```javascript
// backend/app.js
app.use(cors({
  origin: ['https://codecatalyst.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Lỗi API không kết nối được

1. Kiểm tra `NEXT_PUBLIC_API_URL` trong Vercel environment variables
2. Kiểm tra backend có đang chạy không
3. Kiểm tra network tab trong browser console

### Lỗi build

1. Kiểm tra logs trong Vercel dashboard
2. Đảm bảo tất cả dependencies đã được install
3. Kiểm tra TypeScript errors

## Environment Variables Checklist

### Frontend (Vercel)
- ✅ `NEXT_PUBLIC_API_URL` - URL của backend API

### Backend (Vercel/Railway/Render)
- ✅ `MONGODB_URI` - MongoDB connection string (bắt buộc)
- ✅ `JWT_SECRET` - Secret key cho JWT authentication (bắt buộc)
- ✅ `FRONTEND_URL` - URL của frontend (ví dụ: `https://codecatalyst.vercel.app`) - để cấu hình CORS
- ✅ `PORT` - Port number (optional, Vercel tự động)

## Notes

- Frontend và Backend có thể deploy riêng biệt
- Đảm bảo backend URL được cập nhật đúng trong frontend environment variables
- Vercel tự động deploy khi có push mới lên GitHub (nếu đã enable)

