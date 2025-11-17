// Test MongoDB Connection Script
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

// Check if MONGODB_URI is set
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not set!');
  console.error('\n💡 Please create a .env file in the backend/ directory with:');
  console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learncode');
  console.error('\n   Or set it as an environment variable:');
  console.error('   export MONGODB_URI="mongodb+srv://..."');
  process.exit(1);
}

// Show URI preview (without exposing password)
const uriPreview = mongoUri.includes('@') 
  ? mongoUri.split('@')[1] 
  : mongoUri.substring(0, 30) + '...';
console.log(`📡 Connection String: ${uriPreview}`);
console.log(`   Full URI length: ${mongoUri.length} characters\n`);

// Test connection
console.log('🔄 Attempting to connect...\n');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Ready State: ${mongoose.connection.readyState}`);
    console.log(`   Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);
    
    // Test a simple query
    console.log('🧪 Testing database query...');
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ Database query successful!\n');
    console.log('🎉 All tests passed! Your MongoDB connection is working correctly.\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Connection Failed!\n');
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}\n`);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 This usually means:');
      console.error('   1. MongoDB server is not reachable');
      console.error('   2. Network access is blocked (check MongoDB Atlas Network Access)');
      console.error('   3. Connection string is incorrect');
      console.error('   4. MongoDB cluster is paused or not running\n');
      console.error('🔧 Solutions:');
      console.error('   - Check MongoDB Atlas → Network Access → Add your IP (or 0.0.0.0/0 for all)');
      console.error('   - Verify connection string format');
      console.error('   - Check if MongoDB cluster is running\n');
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('💡 Authentication failed!');
      console.error('   - Check username and password in MONGODB_URI');
      console.error('   - Verify user exists in MongoDB Atlas → Database Access');
      console.error('   - Check user has proper permissions\n');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 Server selection failed!');
      console.error('   - Check network connectivity');
      console.error('   - Verify MongoDB Atlas cluster is accessible\n');
    }
    
    process.exit(1);
  });

