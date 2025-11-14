'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Unlock, 
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
  TrendingUp
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
    levelId: { _id: string; title: string; levelNumber: number }
    isUnlocked: boolean
    averageScore: number
    adminApproved: boolean
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

interface Lesson {
  _id: string
  lessonNumber: number
  title: string
  levelId: { _id: string; title: string; levelNumber: number }
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

export default function AdminPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Dashboard
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  
  // Users
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  
  // Content Management
  const [languages, setLanguages] = useState<Language[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  
  // Editing states
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editingLanguage, setEditingLanguage] = useState<string | null>(null)
  const [editingLevel, setEditingLevel] = useState<string | null>(null)
  const [editingLesson, setEditingLesson] = useState<string | null>(null)
  
  // Form states
  const [newLanguage, setNewLanguage] = useState({ name: '', slug: '', description: '', icon: '🌐' })
  const [newLevel, setNewLevel] = useState({ languageId: '', levelNumber: 1, title: '', description: '' })
  const [showNewLanguage, setShowNewLanguage] = useState(false)
  const [showNewLevel, setShowNewLevel] = useState(false)

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
      fetchUsers()
      fetchLanguages()
      fetchLevels()
      fetchLessons()
    }
  }, [isAuthenticated, user])

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data.stats)
      setRecentUsers(response.data.recentUsers)
      setTopUsers(response.data.topUsers || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
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
      const response = await api.get(`/admin/users/${userId}/progress`)
      setUserProgress(response.data.progress)
      setSelectedUser(userId)
    } catch (error) {
      console.error('Error fetching user progress:', error)
    }
  }

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/admin/languages')
      setLanguages(response.data.languages)
    } catch (error) {
      console.error('Error fetching languages:', error)
    }
  }

  const fetchLevels = async () => {
    try {
      const response = await api.get('/admin/levels')
      setLevels(response.data.levels)
    } catch (error) {
      console.error('Error fetching levels:', error)
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await api.get('/admin/lessons')
      setLessons(response.data.lessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  const handleUnlockLevel = async (levelId: string) => {
    if (!selectedUser) return
    try {
      await api.post(`/admin/users/${selectedUser}/unlock-level/${levelId}`)
      fetchUserProgress(selectedUser)
      fetchDashboard()
    } catch (error) {
      console.error('Error unlocking level:', error)
      alert('Error unlocking level')
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

  const handleUpdateLanguage = async (languageId: string, data: Partial<Language>) => {
    try {
      await api.put(`/admin/languages/${languageId}`, data)
      fetchLanguages()
      setEditingLanguage(null)
    } catch (error) {
      console.error('Error updating language:', error)
      alert('Error updating language')
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

  const handleUpdateLevel = async (levelId: string, data: Partial<Level>) => {
    try {
      await api.put(`/admin/levels/${levelId}`, data)
      fetchLevels()
      setEditingLevel(null)
    } catch (error) {
      console.error('Error updating level:', error)
      alert('Error updating level')
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
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
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

              {/* Top Users */}
              {topUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 Users</CardTitle>
                    <CardDescription>Sorted by average score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topUsers.map((user, index) => (
                        <div key={user.userId?._id || index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
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
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentUsers.map((u) => (
                      <div key={u._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
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

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{u.name}</p>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Joined: {new Date(u.createdAt).toLocaleDateString()}
                        </p>
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
                ))}
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
                          onClick={() => setEditingLanguage(editingLanguage === lang._id ? null : lang._id)}
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
                          onClick={() => setEditingLevel(editingLevel === level._id ? null : level._id)}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>All lessons in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          Lesson {lesson.lessonNumber}: {lesson.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lesson.levelId?.title} (Level {lesson.levelId?.levelNumber})
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteLesson(lesson._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select User</CardTitle>
                <CardDescription>Choose a user to view their progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => fetchUserProgress(u._id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedUser === u._id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {userProgress && (
              <Card>
                <CardHeader>
                  <CardTitle>User Progress</CardTitle>
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
                              <p className="font-semibold">
                                Level {levelScore.levelId.levelNumber}: {levelScore.levelId.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Score: {levelScore.averageScore.toFixed(1)}/10
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {levelScore.isUnlocked ? (
                                <span className="text-green-500 text-sm flex items-center gap-1">
                                  <Unlock className="h-4 w-4" />
                                  Unlocked
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleUnlockLevel(levelScore.levelId._id)}
                                >
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Unlock
                                </Button>
                              )}
                            </div>
                          </div>
                          {levelScore.adminApproved && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin approved
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No progress data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
