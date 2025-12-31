import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

async function fixLanguageIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const collection = db.collection('languages');

    // Check existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic id_1 index if it exists
    try {
      console.log('\n🗑️  Dropping id_1 index...');
      await collection.dropIndex('id_1');
      console.log('✅ Successfully dropped id_1 index');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  id_1 index does not exist (already fixed)');
      } else {
        throw error;
      }
    }

    // Check indexes after drop
    console.log('\n📋 Indexes after drop:');
    const indexesAfter = await collection.indexes();
    console.log(JSON.stringify(indexesAfter, null, 2));

    // Remove id field from all documents if it exists
    console.log('\n🔧 Removing id field from documents...');
    const updateResult = await collection.updateMany(
      { id: { $exists: true } },
      { $unset: { id: '' } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} documents`);

    console.log('\n✅ Fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixLanguageIndex();
