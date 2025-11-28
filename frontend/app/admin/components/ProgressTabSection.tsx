'use client'

import { TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, CheckCircle2, Unlock, Lock, Shield, Clock } from 'lucide-react'
import type { User, UserProgress, Language, Level } from '../types'

type SortKey = 'name' | 'email'
type SortOrder = 'asc' | 'desc'

type ProgressUserInfo = {
  language?: string
  completedLessons: number
  score: number
}

type CurrentInfo = {
  language: { icon: string; name: string }
  level: { number: number; title: string }
}

interface ProgressTabSectionProps {
  userProgressTabSearch: string
  onSearchChange: (value: string) => void
  userProgressTabSort: SortKey
  onSortChange: (value: SortKey) => void
  userProgressTabSortOrder: SortOrder
  onSortOrderChange: (value: SortOrder) => void
  getFilteredAndSortedUserProgressTab: () => User[]
  selectedUser: string | null
  fetchUserProgress: (userId: string) => void | Promise<void>
  getUserInfoForSearch: (userId: string) => ProgressUserInfo
  userProgress: UserProgress | null
  getCurrentLanguageAndLevel: () => CurrentInfo | null
  selectedLanguageId: string
  onSelectLanguage: (languageId: string) => void
  selectedLevelId: string
  onSelectLevel: (levelId: string) => void
  languages: Language[]
  getAvailableLevels: () => Level[]
  handleUnlockLevel: (levelId?: string) => void | Promise<void>
  handleLockLevel: (levelId: string) => void | Promise<void>
}

export function ProgressTabSection({
  userProgressTabSearch,
  onSearchChange,
  userProgressTabSort,
  onSortChange,
  userProgressTabSortOrder,
  onSortOrderChange,
  getFilteredAndSortedUserProgressTab,
  selectedUser,
  fetchUserProgress,
  getUserInfoForSearch,
  userProgress,
  getCurrentLanguageAndLevel,
  selectedLanguageId,
  onSelectLanguage,
  selectedLevelId,
  onSelectLevel,
  languages,
  getAvailableLevels,
  handleUnlockLevel,
  handleLockLevel
}: ProgressTabSectionProps) {
  const users = getFilteredAndSortedUserProgressTab()
  const currentInfo = getCurrentLanguageAndLevel()

  return (
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
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm theo tên, email, language, hoặc tiến độ học..."
                value={userProgressTabSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full"
              />
              {userProgressTabSearch && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tìm thấy {users.length} kết quả
                </p>
              )}
            </div>

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
                    onChange={(e) => onSortChange(e.target.value as SortKey)}
                  >
                    <option value="name">Tên</option>
                    <option value="email">Email</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-primary/30 rounded-md bg-background text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[80px]"
                    value={userProgressTabSortOrder}
                    onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                  >
                    <option value="asc">↑ Tăng dần</option>
                    <option value="desc">↓ Giảm dần</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {users.map((u) => {
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
            {currentInfo && (
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
            )}

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
                      onChange={(e) => onSelectLanguage(e.target.value)}
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
                        onChange={(e) => onSelectLevel(e.target.value)}
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

            <Card>
              <CardHeader>
                <CardTitle>Completed Lessons</CardTitle>
                <CardDescription>Danh sách các bài học đã hoàn thành</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProgress.lessonScores && userProgress.lessonScores.length > 0 ? (
                    userProgress.lessonScores
                      .filter((ls) => ls.totalScore > 0)
                      .sort((a, b) => {
                        if (a.completedAt && b.completedAt) {
                          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                        }
                        return (b.totalScore || 0) - (a.totalScore || 0)
                      })
                      .map((lessonScore, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg transition-all duration-200 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01] group cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {lessonScore.lessonId?.levelId && (
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
                                {lessonScore.lessonId
                                  ? `Lesson ${lessonScore.lessonId.lessonNumber}: ${lessonScore.lessonId.title}`
                                  : 'Lesson information unavailable'}
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
                        <p className="font-semibold text-lg">
                          {userProgress.lessonScores.filter((ls) => ls.totalScore > 0).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Quiz Score</p>
                        <p className="font-semibold text-lg">
                          {(() => {
                            const quizScores = userProgress.lessonScores
                              .filter((ls) => ls.quizScore !== null)
                              .map((ls) => ls.quizScore!) as number[]
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
                              .filter((ls) => ls.codeScore !== null)
                              .map((ls) => ls.codeScore!) as number[]
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
                              .filter((ls) => ls.totalScore > 0)
                              .map((ls) => ls.totalScore)
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
  )
}

