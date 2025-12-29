import multer from 'multer';

// Sử dụng memory storage để tạm lưu file trong RAM
// File sẽ được upload lên Cloudinary trong API handler
const storage = multer.memoryStorage();

// Cấu hình multer cho file assignments (cho phép mọi loại file)
const uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

export default uploadFile;

