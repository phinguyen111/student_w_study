import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { EJSON } from 'bson'
import { fileURLToPath } from 'url'

import User from '../models/User.js'
import UserProgress from '../models/UserProgress.js'
import QuizSessionTracking from '../models/QuizSessionTracking.js'
import Language from '../models/Language.js'
import UserActivityTracking from '../models/UserActivityTracking.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')

const readEjsonFile = (fileName) => {
  const filePath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = EJSON.parse(raw)
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array in ${fileName}`)
  }
  return parsed
}

const upsertCollection = async (Model, documents, label) => {
  if (!documents.length) {
    console.log(`⚠️  No ${label} data to import – skipping`)
    return { inserted: 0 }
  }

  const ids = documents
    .filter((doc) => doc && doc._id)
    .map((doc) => doc._id)

  if (ids.length) {
    await Model.deleteMany({ _id: { $in: ids } })
  }

  const result = await Model.insertMany(documents, { ordered: false })
  console.log(`✅ Imported ${result.length} ${label}`)
  return { inserted: result.length }
}

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    console.log('\nReading data dumps...')
    const languagesData = readEjsonFile('learncode.languages.json')
    const usersData = readEjsonFile('learncode.users.json')
    const userProgressData = readEjsonFile('learncode.userprogresses.json')
    const quizSessionsData = readEjsonFile('learncode.quizsessiontrackings.json')
    const activityData = readEjsonFile('learncode.useractivitytrackings.json')

    console.log('\nImporting collections...')
    await upsertCollection(Language, languagesData, 'languages')
    await upsertCollection(User, usersData, 'users')
    await upsertCollection(UserProgress, userProgressData, 'user progress records')
    await upsertCollection(QuizSessionTracking, quizSessionsData, 'quiz session tracking records')
    await upsertCollection(UserActivityTracking, activityData, 'user activity tracking records')

    console.log('\n🎉 Import completed successfully!')
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Import failed:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

run()

