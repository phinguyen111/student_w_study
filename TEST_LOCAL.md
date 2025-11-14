# Test Local Development

Sau khi cấu hình cho Vercel, bạn vẫn có thể chạy local bình thường.

## Chạy Backend Local

```bash
cd backend
npm install
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

**Lưu ý:** 
- Backend sẽ tự động detect môi trường Vercel (`VERCEL=1`) và không listen port
- Khi chạy local, `VERCEL` không được set, nên backend sẽ listen port 5000 bình thường
- CORS đã được cấu hình để cho phép `http://localhost:3000`

## Chạy Frontend Local

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

**Lưu ý:**
- `next.config.js` chỉ dùng `output: 'standalone'` khi build production
- Dev mode (`npm run dev`) không bị ảnh hưởng
- API URL mặc định là `http://localhost:5000/api` khi không có env variable

## Environment Variables (Optional)

Nếu muốn override, tạo file `.env.local` trong `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Hoặc trong `backend/` tạo `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/learncode
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## Kiểm tra

1. Backend health check: `http://localhost:5000/api/health`
2. Frontend: `http://localhost:3000`
3. Test login, register, learn features

Tất cả đều hoạt động bình thường như trước! ✅

