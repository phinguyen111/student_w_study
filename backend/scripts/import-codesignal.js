/**
 * Script to manually import lessons from CodeSignal Learn
 * 
 * Note: CodeSignal Learn does not have a public API.
 * This script provides a template for manually adding lessons.
 * 
 * To use:
 * 1. Visit CodeSignal Learn pages
 * 2. Copy the content
 * 3. Format it according to the Lesson schema
 * 4. Add it to seed.js or use this script
 */

import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Language from '../models/Language.js';
import Level from '../models/Level.js';
import Lesson from '../models/Lesson.js';

dotenv.config();

const importLesson = async () => {
  try {
    await connectDB();

    // Find HTML language and level
    const htmlLang = await Language.findOne({ slug: 'html' });
    if (!htmlLang) {
      console.error('HTML language not found. Run seed.js first.');
      process.exit(1);
    }

    const htmlLevel1 = await Level.findOne({ 
      languageId: htmlLang._id, 
      levelNumber: 1 
    });
    if (!htmlLevel1) {
      console.error('HTML Level 1 not found. Run seed.js first.');
      process.exit(1);
    }

    // Example: Add a new lesson
    const newLesson = await Lesson.create({
      levelId: htmlLevel1._id,
      lessonNumber: 3, // Adjust based on existing lessons
      title: 'Your Lesson Title Here',
      content: `# Your Lesson Content

Add your markdown content here...`,
      codeExample: `<!-- Your code example here -->`,
      quiz: {
        questions: [
          {
            question: 'Your question?',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 0,
            explanation: 'Explanation here'
          }
        ],
        passingScore: 7
      }
    });

    // Add to level
    htmlLevel1.lessons.push(newLesson._id);
    await htmlLevel1.save();

    console.log('Lesson imported successfully!');
    console.log('Lesson ID:', newLesson._id);
    process.exit(0);
  } catch (error) {
    console.error('Error importing lesson:', error);
    process.exit(1);
  }
};

// Uncomment to run
// importLesson();

export default importLesson;



