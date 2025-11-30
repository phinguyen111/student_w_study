/**
 * Script to export MongoDB database from Atlas
 * 
 * Usage:
 * 1. Install mongodb-database-tools: https://www.mongodb.com/try/download/database-tools
 * 2. Update connection string below
 * 3. Run: node scripts/export-database.js
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// MongoDB Atlas connection string
// Format: mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
const CONNECTION_STRING = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority';

// Database name
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'your_database_name';

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../database-backup');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR = path.join(OUTPUT_DIR, `backup-${TIMESTAMP}`);

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Starting database export...');
console.log(`Database: ${DATABASE_NAME}`);
console.log(`Output: ${BACKUP_DIR}`);

// mongodump command
const command = `mongodump --uri="${CONNECTION_STRING}" --db=${DATABASE_NAME} --out="${BACKUP_DIR}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error exporting database:', error);
    console.error('Make sure mongodump is installed and connection string is correct');
    return;
  }
  
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  
  console.log('Database exported successfully!');
  console.log(`Backup location: ${BACKUP_DIR}`);
  console.log('\nTo restore, use:');
  console.log(`mongorestore --uri="${CONNECTION_STRING}" "${BACKUP_DIR}/${DATABASE_NAME}"`);
});









