'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGATracking } from '@/hooks/useGATracking'
import { useRouter, useParams } from 'next/navigation'
import api, { getApiUrl } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuizAssignmentModal } from '@/components/QuizAssignmentModal'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  AlertCircle,
  Trophy,
  Download,
  Upload,
  MessageSquare,
  X
} from 'lucide-react'
import Link from 'next/link'

interface QuizAssignment {
  _id: string
  title: string
  description: string
  questions: Array<{
    question: string | { vi?: string; en?: string }
    options: Array<string | { vi?: string; en?: string }>
    correctAnswer?: number
    explanation?: string | { vi?: string; en?: string }
  }>
  passingScore: number
  assignedBy: { _id: string; name: string; email: string }
  deadline: string
  isExpired: boolean
  isSubmitted: boolean
  canSubmit: boolean
  userResult?: {
    _id: string
    score: number
    passed: boolean
    submittedAt: string
  }
}

interface FileAssignment {
  _id: string
  title: string
  description: string
  fileKey?: string
  fileUrl: string
  fileName: string
  assignedBy: { _id: string; name: string; email: string }
  deadline: string
  isExpired: boolean
  isSubmitted: boolean
  canSubmit: boolean
  submission?: {
    _id: string
    fileKey?: string
    fileUrl?: string
    fileName: string
    submittedAt: string
    score?: number
    feedback?: string
    status?: 'submitted' | 'reviewed'
  }
}

export default function AssignmentsPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const [quizAssignments, setQuizAssignments] = useState<QuizAssignment[]>([])
  const [fileAssignments, setFileAssignments] = useState<FileAssignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<QuizAssignment | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [submittingFile, setSubmittingFile] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const { trackQuizAction, trackButtonClick, trackNavigation } = useGATracking()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssignments()
    }
  }, [isAuthenticated])

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true)
      const [quizResponse, fileResponse] = await Promise.all([
        api.get('/progress/quiz-assignments'),
        api.get('/progress/file-assignments')
      ])
      setQuizAssignments(quizResponse.data.assignments || [])
      setFileAssignments(fileResponse.data.assignments || [])
      
      // Track page view
      trackNavigation('', '/assignments', 'direct')
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoadingAssignments(false)
    }
  }

  const handleStartQuiz = async (assignmentId: string) => {
    try {
      router.push(`/assignments/${assignmentId}/quiz`)
    } catch (error: any) {
      console.error('Error starting quiz:', error)
      alert(error.response?.data?.message || 'Error loading quiz')
    }
  }

  const handleDownloadFile = async (fileKey: string) => {
  const res = await fetch(`/api/r2/presign-download?key=${encodeURIComponent(fileKey)}`)
  const { downloadUrl } = await res.json()
  window.open(downloadUrl, '_blank')
}



  const handleFileSelect = (assignmentId: string, file: File | null) => {
    if (file) {
      handleSubmitFile(assignmentId, file)
    }
  }

 const handleSubmitFile = async (assignmentId: string, file: File) => {
  try {
    setSubmittingFile(assignmentId)

    // Step 1: Get presigned upload URL
    const presignRes = await fetch('/api/r2/presign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream'
      })
    })

    if (!presignRes.ok) {
      const errorData = await presignRes.json()
      console.error('Presign error:', errorData)
      throw new Error(errorData.message || 'Không lấy được URL upload')
    }

    const { uploadUrl, key, fileUrl } = await presignRes.json()

    console.log('Presigned URL received, uploading file...', { key, fileUrl })

    // Step 2: Upload file to R2
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    })

    if (!uploadRes.ok) {
      console.error('Upload response:', uploadRes.status, uploadRes.statusText)
      throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`)
    }

    console.log('File uploaded successfully to R2')

    // Step 3: Submit assignment with file key
    const submitRes = await api.post(`/progress/file-assignments/${assignmentId}/submit`, {
      fileKey: key,
      fileUrl: fileUrl,
      fileName: file.name
    })

    console.log('Assignment submitted:', submitRes.data)
    alert('Nộp file thành công!')
    fetchAssignments()

  } catch (error) {
    console.error('Error submitting file:', error)
    alert(`Upload file thất bại: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`)
  } finally {
    setSubmittingFile(null)
  }
}

  const handleQuizComplete = async (quizScore: number, codeScore?: number) => {
    if (!selectedAssignment) return
    
    trackQuizAction('submit', selectedAssignment._id, selectedAssignment.title, {
      quiz_type: 'assignment',
      quiz_score: quizScore,
      passed: quizScore >= selectedAssignment.passingScore
    })
    
    setShowQuiz(false)
    setSelectedAssignment(null)
    fetchAssignments()
  }

  if (loading || loadingAssignments) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const normalizedQuestions = selectedAssignment?.questions.map((q) => {
    const questionText = typeof q.question === 'string' ? q.question : (q.question.en || q.question.vi || '')
    const options = q.options.map((opt) => 
      typeof opt === 'string' ? opt : (opt.en || opt.vi || '')
    )
    
    return {
      question: questionText,
      options,
      correctAnswer: q.correctAnswer || 0,
      explanation: q.explanation ? (typeof q.explanation === 'string' ? q.explanation : (q.explanation.en || q.explanation.vi || '')) : undefined
    }
  }) || []

  // Phân loại assignments
  const pendingQuizAssignments = quizAssignments.filter(a => !a.isSubmitted)
  const submittedQuizAssignments = quizAssignments.filter(a => a.isSubmitted)
  const pendingFileAssignments = fileAssignments.filter(a => !a.isSubmitted)
  const submittedFileAssignments = fileAssignments.filter(a => a.isSubmitted)

  const totalPending = pendingQuizAssignments.length + pendingFileAssignments.length
  const totalSubmitted = submittedQuizAssignments.length + submittedFileAssignments.length

  // Component để render assignment card
  const renderAssignmentCard = (assignment: QuizAssignment | FileAssignment, isQuiz: boolean) => {
    const deadlineDate = new Date(assignment.deadline)
    const timeRemaining = deadlineDate.getTime() - Date.now()
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
    const isUrgent = daysRemaining <= 1 && !assignment.isSubmitted

    if (isQuiz) {
      const quizAssignment = assignment as QuizAssignment
      return (
        <Card 
          key={quizAssignment._id} 
          className={`${quizAssignment.isExpired && !quizAssignment.isSubmitted ? 'opacity-75 border-red-300 dark:border-red-700' : ''} ${isUrgent && !quizAssignment.isSubmitted ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  {quizAssignment.title}
                  {quizAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Đã nộp
                    </span>
                  )}
                  {quizAssignment.isExpired && !quizAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Đã hết hạn
                    </span>
                  )}
                  {isUrgent && !quizAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Sắp hết hạn
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mb-3">
                  {quizAssignment.description}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Deadline: {deadlineDate.toLocaleString('vi-VN')}
                  </span>
                  {!quizAssignment.isExpired && !quizAssignment.isSubmitted && (
                    <span className={isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                      {daysRemaining > 0 ? `${daysRemaining} ngày còn lại` : 'Hết hạn hôm nay'}
                    </span>
                  )}
                  <span>Passing: {quizAssignment.passingScore}/10</span>
                  <span>{quizAssignment.questions.length} câu hỏi</span>
                  <span>Gán bởi: {quizAssignment.assignedBy.name}</span>
                </div>
                {quizAssignment.isSubmitted && quizAssignment.userResult && (
                  <div className={`mt-3 p-3 rounded-lg border-2 ${
                    quizAssignment.userResult.passed
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      {quizAssignment.userResult.passed ? (
                        <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold">
                          Điểm của bạn: {quizAssignment.userResult.score.toFixed(1)}/10
                        </p>
                        <p className={`text-sm ${quizAssignment.userResult.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {quizAssignment.userResult.passed ? 'Đã đạt!' : 'Chưa đạt (Cần ' + quizAssignment.passingScore + '/10 để đạt)'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Nộp lúc: {new Date(quizAssignment.userResult.submittedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-4">
                {quizAssignment.canSubmit ? (
                  <Button onClick={() => handleStartQuiz(quizAssignment._id)}>
                    Bắt đầu Quiz
                  </Button>
                ) : quizAssignment.isExpired ? (
                  <Button variant="outline" onClick={() => handleStartQuiz(quizAssignment._id)}>
                    Xem Quiz
                  </Button>
                ) : quizAssignment.isSubmitted ? (
                  <Button variant="outline" onClick={() => handleStartQuiz(quizAssignment._id)}>
                    Xem kết quả
                  </Button>
                ) : null}
              </div>
            </div>
          </CardHeader>
        </Card>
      )
    } else {
      const fileAssignment = assignment as FileAssignment
      return (
        <Card 
          key={fileAssignment._id} 
          className={`${fileAssignment.isExpired && !fileAssignment.isSubmitted ? 'opacity-75 border-red-300 dark:border-red-700' : ''} ${isUrgent && !fileAssignment.isSubmitted ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-2">
                  {fileAssignment.title}
                  {fileAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Đã nộp
                    </span>
                  )}
                  {fileAssignment.isExpired && !fileAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Đã hết hạn
                    </span>
                  )}
                  {isUrgent && !fileAssignment.isSubmitted && (
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Sắp hết hạn
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="mb-3">
                  {fileAssignment.description}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Deadline: {deadlineDate.toLocaleString('vi-VN')}
                  </span>
                  {!fileAssignment.isExpired && !fileAssignment.isSubmitted && (
                    <span className={isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                      {daysRemaining > 0 ? `${daysRemaining} ngày còn lại` : 'Hết hạn hôm nay'}
                    </span>
                  )}
                  <span>Gán bởi: {fileAssignment.assignedBy.name}</span>
                </div>
                {fileAssignment.isSubmitted && fileAssignment.submission && (
                  <div className={`mt-3 p-3 rounded-lg border-2 ${
                    fileAssignment.submission.status === 'reviewed' && fileAssignment.submission.score !== undefined
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-5 w-5 ${
                        fileAssignment.submission.status === 'reviewed' && fileAssignment.submission.score !== undefined
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-green-600 dark:text-green-400'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          fileAssignment.submission.status === 'reviewed' && fileAssignment.submission.score !== undefined
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {fileAssignment.submission.status === 'reviewed' && fileAssignment.submission.score !== undefined
                            ? 'Đã được chấm điểm'
                            : 'Đã nộp bài'}
                        </p>
                        {fileAssignment.submission.score !== undefined && (
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                            Điểm: {fileAssignment.submission.score}/10
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Nộp lúc: {new Date(fileAssignment.submission.submittedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">File đề bài:</span>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDownloadFile(fileAssignment.fileKey || fileAssignment.fileUrl)}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải đề bài: {fileAssignment.fileName}
              </Button>
            </div>
            
            {fileAssignment.canSubmit && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Nộp bài:</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    ref={(el) => { fileInputRefs.current[fileAssignment._id] = el }}
                    type="file"
                    onChange={(e) => handleFileSelect(fileAssignment._id, e.target.files?.[0] || null)}
                    disabled={submittingFile === fileAssignment._id}
                    className="flex-1"
                  />
                  {submittingFile === fileAssignment._id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            )}

            {fileAssignment.isExpired && !fileAssignment.isSubmitted && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Đã hết hạn nộp bài. Bạn vẫn có thể tải đề bài để tham khảo.
              </p>
            )}

            {fileAssignment.submission?.status === 'reviewed' && fileAssignment.submission.feedback && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedbackModal(fileAssignment._id)}
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Xem Feedback
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )
    }
  }

  // Get feedback for modal
  const getFeedbackForAssignment = (assignmentId: string) => {
    const assignment = fileAssignments.find(a => a._id === assignmentId)
    return assignment?.submission?.feedback || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
            Assignments
          </h1>
          <p className="text-muted-foreground">
            Complete your assigned quizzes and file assignments before the deadline
          </p>
        </div>

        {totalPending === 0 && totalSubmitted === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Assignments</h3>
                <p className="text-muted-foreground">
                  You don't have any assignments yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Chưa làm ({totalPending})
              </TabsTrigger>
              <TabsTrigger value="submitted">
                Đã nộp ({totalSubmitted})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {totalPending === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">Tuyệt vời!</h3>
                      <p className="text-muted-foreground">
                        Bạn đã hoàn thành tất cả assignments chưa nộp.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {pendingQuizAssignments.map(a => renderAssignmentCard(a, true))}
                  {pendingFileAssignments.map(a => renderAssignmentCard(a, false))}
                </>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="space-y-4 mt-6">
              {totalSubmitted === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Chưa có bài nộp</h3>
                      <p className="text-muted-foreground">
                        Bạn chưa nộp assignment nào.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {submittedQuizAssignments.map(a => renderAssignmentCard(a, true))}
                  {submittedFileAssignments.map(a => renderAssignmentCard(a, false))}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Quiz Modal */}
        {showQuiz && selectedAssignment && (
          <QuizAssignmentModal
            assignmentId={selectedAssignment._id}
            questions={normalizedQuestions}
            passingScore={selectedAssignment.passingScore}
            showCorrectAnswers={selectedAssignment.isSubmitted || selectedAssignment.isExpired}
            onComplete={() => {
              setShowQuiz(false)
              setSelectedAssignment(null)
              fetchAssignments()

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('quiz-assignment-completed'))
              }
            }}
            onClose={() => {
              setShowQuiz(false)
              setSelectedAssignment(null)
            }}
          />
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Feedback từ giáo viên</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFeedbackModal(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Feedback:</p>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap min-h-[200px]">
                      {getFeedbackForAssignment(showFeedbackModal) || 'Chưa có feedback'}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setShowFeedbackModal(null)}>
                      Đóng
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
