'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Plus,
  Save,
  X,
  TrendingUp,
  Eye,
  ExternalLink
} from 'lucide-react'
import type { Stats, TopUser, User } from '../types'

interface DashboardTabProps {
  stats: Stats | null
  trackingStats: any
  topUsers: TopUser[]
  recentUsers: User[]
  bulkUsers: Array<{ name: string; email: string; password: string }>
  showBulkCreateUsers: boolean
  topUsersSort: string
  topUsersSortOrder: 'asc' | 'desc'
  recentUsersSort: string
  recentUsersSortOrder: 'asc' | 'desc'
  onSetShowBulkCreateUsers: (show: boolean) => void
  onSetBulkUsers: (users: Array<{ name: string; email: string; password: string }>) => void
  onAddBulkUser: () => void
  onRemoveBulkUser: (index: number) => void
  onUpdateBulkUser: (index: number, field: string, value: string) => void
  onHandleBulkCreateUsers: () => void
  onSetTopUsersSort: (sort: string) => void
  onSetTopUsersSortOrder: (order: 'asc' | 'desc') => void
  onSetRecentUsersSort: (sort: string) => void
  onSetRecentUsersSortOrder: (order: 'asc' | 'desc') => void
  getSortedTopUsers: () => TopUser[]
  getSortedRecentUsers: () => User[]
  getWebsiteName: (domain: string) => string
}

export function DashboardTab({
  stats,
  trackingStats,
  topUsers,
  recentUsers,
  bulkUsers,
  showBulkCreateUsers,
  topUsersSort,
  topUsersSortOrder,
  recentUsersSort,
  recentUsersSortOrder,
  onSetShowBulkCreateUsers,
  onSetBulkUsers,
  onAddBulkUser,
  onRemoveBulkUser,
  onUpdateBulkUser,
  onHandleBulkCreateUsers,
  onSetTopUsersSort,
  onSetTopUsersSortOrder,
  onSetRecentUsersSort,
  onSetRecentUsersSortOrder,
  getSortedTopUsers,
  getSortedRecentUsers,
  getWebsiteName,
}: DashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Bulk Create Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Create Multiple Users</CardTitle>
            <CardDescription>Create multiple user accounts at once</CardDescription>
          </div>
          <Button onClick={() => onSetShowBulkCreateUsers(!showBulkCreateUsers)}>
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
                        onClick={() => onRemoveBulkUser(index)}
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
                        onChange={(e) => onUpdateBulkUser(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={user.email}
                        onChange={(e) => onUpdateBulkUser(index, 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Password *</label>
                      <Input
                        type="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={(e) => onUpdateBulkUser(index, 'password', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onAddBulkUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another User
              </Button>
              <Button onClick={onHandleBulkCreateUsers}>
                <Save className="h-4 w-4 mr-2" />
                Create {bulkUsers.filter(u => u.name && u.email && u.password).length} User(s)
              </Button>
              <Button variant="outline" onClick={() => {
                onSetShowBulkCreateUsers(false)
                onSetBulkUsers([{ name: '', email: '', password: '' }])
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

          {/* Tracking Statistics - Continue in next part due to length */}
          {trackingStats && (
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
                              <span className="font-medium text-sm">{getWebsiteName(domain.domain)}</span>
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
                      onChange={(e) => onSetTopUsersSort(e.target.value)}
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
                      onChange={(e) => onSetTopUsersSortOrder(e.target.value as 'asc' | 'desc')}
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
                    onChange={(e) => onSetRecentUsersSort(e.target.value)}
                  >
                    <option value="date">Ngày đăng ký</option>
                    <option value="name">Tên</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                  </select>
                  <select
                    className="text-sm px-2 py-1 border rounded-md"
                    value={recentUsersSortOrder}
                    onChange={(e) => onSetRecentUsersSortOrder(e.target.value as 'asc' | 'desc')}
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
    </div>
  )
}
