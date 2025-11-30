#!/bin/bash

# Script to export MongoDB database from Atlas
# 
# Usage:
# 1. Install mongodb-database-tools: https://www.mongodb.com/try/download/database-tools
# 2. Set environment variables or update the script
# 3. Run: bash scripts/export-database.sh

# MongoDB Atlas connection string
# Get this from: Atlas → Clusters → Connect → Connect your application
MONGODB_URI="${MONGODB_URI:-mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority}"

# Database name
DATABASE_NAME="${MONGODB_DB_NAME:-your_database_name}"

# Output directory
OUTPUT_DIR="./database-backup"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="${OUTPUT_DIR}/backup-${TIMESTAMP}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Starting database export..."
echo "Database: $DATABASE_NAME"
echo "Output: $BACKUP_DIR"
echo ""

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    echo "Error: mongodump is not installed"
    echo "Please install MongoDB Database Tools:"
    echo "https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Export database
mongodump --uri="$MONGODB_URI" --db="$DATABASE_NAME" --out="$BACKUP_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database exported successfully!"
    echo "Backup location: $BACKUP_DIR"
    echo ""
    echo "To restore, use:"
    echo "mongorestore --uri=\"$MONGODB_URI\" \"$BACKUP_DIR/$DATABASE_NAME\""
else
    echo ""
    echo "❌ Error exporting database"
    echo "Please check your connection string and credentials"
    exit 1
fi








