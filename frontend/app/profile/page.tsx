'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, Clock, BookOpen, ClipboardList, CheckCircle2, XCircle } from 'lucide-react'

interface UserProgress {
  currentStreak: number
  totalStudyTime: number
  completedLessonIds: string[]
  lessonScores: Array<{
    lessonId: { title: string; lessonNumber: number }
    quizScore: number | null
    codeScore: number | null
    totalScore: number
    quizAttempts: number
    codeAttempts: number
  }>
  levelScores: Array<{
    levelId: { title: string; levelNumber: number }
    averageScore: number
  }>
}

interface QuizAssignmentResult {
  _id: string
  assignmentId: {
    _id: string
    title: string
    deadline: string
    passingScore: number
  }
  score: number
  passed: boolean
  submittedAt: string
}

export default function ProfilePage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [assignmentResults, setAssignmentResults] = useState<QuizAssignmentResult[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])


  const fetchProgress = async () => {
    try {
      const response = await api.get('/progress')
      setProgress(response.data.progress)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoadingProgress(false)
    }
  }

  const fetchAssignmentResults = async () => {
    try {
      const response = await api.get('/progress/quiz-assignments/results')
      setAssignmentResults(response.data.results || [])
    } catch (error) {
      console.error('Error fetching assignment results:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProgress()
      fetchAssignmentResults()
    }
  }, [isAuthenticated])

  if (loading || loadingProgress) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
        Hồ sơ
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Chuỗi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress?.currentStreak || 0} ngày</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Thời gian học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round((progress?.totalStudyTime || 0) / 60)} giờ</p>
            <p className="text-sm text-muted-foreground">
              {progress?.totalStudyTime || 0} phút tổng cộng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              Bài học đã hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{progress?.completedLessonIds.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz and Code Statistics */}
      {progress && progress.lessonScores.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Thống kê điểm số</CardTitle>
            <CardDescription>Điểm Quiz và Code Exercise theo từng bài học</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.lessonScores.map((lessonScore, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        Bài {lessonScore.lessonId.lessonNumber}: {lessonScore.lessonId.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Tổng: {lessonScore.totalScore.toFixed(1)}/20
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Điểm Quiz
                        </span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {lessonScore.quizScore !== null ? `${lessonScore.quizScore.toFixed(1)}/10` : 'Chưa làm'}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {lessonScore.quizAttempts} lần thử
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">
                          Điểm Code
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {lessonScore.codeScore !== null ? `${lessonScore.codeScore.toFixed(1)}/10` : 'Chưa làm'}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {lessonScore.codeAttempts} lần thử
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Statistics */}
      {progress && progress.lessonScores.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Thống kê tổng quan</CardTitle>
            <CardDescription>Tổng hợp điểm số Quiz và Code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">Điểm Quiz trung bình</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {(() => {
                    const quizScores = progress.lessonScores
                      .filter(ls => ls.quizScore !== null)
                      .map(ls => ls.quizScore!);
                    return quizScores.length > 0
                      ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length).toFixed(1)
                      : '0.0';
                  })()}/10
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {progress.lessonScores.filter(ls => ls.quizScore !== null).length} bài đã làm
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-900 dark:text-green-100 mb-2">Điểm Code trung bình</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(() => {
                    const codeScores = progress.lessonScores
                      .filter(ls => ls.codeScore !== null)
                      .map(ls => ls.codeScore!);
                    return codeScores.length > 0
                      ? (codeScores.reduce((a, b) => a + b, 0) / codeScores.length).toFixed(1)
                      : '0.0';
                  })()}/10
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {progress.lessonScores.filter(ls => ls.codeScore !== null).length} bài đã làm
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-900 dark:text-purple-100 mb-2">Điểm tổng trung bình</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {(() => {
                    const totalScores = progress.lessonScores
                      .filter(ls => ls.totalScore > 0)
                      .map(ls => ls.totalScore);
                    return totalScores.length > 0
                      ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length / 2).toFixed(1)
                      : '0.0';
                  })()}/10
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                  {progress.lessonScores.filter(ls => ls.totalScore > 0).length} bài đã hoàn thành
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Assignments Results */}
      {assignmentResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Điểm Quiz Assignments
            </CardTitle>
            <CardDescription>Điểm số Quiz Assignments (riêng biệt với Quiz của bài học)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignmentResults.map((result) => {
                const deadlineDate = new Date(result.assignmentId.deadline)
                return (
                  <div 
                    key={result._id} 
                    className={`p-4 border-2 rounded-lg ${
                      result.passed
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{result.assignmentId.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Deadline: {deadlineDate.toLocaleString()} • Passing: {result.assignmentId.passingScore}/10
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {result.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <div className="text-right">
                          <p className="font-bold text-xl">
                            {result.score.toFixed(1)}/10
                          </p>
                          <p className={`text-sm font-medium ${result.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {new Date(result.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Quiz Assignments Done</p>
                  <p className="text-2xl font-bold">{assignmentResults.length}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold">
                    {assignmentResults.length > 0
                      ? (assignmentResults.reduce((sum, r) => sum + r.score, 0) / assignmentResults.length).toFixed(1)
                      : '0.0'}/10
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-900 dark:text-green-100 mb-1">Passed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {assignmentResults.filter(r => r.passed).length}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-900 dark:text-red-100 mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {assignmentResults.filter(r => !r.passed).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {progress && progress.levelScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ cấp độ</CardTitle>
            <CardDescription>Điểm số của bạn theo cấp độ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.levelScores.map((levelScore, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">
                      Cấp độ {levelScore.levelId.levelNumber}: {levelScore.levelId.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Điểm trung bình: {levelScore.averageScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



