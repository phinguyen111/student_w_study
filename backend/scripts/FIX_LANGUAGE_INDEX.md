/**
 * Fix Language Index - Alternative Method
 * 
 * Run this in MongoDB Compass or MongoDB Shell:
 * 
 * 1. Open MongoDB Compass
 * 2. Connect to: mongodb+srv://phinguyen:hEr1dGJfdbO6P85m@cluster0.qz9swjf.mongodb.net/learncode
 * 3. Select database "learncode"
 * 4. Select collection "languages"
 * 5. Go to "Indexes" tab
 * 6. Delete the index named "id_1" if it exists
 * 
 * OR run these commands in mongosh:
 */

// Connect to database
use learncode

// Check current indexes
db.languages.getIndexes()

// Drop the problematic index
db.languages.dropIndex("id_1")

// Remove id field from all documents
db.languages.updateMany(
  { id: { $exists: true } },
  { $unset: { id: "" } }
)

// Verify indexes after fix
db.languages.getIndexes()

// Expected result: Only these indexes should remain:
// 1. _id_ (default)
// 2. slug_1 (unique)

console.log("✅ Fix completed! You should now be able to insert/update languages without errors.");
