'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuizModal } from '@/components/QuizModal'
import { MarkdownContent } from '@/components/MarkdownContent'
import { useTimeTracker } from '@/hooks/useTimeTracker'
import { useGATracking } from '@/hooks/useGATracking'
import { ArrowLeft, BookOpen, Code, Clock, CheckCircle2, PlayCircle, Loader2, Copy, Check, FileCode, ArrowRight } from 'lucide-react'

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Lesson {
  _id: string
  title: string
  content: string
  codeExample?: string
  quiz: {
    questions: Question[]
    passingScore: number
  }
  levelId: {
    _id: string
    title: string
    levelNumber: number
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const { startTracking, stopTracking } = useTimeTracker()
  const { trackLessonAction, trackQuizAction, trackButtonClick } = useGATracking()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && params.lessonId) {
      fetchLesson()
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isAuthenticated, params.lessonId])

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${params.lessonId}?lang=en`)
      const lessonData = response.data.lesson
      setLesson(lessonData)
      
      // Track lesson view
      if (lessonData) {
        trackLessonAction('view', lessonData._id, lessonData.title)
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoadingLesson(false)
    }
  }

  const handleQuizComplete = async (quizScore: number, codeScore?: number, sessionId?: string) => {
    try {
      await api.post(`/progress/quiz/${params.lessonId}`, { 
        quizScore,
        codeScore: codeScore !== undefined ? codeScore : undefined,
        sessionId: sessionId || undefined
      })
      
      // Track quiz completion
      trackQuizAction('submit', Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId, lesson?.title, {
        quiz_score: quizScore,
        code_score: codeScore,
        passed: quizScore >= (lesson?.quiz?.passingScore || 7)
      })
      
      // Track lesson completion if passed
      if (quizScore >= (lesson?.quiz?.passingScore || 7)) {
        trackLessonAction('complete', Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId, lesson?.title, {
          quiz_score: quizScore,
          code_score: codeScore
        })
      }
      
      stopTracking()
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const handleShowQuiz = () => {
    setShowQuiz(true)
    trackQuizAction('start', Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId, lesson?.title)
    trackButtonClick('Start Quiz', window.location.pathname)
  }

  if (loading || loadingLesson) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen flex items-center justify-center">
        <div>
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Lesson not found</h2>
          <p className="text-muted-foreground mb-4">The lesson you're looking for doesn't exist.</p>
          <Link href={`/learn/${params.langId}`}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/learn" className="hover:text-foreground transition-colors">Learn</Link>
          <span>/</span>
          <Link href={`/learn/${params.langId}`} className="hover:text-foreground transition-colors">
            Language
          </Link>
          <span>/</span>
          <Link 
            href={`/learn/${params.langId}/level/${lesson.levelId._id}`} 
            className="hover:text-foreground transition-colors"
          >
            Level {lesson.levelId.levelNumber}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Lesson</span>
        </nav>

        {/* Back Button */}
        <Link href={`/learn/${params.langId}/level/${lesson.levelId._id}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Lesson Header */}
        <Card className="mb-6 shadow-lg border-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Level {lesson.levelId.levelNumber}
                  </span>
                </div>
                <CardTitle className="text-3xl md:text-4xl mb-2 leading-tight">
                  {lesson.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {lesson.levelId.title}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lesson Content */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="max-w-none">
              <MarkdownContent content={lesson.content} />
            </div>

            {/* Code Example */}
            {lesson.codeExample && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Code Example</h3>
                </div>
                    <Button
                    variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lesson.codeExample || '')
                      }}
                    className="gap-2"
                    >
                    <Copy className="h-4 w-4" />
                    Copy Code
                    </Button>
                  </div>
                <Card className="bg-muted/50 border-2">
                  <CardContent className="p-0">
                    <div className="relative">
                  <MarkdownContent 
                    content={`\`\`\`html\n${lesson.codeExample}\n\`\`\``} 
                  />
                </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz & Code Exercise Section */}
        <Card className="shadow-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 dark:from-primary/10 dark:via-secondary/10 dark:to-primary/10">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Ready to test your knowledge?
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to practice and reinforce what you've learned
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quiz Card */}
              <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                onClick={handleShowQuiz} 
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Take Quiz</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Test your understanding with multiple-choice questions
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.quiz.questions.length} questions</span>
                        <span>•</span>
                        <span>Passing: {lesson.quiz.passingScore}/{lesson.quiz.questions.length}</span>
                      </div>
                    </div>
                    <Button className="w-full group/btn">
                      Start Quiz
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Code Exercise Card */}
              <Card className="border-2 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg cursor-pointer group"
                onClick={() => router.push(`/learn/${params.langId}/lesson/${params.lessonId}/code`)} 
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <Code className="h-8 w-8 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">Code Exercise</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Practice coding with hands-on exercises and real-time feedback
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <FileCode className="h-3 w-3" />
                        <span>Interactive IDE</span>
                        <span>•</span>
                        <span>Live Preview</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full group/btn border-2">
                      Start Coding
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Modal */}
        {showQuiz && lesson.quiz.questions.length > 0 && (
          <QuizModal
            questions={lesson.quiz.questions}
            passingScore={lesson.quiz.passingScore}
            lessonId={lesson._id}
            onComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    </div>
  )
}
