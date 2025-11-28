/**
 * Script to migrate and upload database to MongoDB Atlas
 * 
 * This script:
 * 1. Reads JSON files from backend/data/
 * 2. Migrates/transforms data (e.g., codeExercise.description from string to {vi, en})
 * 3. Uploads to MongoDB Atlas
 * 
 * Usage:
 * node backend/scripts/migrate-and-upload.js
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Lesson from '../models/Lesson.js';
import Level from '../models/Level.js';
import Language from '../models/Language.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import QuizAssignment from '../models/QuizAssignment.js';
import QuizAssignmentResult from '../models/QuizAssignmentResult.js';
import QuizSessionTracking from '../models/QuizSessionTracking.js';
import UserActivityTracking from '../models/UserActivityTracking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = MONGODB_URI?.split('/').pop()?.split('?')[0] || 'learncode';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env file');
  process.exit(1);
}

// Data directory
const DATA_DIR = path.join(__dirname, '../data');

// Helper function to convert MongoDB extended JSON to regular objects
function convertMongoDBJSON(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertMongoDBJSON);
  }
  
  if (typeof obj === 'object') {
    // Handle MongoDB extended JSON types
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    if (obj.$numberLong) {
      return parseInt(obj.$numberLong);
    }
    if (obj.$numberDouble) {
      return parseFloat(obj.$numberDouble);
    }
    
    // Recursively convert nested objects
    const converted = {};
    for (const key in obj) {
      converted[key] = convertMongoDBJSON(obj[key]);
    }
    return converted;
  }
  
  return obj;
}

// Migrate codeExercise.description from {vi, en} object to string format
function migrateCodeExerciseDescription(lesson) {
  if (!lesson.codeExercise) return lesson;
  
  // If description is already a string, keep it
  if (lesson.codeExercise.description && typeof lesson.codeExercise.description === 'string') {
    return lesson;
  }
  
  // If description is an object {vi, en}, convert to string (prefer en, fallback to vi)
  if (lesson.codeExercise.description && typeof lesson.codeExercise.description === 'object') {
    const descObj = lesson.codeExercise.description;
    lesson.codeExercise.description = descObj.en || descObj.vi || '';
  } else {
    // If no description, set empty string
    lesson.codeExercise.description = '';
  }
  
  return lesson;
}

// Load and parse JSON file
function loadJSONFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error(`❌ Error reading ${filename}:`, error.message);
    return null;
  }
}

// Upload collection to MongoDB
async function uploadCollection(Model, data, collectionName, migrateFn = null) {
  if (!data || data.length === 0) {
    console.log(`⏭️  Skipping ${collectionName} (no data)`);
    return { inserted: 0, updated: 0, errors: 0 };
  }
  
  console.log(`\n📦 Processing ${collectionName}...`);
  console.log(`   Found ${data.length} documents`);
  
  let inserted = 0;
  let updated = 0;
  let errors = 0;
  
  // Clear existing collection (optional - comment out if you want to keep existing data)
  try {
    await Model.deleteMany({});
    console.log(`   🗑️  Cleared existing ${collectionName}`);
  } catch (error) {
    console.warn(`   ⚠️  Could not clear ${collectionName}:`, error.message);
  }
  
  // Process in batches
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    for (const doc of batch) {
      try {
        // Convert MongoDB extended JSON
        const convertedDoc = convertMongoDBJSON(doc);
        
        // Apply migration function if provided
        const migratedDoc = migrateFn ? migrateFn(convertedDoc) : convertedDoc;
        
        // Try to find existing document
        const existing = await Model.findById(migratedDoc._id);
        
        if (existing) {
          // Update existing
          await Model.findByIdAndUpdate(migratedDoc._id, migratedDoc, { upsert: true });
          updated++;
        } else {
          // Insert new
          await Model.create(migratedDoc);
          inserted++;
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Error processing document ${doc._id?.$oid || doc._id}:`, error.message);
      }
    }
    
    process.stdout.write(`   Progress: ${Math.min(i + batchSize, data.length)}/${data.length}\r`);
  }
  
  console.log(`\n   ✅ ${collectionName}: ${inserted} inserted, ${updated} updated, ${errors} errors`);
  
  return { inserted, updated, errors };
}

// Main function
async function main() {
  console.log('🚀 Starting database migration and upload...\n');
  console.log(`📊 Database: ${DATABASE_NAME}`);
  console.log(`📁 Data directory: ${DATA_DIR}\n`);
  
  // Connect to MongoDB
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
  
  const results = {};
  
  try {
    // Load and upload collections in order (respecting dependencies)
    
    // 1. Languages (no dependencies)
    const languages = loadJSONFile('learncode.languages.json');
    if (languages) {
      results.languages = await uploadCollection(Language, languages, 'languages');
    }
    
    // 2. Levels (depends on languages)
    const levels = loadJSONFile('learncode.levels.json');
    if (levels) {
      results.levels = await uploadCollection(Level, levels, 'levels');
    }
    
    // 3. Lessons (depends on levels) - with migration
    const lessons = loadJSONFile('learncode.lessons.json');
    if (lessons) {
      results.lessons = await uploadCollection(
        Lesson, 
        lessons, 
        'lessons',
        migrateCodeExerciseDescription
      );
    }
    
    // 4. Users
    const users = loadJSONFile('learncode.users.json');
    if (users) {
      results.users = await uploadCollection(User, users, 'users');
    }
    
    // 5. UserProgress (depends on users, lessons)
    const userProgresses = loadJSONFile('learncode.userprogresses.json');
    if (userProgresses) {
      results.userProgresses = await uploadCollection(UserProgress, userProgresses, 'userProgresses');
    }
    
    // 6. QuizAssignments
    const quizAssignments = loadJSONFile('learncode.quizassignments.json');
    if (quizAssignments) {
      results.quizAssignments = await uploadCollection(QuizAssignment, quizAssignments, 'quizAssignments');
    }
    
    // 7. QuizAssignmentResults
    const quizAssignmentResults = loadJSONFile('learncode.quizassignmentresults.json');
    if (quizAssignmentResults) {
      results.quizAssignmentResults = await uploadCollection(QuizAssignmentResult, quizAssignmentResults, 'quizAssignmentResults');
    }
    
    // 8. QuizSessionTrackings
    const quizSessionTrackings = loadJSONFile('learncode.quizsessiontrackings.json');
    if (quizSessionTrackings) {
      results.quizSessionTrackings = await uploadCollection(QuizSessionTracking, quizSessionTrackings, 'quizSessionTrackings');
    }
    
    // 9. UserActivityTrackings
    const userActivityTrackings = loadJSONFile('learncode.useractivitytrackings.json');
    if (userActivityTrackings) {
      results.userActivityTrackings = await uploadCollection(UserActivityTracking, userActivityTrackings, 'userActivityTrackings');
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('='.repeat(60));
    
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    
    for (const [collection, stats] of Object.entries(results)) {
      if (stats) {
        console.log(`${collection}:`);
        console.log(`  ✅ Inserted: ${stats.inserted}`);
        console.log(`  🔄 Updated: ${stats.updated}`);
        console.log(`  ❌ Errors: ${stats.errors}`);
        totalInserted += stats.inserted;
        totalUpdated += stats.updated;
        totalErrors += stats.errors;
      }
    }
    
    console.log('='.repeat(60));
    console.log(`TOTAL: ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);
    console.log('='.repeat(60));
    console.log('\n✅ Database migration and upload completed!');
    
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    throw error;
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

