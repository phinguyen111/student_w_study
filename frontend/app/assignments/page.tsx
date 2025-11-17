'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGATracking } from '@/hooks/useGATracking'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuizAssignmentModal } from '@/components/QuizAssignmentModal'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  FileText,
  AlertCircle,
  Trophy
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

export default function AssignmentsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [assignments, setAssignments] = useState<QuizAssignment[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<QuizAssignment | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
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
      const response = await api.get('/progress/quiz-assignments')
      setAssignments(response.data.assignments || [])
      
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
      const response = await api.get(`/progress/quiz-assignments/${assignmentId}`)
      const assignment = response.data.assignment
      setSelectedAssignment(assignment)
      setShowQuiz(true)
      
      // Track quiz start
      trackQuizAction('start', assignmentId, assignment.title, {
        quiz_type: 'assignment',
        passing_score: assignment.passingScore,
        questions_count: assignment.questions.length
      })
      trackButtonClick('Start Quiz', '/assignments')
    } catch (error: any) {
      console.error('Error fetching assignment:', error)
      alert(error.response?.data?.message || 'Error loading quiz')
    }
  }

  const handleQuizComplete = async (quizScore: number, codeScore?: number) => {
    if (!selectedAssignment) return
    
    // Track quiz completion
    trackQuizAction('submit', selectedAssignment._id, selectedAssignment.title, {
      quiz_type: 'assignment',
      quiz_score: quizScore,
      passed: quizScore >= selectedAssignment.passingScore
    })
    
    // QuizModal will handle the submission, we just refresh
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

  // Normalize questions for QuizModal
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
            Quiz Assignments
          </h1>
          <p className="text-muted-foreground">
            Complete your assigned quizzes before the deadline
          </p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Assignments</h3>
                <p className="text-muted-foreground">
                  You don't have any quiz assignments yet.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const deadlineDate = new Date(assignment.deadline)
              const timeRemaining = deadlineDate.getTime() - Date.now()
              const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
              const isUrgent = daysRemaining <= 1 && !assignment.isSubmitted

              return (
                <Card 
                  key={assignment._id} 
                  className={`${assignment.isExpired && !assignment.isSubmitted ? 'opacity-75 border-red-300 dark:border-red-700' : ''} ${isUrgent && !assignment.isSubmitted ? 'border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20' : ''}`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {assignment.title}
                          {assignment.isSubmitted && (
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Submitted
                            </span>
                          )}
                          {assignment.isExpired && !assignment.isSubmitted && (
                            <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              Expired
                            </span>
                          )}
                          {isUrgent && !assignment.isSubmitted && (
                            <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              Due Soon
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="mb-3">
                          {assignment.description}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Deadline: {deadlineDate.toLocaleString()}
                          </span>
                          {!assignment.isExpired && !assignment.isSubmitted && (
                            <span className={isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                              {daysRemaining > 0 ? `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining` : 'Due today'}
                            </span>
                          )}
                          <span>Passing: {assignment.passingScore}/10</span>
                          <span>{assignment.questions.length} questions</span>
                          <span>Assigned by: {assignment.assignedBy.name}</span>
                        </div>
                        {assignment.isSubmitted && assignment.userResult && (
                          <div className={`mt-3 p-3 rounded-lg border-2 ${
                            assignment.userResult.passed
                              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                          }`}>
                            <div className="flex items-center gap-2">
                              {assignment.userResult.passed ? (
                                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              )}
                              <div>
                                <p className="font-semibold">
                                  Your Score: {assignment.userResult.score.toFixed(1)}/10
                                </p>
                                <p className={`text-sm ${assignment.userResult.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {assignment.userResult.passed ? 'Passed!' : 'Failed (Need ' + assignment.passingScore + '/10 to pass)'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Submitted: {new Date(assignment.userResult.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {assignment.canSubmit ? (
                          <Button onClick={() => handleStartQuiz(assignment._id)}>
                            Start Quiz
                          </Button>
                        ) : assignment.isExpired ? (
                          <Button variant="outline" onClick={() => handleStartQuiz(assignment._id)}>
                            View Quiz
                          </Button>
                        ) : assignment.isSubmitted ? (
                          <Button variant="outline" onClick={() => handleStartQuiz(assignment._id)}>
                            Review Results
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
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
            }}
            onClose={() => {
              setShowQuiz(false)
              setSelectedAssignment(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

