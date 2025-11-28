'use client'

export interface User {
  _id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export interface UserProgress {
  userId: { _id: string; name: string; email: string }
  levelScores: Array<{
    levelId: {
      _id: string
      title: string
      levelNumber: number
      languageId?: { _id: string; name: string; slug: string; icon: string }
    }
    isUnlocked: boolean
    averageScore: number
    adminApproved: boolean
  }>
  lessonScores?: Array<{
    lessonId: {
      _id: string
      title: string
      lessonNumber: number
      levelId?: {
        _id: string
        title: string
        levelNumber: number
        languageId?: { _id: string; name: string; slug: string; icon: string }
      }
    }
    quizScore: number | null
    codeScore: number | null
    totalScore: number
    completedAt?: string
    quizAttempts?: number
    codeAttempts?: number
  }>
}

export interface Language {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  levels: any[]
}

export interface Level {
  _id: string
  levelNumber: number
  title: string
  description: string
  languageId: { _id: string; name: string }
  lessons: any[]
}

export interface Question {
  question: string
  options?: string[]
  correctAnswer?: number | string
  explanation?: string
  type?: 'multiple-choice' | 'code'
  codeType?: 'html' | 'css' | 'javascript' | 'html-css-js'
  starterCode?: {
    html?: string
    css?: string
    javascript?: string
  }
  expectedOutput?: string
  outputCriteria?: Array<{
    id?: string
    snippet: string
    points: number
    penalty?: number
  }>
}

export type LocalizedString = string | { en?: string; vi?: string }

export type OutputRule = {
  id?: string
  snippet: string
  points: number
  penalty?: number
}

export interface Lesson {
  _id: string
  lessonNumber: number
  title: string
  content?: string
  codeExample?: string
  codeExercise?: {
    language?: string
    starterCode?: string
    description?: string
    outputCriteria?: OutputRule[]
  }
  levelId: { _id: string; title: string; levelNumber: number }
  quiz?: {
    questions: Question[]
    passingScore: number
  }
}

export interface Stats {
  totalUsers: number
  totalAdmins: number
  totalLanguages: number
  totalLevels: number
  totalLessons: number
  totalProgress: number
  newUsersLast30Days: number
  activeUsers: number
  avgQuizScore: string
  avgCodeScore: string
  avgTotalScore: string
  grandTotalScore: number
  totalQuizAttempts: number
  totalCodeAttempts: number
  scoreDistribution: {
    excellent: number
    good: number
    average: number
    poor: number
  }
}

export interface QuizAssignment {
  _id: string
  title: string
  description: string
  questions: Array<{
    question: string | { vi?: string; en?: string }
    options: Array<string | { vi?: string; en?: string }>
    correctAnswer: number
    explanation?: string | { vi?: string; en?: string }
  }>
  passingScore: number
  assignedBy: { _id: string; name: string; email: string }
  assignedTo: Array<{ _id: string; name: string; email: string }>
  deadline: string
  status: 'active' | 'expired' | 'completed'
  submittedCount?: number
  passedCount?: number
  totalAssigned?: number
  createdAt: string
}

export interface TopUser {
  userId: { _id: string; name: string; email: string }
  name: string
  email: string
  completedLessons: number
  quizAverage: number
  codeAverage: number
  totalAverage: number
  totalScore: number
  quizAttempts: number
  codeAttempts: number
  currentStreak: number
  totalStudyTime: number
}

