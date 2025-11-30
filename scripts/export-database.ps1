# PowerShell script to export MongoDB database from Atlas
# 
# Usage:
# 1. Install mongodb-database-tools: https://www.mongodb.com/try/download/database-tools
# 2. Set environment variables or update the script
# 3. Run: .\scripts\export-database.ps1

# MongoDB Atlas connection string
# Get this from: Atlas → Clusters → Connect → Connect your application
$MONGODB_URI = if ($env:MONGODB_URI) { $env:MONGODB_URI } else { "mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority" }

# Database name
$DATABASE_NAME = if ($env:MONGODB_DB_NAME) { $env:MONGODB_DB_NAME } else { "your_database_name" }

# Output directory
$OUTPUT_DIR = ".\database-backup"
$TIMESTAMP = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BACKUP_DIR = "$OUTPUT_DIR\backup-$TIMESTAMP"

# Create output directory
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

Write-Host "Starting database export..." -ForegroundColor Cyan
Write-Host "Database: $DATABASE_NAME" -ForegroundColor Yellow
Write-Host "Output: $BACKUP_DIR" -ForegroundColor Yellow
Write-Host ""

# Check if mongodump is installed
$mongodumpPath = Get-Command mongodump -ErrorAction SilentlyContinue
if (-not $mongodumpPath) {
    Write-Host "Error: mongodump is not installed" -ForegroundColor Red
    Write-Host "Please install MongoDB Database Tools:" -ForegroundColor Yellow
    Write-Host "https://www.mongodb.com/try/download/database-tools" -ForegroundColor Blue
    exit 1
}

# Export database
Write-Host "Exporting database..." -ForegroundColor Cyan
& mongodump --uri="$MONGODB_URI" --db="$DATABASE_NAME" --out="$BACKUP_DIR"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database exported successfully!" -ForegroundColor Green
    Write-Host "Backup location: $BACKUP_DIR" -ForegroundColor Green
    Write-Host ""
    Write-Host "To restore, use:" -ForegroundColor Yellow
    Write-Host "mongorestore --uri=`"$MONGODB_URI`" `"$BACKUP_DIR\$DATABASE_NAME`"" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Error exporting database" -ForegroundColor Red
    Write-Host "Please check your connection string and credentials" -ForegroundColor Yellow
    exit 1
}









