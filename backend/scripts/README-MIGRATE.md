# Database Migration and Upload Script

Script để migrate và upload database từ JSON files lên MongoDB Atlas.

## Cấu trúc

- `backend/data/` - Chứa các file JSON đã export từ MongoDB
- `backend/scripts/migrate-and-upload.js` - Script chính để migrate và upload

## Cách sử dụng

### 1. Chuẩn bị

Đảm bảo bạn có:
- File `.env` trong `backend/` với `MONGODB_URI` đã được set
- Các file JSON trong `backend/data/`:
  - `learncode.languages.json`
  - `learncode.levels.json`
  - `learncode.lessons.json`
  - `learncode.users.json`
  - `learncode.userprogresses.json`
  - `learncode.quizassignments.json`
  - `learncode.quizassignmentresults.json`
  - `learncode.quizsessiontrackings.json`
  - `learncode.useractivitytrackings.json`

### 2. Chạy script

```bash
cd backend
node scripts/migrate-and-upload.js
```

### 3. Kết quả

Script sẽ:
1. ✅ Kết nối với MongoDB Atlas
2. 📦 Đọc và parse các file JSON
3. 🔄 Migrate data (ví dụ: convert `codeExercise.description` từ string sang `{vi, en}`)
4. 📤 Upload từng collection lên MongoDB
5. 📊 Hiển thị summary

## Migration Logic

### codeExercise.description Migration

Script tự động migrate `codeExercise.description`:
- **Nếu là string**: Convert thành `{vi: string, en: string}`
- **Nếu đã là object**: Giữ nguyên
- **Nếu không có**: Set thành `{vi: '', en: ''}`

Ví dụ:
```javascript
// Before
codeExercise: {
  description: "Some description"
}

// After
codeExercise: {
  description: {
    vi: "Some description",
    en: "Some description"
  }
}
```

## Thứ tự Upload

Collections được upload theo thứ tự để đảm bảo dependencies:
1. Languages (không phụ thuộc)
2. Levels (phụ thuộc Languages)
3. Lessons (phụ thuộc Levels) - **có migration**
4. Users
5. UserProgress (phụ thuộc Users, Lessons)
6. QuizAssignments
7. QuizAssignmentResults
8. QuizSessionTrackings
9. UserActivityTrackings

## Lưu ý

⚠️ **Script sẽ xóa toàn bộ data hiện tại trong mỗi collection trước khi upload!**

Nếu bạn muốn giữ data hiện tại, comment out phần này trong script:
```javascript
// Clear existing collection
await Model.deleteMany({});
```

## Troubleshooting

### Lỗi: "MONGODB_URI is not set"
- Kiểm tra file `.env` trong `backend/`
- Đảm bảo có dòng: `MONGODB_URI=mongodb+srv://...`

### Lỗi: "Connection timeout"
- Kiểm tra IP whitelist trong MongoDB Atlas
- Đảm bảo connection string đúng

### Lỗi: "Authentication failed"
- Kiểm tra username và password trong connection string
- Đảm bảo user có quyền write

### Lỗi: "File not found"
- Kiểm tra các file JSON có trong `backend/data/`
- Đảm bảo tên file đúng

## Advanced Usage

### Chỉ upload một collection cụ thể

Sửa script để chỉ upload collection bạn muốn:

```javascript
// Chỉ upload lessons
const lessons = loadJSONFile('learncode.lessons.json');
if (lessons) {
  await uploadCollection(Lesson, lessons, 'lessons', migrateCodeExerciseDescription);
}
```

### Custom migration function

Bạn có thể thêm migration function riêng:

```javascript
function customMigration(doc) {
  // Your migration logic here
  return doc;
}

await uploadCollection(Model, data, 'collectionName', customMigration);
```








