# Export MongoDB Database from Atlas

Hướng dẫn export/download database từ MongoDB Atlas.

## Cách 1: Sử dụng MongoDB Atlas UI (Đơn giản nhất)

1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com/)
2. Chọn cluster của bạn
3. Click vào **"..."** (three dots) → **"Command Line Tools"**
4. Download **MongoDB Database Tools**
5. Sử dụng connection string để export

## Cách 2: Sử dụng mongodump (Command Line)

### Bước 1: Cài đặt MongoDB Database Tools

**Windows:**
- Download từ: https://www.mongodb.com/try/download/database-tools
- Giải nén và thêm vào PATH

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-database-tools
```

**Linux:**
```bash
# Ubuntu/Debian
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.4.tgz
tar -xzf mongodb-database-tools-*.tgz
export PATH=$PATH:$(pwd)/mongodb-database-tools-*/bin
```

### Bước 2: Lấy Connection String

1. Vào MongoDB Atlas → Clusters
2. Click **"Connect"**
3. Chọn **"Connect your application"**
4. Copy connection string
5. Thay `<password>` bằng password thực tế
6. Thay `<dbname>` bằng tên database

### Bước 3: Export Database

**Sử dụng script có sẵn:**

**Windows (PowerShell):**
```powershell
# Set environment variables
$env:MONGODB_URI = "mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
$env:MONGODB_DB_NAME = "your_database_name"

# Run script
.\scripts\export-database.ps1
```

**Linux/macOS:**
```bash
# Set environment variables
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
export MONGODB_DB_NAME="your_database_name"

# Run script
bash scripts/export-database.sh
```

**Hoặc chạy trực tiếp:**
```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority" --db=your_database_name --out=./database-backup
```

### Bước 4: Kiểm tra kết quả

Sau khi export, bạn sẽ có thư mục `database-backup/backup-TIMESTAMP/your_database_name/` chứa:
- Các file BSON (dữ liệu)
- Các file metadata.json (schema)

## Cách 3: Export từ MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Kết nối với Atlas cluster
3. Chọn database → Click **"..."** → **"Export Collection"**
4. Chọn collections cần export
5. Chọn format (JSON hoặc CSV)

## Cách 4: Export qua API (Programmatic)

Sử dụng MongoDB Node.js driver để export:

```javascript
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = 'mongodb+srv://username:password@cluster.mongodb.net/';
const client = new MongoClient(uri);

async function exportDatabase() {
  try {
    await client.connect();
    const db = client.db('your_database_name');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const data = await db.collection(collection.name).find({}).toArray();
      fs.writeFileSync(
        `backup/${collection.name}.json`,
        JSON.stringify(data, null, 2)
      );
      console.log(`Exported ${collection.name}: ${data.length} documents`);
    }
  } finally {
    await client.close();
  }
}

exportDatabase();
```

## Restore Database

Để restore database đã export:

```bash
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority" ./database-backup/backup-TIMESTAMP/your_database_name
```

## Lưu ý

- Đảm bảo IP address của bạn đã được whitelist trong Atlas Network Access
- Sử dụng user có quyền read để export
- Backup có thể lớn, đảm bảo có đủ dung lượng
- Connection string chứa password, không commit vào git

## Troubleshooting

**Lỗi: "authentication failed"**
- Kiểm tra username và password trong connection string
- Đảm bảo user có quyền read

**Lỗi: "connection timeout"**
- Kiểm tra IP whitelist trong Atlas
- Thử thêm IP hiện tại vào Network Access

**Lỗi: "mongodump not found"**
- Đảm bảo đã cài đặt MongoDB Database Tools
- Kiểm tra PATH environment variable








