/**
 * Script to check and validate data before migration
 * 
 * Usage:
 * node backend/scripts/check-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Check if file exists and count documents
function checkFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filename}: NOT FOUND`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const count = Array.isArray(data) ? data.length : 1;
    
    // Check for codeExercise.description issues in lessons
    if (filename === 'learncode.lessons.json' && Array.isArray(data)) {
      let stringDescriptions = 0;
      let objectDescriptions = 0;
      let missingDescriptions = 0;
      
      data.forEach((lesson, index) => {
        if (lesson.codeExercise) {
          if (!lesson.codeExercise.description) {
            missingDescriptions++;
          } else if (typeof lesson.codeExercise.description === 'string') {
            stringDescriptions++;
            if (stringDescriptions <= 3) {
              console.log(`   ⚠️  Lesson ${index + 1} (${lesson._id?.$oid || lesson._id}): description is string`);
            }
          } else if (typeof lesson.codeExercise.description === 'object') {
            objectDescriptions++;
          }
        }
      });
      
      console.log(`   📊 Description stats:`);
      console.log(`      ✅ Object format: ${objectDescriptions}`);
      console.log(`      ⚠️  String format (needs migration): ${stringDescriptions}`);
      console.log(`      ❌ Missing: ${missingDescriptions}`);
    }
    
    const fileSize = (fs.statSync(filePath).size / 1024).toFixed(2);
    console.log(`✅ ${filename}: ${count} documents (${fileSize} KB)`);
    return { count, fileSize };
  } catch (error) {
    console.log(`❌ ${filename}: ERROR - ${error.message}`);
    return null;
  }
}

// Main function
console.log('🔍 Checking data files...\n');
console.log(`📁 Data directory: ${DATA_DIR}\n`);

const files = [
  'learncode.languages.json',
  'learncode.levels.json',
  'learncode.lessons.json',
  'learncode.users.json',
  'learncode.userprogresses.json',
  'learncode.quizassignments.json',
  'learncode.quizassignmentresults.json',
  'learncode.quizsessiontrackings.json',
  'learncode.useractivitytrackings.json'
];

const results = {};
let totalDocuments = 0;

files.forEach(filename => {
  const result = checkFile(filename);
  if (result) {
    results[filename] = result;
    totalDocuments += result.count;
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`Total documents: ${totalDocuments}`);
console.log(`Files found: ${Object.keys(results).length}/${files.length}`);
console.log('='.repeat(60));

if (Object.keys(results).length === files.length) {
  console.log('\n✅ All files are ready for migration!');
  console.log('💡 Run: npm run migrate');
} else {
  console.log('\n⚠️  Some files are missing. Please check the data directory.');
}

