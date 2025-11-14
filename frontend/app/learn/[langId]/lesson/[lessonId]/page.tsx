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
import { ArrowLeft, BookOpen, Code, Clock, CheckCircle2, PlayCircle, Loader2, Copy, Check, FileCode } from 'lucide-react'

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
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoadingLesson(false)
    }
  }

  const handleQuizComplete = async (quizScore: number, codeScore?: number) => {
    try {
      await api.post(`/progress/quiz/${params.lessonId}`, { 
        quizScore,
        codeScore: codeScore !== undefined ? codeScore : undefined
      })
      stopTracking()
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
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
                <div className="flex items-center gap-2 mb-4">
                  <Code className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">Code Example</h3>
                </div>
                <div className="relative group">
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lesson.codeExample || '')
                      }}
                      className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <MarkdownContent 
                    content={`\`\`\`html\n${lesson.codeExample}\n\`\`\``} 
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz & Code Exercise Section */}
        <Card className="shadow-lg border-2 border-primary/30 bg-gradient-to-br from-[hsl(185_80%_95%)] via-[hsl(210_60%_95%)] to-[hsl(250_60%_95%)] dark:from-[hsl(185_80%_15%)] dark:via-[hsl(210_60%_15%)] dark:to-[hsl(250_60%_15%)]">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Ready to test your knowledge?</h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to practice
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quiz Button */}
              <Button 
                onClick={() => setShowQuiz(true)} 
                size="lg"
                variant="default"
                className="w-full h-24 flex flex-col items-center justify-center gap-2"
              >
                <BookOpen className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Take Quiz</div>
                  <div className="text-xs opacity-90">
                    {lesson.quiz.questions.length} questions
                  </div>
                </div>
              </Button>

              {/* Code Exercise Button */}
              <Button 
                onClick={() => router.push(`/learn/${params.langId}/lesson/${params.lessonId}/code`)} 
                size="lg"
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 border-2"
              >
                <Code className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Code Exercise</div>
                  <div className="text-xs opacity-90">
                    Practice coding
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Modal */}
        {showQuiz && lesson.quiz.questions.length > 0 && (
          <QuizModal
            questions={lesson.quiz.questions}
            passingScore={lesson.quiz.passingScore}
            onComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    </div>
  )
}

