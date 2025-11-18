'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy, AlertCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useQuizTracker } from '@/hooks/useQuizTracker'
import { useGATracking } from '@/hooks/useGATracking'

interface Question {
  question: string
  options: string[]
  correctAnswer?: number
  explanation?: string
}

interface QuizAssignmentModalProps {
  assignmentId: string
  questions: Question[]
  passingScore: number
  showCorrectAnswers: boolean
  onClose: () => void
  onComplete: () => void
}

export function QuizAssignmentModal({ 
  assignmentId, 
  questions, 
  passingScore, 
  showCorrectAnswers,
  onClose, 
  onComplete 
}: QuizAssignmentModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(showCorrectAnswers)
  const [score, setScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedResult, setSubmittedResult] = useState<any>(null)
  const [isAbandoning, setIsAbandoning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const isHandlingAbandonRef = useRef<boolean>(false)
  const pendingAbandonRef = useRef<boolean>(false)
  const questionTimesRef = useRef<Array<{ questionIndex: number; startTime: number; endTime?: number }>>([])

  // Initialize quiz tracking
  const { startTracking, endTracking, isTracking, sessionId } = useQuizTracker({
    assignmentId: assignmentId,
    quizType: 'assignment',
    onSessionStart: (sessionId) => {
      startTimeRef.current = Date.now()
      questionTimesRef.current = []
      questionTimesRef.current.push({
        questionIndex: 0,
        startTime: Date.now()
      })
    }
  })

  const { trackQuizAction, trackButtonClick } = useGATracking()

  // Start tracking when modal opens (only for new quiz, not review)
  useEffect(() => {
    if (!showCorrectAnswers && assignmentId) {
      startTracking()
    }

    return () => {
      if (isTracking) {
        endTracking()
      }
    }
  }, [assignmentId, showCorrectAnswers])

  // Track when quiz starts and request fullscreen
  useEffect(() => {
    if (!showCorrectAnswers && assignmentId) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
      }
      
      // Request fullscreen to "lock" user in quiz
      // This makes it harder to switch tabs and we can detect it better
      const requestFullscreen = async () => {
        try {
          const element = document.documentElement
          if (element.requestFullscreen) {
            await element.requestFullscreen()
          } else if ((element as any).webkitRequestFullscreen) {
            // Safari
            await (element as any).webkitRequestFullscreen()
          } else if ((element as any).mozRequestFullScreen) {
            // Firefox
            await (element as any).mozRequestFullScreen()
          } else if ((element as any).msRequestFullscreen) {
            // IE/Edge
            await (element as any).msRequestFullscreen()
          }
        } catch (error: any) {
          // User denied fullscreen or browser doesn't support
          console.warn('Fullscreen request denied or not supported:', error.message)
          // Show warning that quiz requires fullscreen for security
          alert('⚠️ Warning: This quiz requires fullscreen mode to ensure integrity.\n\nPlease enable fullscreen when taking the quiz. If you leave the page, switch tabs, or exit fullscreen, the quiz will automatically end and you cannot retake it.')
        }
      }
      
      // Request fullscreen when quiz starts
      requestFullscreen()
    }
    
    // Cleanup: exit fullscreen when component unmounts or quiz ends
    return () => {
      const exitFullscreen = async () => {
        try {
          if (document.fullscreenElement) {
            await document.exitFullscreen()
          } else if ((document as any).webkitFullscreenElement) {
            await (document as any).webkitExitFullscreen()
          } else if ((document as any).mozFullScreenElement) {
            await (document as any).mozCancelFullScreen()
          } else if ((document as any).msFullscreenElement) {
            await (document as any).msExitFullscreen()
          }
        } catch (error) {
          console.error('Error exiting fullscreen:', error)
        }
      }
      
      if (showCorrectAnswers || showResults) {
        exitFullscreen()
      }
    }
  }, [assignmentId, showCorrectAnswers, showResults])

  // If showing correct answers (already submitted), load the result and show results immediately
  useEffect(() => {
    if (showCorrectAnswers) {
      fetchResult().then(() => {
        setShowResults(true)
      })
    }
  }, [showCorrectAnswers, assignmentId])

  const fetchResult = async () => {
    try {
      const response = await api.get(`/progress/quiz-assignments/${assignmentId}`)
      if (response.data.assignment?.latestResult) {
        const result = response.data.assignment.latestResult
        setScore(result.score)
        setSubmittedResult(result)
        // Set selected answers from result
        const answers = result.answers.sort((a: any, b: any) => a.questionIndex - b.questionIndex)
          .map((a: any) => a.selectedAnswer)
        setSelectedAnswers(answers)
      } else if (response.data.assignment?.previousResults?.length > 0) {
        // Fallback to previous results
        const result = response.data.assignment.previousResults[0]
        setScore(result.score)
        setSubmittedResult(result)
        const answers = result.answers.sort((a: any, b: any) => a.questionIndex - b.questionIndex)
          .map((a: any) => a.selectedAnswer)
        setSelectedAnswers(answers)
      }
    } catch (error) {
      console.error('Error fetching result:', error)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showCorrectAnswers) return // Don't allow changing answers if already submitted
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
    
    // Track answer selection
    trackQuizAction('answer_select', assignmentId, undefined, {
      question_index: currentQuestion,
      selected_answer: answerIndex
    })
  }

  const handleNext = () => {
    // Track time spent on current question
    const currentQuestionTime = questionTimesRef.current.find(
      qt => qt.questionIndex === currentQuestion && !qt.endTime
    )
    if (currentQuestionTime) {
      currentQuestionTime.endTime = Date.now()
    }

    if (showCorrectAnswers) {
      // If showing results, go to results view
      calculateScore()
    } else if (currentQuestion < questions.length - 1) {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      
      // Track question view
      trackQuizAction('question_view', assignmentId, undefined, {
        question_index: nextQuestion
      })
      
      // Track new question start
      questionTimesRef.current.push({
        questionIndex: nextQuestion,
        startTime: Date.now()
      })
    } else {
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Track time spent on current question
      const currentQuestionTime = questionTimesRef.current.find(
        qt => qt.questionIndex === currentQuestion && !qt.endTime
      )
      if (currentQuestionTime) {
        currentQuestionTime.endTime = Date.now()
      }

      const prevQuestion = currentQuestion - 1
      setCurrentQuestion(prevQuestion)
      
      // Track previous question start (if not already tracked)
      const prevQuestionTime = questionTimesRef.current.find(
        qt => qt.questionIndex === prevQuestion
      )
      if (!prevQuestionTime) {
        questionTimesRef.current.push({
          questionIndex: prevQuestion,
          startTime: Date.now()
        })
      }
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      const userAnswer = selectedAnswers[index]
      const correctAnswer = q.correctAnswer
      
      // Only count as correct if both are defined and match exactly
      if (
        userAnswer !== undefined && 
        userAnswer !== null &&
        correctAnswer !== undefined && 
        correctAnswer !== null &&
        Number(userAnswer) === Number(correctAnswer)
      ) {
        correct++
      }
    })
    const finalScore = questions.length > 0 
      ? (correct / questions.length) * 10 
      : 0
    setScore(finalScore)
    setShowResults(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Track time spent on last question
    const currentQuestionTime = questionTimesRef.current.find(
      qt => qt.questionIndex === currentQuestion && !qt.endTime
    )
    if (currentQuestionTime) {
      currentQuestionTime.endTime = Date.now()
    }
    
    // End tracking session
    if (isTracking) {
      await endTracking(new Date())
    }
    
    try {
      const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0

      // Ensure we send a properly formatted answers array
      // Fill undefined values with null to ensure array length matches questions length
      const formattedAnswers = questions.map((_, index) => {
        const answer = selectedAnswers[index]
        return answer !== undefined ? answer : null
      })

      const response = await api.post(`/progress/quiz-assignments/${assignmentId}/submit`, {
        answers: formattedAnswers,
        timeTaken
      })
      
      const result = response.data.result
      setSubmittedResult(result)
      setScore(result.score)
      
      // Track quiz submission in GA
      trackQuizAction('submit', assignmentId, undefined, {
        quiz_type: 'assignment',
        quiz_score: result.score,
        passed: result.passed,
        time_taken: timeTaken,
        questions_count: questions.length,
        correct_answers: Math.round((result.score / 10) * questions.length)
      })
      
      onComplete()
    } catch (error: any) {
      console.error('Error submitting quiz:', error)
      alert(error.response?.data?.message || 'Error submitting quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle abandoning quiz - STRICT MODE: abandon immediately
  const handleAbandonQuiz = async (reason: string = 'user_choice') => {
    if (isHandlingAbandonRef.current) return // Prevent multiple calls
    isHandlingAbandonRef.current = true
    setIsAbandoning(true)
    
    // Track quiz abandonment
    trackQuizAction('abandon', assignmentId, undefined, {
      abandon_reason: reason,
      questions_answered: selectedAnswers.filter(a => a !== undefined).length,
      time_spent: startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current) / 1000) : 0
    })
    
    // End tracking session
    if (isTracking) {
      await endTracking()
    }
    
    try {
      // Try to send via sendBeacon first (more reliable when page is closing)
      try {
        const data = JSON.stringify({ reason })
        // Get API URL - use environment variable or default backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
            ? 'https://codecatalyst-azure.vercel.app/api'
            : 'http://localhost:5000/api')
        navigator.sendBeacon(`${apiUrl}/progress/quiz-assignments/${assignmentId}/abandon`, data)
      } catch (beaconError) {
        console.log('sendBeacon failed, using regular API call')
      }
      
      // Regular API call
      await api.post(`/progress/quiz-assignments/${assignmentId}/abandon`, {
        reason
      })
      
      // Close modal immediately
      onClose()
      
      // Show appropriate message based on reason
      let message = ''
      if (reason === 'tab_switch') {
        message = 'You switched tabs while taking the quiz. The quiz has been ended.\n\nPlease contact admin to get permission to retake.'
      } else if (reason === 'browser_leave') {
        message = 'You left the browser while taking the quiz. The quiz has been ended.\n\nPlease contact admin to get permission to retake.'
      } else if (reason === 'tab_close') {
        message = 'You closed the page while taking the quiz. The quiz has been ended.\n\nPlease contact admin to get permission to retake.'
      }
      
      if (message) {
        // Use setTimeout to ensure alert shows after modal closes
        setTimeout(() => {
          alert(message)
          onComplete() // Refresh assignments list after alert
        }, 300)
      } else {
        onComplete() // Refresh assignments list
      }
    } catch (error: any) {
      console.error('Error abandoning quiz:', error)
      // Even if API fails, close modal and show message
      onClose()
      setTimeout(() => {
        alert('Quiz has been ended because you left the page. Please contact admin to get permission to retake.')
        onComplete()
      }, 300)
    } finally {
      setIsAbandoning(false)
      // Keep isHandlingAbandonRef true to prevent any retries
    }
  }

  // Warn user when trying to leave/tab away
  useEffect(() => {
    if (showCorrectAnswers || showResults) return // Don't warn if already submitted or viewing results

    let visibilityTimeout: NodeJS.Timeout | null = null
    let blurTimeout: NodeJS.Timeout | null = null
    let checkInterval: NodeJS.Timeout | null = null

    const handleVisibilityChange = () => {
      if (showResults || showCorrectAnswers || isHandlingAbandonRef.current) return
      
      if (document.hidden) {
        // STRICT MODE: User switched to another tab or exited fullscreen
        // IMMEDIATELY abandon - no second chances
        if (!pendingAbandonRef.current && !isHandlingAbandonRef.current) {
          pendingAbandonRef.current = true
          isHandlingAbandonRef.current = true
          
          // STRICT MODE: Abandon immediately without asking
          handleAbandonQuiz('tab_switch').catch(() => {
            // If error, still mark as handling to prevent retry
          })
        }
      } else {
        // User came back to tab - check if fullscreen is still active
        // If not, they exited fullscreen which also triggers abandon
        const isFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        )
        
        if (!isFullscreen && !showCorrectAnswers && !showResults && !isHandlingAbandonRef.current) {
          // User exited fullscreen - also abandon
          if (!pendingAbandonRef.current) {
            pendingAbandonRef.current = true
            isHandlingAbandonRef.current = true
            handleAbandonQuiz('browser_leave').catch(() => {
              // If error, still mark as handling
            })
          }
        }
        
        // Clear any timeouts if somehow we're still here
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout)
          visibilityTimeout = null
        }
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = null
        }
      }
    }
    
    // Also listen for fullscreen change events
    const handleFullscreenChange = () => {
      if (showResults || showCorrectAnswers || isHandlingAbandonRef.current) return
      
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      
      if (!isFullscreen && !showCorrectAnswers && !showResults && !isHandlingAbandonRef.current) {
        // User exited fullscreen - abandon immediately
        if (!pendingAbandonRef.current) {
          pendingAbandonRef.current = true
          isHandlingAbandonRef.current = true
          handleAbandonQuiz('browser_leave').catch(() => {
            // If error, still mark as handling
          })
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showResults || showCorrectAnswers || isHandlingAbandonRef.current) return
      
      // STRICT MODE: Prevent default and show warning
      e.preventDefault()
      e.returnValue = 'You are taking a quiz! If you close this page, the quiz will be ended and you cannot retake it.'
      
      // Abandon immediately when user tries to close
      if (!pendingAbandonRef.current && !isHandlingAbandonRef.current) {
        // Use sendBeacon for more reliable request even if page is closing
        pendingAbandonRef.current = true
        isHandlingAbandonRef.current = true
        
        // Try to send abandon request via sendBeacon (works even when page is closing)
        try {
          const data = JSON.stringify({ reason: 'tab_close' })
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
          navigator.sendBeacon(`${apiUrl}/api/progress/quiz-assignments/${assignmentId}/abandon`, data)
        } catch (err) {
          console.error('Error sending beacon:', err)
        }
        
        // Also try regular API call (may not complete if page closes)
        handleAbandonQuiz('tab_close').catch(() => {
          // Ignore errors during unload - beacon should have handled it
        })
      }
    }

    const handleBlur = () => {
      if (showResults || showCorrectAnswers || isHandlingAbandonRef.current) return
      
      // STRICT MODE: Small delay to differentiate between tab switch and window switch
      blurTimeout = setTimeout(() => {
        // If window lost focus AND document is hidden, user switched to another app/browser
        if (document.hidden && !pendingAbandonRef.current && !isHandlingAbandonRef.current) {
          // User opened another app/browser - auto-abandon immediately
          pendingAbandonRef.current = true
          isHandlingAbandonRef.current = true
          handleAbandonQuiz('browser_leave').catch(() => {
            // If error, still mark as handling
          })
        } else if (!document.hidden) {
          // Just window blur but still on tab - might be minimizing
          // Check again after a longer delay
          setTimeout(() => {
            if (document.hidden && !pendingAbandonRef.current && !isHandlingAbandonRef.current) {
              // Window minimized or switched to another app
              pendingAbandonRef.current = true
              isHandlingAbandonRef.current = true
              handleAbandonQuiz('browser_leave').catch(() => {
                // If error, still mark as handling
              })
            }
          }, 1500) // Reduced delay to catch faster
        }
      }, 150) // Reduced delay to catch faster
    }

    const handleFocus = () => {
      // Clear any pending timeouts when window regains focus
      if (blurTimeout) {
        clearTimeout(blurTimeout)
        blurTimeout = null
      }
      // In strict mode, quiz is already abandoned if they switched away
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      if (visibilityTimeout) clearTimeout(visibilityTimeout)
      if (blurTimeout) clearTimeout(blurTimeout)
      if (checkInterval) clearInterval(checkInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [showResults, showCorrectAnswers, assignmentId])

  if (showResults || showCorrectAnswers) {
    const passed = score >= passingScore
    const correctCount = Math.round((score / 10) * questions.length)
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
        <Card className="w-full max-w-3xl max-h-[90vh] shadow-2xl border-2 animate-in zoom-in-95 duration-200 flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className={`h-6 w-6 ${passed ? 'text-yellow-500' : 'text-gray-400'}`} />
                Quiz Results
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 overflow-y-auto flex-1 min-h-0">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
                passed 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <div className={`text-5xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {score.toFixed(1)}
                </div>
              </div>
              <div className="text-2xl font-bold mb-2 text-foreground">
                {score.toFixed(1)}/10
              </div>
              <div className={`flex items-center justify-center gap-2 mb-2 ${
                passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {passed ? (
                  <>
                    <CheckCircle2 className="h-6 w-6" />
                    <p className="text-xl font-semibold">Congratulations! You passed!</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-xl font-semibold">You need at least {passingScore}/10 to pass</p>
                  </>
                )}
              </div>
              <p className="text-muted-foreground">
                You got {correctCount} out of {questions.length} questions correct
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{correctCount}/{questions.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(correctCount / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {questions.map((q, index) => {
                const userAnswer = selectedAnswers[index]
                const isCorrect = userAnswer === q.correctAnswer
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20' 
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="font-semibold text-base flex-1">{q.question}</p>
                    </div>
                    <div className="space-y-2 ml-8">
                      {q.options.map((option, optIndex) => {
                        let className = 'p-3 rounded-lg border-2 transition-all'
                        if (optIndex === q.correctAnswer) {
                          className += ' border-green-500 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 font-medium'
                        } else if (optIndex === userAnswer && !isCorrect) {
                          className += ' border-red-500 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                        } else {
                          className += ' border-border bg-background'
                        }
                        return (
                          <div key={optIndex} className={className}>
                            <div className="flex items-center gap-2">
                              {optIndex === q.correctAnswer && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              )}
                              {optIndex === userAnswer && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>{option}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <div className="mt-3 ml-8 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex-shrink-0 pt-4 border-t">
              <Button onClick={onClose} className="w-full" size="lg">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestion]
  if (!question) return null

  const hasAnswer = selectedAnswers[currentQuestion] !== undefined
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
        <Card className="w-full max-w-3xl shadow-2xl border-2 animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Quiz</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <CardDescription className="text-base">
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 leading-tight">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === index
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showCorrectAnswers}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      showCorrectAnswers 
                        ? 'cursor-default opacity-60'
                        : isSelected
                        ? 'border-primary bg-primary/10 shadow-md scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && (
                          <div className="w-3 h-3 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="text-base">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNext}
              disabled={!hasAnswer || isSubmitting || showCorrectAnswers}
              className="flex items-center gap-2"
              size="lg"
            >
              {showCorrectAnswers ? (
                <>
                  View Results
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                <>
                  Submit Quiz
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      </div>
    </>
  )
}

