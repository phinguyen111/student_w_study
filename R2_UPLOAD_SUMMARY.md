# ✅ R2 Upload Fixes - Summary

## 🎯 Chỉnh Sửa Hoàn Thành

### 1. **Backend** (`backend/api/r2.js`)
✅ Tạo route `/api/r2/presign-upload` để tạo presigned URLs
✅ Tạo route `/api/r2/presign-download` để download files
✅ Add comprehensive error handling và logging
✅ Add environment variable validation

### 2. **Upload Config** (`backend/middleware/uploadFile.js`)
✅ Thay đổi từ disk storage → memory storage
✅ Không lưu file vào `/var/task/backend/public/uploads/` nữa

### 3. **Admin API** (`backend/api/admin.js`)
✅ Upload assignment files lên R2 bằng AWS SDK
✅ Lưu `fileKey` và `fileUrl` trong database

### 4. **Frontend** (`frontend/app/assignments/page.tsx`)
✅ Gọi presign-upload endpoint
✅ Upload file trực tiếp lên R2 từ browser
✅ Better error messages cho users

### 5. **Dependencies** (`backend/package.json`)
✅ Thêm `@aws-sdk/client-s3`
✅ Thêm `@aws-sdk/s3-request-presigner`

---

## 🚀 Để Deploy Lên Vercel

**BƯỚC 1:** Thêm Environment Variables
- Vào https://vercel.com → Project Settings → Environment Variables
- Thêm các biến dưới đây cho **Production**:

```env
R2_ENDPOINT=https://7dc0b979064f094321ffb0cb6feeeea0.r2.cloudflarestorage.com
R2_BUCKET=codecatalyst-uploads
R2_REGION=auto
R2_ACCESS_KEY_ID=a8dc3da97caa0ec0a49bdf0058ffe4eb
R2_SECRET_ACCESS_KEY=c0f1afd1e33ef3f03722c00e802a9a69c6619ac5d4b45a87450d18e5fa14e128
```

**BƯỚC 2:** Redeploy
- Vào **Deployments** tab
- Chọn latest deployment
- Click **Redeploy** button

**BƯỚC 3:** Test Upload
- Upload file (dưới 5MB)
- Kiểm tra R2 bucket xem file đã lưu chưa

---

## 📋 Tính Năng Hỗ Trợ

✅ Upload mọi loại file (ZIP, RAR, PDF, DOC, etc.)
✅ Dưới 5MB per file
✅ Direct upload từ browser (không qua backend)
✅ Presigned URLs (secure, auto-expire sau 1 giờ)
✅ Error logging để debug
✅ Kompatible với Vercel serverless

---

## 🔍 Nếu Lỗi

1. **Check Vercel logs:**
   - Deployments → Select Latest → Function Logs
   - Tìm message từ `/api/r2/presign-upload`

2. **Check R2 Credentials:**
   - Vào Cloudflare Dashboard
   - Verify Access Key ID & Secret Key

3. **Check CORS:**
   - R2 presigned URLs không cần CORS (direct upload)
   - Nếu error 403, check R2 bucket permissions

---

## 📁 Files Thay Đổi

- `backend/api/r2.js` (NEW)
- `backend/api/admin.js` (UPDATED)
- `backend/api/progress.js` (UPDATED)
- `backend/app.js` (UPDATED)
- `backend/middleware/uploadFile.js` (UPDATED)
- `backend/models/FileAssignment.js` (UPDATED)
- `backend/models/AssignmentSubmission.js` (UPDATED)
- `backend/package.json` (UPDATED)
- `frontend/app/assignments/page.tsx` (UPDATED)
- `frontend/app/admin/types.ts` (UPDATED)

Code đã được push lên GitHub. Vercel sẽ tự động redeploy khi bạn thêm environment variables.
