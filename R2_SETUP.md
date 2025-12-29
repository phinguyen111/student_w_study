# 🚀 Hướng dẫn Setup R2 trên Vercel

## 📋 Bước 1: Thêm Environment Variables vào Vercel

Vào **Vercel Dashboard** → **Project Settings** → **Environment Variables**

Thêm các biến sau cho **Production** environment:

```
R2_ENDPOINT=https://7dc0b979064f094321ffb0cb6feeeea0.r2.cloudflarestorage.com
R2_BUCKET=codecatalyst-uploads
R2_REGION=auto
R2_ACCESS_KEY_ID=a8dc3da97caa0ec0a49bdf0058ffe4eb
R2_SECRET_ACCESS_KEY=c0f1afd1e33ef3f03722c00e802a9a69c6619ac5d4b45a87450d18e5fa14e128
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
```

## 📌 Bước 2: Trigger Redeploy

Sau khi thêm environment variables:
- Vào **Deployments** tab
- Chọn latest deployment
- Click **Redeploy**

## ✅ Bước 3: Test Upload

1. Mở ứng dụng trên Vercel
2. Thử upload file (dưới 5MB)
3. Kiểm tra Cloudflare R2 console để xem file đã upload chưa

## 🔍 Debugging

Nếu lỗi upload, check Vercel logs:
- Vào **Deployments** → **Select Deployment** → **Function Logs**
- Tìm message từ `/api/r2/presign-upload`

## 📁 File Cấu Hình

- Backend: `backend/api/r2.js` - API routes
- Frontend: `frontend/app/assignments/page.tsx` - Upload handler
- Config: `backend/.env.example` - Environment variables template

## 🎯 Tính Năng Hỗ Trợ

✅ Upload file nén (ZIP, RAR, 7Z, etc.)
✅ Upload mọi loại file (không limit type)
✅ Dưới 5MB (configurable)
✅ Presigned URLs (secure, direct upload)
✅ Error logging & debugging

---

**Lưu ý:** Không commit `.env.local` lên GitHub (đã trong .gitignore)
