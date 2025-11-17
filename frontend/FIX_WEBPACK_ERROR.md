# Fix: UNKNOWN error opening webpack-runtime.js

## Nguyên nhân

Lỗi này thường xảy ra trên Windows khi:
1. File bị lock bởi process khác (antivirus, file explorer, etc.)
2. Thư mục `.next` bị corrupt
3. Quyền truy cập file bị hạn chế
4. Next.js dev server đang chạy và cố gắng rebuild

## Giải pháp

### Bước 1: Dừng tất cả Next.js processes

1. Đóng terminal đang chạy `npm run dev`
2. Mở Task Manager (Ctrl + Shift + Esc)
3. Tìm và kill các process:
   - `node.exe`
   - `next.exe` (nếu có)

### Bước 2: Xóa thư mục .next

**PowerShell:**
```powershell
cd frontend
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

**Command Prompt:**
```cmd
cd frontend
rmdir /s /q .next
rmdir /s /q node_modules\.cache
```

**Hoặc dùng npm script:**
```bash
npm run clean:win
```

### Bước 3: Kiểm tra file lock

Nếu vẫn lỗi, có thể file đang bị lock:

1. **Tắt Antivirus tạm thời** (chỉ khi dev)
2. **Kiểm tra file explorer** - đóng các cửa sổ đang mở thư mục `.next`
3. **Restart máy** nếu cần

### Bước 4: Chạy lại dev server

```bash
npm run dev
```

## Nếu vẫn lỗi

### Giải pháp 1: Chạy với quyền Administrator

1. Right-click PowerShell/CMD
2. Chọn "Run as Administrator"
3. Chạy lại `npm run dev`

### Giải pháp 2: Thay đổi port

Có thể port đang bị conflict:

```bash
npm run dev -- -p 3001
```

### Giải pháp 3: Clear toàn bộ cache

```bash
# Xóa node_modules và reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

### Giải pháp 4: Kiểm tra disk space

Đảm bảo có đủ disk space:
```powershell
Get-PSDrive C
```

## Prevention

1. **Không mở file explorer vào thư mục `.next`** khi dev server đang chạy
2. **Thêm `.next` vào antivirus exclusion list**
3. **Dùng WSL2** nếu có thể (ít lỗi file lock hơn)

## Quick Fix Script

Tạo file `clean.ps1` trong thư mục frontend:

```powershell
# Stop all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a bit
Start-Sleep -Seconds 2

# Remove .next and cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

Write-Host "Cleaned! Now run: npm run dev"
```

Chạy: `.\clean.ps1`

