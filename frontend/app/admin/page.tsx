'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Unlock, 
  Lock,
  Users, 
  BookOpen, 
  Layers, 
  FileText, 
  BarChart3, 
  Trash2, 
  Edit, 
  Plus,
  Save,
  X,
  Shield,
  UserCheck,
  TrendingUp,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  Activity,
  Filter,
  RefreshCw
} from 'lucide-react'

interface User {
  _id: string
  email: string
  name: string
  role: string
  createdAt: string
}

interface UserProgress {
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

interface Language {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
  levels: any[]
}

interface Level {
  _id: string
  levelNumber: number
  title: string
  description: string
  languageId: { _id: string; name: string }
  lessons: any[]
}

interface Question {
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
}

interface Lesson {
  _id: string
  lessonNumber: number
  title: string
  content?: string
  codeExample?: string
  levelId: { _id: string; title: string; levelNumber: number }
  quiz?: {
    questions: Question[]
    passingScore: number
  }
}

interface Stats {
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

interface QuizAssignment {
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

interface TopUser {
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

// Helper function to get friendly website name from domain
const getWebsiteName = (domain: string): string => {
  if (!domain) return domain;
  const domainLower = domain.toLowerCase();
  
  const websiteNames: Record<string, string> = {
    // AI & Chat
    'chatgpt.com': 'ChatGPT',
    'chat.openai.com': 'ChatGPT',
    'openai.com': 'OpenAI',
    'claude.ai': 'Claude AI',
    'bard.google.com': 'Google Bard',
    'gemini.google.com': 'Google Gemini',
    
    // Social Media
    'facebook.com': 'Facebook',
    'fb.com': 'Facebook',
    'messenger.com': 'Facebook Messenger',
    'instagram.com': 'Instagram',
    'twitter.com': 'Twitter',
    'x.com': 'Twitter/X',
    'linkedin.com': 'LinkedIn',
    'tiktok.com': 'TikTok',
    'snapchat.com': 'Snapchat',
    'pinterest.com': 'Pinterest',
    'reddit.com': 'Reddit',
    
    // Video & Streaming
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'twitch.tv': 'Twitch',
    'vimeo.com': 'Vimeo',
    'netflix.com': 'Netflix',
    'spotify.com': 'Spotify',
    
    // Communication
    'discord.com': 'Discord',
    'slack.com': 'Slack',
    'whatsapp.com': 'WhatsApp',
    'telegram.org': 'Telegram',
    'viber.com': 'Viber',
    'skype.com': 'Skype',
    'zoom.us': 'Zoom',
    
    // Search & Information
    'google.com': 'Google',
    'bing.com': 'Bing',
    'duckduckgo.com': 'DuckDuckGo',
    'wikipedia.org': 'Wikipedia',
    'stackoverflow.com': 'Stack Overflow',
    'github.com': 'GitHub',
    'w3schools.com': 'W3Schools',
    'medium.com': 'Medium',
    'quora.com': 'Quora',
    
    // Google Services
    'docs.google.com': 'Google Docs',
    'translate.google.com': 'Google Translate',
    'gmail.com': 'Gmail',
    'drive.google.com': 'Google Drive',
    'sheets.google.com': 'Google Sheets',
    'slides.google.com': 'Google Slides',
    
    // Microsoft
    'microsoft.com': 'Microsoft',
    'office.com': 'Microsoft Office',
    'outlook.com': 'Outlook',
    'onedrive.com': 'OneDrive',
    
    // E-commerce
    'amazon.com': 'Amazon',
    'ebay.com': 'eBay',
    'shopify.com': 'Shopify',
    'alibaba.com': 'Alibaba',
    'aliexpress.com': 'AliExpress',
  };
  
  // Check exact match first
  if (websiteNames[domainLower]) {
    return websiteNames[domainLower];
  }
  
  // Check if domain contains any known website
  for (const [key, value] of Object.entries(websiteNames)) {
    if (domainLower.includes(key)) {
      return value;
    }
  }
  
  // Return formatted domain if no match
  return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
};

export default function AdminPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [trackingStats, setTrackingStats] = useState<any>(null)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [loadingActivityLog, setLoadingActivityLog] = useState(false)
  const [activityLogFilters, setActivityLogFilters] = useState({
    userId: '',
    quizType: '',
    limit: 50
  })
  
  // Users
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('')
  const [selectedLevelId, setSelectedLevelId] = useState<string>('')
  
  // Sort states for different user lists
  const [topUsersSort, setTopUsersSort] = useState<'score' | 'name' | 'email' | 'lessons' | 'streak'>('score')
  const [topUsersSortOrder, setTopUsersSortOrder] = useState<'asc' | 'desc'>('desc')
  const [recentUsersSort, setRecentUsersSort] = useState<'date' | 'name' | 'email' | 'role'>('date')
  const [recentUsersSortOrder, setRecentUsersSortOrder] = useState<'asc' | 'desc'>('desc')
  const [usersTabSort, setUsersTabSort] = useState<'name' | 'email' | 'role' | 'date'>('name')
  const [usersTabSortOrder, setUsersTabSortOrder] = useState<'asc' | 'desc'>('asc')
  const [userProgressTabSort, setUserProgressTabSort] = useState<'name' | 'email'>('name')
  const [userProgressTabSortOrder, setUserProgressTabSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Search states
  const [usersTabSearch, setUsersTabSearch] = useState<string>('')
  const [userProgressTabSearch, setUserProgressTabSearch] = useState<string>('')
  const [userProgressSummaries, setUserProgressSummaries] = useState<Record<string, { level: string; language: string; score: number; completedLessons: number }>>({})
  
  // Content Management
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  // Editing states
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingLanguage, setEditingLanguage] = useState<string | null>(null)
  const [editingLanguageData, setEditingLanguageData] = useState<{
    name: string
    slug: string
    description: string
    icon: string
  } | null>(null)
  const [editingLevel, setEditingLevel] = useState<string | null>(null)
  const [editingLevelData, setEditingLevelData] = useState<{
    languageId: string
    levelNumber: number
    title: string
    description: string
  } | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  const [editingLessonData, setEditingLessonData] = useState<{
    levelId: string
    lessonNumber: number
    title: string
    content: string
    codeExample: string
    quiz: {
      questions: any[]
      passingScore: number
    }
  } | null>(null)
  
  // Form states
  const [newLanguage, setNewLanguage] = useState({ name: '', slug: '', description: '', icon: '🌐' })
  const [newLevel, setNewLevel] = useState({ languageId: '', levelNumber: 1, title: '', description: '' })
  const [showNewLanguage, setShowNewLanguage] = useState(false)
  const [showNewLevel, setShowNewLevel] = useState(false)
  const [showNewLesson, setShowNewLesson] = useState(false)
  const [showBulkCreateUsers, setShowBulkCreateUsers] = useState(false)
  const [bulkUsers, setBulkUsers] = useState<Array<{ name: string; email: string; password: string }>>([{ name: '', email: '', password: '' }])
  const [newLesson, setNewLesson] = useState({
    levelId: '',
    lessonNumber: 1,
    title: '',
    content: '',
    codeExample: '',
    quiz: {
      questions: [] as any[],
      passingScore: 7
    }
  })
  
  // Quiz Assignments
  const [quizAssignments, setQuizAssignments] = useState<QuizAssignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<QuizAssignment | null>(null)
  const [assignmentResults, setAssignmentResults] = useState<any[]>([])
  const [assignmentTracking, setAssignmentTracking] = useState<any[]>([])
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    questions: [] as any[],
    passingScore: 7,
    assignedTo: [] as string[],
    deadline: ''
  })

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/stats?lang=en')
      setStats(response.data.stats)
      setRecentUsers(response.data.recentUsers)
      setTopUsers(response.data.topUsers || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchTrackingStats = async () => {
    try {
      const response = await api.get('/admin/tracking-stats?lang=en')
      setTrackingStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching tracking stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchUserProgress = async (userId: string) => {
    try {
      const response = await api.get(`/admin/users/${userId}/progress?lang=en`)
      setUserProgress(response.data.progress)
      setSelectedUser(userId)
    } catch (error) {
      console.error('Error fetching user progress:', error)
    }
  }

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/admin/languages?lang=en')
      setLanguages(response.data.languages)
    } catch (error) {
      console.error('Error fetching languages:', error)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await api.get('/admin/levels?lang=en')
      setLevels(response.data.levels)
    } catch (error) {
      console.error('Error fetching levels:', error)
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await api.get('/admin/lessons?lang=en')
      setLessons(response.data.lessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  const handleUnlockLevel = async (levelId?: string) => {
    if (!selectedUser) {
      alert('Please select a user first')
      return
    }
    
    const levelToUnlock = levelId || selectedLevelId
    if (!levelToUnlock) {
      alert('Please select a level to unlock')
      return
    }
    
    try {
      await api.post(`/admin/users/${selectedUser}/unlock-level/${levelToUnlock}`)
      fetchUserProgress(selectedUser)
      fetchDashboard()
      setSelectedLanguageId('')
      setSelectedLevelId('')
    } catch (error) {
      console.error('Error unlocking level:', error)
      alert('Error unlocking level')
    }
  }

  const handleLockLevel = async (levelId: string) => {
    if (!selectedUser) {
      alert('Please select a user first')
      return
    }
    
    if (!confirm('Are you sure you want to lock this level? User will lose access to it.')) {
      return
    }
    
    try {
      await api.post(`/admin/users/${selectedUser}/lock-level/${levelId}`)
      fetchUserProgress(selectedUser)
      fetchDashboard()
    } catch (error) {
      console.error('Error locking level:', error)
      alert('Error locking level')
    }
  }

  // Get available levels for selected language
  const getAvailableLevels = () => {
    if (!selectedLanguageId || !levels.length) return []
    return levels.filter(level => level.languageId._id === selectedLanguageId)
  }

  // Sort functions for different user lists
  const getSortedTopUsers = () => {
    const sorted = [...topUsers].sort((a, b) => {
      let aValue: any, bValue: any
      switch (topUsersSort) {
        case 'score':
          aValue = a.totalAverage
          bValue = b.totalAverage
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'lessons':
          aValue = a.completedLessons
          bValue = b.completedLessons
          break
        case 'streak':
          aValue = a.currentStreak
          bValue = b.currentStreak
          break
        default:
          aValue = a.totalAverage
          bValue = b.totalAverage
      }
      if (aValue < bValue) return topUsersSortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return topUsersSortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  const getSortedRecentUsers = () => {
    const sorted = [...recentUsers].sort((a, b) => {
      let aValue: any, bValue: any
      switch (recentUsersSort) {
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }
      if (aValue < bValue) return recentUsersSortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return recentUsersSortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  const getSortedUsersTab = () => {
    const sorted = [...users].sort((a, b) => {
      let aValue: any, bValue: any
      switch (usersTabSort) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'date':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      if (aValue < bValue) return usersTabSortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return usersTabSortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  const getSortedUserProgressTab = () => {
    const sorted = [...users].sort((a, b) => {
      let aValue: any, bValue: any
      switch (userProgressTabSort) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }
      if (aValue < bValue) return userProgressTabSortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return userProgressTabSortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }

  // Helper to get current language and level from progress object
  const getCurrentLanguageAndLevelFromProgress = (progress: UserProgress) => {
    if (!progress || !progress.lessonScores || progress.lessonScores.length === 0) {
      return null
    }

    const recentLessons = [...progress.lessonScores]
      .filter(ls => ls.totalScore > 0)
      .sort((a, b) => {
        if (a.completedAt && b.completedAt) {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        }
        return (b.totalScore || 0) - (a.totalScore || 0)
      })

    if (recentLessons.length === 0) return null

    const recentLesson = recentLessons[0]
    if (recentLesson.lessonId && typeof recentLesson.lessonId === 'object' && 'levelId' in recentLesson.lessonId) {
      const levelData = (recentLesson.lessonId as any).levelId
      if (levelData) {
        const levelName = levelData.title || `Level ${levelData.levelNumber || ''}`
        const languageName = levelData.languageId?.name || ''
        return { level: levelName, language: languageName }
      }
    }

    return null
  }

  // Fetch user progress summaries for search functionality
  const fetchUserProgressSummaries = async () => {
    try {
      const summaries: Record<string, { level: string; language: string; score: number; completedLessons: number }> = {}
      
      // Use topUsers for initial data
      if (topUsers && topUsers.length > 0) {
        topUsers.forEach(topUser => {
          if (topUser.userId?._id) {
            summaries[topUser.userId._id] = {
              score: topUser.totalAverage || 0,
              level: '',
              language: '',
              completedLessons: topUser.completedLessons || 0
            }
          }
        })
      }

      // Fetch progress for users not in topUsers (limit to first 50 to avoid too many requests)
      const currentUsers = users.length > 0 ? users : []
      const userIdsToFetch = currentUsers
        .filter(u => !summaries[u._id])
        .slice(0, 50)
        .map(u => u._id)

      for (const userId of userIdsToFetch) {
        try {
          const response = await api.get(`/admin/users/${userId}/progress?lang=en`)
          const progress = response.data.progress
          if (progress) {
            const currentInfo = getCurrentLanguageAndLevelFromProgress(progress)
            const completedLessons = progress.lessonScores?.filter((ls: any) => ls.totalScore > 0).length || 0
            summaries[userId] = {
              score: summaries[userId]?.score || 0,
              level: currentInfo?.level || '',
              language: currentInfo?.language || '',
              completedLessons: completedLessons
            }
          }
        } catch (error) {
          // Ignore errors for individual users
        }
      }

      setUserProgressSummaries(summaries)
    } catch (error) {
      console.error('Error fetching user progress summaries:', error)
    }
  }

  // Get user info for search
  const getUserInfoForSearch = (userId: string) => {
    const topUser = topUsers.find(u => u.userId?._id === userId)
    const summary = userProgressSummaries[userId]
    
    return {
      score: topUser?.totalAverage || summary?.score || 0,
      level: summary?.level || '',
      language: summary?.language || '',
      completedLessons: topUser?.completedLessons || summary?.completedLessons || 0
    }
  }

  // Filter and sort users for Users Tab
  const getFilteredAndSortedUsersTab = () => {
    let filtered = getSortedUsersTab()

    if (usersTabSearch.trim()) {
      const query = usersTabSearch.toLowerCase().trim()
      filtered = filtered.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(query)
        const emailMatch = u.email.toLowerCase().includes(query)
        
        // Search by language
        const userInfo = getUserInfoForSearch(u._id)
        const languageMatch = userInfo.language.toLowerCase().includes(query)
        
        // Search by progress (số bài đã làm, điểm số)
        const progressMatch = 
          userInfo.completedLessons.toString().includes(query) ||
          userInfo.score.toFixed(1).includes(query) ||
          (query.includes('bài') && userInfo.completedLessons > 0) ||
          (query.includes('điểm') && userInfo.score > 0)
        
        return nameMatch || emailMatch || languageMatch || progressMatch
      })
    }

    return filtered
  }

  // Filter and sort users for Progress Tab
  const getFilteredAndSortedUserProgressTab = () => {
    let filtered = getSortedUserProgressTab()

    if (userProgressTabSearch.trim()) {
      const query = userProgressTabSearch.toLowerCase().trim()
      filtered = filtered.filter(u => {
        const nameMatch = u.name.toLowerCase().includes(query)
        const emailMatch = u.email.toLowerCase().includes(query)
        
        // Search by language
        const userInfo = getUserInfoForSearch(u._id)
        const languageMatch = userInfo.language.toLowerCase().includes(query)
        
        // Search by progress
        const progressMatch = 
          userInfo.completedLessons.toString().includes(query) ||
          userInfo.score.toFixed(1).includes(query)
        
        return nameMatch || emailMatch || languageMatch || progressMatch
      })
    }

    return filtered
  }

  // Get current language and level info for user
  const getCurrentLanguageAndLevel = () => {
    if (!userProgress || !userProgress.lessonScores || userProgress.lessonScores.length === 0) {
      return null
    }

    // Find the most recent lesson score (by completedAt or highest totalScore)
    const recentLessons = [...userProgress.lessonScores]
      .filter(ls => ls.totalScore > 0) // Only lessons with scores
      .sort((a, b) => {
        // Sort by completedAt if available, otherwise by totalScore
        if (a.completedAt && b.completedAt) {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        }
        return (b.totalScore || 0) - (a.totalScore || 0)
      })

    if (recentLessons.length === 0) return null

    const recentLesson = recentLessons[0]
    
    // Try to get level and language info from lessonScore.populated data
    let levelId = null
    let levelData = null
    let languageData = null

    if (recentLesson.lessonId?.levelId?._id) {
      // Use populated levelId from lessonScore
      levelData = recentLesson.lessonId.levelId
      levelId = typeof levelData._id === 'string' 
        ? levelData._id 
        : (levelData._id as any).toString()

      // Check if languageId is already populated in levelId
      if (levelData.languageId && typeof levelData.languageId === 'object' && 'name' in levelData.languageId) {
        languageData = levelData.languageId
      }
    } else {
      // Fallback: find lesson in lessons array
      const lessonId = typeof recentLesson.lessonId._id === 'string' 
        ? recentLesson.lessonId._id 
        : (recentLesson.lessonId._id as any).toString()
      
      const lesson = lessons.find(l => l._id === lessonId)
      if (!lesson) return null
      levelId = lesson.levelId._id
    }

    // Get level and language if not already populated
    if (!levelData) {
      levelData = levels.find(l => l._id === levelId)
      if (!levelData) return null
    }

    if (!languageData) {
      const langId = typeof levelData.languageId === 'object' && levelData.languageId._id
        ? levelData.languageId._id
        : levelData.languageId
      languageData = languages.find(lang => lang._id === langId)
      if (!languageData) return null
    }

    return {
      language: { name: languageData.name, icon: languageData.icon },
      level: { number: levelData.levelNumber, title: levelData.title }
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      fetchUsers()
      fetchDashboard()
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      fetchUsers()
      fetchDashboard()
      if (selectedUser === userId) {
        setSelectedUser(null)
        setUserProgress(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleBulkCreateUsers = async () => {
    try {
      // Filter out empty users
      const validUsers = bulkUsers.filter(u => u.name && u.email && u.password)
      if (validUsers.length === 0) {
        alert('Please add at least one user with all fields filled')
        return
      }

      const response = await api.post('/admin/users/bulk', { users: validUsers })
      alert(`Successfully created ${response.data.created} user(s). ${response.data.failed > 0 ? `${response.data.failed} failed.` : ''}`)
      setShowBulkCreateUsers(false)
      setBulkUsers([{ name: '', email: '', password: '' }])
      fetchUsers()
      fetchDashboard()
    } catch (error: any) {
      console.error('Error creating users:', error)
      alert(error.response?.data?.message || 'Error creating users')
    }
  }

  const addBulkUser = () => {
    setBulkUsers([...bulkUsers, { name: '', email: '', password: '' }])
  }

  const removeBulkUser = (index: number) => {
    if (bulkUsers.length > 1) {
      setBulkUsers(bulkUsers.filter((_, i) => i !== index))
    }
  }

  const updateBulkUser = (index: number, field: 'name' | 'email' | 'password', value: string) => {
    const newUsers = [...bulkUsers]
    newUsers[index] = { ...newUsers[index], [field]: value }
    setBulkUsers(newUsers)
  }

  const handleCreateLanguage = async () => {
    try {
      await api.post('/admin/languages', newLanguage)
      fetchLanguages()
      fetchDashboard()
      setNewLanguage({ name: '', slug: '', description: '', icon: '🌐' })
      setShowNewLanguage(false)
    } catch (error: any) {
      console.error('Error creating language:', error)
      alert(error.response?.data?.message || 'Error creating language')
    }
  }

  const handleStartEditLanguage = (language: Language) => {
    setEditingLanguage(language._id)
    setEditingLanguageData({
      name: language.name,
      slug: language.slug,
      description: language.description,
      icon: language.icon
    })
  }

  const handleUpdateLanguage = async () => {
    if (!editingLanguage || !editingLanguageData) return
    try {
      await api.put(`/admin/languages/${editingLanguage}`, editingLanguageData)
      fetchLanguages()
      setEditingLanguage(null)
      setEditingLanguageData(null)
    } catch (error: any) {
      console.error('Error updating language:', error)
      alert(error.response?.data?.message || 'Error updating language')
    }
  }

  const handleDeleteLanguage = async (languageId: string) => {
    if (!confirm('Are you sure? This will delete all levels and lessons in this language!')) return
    try {
      await api.delete(`/admin/languages/${languageId}`)
      fetchLanguages()
      fetchLevels()
      fetchLessons()
      fetchDashboard()
    } catch (error) {
      console.error('Error deleting language:', error)
      alert('Error deleting language')
    }
  }

  const handleCreateLevel = async () => {
    try {
      await api.post('/admin/levels', newLevel)
      fetchLevels()
      fetchLanguages()
      fetchDashboard()
      setNewLevel({ languageId: '', levelNumber: 1, title: '', description: '' })
      setShowNewLevel(false)
    } catch (error: any) {
      console.error('Error creating level:', error)
      alert(error.response?.data?.message || 'Error creating level')
    }
  }

  const handleStartEditLevel = (level: Level) => {
    setEditingLevel(level._id)
    setEditingLevelData({
      languageId: typeof level.languageId === 'object' ? level.languageId._id : level.languageId,
      levelNumber: level.levelNumber,
      title: level.title,
      description: level.description
    })
  }

  const handleUpdateLevel = async () => {
    if (!editingLevel || !editingLevelData) return
    try {
      await api.put(`/admin/levels/${editingLevel}`, editingLevelData)
      fetchLevels()
      setEditingLevel(null)
      setEditingLevelData(null)
    } catch (error: any) {
      console.error('Error updating level:', error)
      alert(error.response?.data?.message || 'Error updating level')
    }
  }

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm('Are you sure? This will delete all lessons in this level!')) return
    try {
      await api.delete(`/admin/levels/${levelId}`)
      fetchLevels()
      fetchLessons()
      fetchLanguages()
      fetchDashboard()
    } catch (error) {
      console.error('Error deleting level:', error)
      alert('Error deleting level')
    }
  }

  const handleCreateLesson = async () => {
    try {
      if (!newLesson.levelId || !newLesson.title) {
        alert('Please fill in all required fields')
        return
      }
      await api.post('/admin/lessons', newLesson)
      fetchLessons()
      fetchLevels()
      fetchDashboard()
      setShowNewLesson(false)
      setNewLesson({
        levelId: '',
        lessonNumber: 1,
        title: '',
        content: '',
        codeExample: '',
        quiz: {
          questions: [],
          passingScore: 7
        }
      })
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      alert(error.response?.data?.message || 'Error creating lesson')
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    try {
      await api.delete(`/admin/lessons/${lessonId}`)
      fetchLessons()
      fetchLevels()
      fetchDashboard()
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Error deleting lesson')
    }
  }

  const handleStartEditLesson = async (lessonId: string) => {
    try {
      const response = await api.get(`/lessons/${lessonId}`)
      const lesson = response.data.lesson
      setEditingLesson(lessonId)
      setEditingLessonData({
        levelId: lesson.levelId._id || lesson.levelId,
        lessonNumber: lesson.lessonNumber,
        title: lesson.title || '',
        content: lesson.content || '',
        codeExample: lesson.codeExample || '',
        quiz: lesson.quiz || {
          questions: [],
          passingScore: 7
        }
      })
    } catch (error) {
      console.error('Error loading lesson:', error)
      alert('Error loading lesson data')
    }
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson || !editingLessonData) return
    try {
      if (!editingLessonData.title) {
        alert('Please fill in all required fields')
        return
      }
      await api.put(`/admin/lessons/${editingLesson}`, editingLessonData)
      fetchLessons()
      fetchLevels()
      fetchDashboard()
      setEditingLesson(null)
      setEditingLessonData(null)
    } catch (error: any) {
      console.error('Error updating lesson:', error)
      alert(error.response?.data?.message || 'Error updating lesson')
    }
  }

  const addQuizQuestion = () => {
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: [
          ...newLesson.quiz.questions,
          {
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
          }
        ]
      }
    })
  }

  const removeQuizQuestion = (index: number) => {
    const newQuestions = [...newLesson.quiz.questions]
    newQuestions.splice(index, 1)
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...newLesson.quiz.questions]
    if (field === 'type' && value === 'code') {
      // Reset to code question structure
      newQuestions[index] = {
        type: 'code',
        question: newQuestions[index].question || '',
        codeType: 'html',
        starterCode: {
          html: '',
          css: '',
          javascript: ''
        },
        expectedOutput: '',
        explanation: ''
      }
    } else if (field === 'type' && value === 'multiple-choice') {
      // Reset to multiple-choice structure
      newQuestions[index] = {
        type: 'multiple-choice',
        question: newQuestions[index].question || '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      }
    }
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const updateQuizQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...newLesson.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions[optIndex] = value
    newQuestions[qIndex].options = newOptions
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const duplicateQuizQuestion = (qIndex: number) => {
    const newQuestions = [...newLesson.quiz.questions]
    const questionToDuplicate = { ...newQuestions[qIndex] }
    // Clear question text and adjust for duplicate
    questionToDuplicate.question = ''
    if (questionToDuplicate.type === 'multiple-choice') {
      questionToDuplicate.correctAnswer = 0
    }
    newQuestions.splice(qIndex + 1, 0, questionToDuplicate)
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const addQuizQuestionOption = (qIndex: number) => {
    const newQuestions = [...newLesson.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions.push('')
    newQuestions[qIndex].options = newOptions
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const removeQuizQuestionOption = (qIndex: number, optIndex: number) => {
    const newQuestions = [...newLesson.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions.splice(optIndex, 1)
    newQuestions[qIndex].options = newOptions
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  const updateStarterCode = (qIndex: number, lang: 'html' | 'css' | 'javascript', value: string) => {
    const newQuestions = [...newLesson.quiz.questions]
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      starterCode: {
        ...(newQuestions[qIndex].starterCode || { html: '', css: '', javascript: '' }),
        [lang]: value
      }
    }
    setNewLesson({
      ...newLesson,
      quiz: {
        ...newLesson.quiz,
        questions: newQuestions
      }
    })
  }

  // Helper functions for editing lesson
  const addEditQuizQuestion = () => {
    if (!editingLessonData) return
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: [
          ...editingLessonData.quiz.questions,
          {
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: ''
          }
        ]
      }
    })
  }

  const removeEditQuizQuestion = (index: number) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    newQuestions.splice(index, 1)
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  const updateEditQuizQuestion = (index: number, field: string, value: any) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    if (field === 'type' && value === 'code') {
      newQuestions[index] = {
        type: 'code',
        question: newQuestions[index].question || '',
        codeType: 'html',
        starterCode: {
          html: '',
          css: '',
          javascript: ''
        },
        expectedOutput: '',
        explanation: ''
      }
    } else if (field === 'type' && value === 'multiple-choice') {
      newQuestions[index] = {
        type: 'multiple-choice',
        question: newQuestions[index].question || '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    } else {
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      }
    }
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  const updateEditQuizQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions[optIndex] = value
    newQuestions[qIndex].options = newOptions
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  const updateEditStarterCode = (qIndex: number, lang: 'html' | 'css' | 'javascript', value: string) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      starterCode: {
        ...(newQuestions[qIndex].starterCode || { html: '', css: '', javascript: '' }),
        [lang]: value
      }
    }
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  const addEditQuizQuestionOption = (qIndex: number) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions.push('')
    newQuestions[qIndex].options = newOptions
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  const removeEditQuizQuestionOption = (qIndex: number, optIndex: number) => {
    if (!editingLessonData) return
    const newQuestions = [...editingLessonData.quiz.questions]
    const newOptions = [...(newQuestions[qIndex].options || [])]
    newOptions.splice(optIndex, 1)
    newQuestions[qIndex].options = newOptions
    setEditingLessonData({
      ...editingLessonData,
      quiz: {
        ...editingLessonData.quiz,
        questions: newQuestions
      }
    })
  }

  // Quiz Assignment functions
  const fetchQuizAssignments = async () => {
    try {
      const response = await api.get('/admin/quiz-assignments')
      setQuizAssignments(response.data.assignments || [])
    } catch (error) {
      console.error('Error fetching quiz assignments:', error)
    }
  }

  const fetchActivityLog = useCallback(async () => {
    setLoadingActivityLog(true)
    try {
      const params = new URLSearchParams()
      if (activityLogFilters.userId) params.append('userId', activityLogFilters.userId)
      if (activityLogFilters.quizType) params.append('quizType', activityLogFilters.quizType)
      params.append('limit', activityLogFilters.limit.toString())
      params.append('lang', 'en')
      
      const response = await api.get(`/admin/activity-log?${params.toString()}`)
      setActivityLog(response.data.sessions || [])
    } catch (error) {
      console.error('Error fetching activity log:', error)
      setActivityLog([])
    } finally {
      setLoadingActivityLog(false)
    }
  }, [activityLogFilters])

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, loading, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboard()
      fetchTrackingStats()
      fetchUsers()
      fetchLanguages()
      fetchLevels()
      fetchLessons()
      fetchQuizAssignments()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && activeTab === 'activity-log') {
      fetchActivityLog()
    }
  }, [isAuthenticated, user, activeTab, fetchActivityLog])

  // Fetch user progress summaries when users or progress tab is active
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && (activeTab === 'users' || activeTab === 'progress') && users.length > 0) {
      fetchUserProgressSummaries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role, activeTab, users.length, topUsers.length])

  const fetchAssignmentDetails = async (assignmentId: string) => {
    try {
      const response = await api.get(`/admin/quiz-assignments/${assignmentId}`)
      setSelectedAssignment(response.data.assignment)
      setAssignmentResults(response.data.results || [])
      
      // Fetch tracking data
      try {
        const trackingResponse = await api.get(`/admin/quiz-assignments/${assignmentId}/tracking`)
        setAssignmentTracking(trackingResponse.data.sessions || [])
      } catch (trackingError) {
        console.error('Error fetching tracking data:', trackingError)
        setAssignmentTracking([])
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error)
    }
  }

  const handleCreateQuizAssignment = async () => {
    try {
      if (!newAssignment.title || newAssignment.questions.length === 0 || newAssignment.assignedTo.length === 0 || !newAssignment.deadline) {
        alert('Please fill in all required fields')
        return
      }

      // Normalize questions - remove correctAnswer for code questions, remove code fields for multiple-choice
      const normalizedQuestions = newAssignment.questions.map((q) => {
        if (q.type === 'code') {
          const { correctAnswer, options, ...codeQuestion } = q
          return {
            type: 'code',
            question: codeQuestion.question,
            codeType: codeQuestion.codeType || 'html',
            starterCode: {
              html: codeQuestion.starterCode?.html || '',
              css: codeQuestion.starterCode?.css || '',
              javascript: codeQuestion.starterCode?.javascript || ''
            },
            expectedOutput: codeQuestion.expectedOutput || '',
            explanation: codeQuestion.explanation || undefined
          }
        } else {
          const { codeType, starterCode, expectedOutput, ...multipleChoiceQuestion } = q
          return {
            type: 'multiple-choice',
            question: multipleChoiceQuestion.question,
            options: multipleChoiceQuestion.options || [],
            correctAnswer: multipleChoiceQuestion.correctAnswer || 0,
            explanation: multipleChoiceQuestion.explanation || undefined
          }
        }
      })

      const assignmentData = {
        ...newAssignment,
        questions: normalizedQuestions
      }

      await api.post('/admin/quiz-assignments', assignmentData)
      fetchQuizAssignments()
      setNewAssignment({
        title: '',
        description: '',
        questions: [],
        passingScore: 7,
        assignedTo: [],
        deadline: ''
      })
      setShowCreateAssignment(false)
      alert('Quiz assignment created successfully!')
    } catch (error: any) {
      console.error('Error creating quiz assignment:', error)
      alert(error.response?.data?.message || 'Error creating quiz assignment')
    }
  }

  const handleDeleteQuizAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this quiz assignment? All results will be deleted too.')) return
    try {
      await api.delete(`/admin/quiz-assignments/${assignmentId}`)
      fetchQuizAssignments()
      if (selectedAssignment?._id === assignmentId) {
        setSelectedAssignment(null)
        setAssignmentResults([])
      }
    } catch (error) {
      console.error('Error deleting quiz assignment:', error)
      alert('Error deleting quiz assignment')
    }
  }

  const addQuestion = (type: 'multiple-choice' | 'code' = 'multiple-choice') => {
    if (type === 'code') {
      setNewAssignment({
        ...newAssignment,
        questions: [...newAssignment.questions, {
          type: 'code',
          question: '',
          codeType: 'html',
          starterCode: {
            html: '',
            css: '',
            javascript: ''
          },
          expectedOutput: '',
          explanation: ''
        }]
      })
    } else {
      setNewAssignment({
        ...newAssignment,
        questions: [...newAssignment.questions, { 
          type: 'multiple-choice',
          question: '', 
          options: ['', '', '', ''], 
          correctAnswer: 0, 
          explanation: '' 
        }]
      })
    }
  }

  const removeQuestion = (index: number) => {
    setNewAssignment({
      ...newAssignment,
      questions: newAssignment.questions.filter((_, i) => i !== index)
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...newAssignment.questions]
    if (field === 'type' && value === 'code') {
      // Reset to code question structure
      updatedQuestions[index] = {
        type: 'code',
        question: updatedQuestions[index].question || '',
        codeType: 'html',
        starterCode: {
          html: '',
          css: '',
          javascript: ''
        },
        expectedOutput: '',
        explanation: ''
      }
    } else if (field === 'type' && value === 'multiple-choice') {
      // Reset to multiple-choice structure
      updatedQuestions[index] = {
        type: 'multiple-choice',
        question: updatedQuestions[index].question || '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    } else {
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    }
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const updateQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    const updatedQuestions = [...newAssignment.questions]
    const newOptions = [...(updatedQuestions[qIndex].options || [])]
    newOptions[optIndex] = value
    updatedQuestions[qIndex].options = newOptions
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const addQuestionOption = (qIndex: number) => {
    const updatedQuestions = [...newAssignment.questions]
    const newOptions = [...(updatedQuestions[qIndex].options || [])]
    newOptions.push('')
    updatedQuestions[qIndex].options = newOptions
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const removeQuestionOption = (qIndex: number, optIndex: number) => {
    const updatedQuestions = [...newAssignment.questions]
    const newOptions = [...(updatedQuestions[qIndex].options || [])]
    newOptions.splice(optIndex, 1)
    updatedQuestions[qIndex].options = newOptions
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const updateAssignmentStarterCode = (qIndex: number, lang: 'html' | 'css' | 'javascript', value: string) => {
    const updatedQuestions = [...newAssignment.questions]
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      starterCode: {
        ...(updatedQuestions[qIndex].starterCode || { html: '', css: '', javascript: '' }),
        [lang]: value
      }
    }
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const toggleUserAssignment = (userId: string) => {
    const assignedTo = newAssignment.assignedTo.includes(userId)
      ? newAssignment.assignedTo.filter(id => id !== userId)
      : [...newAssignment.assignedTo, userId]
    setNewAssignment({ ...newAssignment, assignedTo })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
        Admin Dashboard
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8 max-w-5xl">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="activity-log">
            <Activity className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="quiz-assignments">
            <ClipboardList className="h-4 w-4 mr-2" />
            Quiz Assignments
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Bulk Create Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create Multiple Users</CardTitle>
                <CardDescription>Create multiple user accounts at once</CardDescription>
              </div>
              <Button onClick={() => setShowBulkCreateUsers(!showBulkCreateUsers)}>
                <Plus className="h-4 w-4 mr-2" />
                {showBulkCreateUsers ? 'Hide' : 'Create Users'}
              </Button>
            </CardHeader>
            {showBulkCreateUsers && (
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {bulkUsers.map((user, index) => (
                    <Card key={index} className="p-4 border-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">User {index + 1}</span>
                        {bulkUsers.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBulkUser(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Name *</label>
                          <Input
                            placeholder="User name"
                            value={user.name}
                            onChange={(e) => updateBulkUser(index, 'name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Email *</label>
                          <Input
                            type="email"
                            placeholder="user@example.com"
                            value={user.email}
                            onChange={(e) => updateBulkUser(index, 'email', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium mb-1 block">Password *</label>
                          <Input
                            type="password"
                            placeholder="Password"
                            value={user.password}
                            onChange={(e) => updateBulkUser(index, 'password', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addBulkUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another User
                  </Button>
                  <Button onClick={handleBulkCreateUsers}>
                    <Save className="h-4 w-4 mr-2" />
                    Create {bulkUsers.filter(u => u.name && u.email && u.password).length} User(s)
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowBulkCreateUsers(false)
                    setBulkUsers([{ name: '', email: '', password: '' }])
                  }}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Overview Stats */}
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.newUsersLast30Days} new users (30 days)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Active in the last 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalLanguages}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalLevels} levels, {stats.totalLessons} lessons
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProgress}</div>
                    <p className="text-xs text-muted-foreground">
                      Users with progress
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Score Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Average Quiz Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.avgQuizScore}/10
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      {stats.totalQuizAttempts} attempts
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                      Average Code Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.avgCodeScore}/10
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                      {stats.totalCodeAttempts} attempts
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Average Total Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.avgTotalScore}/10
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                      Combined Quiz + Code
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Grand Total Score */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Grand Total Score
                  </CardTitle>
                  <CardDescription className="text-indigo-700 dark:text-indigo-300">
                    Sum of all quiz and code scores across all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {stats.grandTotalScore.toLocaleString()}
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Total points earned by all users
                  </p>
                </CardContent>
              </Card>

              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                  <CardDescription>Statistics of scores from all lessons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                        Excellent (9-10)
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.scoreDistribution.excellent}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Good (7-8.9)
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.scoreDistribution.good}
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                        Average (5-6.9)
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {stats.scoreDistribution.average}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                        Poor (&lt;5)
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {stats.scoreDistribution.poor}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Statistics */}
              {trackingStats && (
                <>
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                        <Eye className="h-5 w-5" />
                        Quiz Tracking Statistics
                      </CardTitle>
                      <CardDescription className="text-yellow-700 dark:text-yellow-300">
                        Overview of quiz session tracking and suspicious activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {trackingStats.totalSessions}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            {trackingStats.activeSessions} active
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-muted-foreground mb-1">External Visits</p>
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {trackingStats.sessionsWithExternalVisits}
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                            {trackingStats.totalExternalTimeMinutes} min total
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-muted-foreground mb-1">Suspicious Activities</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {trackingStats.sessionsWithSuspicious}
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            Sessions flagged
                          </p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-muted-foreground mb-1">Tab Switches</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {trackingStats.totalTabSwitches}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {trackingStats.totalWindowBlurs} window blurs
                          </p>
                        </div>
                      </div>

                      {/* Top External Domains */}
                      {trackingStats.topDomains && trackingStats.topDomains.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                            Top External Domains Visited
                          </h4>
                          <div className="space-y-2">
                            {trackingStats.topDomains.slice(0, 5).map((domain: any, idx: number) => (
                              <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded border border-yellow-200 dark:border-yellow-800">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="font-medium text-sm">{domain.domain}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                      {domain.totalDurationMinutes} min
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {domain.count} visit(s)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suspicious Activity Types */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                          Suspicious Activity Breakdown
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                            <p className="text-xs text-muted-foreground mb-1">Rapid Tab Switch</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                              {trackingStats.suspiciousActivityTypes?.rapid_tab_switch || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                            <p className="text-xs text-muted-foreground mb-1">Long Away Time</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                              {trackingStats.suspiciousActivityTypes?.long_away_time || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                            <p className="text-xs text-muted-foreground mb-1">Multiple Blur</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                              {trackingStats.suspiciousActivityTypes?.multiple_blur || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                            <p className="text-xs text-muted-foreground mb-1">Unusual Pattern</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                              {trackingStats.suspiciousActivityTypes?.unusual_pattern || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recent Suspicious Sessions */}
                      {trackingStats.recentSuspiciousSessions && trackingStats.recentSuspiciousSessions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                            Recent Suspicious Sessions
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {trackingStats.recentSuspiciousSessions.map((session: any, idx: number) => (
                              <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded border border-red-200 dark:border-red-800">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {session.userId?.name || 'Unknown'} ({session.userId?.email || 'N/A'})
                                      </span>
                                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded">
                                        {session.quizType}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {session.assignmentId?.title || session.lessonId?.title || 'N/A'}
                                    </p>
                                    <div className="flex gap-3 text-xs text-muted-foreground">
                                      <span>{session.suspiciousCount} suspicious</span>
                                      <span>{session.externalVisitsCount} external visits</span>
                                      <span>{session.tabSwitchCount} tab switches</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(session.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(session.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Top Users */}
              {topUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Top 10 Users</CardTitle>
                        <CardDescription>Top performers</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm px-2 py-1 border rounded-md"
                          value={topUsersSort}
                          onChange={(e) => setTopUsersSort(e.target.value as any)}
                        >
                          <option value="score">Điểm</option>
                          <option value="name">Tên</option>
                          <option value="email">Email</option>
                          <option value="lessons">Số bài</option>
                          <option value="streak">Streak</option>
                        </select>
                        <select
                          className="text-sm px-2 py-1 border rounded-md"
                          value={topUsersSortOrder}
                          onChange={(e) => setTopUsersSortOrder(e.target.value as 'asc' | 'desc')}
                        >
                          <option value="desc">↓</option>
                          <option value="asc">↑</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getSortedTopUsers().map((user, index) => (
                        <div key={user.userId?._id || index} className="p-4 border rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:scale-[1.02] group cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 group-hover:scale-110">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold group-hover:text-primary group-hover:font-bold transition-all duration-200">{user.name}</p>
                                <p className="text-sm text-muted-foreground group-hover:text-foreground group-hover:font-medium transition-all duration-200">{user.email}</p>
                              </div>
                            </div>
                              <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {user.totalAverage.toFixed(1)}/10
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.completedLessons} lessons completed
                              </p>
                              <p className="text-xs text-primary font-medium mt-1">
                                Total: {user.totalScore.toFixed(0)}/20
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Quiz:</span>
                              <span className="ml-1 font-medium">{user.quizAverage.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Code:</span>
                              <span className="ml-1 font-medium">{user.codeAverage.toFixed(1)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Streak:</span>
                              <span className="ml-1 font-medium">{user.currentStreak} days</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time:</span>
                              <span className="ml-1 font-medium">{Math.round(user.totalStudyTime / 60)}h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Users</CardTitle>
                      <CardDescription>Users mới đăng ký</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-sm px-2 py-1 border rounded-md"
                        value={recentUsersSort}
                        onChange={(e) => setRecentUsersSort(e.target.value as any)}
                      >
                        <option value="date">Ngày đăng ký</option>
                        <option value="name">Tên</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                      </select>
                      <select
                        className="text-sm px-2 py-1 border rounded-md"
                        value={recentUsersSortOrder}
                        onChange={(e) => setRecentUsersSortOrder(e.target.value as 'asc' | 'desc')}
                      >
                        <option value="desc">↓</option>
                        <option value="asc">↑</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSortedRecentUsers().map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 hover:scale-[1.01] group cursor-pointer">
                        <div>
                          <p className="font-semibold group-hover:text-primary group-hover:font-bold transition-all duration-200">{u.name}</p>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground group-hover:font-medium transition-all duration-200">{u.email}</p>
                          <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-all duration-200">
                            Joined: {new Date(u.createdAt).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity-log" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity Log
                  </CardTitle>
                  <div>
                    <CardDescription>
                      All user activities - Who did what, on which page, when, and for how long (including external visits)
                    </CardDescription>
                    {selectedSessions.size > 0 && (
                      <span className="ml-0 mt-1 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-semibold">
                        {selectedSessions.size} selected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSessions.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete ${selectedSessions.size} selected activities?\n\nThis information will be permanently deleted and cannot be recovered.`)) {
                          return
                        }
                        setIsDeleting(true)
                        try {
                          const deletePromises = Array.from(selectedSessions).map(sessionId =>
                            api.delete(`/admin/activity-log/${sessionId}`).catch(err => {
                              console.error(`Error deleting session ${sessionId}:`, err)
                              return null
                            })
                          )
                          await Promise.all(deletePromises)
                          const deletedCount = selectedSessions.size
                          // Remove from local state
                          setActivityLog(activityLog.filter((s: any) => !selectedSessions.has(s._id)))
                          setSelectedSessions(new Set())
                          alert(`Successfully deleted ${deletedCount} activities`)
                        } catch (error: any) {
                          console.error('Error deleting activity logs:', error)
                          alert('Error deleting activities: ' + (error.response?.data?.message || error.message))
                        } finally {
                          setIsDeleting(false)
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className={`h-4 w-4 mr-2 ${isDeleting ? 'animate-spin' : ''}`} />
                      Delete Selected ({selectedSessions.size})
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedSessions.size === activityLog.length) {
                        setSelectedSessions(new Set())
                      } else {
                        setSelectedSessions(new Set(activityLog.map((s: any) => s._id)))
                      }
                    }}
                    disabled={loadingActivityLog || activityLog.length === 0}
                  >
                    {selectedSessions.size === activityLog.length && activityLog.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchActivityLog}
                    disabled={loadingActivityLog}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingActivityLog ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 p-4 bg-muted rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Filters:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">User</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={activityLogFilters.userId}
                      onChange={(e) => {
                        setActivityLogFilters({ ...activityLogFilters, userId: e.target.value })
                        setTimeout(() => fetchActivityLog(), 100)
                      }}
                    >
                      <option value="">All Users</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quiz Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={activityLogFilters.quizType}
                      onChange={(e) => {
                        setActivityLogFilters({ ...activityLogFilters, quizType: e.target.value })
                        setTimeout(() => fetchActivityLog(), 100)
                      }}
                    >
                      <option value="">All Types</option>
                      <option value="assignment">Assignment</option>
                      <option value="lesson">Lesson</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Limit</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={activityLogFilters.limit}
                      onChange={(e) => {
                        setActivityLogFilters({ ...activityLogFilters, limit: parseInt(e.target.value) })
                        setTimeout(() => fetchActivityLog(), 100)
                      }}
                    >
                      <option value="50">50 records</option>
                      <option value="100">100 records</option>
                      <option value="200">200 records</option>
                      <option value="500">500 records</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Activity List */}
              {loadingActivityLog ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading activity log...</p>
                </div>
              ) : activityLog.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No activities</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityLog.map((session: any) => {
                    const isExpanded = expandedSessions.has(session._id)
                    const hasDetails = session.activityTimeline && session.activityTimeline.length > 0
                    const isSelected = selectedSessions.has(session._id)
                    
                    return (
                      <Card
                        key={session._id}
                        className={`border-2 ${
                          isSelected
                            ? 'border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                            : session.hasSuspiciousActivity
                            ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20'
                            : session.hasExternalVisits
                            ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20'
                            : 'border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedSessions)
                                  if (e.target.checked) {
                                    newSelected.add(session._id)
                                  } else {
                                    newSelected.delete(session._id)
                                  }
                                  setSelectedSessions(newSelected)
                                }}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-bold text-lg">
                                      {session.userId?.name || 'Unknown User'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ({session.userId?.email || 'N/A'})
                                    </span>
                                  </div>
                                  {session.hasSuspiciousActivity && (
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs rounded flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      Suspicious
                                    </span>
                                  )}
                                  {session.hasExternalVisits && !session.hasSuspiciousActivity && (
                                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      External Visits
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <ClipboardList className="h-3 w-3" />
                                    <span className="font-medium">{session.quizTitle}</span>
                                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs ml-2">
                                      {session.quizType}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(session.startTime).toLocaleString()}</span>
                                  </div>
                                  {session.submitTime && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />
                                      <span>Submitted: {new Date(session.submitTime).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasDetails && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newExpanded = new Set(expandedSessions)
                                    if (isExpanded) {
                                      newExpanded.delete(session._id)
                                    } else {
                                      newExpanded.add(session._id)
                                    }
                                    setExpandedSessions(newExpanded)
                                  }}
                                >
                                  {isExpanded ? (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ẩn chi tiết
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Xem chi tiết
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  if (!confirm(`Are you sure you want to delete this activity from ${session.userId?.name || 'user'}?\n\nThis information will be permanently deleted and cannot be recovered.`)) {
                                    return
                                  }
                                  try {
                                    await api.delete(`/admin/activity-log/${session._id}`)
                                    // Remove from local state
                                    setActivityLog(activityLog.filter((s: any) => s._id !== session._id))
                                    alert('Activity deleted successfully')
                                  } catch (error: any) {
                                    console.error('Error deleting activity log:', error)
                                    alert('Error deleting activity: ' + (error.response?.data?.message || error.message))
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Compact Summary */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                              <p className="text-xs text-muted-foreground mb-1">⏱️ Duration</p>
                              <p className="font-semibold text-sm">{session.totalDurationMinutes} min</p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                              <p className="text-xs text-muted-foreground mb-1">✅ Active</p>
                              <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                                {session.activeDurationMinutes} min
                              </p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                              <p className="text-xs text-muted-foreground mb-1">🔗 Away</p>
                              <p className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                                {session.awayDurationMinutes} min
                              </p>
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                              <p className="text-xs text-muted-foreground mb-1">🔄 Tab Switches</p>
                              <p className="font-semibold text-sm">{session.tabSwitchCount}</p>
                            </div>
                          </div>

                          {/* External Visits - Compact */}
                          {session.visitedDomains && session.visitedDomains.length > 0 && (
                            <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                              <div className="flex items-center gap-2 mb-3">
                                <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                <span className="font-bold text-sm text-yellow-900 dark:text-yellow-100">
                                  🌐 External Websites Visited:
                                </span>
                                <span className="text-xs text-yellow-700 dark:text-yellow-300">
                                  Total: {session.totalExternalTimeMinutes || session.visitedDomains.reduce((sum: number, v: any) => sum + parseFloat(v.totalDurationMinutes || 0), 0).toFixed(2)} minutes
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {session.visitedDomains.map((visit: any, idx: number) => {
                                  // Get page titles and routes for this domain from activity timeline
                                  const domainActivities = session.activityTimeline?.filter((a: any) => 
                                    a.domain?.toLowerCase() === visit.domain?.toLowerCase() && 
                                    a.isExternal === true
                                  ) || [];
                                  const uniqueTitles = Array.from(new Set(domainActivities.map((a: any) => a.title).filter(Boolean))) as string[];
                                  const uniqueRoutes = Array.from(new Set(domainActivities.map((a: any) => a.route).filter(Boolean))) as string[];
                                  
                                  return (
                                    <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded border border-yellow-200 dark:border-yellow-800">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                          <div>
                                            <span className="font-bold text-base text-yellow-900 dark:text-yellow-100">
                                              {getWebsiteName(visit.domain)}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                              {visit.domain}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                                            {visit.totalDurationMinutes} minutes
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {visit.count} visit(s)
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {/* Routes visited */}
                                      {uniqueRoutes.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                                          <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                            🛣️ Routes Visited:
                                          </p>
                                          <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {uniqueRoutes.slice(0, 5).map((route: string, routeIdx: number) => (
                                              <p key={routeIdx} className="text-xs text-yellow-700 dark:text-yellow-300 truncate font-mono">
                                                • {route || '/'}
                                              </p>
                                            ))}
                                            {uniqueRoutes.length > 5 && (
                                              <p className="text-xs text-muted-foreground">
                                                +{uniqueRoutes.length - 5} more routes
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Page titles */}
                                      {uniqueTitles.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                                          <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                            📄 Pages Viewed:
                                          </p>
                                          <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {uniqueTitles.slice(0, 3).map((title: string, titleIdx: number) => (
                                              <p key={titleIdx} className="text-xs text-yellow-700 dark:text-yellow-300 truncate">
                                                • {title}
                                              </p>
                                            ))}
                                            {uniqueTitles.length > 3 && (
                                              <p className="text-xs text-muted-foreground">
                                                +{uniqueTitles.length - 3} more pages
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {visit.firstVisit && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          First visit: {new Date(visit.firstVisit).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Expanded Details - Full Activity Timeline */}
                          {isExpanded && hasDetails && (
                            <div className="mt-4 pt-4 border-t">
                              {/* Activity Timeline - All Activities */}
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">Activity Timeline (All Activities):</span>
                                </div>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {session.activityTimeline.map((activity: any, idx: number) => {
                                    const isExternal = activity.isExternal === true || 
                                      (activity.domain && activity.action === 'switch_away' && 
                                       !activity.domain.includes('localhost') && 
                                       !activity.domain.includes('127.0.0.1'));
                                    
                                    return (
                                      <div
                                        key={idx}
                                        className={`p-2 rounded border text-xs ${
                                          activity.type === 'suspicious_activity'
                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                                            : isExternal
                                            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              {activity.type === 'suspicious_activity' ? (
                                                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                              ) : isExternal ? (
                                                <ExternalLink className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                              ) : (
                                                <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                              )}
                                              <span className="font-semibold text-xs">
                                                {activity.type === 'suspicious_activity'
                                                  ? `⚠️ Suspicious: ${activity.activityType?.replace(/_/g, ' ')}`
                                                  : activity.action === 'switch_away'
                                                  ? isExternal 
                                                    ? `🔗 Left page → ${getWebsiteName(activity.domain || '') || 'External Site'}`
                                                    : `🔗 Left page`
                                                  : activity.action === 'switch_back'
                                                  ? '↩️ Return to page'
                                                  : activity.action === 'window_blur'
                                                  ? '👁️ Window Blurred (Lost focus)'
                                                  : '✅ Window Focused (Gained focus)'}
                                              </span>
                                            </div>
                                            {activity.domain && isExternal && (
                                              <div className="text-xs text-muted-foreground mb-1">
                                                <span className="font-semibold">🌐 Website:</span>{' '}
                                                <span className="font-bold text-yellow-700 dark:text-yellow-300">
                                                  {getWebsiteName(activity.domain)}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                  ({activity.domain})
                                                </span>
                                                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs">
                                                  External
                                                </span>
                                              </div>
                                            )}
                                            {activity.route && isExternal && (
                                              <div className="text-xs text-muted-foreground mb-1">
                                                <span className="font-semibold">🛣️ Route:</span>{' '}
                                                <span className="font-mono text-blue-600 dark:text-blue-400">
                                                  {activity.route || '/'}
                                                </span>
                                              </div>
                                            )}
                                            {activity.title && (
                                              <div className="text-xs text-muted-foreground mb-1">
                                                <span className="font-semibold text-blue-700 dark:text-blue-300">📄 Page Title:</span>{' '}
                                                <span className="font-medium">{activity.title}</span>
                                              </div>
                                            )}
                                            {activity.url && (
                                              <div className="text-xs text-muted-foreground mb-1 break-all">
                                                <span className="font-semibold">🔗 URL đầy đủ:</span>{' '}
                                                <span className="text-blue-600 dark:text-blue-400">{activity.url}</span>
                                              </div>
                                            )}
                                            {activity.description && (
                                              <div className="text-xs text-muted-foreground mb-1">
                                                📝 {activity.description}
                                              </div>
                                            )}
                                            {activity.duration && activity.duration > 0 && (
                                              <div className="text-xs text-muted-foreground">
                                                ⏱️ Duration: {activity.durationMinutes} minutes ({activity.durationSeconds} seconds)
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-right ml-3 text-xs text-muted-foreground">
                                            <div>{new Date(activity.timestamp).toLocaleDateString()}</div>
                                            <div>{new Date(activity.timestamp).toLocaleTimeString()}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                  {session.activityTimeline.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                      No detailed timeline
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search Input */}
              <div className="mb-4">
                <Input
                  placeholder="Tìm kiếm theo tên, email, language, hoặc tiến độ học..."
                  value={usersTabSearch}
                  onChange={(e) => setUsersTabSearch(e.target.value)}
                  className="w-full"
                />
                {usersTabSearch && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tìm thấy {getFilteredAndSortedUsersTab().length} kết quả
                  </p>
                )}
              </div>

              {/* Sort Controls */}
              <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-semibold">Sắp xếp:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <select
                      className="flex-1 px-3 py-2 border border-primary/30 rounded-md bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={usersTabSort}
                      onChange={(e) => setUsersTabSort(e.target.value as any)}
                    >
                      <option value="name">Tên</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                      <option value="date">Ngày đăng ký</option>
                    </select>
                    <select
                      className="px-3 py-2 border border-primary/30 rounded-md bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[80px]"
                      value={usersTabSortOrder}
                      onChange={(e) => setUsersTabSortOrder(e.target.value as 'asc' | 'desc')}
                    >
                      <option value="asc">↑ Tăng dần</option>
                      <option value="desc">↓ Giảm dần</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {getFilteredAndSortedUsersTab().map((u) => {
                  const userInfo = getUserInfoForSearch(u._id)
                  return (
                    <div key={u._id} className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold group-hover:text-primary group-hover:font-bold transition-all duration-200">{u.name}</p>
                          {editingUser === u._id ? (
                            <select
                              className="ml-2 px-2 py-1 border rounded text-sm"
                              defaultValue={u.role}
                              onChange={(e) => {
                                handleUpdateUserRole(u._id, e.target.value)
                              }}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-1 rounded text-xs ${
                              u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted'
                            }`}>
                              {u.role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <p>Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                          {userInfo.language && (
                            <p>Language: <span className="font-medium">{userInfo.language}</span></p>
                          )}
                          {userInfo.completedLessons > 0 && (
                            <p>Đã làm: <span className="font-medium">{userInfo.completedLessons} bài</span></p>
                          )}
                          {userInfo.score > 0 && (
                            <p>Điểm TB: <span className="font-medium">{userInfo.score.toFixed(1)}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingUser !== u._id && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(u._id)
                                fetchUserProgress(u._id)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchUserProgress(u._id)}
                            >
                              View Progress
                            </Button>
                            {u.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(u._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Languages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Manage programming languages</CardDescription>
              </div>
              <Button onClick={() => setShowNewLanguage(!showNewLanguage)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </CardHeader>
            <CardContent>
              {showNewLanguage && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                  <Input
                    placeholder="Language Name"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  />
                  <Input
                    placeholder="Slug (e.g., web-development)"
                    value={newLanguage.slug}
                    onChange={(e) => setNewLanguage({ ...newLanguage, slug: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newLanguage.description}
                    onChange={(e) => setNewLanguage({ ...newLanguage, description: e.target.value })}
                  />
                  <Input
                    placeholder="Icon (emoji)"
                    value={newLanguage.icon}
                    onChange={(e) => setNewLanguage({ ...newLanguage, icon: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateLanguage}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewLanguage(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang._id} className="p-4 border rounded-lg">
                    {editingLanguage === lang._id && editingLanguageData ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Language Name"
                          value={editingLanguageData.name}
                          onChange={(e) => setEditingLanguageData({ ...editingLanguageData, name: e.target.value })}
                        />
                        <Input
                          placeholder="Slug (e.g., web-development)"
                          value={editingLanguageData.slug}
                          onChange={(e) => setEditingLanguageData({ ...editingLanguageData, slug: e.target.value })}
                        />
                        <Input
                          placeholder="Description"
                          value={editingLanguageData.description}
                          onChange={(e) => setEditingLanguageData({ ...editingLanguageData, description: e.target.value })}
                        />
                        <Input
                          placeholder="Icon (emoji)"
                          value={editingLanguageData.icon}
                          onChange={(e) => setEditingLanguageData({ ...editingLanguageData, icon: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateLanguage}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setEditingLanguage(null)
                            setEditingLanguageData(null)
                          }}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.icon}</span>
                          <div>
                            <p className="font-semibold">{lang.name}</p>
                            <p className="text-sm text-muted-foreground">{lang.description}</p>
                            <p className="text-xs text-muted-foreground">{lang.levels?.length || 0} levels</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEditLanguage(lang)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLanguage(lang._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Levels */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Levels</CardTitle>
                <CardDescription>Manage learning levels</CardDescription>
              </div>
              <Button onClick={() => setShowNewLevel(!showNewLevel)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </CardHeader>
            <CardContent>
              {showNewLevel && (
                <div className="mb-4 p-4 border rounded-lg space-y-3">
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newLevel.languageId}
                    onChange={(e) => setNewLevel({ ...newLevel, languageId: e.target.value })}
                  >
                    <option value="">Select Language</option>
                    {languages.map((lang) => (
                      <option key={lang._id} value={lang._id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Level Number"
                    value={newLevel.levelNumber}
                    onChange={(e) => setNewLevel({ ...newLevel, levelNumber: parseInt(e.target.value) || 1 })}
                  />
                  <Input
                    placeholder="Title"
                    value={newLevel.title}
                    onChange={(e) => setNewLevel({ ...newLevel, title: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newLevel.description}
                    onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateLevel}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewLevel(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {levels.map((level) => (
                  <div key={level._id} className="p-4 border rounded-lg">
                    {editingLevel === level._id && editingLevelData ? (
                      <div className="space-y-3">
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={editingLevelData.languageId}
                          onChange={(e) => setEditingLevelData({ ...editingLevelData, languageId: e.target.value })}
                        >
                          <option value="">Select Language</option>
                          {languages.map((lang) => (
                            <option key={lang._id} value={lang._id}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          placeholder="Level Number"
                          value={editingLevelData.levelNumber}
                          onChange={(e) => setEditingLevelData({ ...editingLevelData, levelNumber: parseInt(e.target.value) || 1 })}
                        />
                        <Input
                          placeholder="Title"
                          value={editingLevelData.title}
                          onChange={(e) => setEditingLevelData({ ...editingLevelData, title: e.target.value })}
                        />
                        <Input
                          placeholder="Description"
                          value={editingLevelData.description}
                          onChange={(e) => setEditingLevelData({ ...editingLevelData, description: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateLevel}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => {
                            setEditingLevel(null)
                            setEditingLevelData(null)
                          }}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            Level {level.levelNumber}: {level.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {level.languageId?.name} • {level.lessons?.length || 0} lessons
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEditLevel(level)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLevel(level._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>All lessons in the system</CardDescription>
              </div>
              <Button onClick={() => setShowNewLesson(!showNewLesson)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lesson
              </Button>
            </CardHeader>
            <CardContent>
              {showNewLesson && (
                <Card className="mb-6 border-2">
                  <CardHeader>
                    <CardTitle>Create New Lesson</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Level *</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={newLesson.levelId}
                          onChange={(e) => setNewLesson({ ...newLesson, levelId: e.target.value })}
                        >
                          <option value="">Select Level</option>
                          {levels.map((level) => (
                            <option key={level._id} value={level._id}>
                              {level.title} (Level {level.levelNumber})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Lesson Number *</label>
                        <Input
                          type="number"
                          placeholder="Lesson Number"
                          value={newLesson.lessonNumber}
                          onChange={(e) => setNewLesson({ ...newLesson, lessonNumber: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title *</label>
                      <Input
                        placeholder="Lesson Title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <textarea
                        className="w-full p-2 border rounded-lg"
                        rows={6}
                        placeholder="Lesson content (markdown supported)"
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Code Example</label>
                      <textarea
                        className="w-full p-2 border rounded-lg font-mono text-sm"
                        rows={4}
                        placeholder="Code example"
                        value={newLesson.codeExample}
                        onChange={(e) => setNewLesson({ ...newLesson, codeExample: e.target.value })}
                      />
                    </div>
                    
                    {/* Quiz Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <label className="text-sm font-medium">Quiz Questions</label>
                          <p className="text-xs text-muted-foreground">Add multiple-choice or code questions</p>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            className="w-24"
                            placeholder="Passing Score"
                            value={newLesson.quiz.passingScore}
                            onChange={(e) => setNewLesson({
                              ...newLesson,
                              quiz: { ...newLesson.quiz, passingScore: parseFloat(e.target.value) || 7 }
                            })}
                          />
                          <Button size="sm" variant="outline" onClick={addQuizQuestion}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {newLesson.quiz.questions.map((q, qIndex) => (
                          <Card key={qIndex} className="p-4 border-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium">Question {qIndex + 1}</span>
                              <div className="flex gap-2">
                                <select
                                  className="text-sm px-2 py-1 border rounded"
                                  value={q.type || 'multiple-choice'}
                                  onChange={(e) => updateQuizQuestion(qIndex, 'type', e.target.value)}
                                >
                                  <option value="multiple-choice">Multiple Choice</option>
                                  <option value="code">Code Question</option>
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => duplicateQuizQuestion(qIndex)}
                                  title="Duplicate question"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeQuizQuestion(qIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <Input
                                placeholder="Question text"
                                value={q.question || ''}
                                onChange={(e) => updateQuizQuestion(qIndex, 'question', e.target.value)}
                              />
                              
                              {q.type === 'multiple-choice' ? (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium">Options (select correct answer)</label>
                                    {q.options?.map((opt: string, optIndex: number) => (
                                      <div key={optIndex} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${qIndex}`}
                                          checked={q.correctAnswer === optIndex}
                                          onChange={() => updateQuizQuestion(qIndex, 'correctAnswer', optIndex)}
                                          className="w-4 h-4"
                                        />
                                        <Input
                                          placeholder={`Option ${optIndex + 1}`}
                                          value={opt}
                                          onChange={(e) => {
                                            const newOptions = [...(q.options || [])]
                                            newOptions[optIndex] = e.target.value
                                            updateQuizQuestion(qIndex, 'options', newOptions)
                                          }}
                                        />
                                        {q.options && q.options.length > 2 && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeQuizQuestionOption(qIndex, optIndex)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addQuizQuestionOption(qIndex)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Option
                                    </Button>
                                  </div>
                                  <Input
                                    placeholder="Explanation (optional)"
                                    value={q.explanation || ''}
                                    onChange={(e) => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                                  />
                                </>
                              ) : (
                                <>
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Code Type *</label>
                                    <select
                                      className="w-full px-3 py-2 border rounded-md"
                                      value={q.codeType || 'html'}
                                      onChange={(e) => updateQuizQuestion(qIndex, 'codeType', e.target.value)}
                                    >
                                      <option value="html">HTML</option>
                                      <option value="css">CSS</option>
                                      <option value="javascript">JavaScript</option>
                                      <option value="html-css-js">HTML + CSS + JS</option>
                                    </select>
                                  </div>
                                  
                                  {q.codeType === 'html-css-js' ? (
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">HTML Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg font-mono text-sm"
                                          rows={4}
                                          placeholder="HTML starter code"
                                          value={q.starterCode?.html || ''}
                                          onChange={(e) => updateStarterCode(qIndex, 'html', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">CSS Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg font-mono text-sm"
                                          rows={4}
                                          placeholder="CSS starter code"
                                          value={q.starterCode?.css || ''}
                                          onChange={(e) => updateStarterCode(qIndex, 'css', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">JavaScript Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded-lg font-mono text-sm"
                                          rows={4}
                                          placeholder="JavaScript starter code"
                                          value={q.starterCode?.javascript || ''}
                                          onChange={(e) => updateStarterCode(qIndex, 'javascript', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">Starter Code</label>
                                      <textarea
                                        className="w-full p-2 border rounded-lg font-mono text-sm"
                                        rows={6}
                                        placeholder={`${q.codeType?.toUpperCase()} starter code`}
                                        value={q.starterCode?.[q.codeType as 'html' | 'css' | 'javascript'] || ''}
                                        onChange={(e) => updateStarterCode(qIndex, q.codeType as 'html' | 'css' | 'javascript', e.target.value)}
                                      />
                                    </div>
                                  )}
                                  
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Expected Output *</label>
                                    <textarea
                                      className="w-full p-2 border rounded-lg font-mono text-sm"
                                      rows={4}
                                      placeholder="Expected output or result (used for auto-grading)"
                                      value={q.expectedOutput || ''}
                                      onChange={(e) => updateQuizQuestion(qIndex, 'expectedOutput', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Describe what the code should produce or output
                                    </p>
                                  </div>
                                  
                                  <Input
                                    placeholder="Explanation (optional)"
                                    value={q.explanation || ''}
                                    onChange={(e) => updateQuizQuestion(qIndex, 'explanation', e.target.value)}
                                  />
                                </>
                              )}
                            </div>
                          </Card>
                        ))}
                        {newLesson.quiz.questions.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No questions yet. Click "Add Question" to get started.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleCreateLesson}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Lesson
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowNewLesson(false)
                        setNewLesson({
                          levelId: '',
                          lessonNumber: 1,
                          title: '',
                          content: '',
                          codeExample: '',
                          quiz: {
                            questions: [],
                            passingScore: 7
                          }
                        })
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="p-4 border rounded-lg">
                    {editingLesson === lesson._id && editingLessonData ? (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Edit Lesson</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Level *</label>
                              <select
                                className="w-full px-3 py-2 border rounded-md"
                                value={editingLessonData.levelId}
                                onChange={(e) => setEditingLessonData({ ...editingLessonData, levelId: e.target.value })}
                              >
                                <option value="">Select Level</option>
                                {levels.map((level) => (
                                  <option key={level._id} value={level._id}>
                                    {level.title} (Level {level.levelNumber})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Lesson Number *</label>
                              <Input
                                type="number"
                                placeholder="Lesson Number"
                                value={editingLessonData.lessonNumber}
                                onChange={(e) => setEditingLessonData({ ...editingLessonData, lessonNumber: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Title *</label>
                            <Input
                              placeholder="Lesson Title"
                              value={editingLessonData.title}
                              onChange={(e) => setEditingLessonData({ ...editingLessonData, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Content</label>
                            <textarea
                              className="w-full p-2 border rounded-lg"
                              rows={6}
                              placeholder="Lesson content (markdown supported)"
                              value={editingLessonData.content}
                              onChange={(e) => setEditingLessonData({ ...editingLessonData, content: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Code Example</label>
                            <textarea
                              className="w-full p-2 border rounded-lg font-mono text-sm"
                              rows={4}
                              placeholder="Code example"
                              value={editingLessonData.codeExample}
                              onChange={(e) => setEditingLessonData({ ...editingLessonData, codeExample: e.target.value })}
                            />
                          </div>
                          
                          {/* Quiz Section */}
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <label className="text-sm font-medium">Quiz Questions</label>
                                <p className="text-xs text-muted-foreground">Add multiple-choice or code questions</p>
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  className="w-24"
                                  placeholder="Passing Score"
                                  value={editingLessonData.quiz.passingScore}
                                  onChange={(e) => setEditingLessonData({
                                    ...editingLessonData,
                                    quiz: { ...editingLessonData.quiz, passingScore: parseFloat(e.target.value) || 7 }
                                  })}
                                />
                                <Button size="sm" variant="outline" onClick={addEditQuizQuestion}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Question
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-4">
                              {editingLessonData.quiz.questions.map((q, qIndex) => (
                                <Card key={qIndex} className="p-4 border-2">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium">Question {qIndex + 1}</span>
                                    <div className="flex gap-2">
                                      <select
                                        className="text-sm px-2 py-1 border rounded"
                                        value={q.type || 'multiple-choice'}
                                        onChange={(e) => updateEditQuizQuestion(qIndex, 'type', e.target.value)}
                                      >
                                        <option value="multiple-choice">Multiple Choice</option>
                                        <option value="code">Code Question</option>
                                      </select>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => removeEditQuizQuestion(qIndex)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <Input
                                      placeholder="Question text"
                                      value={q.question || ''}
                                      onChange={(e) => updateEditQuizQuestion(qIndex, 'question', e.target.value)}
                                    />
                                    
                                    {q.type === 'multiple-choice' ? (
                                      <>
                                        <div className="space-y-2">
                                          <label className="text-xs font-medium">Options (select correct answer)</label>
                                          {q.options?.map((opt: string, optIndex: number) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                              <input
                                                type="radio"
                                                name={`edit-correct-${qIndex}`}
                                                checked={q.correctAnswer === optIndex}
                                                onChange={() => updateEditQuizQuestion(qIndex, 'correctAnswer', optIndex)}
                                                className="w-4 h-4"
                                              />
                                              <Input
                                                placeholder={`Option ${optIndex + 1}`}
                                                value={opt}
                                                onChange={(e) => updateEditQuizQuestionOption(qIndex, optIndex, e.target.value)}
                                              />
                                              {q.options && q.options.length > 2 && (
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => removeEditQuizQuestionOption(qIndex, optIndex)}
                                                >
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              )}
                                            </div>
                                          ))}
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => addEditQuizQuestionOption(qIndex)}
                                          >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Option
                                          </Button>
                                        </div>
                                        <Input
                                          placeholder="Explanation (optional)"
                                          value={q.explanation || ''}
                                          onChange={(e) => updateEditQuizQuestion(qIndex, 'explanation', e.target.value)}
                                        />
                                      </>
                                    ) : (
                                      <>
                                        <div>
                                          <label className="text-xs font-medium mb-1 block">Code Type *</label>
                                          <select
                                            className="w-full px-2 py-1 border rounded text-sm"
                                            value={q.codeType || 'html'}
                                            onChange={(e) => updateEditQuizQuestion(qIndex, 'codeType', e.target.value)}
                                          >
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="html-css-js">HTML + CSS + JS</option>
                                          </select>
                                        </div>
                                        {q.codeType === 'html-css-js' ? (
                                          <div className="space-y-2">
                                            <div>
                                              <label className="text-xs font-medium mb-1 block">HTML Starter Code</label>
                                              <textarea
                                                className="w-full p-2 border rounded font-mono text-xs"
                                                rows={3}
                                                value={q.starterCode?.html || ''}
                                                onChange={(e) => updateEditStarterCode(qIndex, 'html', e.target.value)}
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium mb-1 block">CSS Starter Code</label>
                                              <textarea
                                                className="w-full p-2 border rounded font-mono text-xs"
                                                rows={3}
                                                value={q.starterCode?.css || ''}
                                                onChange={(e) => updateEditStarterCode(qIndex, 'css', e.target.value)}
                                              />
                                            </div>
                                            <div>
                                              <label className="text-xs font-medium mb-1 block">JavaScript Starter Code</label>
                                              <textarea
                                                className="w-full p-2 border rounded font-mono text-xs"
                                                rows={3}
                                                value={q.starterCode?.javascript || ''}
                                                onChange={(e) => updateEditStarterCode(qIndex, 'javascript', e.target.value)}
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div>
                                            <label className="text-xs font-medium mb-1 block">
                                              {q.codeType?.toUpperCase()} Starter Code
                                            </label>
                                            <textarea
                                              className="w-full p-2 border rounded font-mono text-xs"
                                              rows={4}
                                              value={q.starterCode?.[q.codeType as 'html' | 'css' | 'javascript'] || ''}
                                              onChange={(e) => updateEditStarterCode(qIndex, q.codeType as 'html' | 'css' | 'javascript', e.target.value)}
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <label className="text-xs font-medium mb-1 block">Expected Output *</label>
                                          <textarea
                                            className="w-full p-2 border rounded text-xs"
                                            rows={2}
                                            placeholder="Expected output or result (used for auto-grading)"
                                            value={q.expectedOutput || ''}
                                            onChange={(e) => updateEditQuizQuestion(qIndex, 'expectedOutput', e.target.value)}
                                          />
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Describe what the code should produce or output
                                          </p>
                                        </div>
                                        <Input
                                          placeholder="Explanation (optional)"
                                          value={q.explanation || ''}
                                          onChange={(e) => updateEditQuizQuestion(qIndex, 'explanation', e.target.value)}
                                        />
                                      </>
                                    )}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateLesson}>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingLesson(null)
                                setEditingLessonData(null)
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            Lesson {lesson.lessonNumber}: {lesson.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lesson.levelId?.title} (Level {lesson.levelId?.levelNumber})
                          </p>
                          {lesson.quiz?.questions && (
                            <p className="text-xs text-muted-foreground">
                              {lesson.quiz.questions.length} quiz question(s)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEditLesson(lesson._id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLesson(lesson._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Assignments Tab */}
        <TabsContent value="quiz-assignments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz Assignments</CardTitle>
                <CardDescription>Create and manage quiz assignments for users</CardDescription>
              </div>
              <Button onClick={() => setShowCreateAssignment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {showCreateAssignment && (
                <Card className="mb-6 border-2">
                  <CardHeader>
                    <CardTitle>Create New Quiz Assignment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title *</label>
                      <Input
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        placeholder="Quiz Assignment Title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <textarea
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        placeholder="Assignment description"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Passing Score (0-10) *</label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={newAssignment.passingScore}
                          onChange={(e) => setNewAssignment({ ...newAssignment, passingScore: parseFloat(e.target.value) || 7 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Deadline *</label>
                        <Input
                          type="datetime-local"
                          value={newAssignment.deadline}
                          onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Assign To Users *</label>
                      <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                        {users.filter(u => u.role !== 'admin').map((user) => (
                          <label key={user._id} className="flex items-center gap-2 cursor-pointer p-2 rounded transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-sm hover:shadow-primary/10 hover:scale-[1.02] group">
                            <input
                              type="checkbox"
                              checked={newAssignment.assignedTo.includes(user._id)}
                              onChange={() => toggleUserAssignment(user._id)}
                            />
                            <span>{user.name} ({user.email})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Questions *</label>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => addQuestion('multiple-choice')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Text Question
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => addQuestion('code')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Code Question
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {newAssignment.questions.map((q, qIndex) => (
                          <Card key={qIndex} className="p-4 border-2">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium">Question {qIndex + 1}</span>
                              <div className="flex gap-2">
                                <select
                                  className="text-sm px-2 py-1 border rounded"
                                  value={q.type || 'multiple-choice'}
                                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                >
                                  <option value="multiple-choice">Text Question</option>
                                  <option value="code">Code Question</option>
                                </select>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeQuestion(qIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Input
                                placeholder="Question text"
                                value={typeof q.question === 'string' ? q.question : ''}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                              />
                              
                              {q.type === 'code' ? (
                                <>
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Code Type *</label>
                                    <select
                                      className="w-full px-2 py-1 border rounded text-sm"
                                      value={q.codeType || 'html'}
                                      onChange={(e) => updateQuestion(qIndex, 'codeType', e.target.value)}
                                    >
                                      <option value="html">HTML</option>
                                      <option value="css">CSS</option>
                                      <option value="javascript">JavaScript</option>
                                      <option value="html-css-js">HTML + CSS + JS</option>
                                    </select>
                                  </div>
                                  {q.codeType === 'html-css-js' ? (
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">HTML Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded font-mono text-xs"
                                          rows={3}
                                          value={q.starterCode?.html || ''}
                                          onChange={(e) => updateAssignmentStarterCode(qIndex, 'html', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">CSS Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded font-mono text-xs"
                                          rows={3}
                                          value={q.starterCode?.css || ''}
                                          onChange={(e) => updateAssignmentStarterCode(qIndex, 'css', e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">JavaScript Starter Code</label>
                                        <textarea
                                          className="w-full p-2 border rounded font-mono text-xs"
                                          rows={3}
                                          value={q.starterCode?.javascript || ''}
                                          onChange={(e) => updateAssignmentStarterCode(qIndex, 'javascript', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="text-xs font-medium mb-1 block">
                                        {q.codeType?.toUpperCase()} Starter Code
                                      </label>
                                      <textarea
                                        className="w-full p-2 border rounded font-mono text-xs"
                                        rows={4}
                                        value={q.starterCode?.[q.codeType as 'html' | 'css' | 'javascript'] || ''}
                                        onChange={(e) => updateAssignmentStarterCode(qIndex, q.codeType as 'html' | 'css' | 'javascript', e.target.value)}
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-xs font-medium mb-1 block">Expected Output *</label>
                                    <textarea
                                      className="w-full p-2 border rounded text-xs"
                                      rows={2}
                                      placeholder="Expected output or result (used for auto-grading)"
                                      value={q.expectedOutput || ''}
                                      onChange={(e) => updateQuestion(qIndex, 'expectedOutput', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Describe what the code should produce or output
                                    </p>
                                  </div>
                                  <Input
                                    placeholder="Explanation (optional)"
                                    value={q.explanation || ''}
                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                  />
                                </>
                              ) : (
                                <>
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium">Options (select correct answer)</label>
                                    {q.options?.map((opt: string, optIndex: number) => (
                                      <div key={optIndex} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${qIndex}`}
                                          checked={q.correctAnswer === optIndex}
                                          onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                                          className="w-4 h-4"
                                        />
                                        <Input
                                          placeholder={`Option ${optIndex + 1}`}
                                          value={opt}
                                          onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                        />
                                        {q.options && q.options.length > 2 && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeQuestionOption(qIndex, optIndex)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addQuestionOption(qIndex)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Option
                                    </Button>
                                  </div>
                                  <Input
                                    placeholder="Explanation (optional)"
                                    value={q.explanation || ''}
                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                  />
                                </>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateQuizAssignment}>
                        <Save className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setShowCreateAssignment(false)
                        setNewAssignment({
                          title: '',
                          description: '',
                          questions: [],
                          passingScore: 7,
                          assignedTo: [],
                          deadline: ''
                        })
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {quizAssignments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No quiz assignments yet</p>
                ) : (
                  quizAssignments.map((assignment) => {
                    const isExpired = new Date(assignment.deadline) < new Date()
                    const deadlineDate = new Date(assignment.deadline)
                    
                    return (
                      <Card key={assignment._id} className={isExpired ? 'opacity-75' : ''}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {assignment.title}
                                {isExpired && (
                                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                                    Expired
                                  </span>
                                )}
                                {assignment.status === 'active' && !isExpired && (
                                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
                                    Active
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {assignment.description}
                              </CardDescription>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Deadline: {deadlineDate.toLocaleString()}
                                </span>
                                <span>Passing: {assignment.passingScore}/10</span>
                                <span>{assignment.questions.length} questions</span>
                                <span>{assignment.totalAssigned || assignment.assignedTo.length} users assigned</span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  {assignment.submittedCount || 0}/{assignment.totalAssigned || assignment.assignedTo.length} submitted
                                  ({assignment.passedCount || 0} passed)
                                </span>
                              </div>
                              {/* Quick tracking summary - fetch when assignment is selected */}
                              {selectedAssignment?._id === assignment._id && assignmentTracking.length > 0 && (
                                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="font-semibold text-blue-800 dark:text-blue-200">Tracking Summary:</span>
                                    <span className="text-blue-700 dark:text-blue-300">
                                      {assignmentTracking.filter((t: any) => t.hasExternalVisits).length} user(s) visited external websites
                                    </span>
                                    {assignmentTracking.filter((t: any) => t.hasSuspiciousActivity).length > 0 && (
                                      <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        {assignmentTracking.filter((t: any) => t.hasSuspiciousActivity).length} suspicious
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchAssignmentDetails(assignment._id)}
                              >
                                View Details
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteQuizAssignment(assignment._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {selectedAssignment?._id === assignment._id && (
                          <CardContent>
                            <div className="space-y-4">
                              {/* Tracking Summary Section */}
                              {assignmentTracking.length > 0 && (
                                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    <h4 className="font-bold text-lg text-yellow-900 dark:text-yellow-100">
                                      Cheating Detection Report
                                    </h4>
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                                      <p className="text-sm text-muted-foreground mb-1">Users with External Visits</p>
                                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {assignmentTracking.filter((t: any) => t.hasExternalVisits).length}
                                      </p>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-gray-900 rounded border">
                                      <p className="text-sm text-muted-foreground mb-1">Suspicious Activities</p>
                                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {assignmentTracking.filter((t: any) => t.hasSuspiciousActivity).length}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {assignmentTracking
                                      .filter((t: any) => t.hasExternalVisits)
                                      .map((tracking: any) => (
                                        <div key={tracking._id} className="p-2 bg-white dark:bg-gray-900 rounded border border-yellow-200 dark:border-yellow-800">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm">
                                              {tracking.userId?.name || 'Unknown'} ({tracking.userId?.email})
                                            </span>
                                            <span className="text-xs text-yellow-700 dark:text-yellow-300">
                                              {tracking.totalExternalTimeMinutes} min on external sites
                                            </span>
                                          </div>
                                          <div className="mt-1 flex flex-wrap gap-2">
                                            {tracking.externalVisits.slice(0, 3).map((visit: any, idx: number) => (
                                              <span key={idx} className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                                                {visit.domain} ({visit.totalDurationMinutes} min)
                                              </span>
                                            ))}
                                            {tracking.externalVisits.length > 3 && (
                                              <span className="text-xs text-muted-foreground">
                                                +{tracking.externalVisits.length - 3} more
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-semibold mb-2">Assigned Users:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {assignment.assignedTo.map((user: any) => (
                                    <span
                                      key={user._id}
                                      className="px-2 py-1 bg-muted rounded text-sm"
                                    >
                                      {user.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {assignmentResults.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Results:</h4>
                                  <div className="space-y-2">
                                    {assignmentResults.map((result: any) => {
                                      // Find tracking data for this user
                                      const userTracking = assignmentTracking.find(
                                        (t: any) => t.userId?._id === result.userId?._id
                                      )
                                      const hasSuspiciousActivity = userTracking?.hasSuspiciousActivity || false
                                      const hasExternalVisits = userTracking?.hasExternalVisits || false
                                      
                                      return (
                                        <div
                                          key={result._id}
                                          className={`p-3 border rounded-lg ${
                                            result.passed
                                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                                          } ${hasSuspiciousActivity || hasExternalVisits ? 'border-yellow-500 dark:border-yellow-600 border-2' : ''}`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">
                                                  {result.userId?.name || 'Unknown'} ({result.userId?.email})
                                                </p>
                                                {(hasSuspiciousActivity || hasExternalVisits) && (
                                                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Suspicious Activity
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-sm text-muted-foreground">
                                                Submitted: {new Date(result.submittedAt).toLocaleString()}
                                              </p>
                                              
                                              {/* External Visits Info */}
                                              {userTracking && hasExternalVisits && (
                                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <ExternalLink className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                                      External Website Visits Detected
                                                    </p>
                                                  </div>
                                                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                                                    Total time on external sites: {userTracking.totalExternalTimeMinutes} minutes
                                                  </p>
                                                  <div className="space-y-1">
                                                    {userTracking.externalVisits.map((visit: any, idx: number) => (
                                                      <div key={idx} className="text-xs text-yellow-700 dark:text-yellow-300 flex justify-between items-center">
                                                        <span className="font-medium">{visit.domain}</span>
                                                        <span>
                                                          {visit.count} visit(s) • {visit.totalDurationMinutes} min
                                                        </span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                  {userTracking.suspiciousCount > 0 && (
                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                      {userTracking.suspiciousCount} suspicious activity(ies) detected
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-right ml-4">
                                              <p className="font-bold text-lg">
                                                {result.score.toFixed(1)}/10
                                              </p>
                                              <p className={`text-sm ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {result.passed ? 'Passed' : 'Failed'}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Select User</CardTitle>
                  <CardDescription>Choose a user to view their progress</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="mb-4">
                  <Input
                    placeholder="Tìm kiếm theo tên, email, language, hoặc tiến độ học..."
                    value={userProgressTabSearch}
                    onChange={(e) => setUserProgressTabSearch(e.target.value)}
                    className="w-full"
                  />
                  {userProgressTabSearch && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Tìm thấy {getFilteredAndSortedUserProgressTab().length} kết quả
                    </p>
                  )}
                </div>

                {/* Sort Controls */}
                <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-semibold">Sắp xếp:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        className="flex-1 px-3 py-2 border border-primary/30 rounded-md bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={userProgressTabSort}
                        onChange={(e) => setUserProgressTabSort(e.target.value as any)}
                      >
                        <option value="name">Tên</option>
                        <option value="email">Email</option>
                      </select>
                      <select
                        className="px-3 py-2 border border-primary/30 rounded-md bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[80px]"
                        value={userProgressTabSortOrder}
                        onChange={(e) => setUserProgressTabSortOrder(e.target.value as 'asc' | 'desc')}
                      >
                        <option value="asc">↑ Tăng dần</option>
                        <option value="desc">↓ Giảm dần</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {getFilteredAndSortedUserProgressTab().map((u) => {
                    const userInfo = getUserInfoForSearch(u._id)
                    return (
                    <button
                      key={u._id}
                      onClick={() => fetchUserProgress(u._id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        selectedUser === u._id
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                          : 'border-border hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 hover:scale-[1.02] group'
                      }`}
                    >
                      <p className={`font-semibold transition-all duration-200 ${selectedUser !== u._id ? 'group-hover:text-primary group-hover:font-bold' : ''}`}>{u.name}</p>
                      <p className={`text-sm text-muted-foreground transition-all duration-200 ${selectedUser !== u._id ? 'group-hover:text-foreground group-hover:font-medium' : ''}`}>{u.email}</p>
                      {(userInfo.language || userInfo.completedLessons > 0 || userInfo.score > 0) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {userInfo.language && (
                            <span>Language: <span className="font-medium">{userInfo.language}</span></span>
                          )}
                          {userInfo.completedLessons > 0 && (
                            <span>Đã làm: <span className="font-medium">{userInfo.completedLessons} bài</span></span>
                          )}
                          {userInfo.score > 0 && (
                            <span>Điểm: <span className="font-medium">{userInfo.score.toFixed(1)}</span></span>
                          )}
                        </div>
                      )}
                    </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {userProgress && (
              <div className="space-y-6">
                {/* Current Language and Level Info */}
                {(() => {
                  const currentInfo = getCurrentLanguageAndLevel()
                  return currentInfo ? (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader>
                        <CardTitle className="text-lg">Current Learning Status</CardTitle>
                        <CardDescription>User's current language and level</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{currentInfo.language.icon}</span>
                            <div>
                              <p className="font-semibold">Language</p>
                              <p className="text-sm text-muted-foreground">{currentInfo.language.name}</p>
                            </div>
                          </div>
                          <div className="h-12 w-px bg-border"></div>
                          <div>
                            <p className="font-semibold">Current Level</p>
                            <p className="text-sm text-muted-foreground">
                              Level {currentInfo.level.number}: {currentInfo.level.title}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null
                })()}

                {/* Unlock Level Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unlock Level</CardTitle>
                    <CardDescription>Manually unlock a level for this user</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Language</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={selectedLanguageId}
                          onChange={(e) => {
                            setSelectedLanguageId(e.target.value)
                            setSelectedLevelId('') // Reset level when language changes
                          }}
                        >
                          <option value="">-- Select Language --</option>
                          {languages.map((lang) => (
                            <option key={lang._id} value={lang._id}>
                              {lang.icon} {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedLanguageId && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Level</label>
                          <select
                            className="w-full p-2 border rounded-lg"
                            value={selectedLevelId}
                            onChange={(e) => setSelectedLevelId(e.target.value)}
                          >
                            <option value="">-- Select Level --</option>
                            {getAvailableLevels().map((level) => (
                              <option key={level._id} value={level._id}>
                                Level {level.levelNumber}: {level.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <Button
                        onClick={() => handleUnlockLevel()}
                        disabled={!selectedLevelId}
                        className="w-full"
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Selected Level
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* User Progress List - Levels */}
                <Card>
                  <CardHeader>
                    <CardTitle>Level Progress</CardTitle>
                    <CardDescription>
                      {userProgress.userId.name} ({userProgress.userId.email})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userProgress.levelScores.length > 0 ? (
                        userProgress.levelScores.map((levelScore, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {levelScore.levelId.languageId && (
                                    <>
                                      <span className="text-lg">
                                        {levelScore.levelId.languageId.icon}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {levelScore.levelId.languageId.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <p className="font-semibold">
                                  Level {levelScore.levelId.levelNumber}: {levelScore.levelId.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {levelScore.averageScore.toFixed(1)}/10
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {levelScore.isUnlocked ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-500 text-sm flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      Unlocked
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleLockLevel(levelScore.levelId._id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                    >
                                      <Lock className="h-4 w-4 mr-2" />
                                      Lock
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnlockLevel(levelScore.levelId._id)}
                                  >
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Unlock
                                  </Button>
                                )}
                              </div>
                            </div>
                            {levelScore.adminApproved && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                <Shield className="h-3 w-3" />
                                Admin approved
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No level progress data available
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* User Progress List - Lessons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Completed Lessons</CardTitle>
                    <CardDescription>
                      Danh sách các bài học đã hoàn thành
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userProgress.lessonScores && userProgress.lessonScores.length > 0 ? (
                        userProgress.lessonScores
                          .filter(ls => ls.totalScore > 0)
                          .sort((a, b) => {
                            if (a.completedAt && b.completedAt) {
                              return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                            }
                            return (b.totalScore || 0) - (a.totalScore || 0)
                          })
                          .map((lessonScore, index) => (
                            <div key={index} className="p-4 border rounded-lg transition-all duration-200 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] group cursor-pointer">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {lessonScore.lessonId.levelId && (
                                      <>
                                        {lessonScore.lessonId.levelId.languageId && (
                                          <span className="text-lg">
                                            {lessonScore.lessonId.levelId.languageId.icon}
                                          </span>
                                        )}
                                        <span className="text-xs px-2 py-1 bg-muted rounded">
                                          Level {lessonScore.lessonId.levelId.levelNumber}
                                        </span>
                                        {lessonScore.lessonId.levelId.languageId && (
                                          <span className="text-xs text-muted-foreground">
                                            {lessonScore.lessonId.levelId.languageId.name}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>
                                  <p className="font-semibold text-lg mb-1 group-hover:text-primary group-hover:font-bold transition-all duration-200">
                                    Lesson {lessonScore.lessonId.lessonNumber}: {lessonScore.lessonId.title}
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Quiz Score</p>
                                      <p className="font-medium">
                                        {lessonScore.quizScore !== null ? lessonScore.quizScore.toFixed(1) : 'N/A'}/10
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Code Score</p>
                                      <p className="font-medium">
                                        {lessonScore.codeScore !== null ? lessonScore.codeScore.toFixed(1) : 'N/A'}/10
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Total Score</p>
                                      <p className="font-medium text-primary">
                                        {lessonScore.totalScore.toFixed(1)}/20
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Attempts</p>
                                      <p className="font-medium">
                                        Quiz: {lessonScore.quizAttempts || 0} | Code: {lessonScore.codeAttempts || 0}
                                      </p>
                                    </div>
                                  </div>
                                  {lessonScore.completedAt && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Completed: {new Date(lessonScore.completedAt).toLocaleString('vi-VN')}
                                    </p>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    lessonScore.totalScore >= 18 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                      : lessonScore.totalScore >= 14
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                      : lessonScore.totalScore >= 10
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {lessonScore.totalScore >= 18 ? 'Excellent' 
                                      : lessonScore.totalScore >= 14 ? 'Good'
                                      : lessonScore.totalScore >= 10 ? 'Average'
                                      : 'Needs Improvement'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          Chưa có bài học nào được hoàn thành
                        </p>
                      )}
                    </div>
                    {userProgress.lessonScores && userProgress.lessonScores.length > 0 && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Lessons</p>
                            <p className="font-semibold text-lg">{userProgress.lessonScores.filter(ls => ls.totalScore > 0).length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Quiz Score</p>
                            <p className="font-semibold text-lg">
                              {(() => {
                                const quizScores = userProgress.lessonScores
                                  .filter(ls => ls.quizScore !== null)
                                  .map(ls => ls.quizScore!)
                                return quizScores.length > 0 
                                  ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)
                                  : 'N/A'
                              })()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Code Score</p>
                            <p className="font-semibold text-lg">
                              {(() => {
                                const codeScores = userProgress.lessonScores
                                  .filter(ls => ls.codeScore !== null)
                                  .map(ls => ls.codeScore!)
                                return codeScores.length > 0 
                                  ? (codeScores.reduce((a, b) => a + b, 0) / codeScores.length).toFixed(1)
                                  : 'N/A'
                              })()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Total Score</p>
                            <p className="font-semibold text-lg">
                              {(() => {
                                const totalScores = userProgress.lessonScores
                                  .filter(ls => ls.totalScore > 0)
                                  .map(ls => ls.totalScore)
                                return totalScores.length > 0 
                                  ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1)
                                  : 'N/A'
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
