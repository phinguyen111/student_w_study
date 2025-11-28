import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import UserProgress from '../models/UserProgress.js'

dotenv.config()

const deleteLessonsLevel1 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find Level 1 - try to find HTML/CSS/JS level first, or any level 1
    let level1 = await Level.findOne({ levelNumber: 1 })
      .populate('languageId')
      .sort({ createdAt: 1 }) // Get the first created level 1

    // If not found, try to find by language name
    if (!level1) {
      const Language = (await import('../models/Language.js')).default
      const htmlLang = await Language.findOne({ 
        $or: [
          { name: { $regex: /html|css|javascript/i } },
          { slug: { $regex: /html|css|javascript/i } }
        ]
      })
      
      if (htmlLang) {
        level1 = await Level.findOne({ 
          levelNumber: 1,
          languageId: htmlLang._id 
        }).populate('languageId')
      }
    }

    if (!level1) {
      console.error('Level 1 not found. Please check your database.')
      process.exit(1)
    }

    console.log(`Found Level 1: ${level1.title} (ID: ${level1._id})`)
    if (level1.languageId) {
      console.log(`  Language: ${level1.languageId.name || level1.languageId.slug || 'Unknown'}`)
    }

    // Find lessons with lessonNumber 2-7 in level 1
    const lessonsToDelete = await Lesson.find({
      levelId: level1._id,
      lessonNumber: { $gte: 2, $lte: 7 }
    })

    console.log(`Found ${lessonsToDelete.length} lessons to delete:`)
    lessonsToDelete.forEach(lesson => {
      console.log(`  - Lesson ${lesson.lessonNumber}: ${lesson.title} (ID: ${lesson._id})`)
    })

    if (lessonsToDelete.length === 0) {
      console.log('No lessons found to delete')
      await mongoose.disconnect()
      process.exit(0)
    }

    // Get lesson IDs
    const lessonIds = lessonsToDelete.map(l => l._id)

    // Remove these lessons from user progress
    console.log('\nCleaning up user progress...')
    const progressUpdateResult = await UserProgress.updateMany(
      {},
      {
        $pull: {
          completedLessonIds: { $in: lessonIds },
          lessonScores: { lessonId: { $in: lessonIds } }
        }
      }
    )
    console.log(`Updated ${progressUpdateResult.modifiedCount} user progress records`)

    // Delete the lessons
    console.log('\nDeleting lessons...')
    const deleteResult = await Lesson.deleteMany({
      _id: { $in: lessonIds }
    })
    console.log(`Deleted ${deleteResult.deletedCount} lessons`)

    // Renumber remaining lessons in level 1 (if any)
    const remainingLessons = await Lesson.find({
      levelId: level1._id,
      lessonNumber: { $gt: 7 }
    }).sort({ lessonNumber: 1 })

    if (remainingLessons.length > 0) {
      console.log('\nRenumbering remaining lessons...')
      for (let i = 0; i < remainingLessons.length; i++) {
        const newNumber = i + 2 // Start from 2 (since lesson 1 remains)
        await Lesson.findByIdAndUpdate(remainingLessons[i]._id, {
          lessonNumber: newNumber
        })
        console.log(`  - Renumbered lesson ${remainingLessons[i].lessonNumber} to ${newNumber}`)
      }
    }

    console.log('\n✅ Done!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

deleteLessonsLevel1()

