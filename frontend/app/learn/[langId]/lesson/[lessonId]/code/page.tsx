'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/MarkdownContent'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useTimeTracker } from '@/hooks/useTimeTracker'

interface Lesson {
  _id: string
  title: string
  codeExercise?: {
    starterCode: string
    language: 'html' | 'javascript' | 'css' | 'python'
    description?: string
  }
}

export default function CodeExercisePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(true)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { stopTracking } = useTimeTracker()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && params.lessonId) {
      fetchLesson()
    }
  }, [isAuthenticated, params.lessonId])

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${params.lessonId}`)
      const lessonData = response.data.lesson
      console.log('Lesson data:', lessonData)
      console.log('CodeExercise:', lessonData.codeExercise)
      setLesson(lessonData)
      if (lessonData.codeExercise?.starterCode) {
        setCode(lessonData.codeExercise.starterCode)
      } else {
        console.warn('No codeExercise found in lesson data')
      }
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoadingLesson(false)
    }
  }

  const handleRun = () => {
    setIsRunning(true)
    setOutput('')

    try {
      if (lesson?.codeExercise?.language === 'javascript') {
        try {
          const result = eval(code)
          if (result !== undefined) {
            setOutput(String(result))
          } else {
            setOutput('Code executed successfully!')
          }
        } catch (error: any) {
          setOutput(`Error: ${error.message}`)
        }
      } else {
        // For HTML and CSS, update iframe by changing key
        setOutput('Code executed successfully!')
        setIframeKey(prev => prev + 1)
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    if (lesson?.codeExercise?.starterCode) {
      setCode(lesson.codeExercise.starterCode)
    }
    setOutput('')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Calculate code score based on output correctness
      // For now, give full score if code runs without errors
      // In the future, you can add more sophisticated scoring based on test cases
      let codeScore = 10
      
      // If there's an error in output, reduce score
      if (output && output.toLowerCase().includes('error')) {
        codeScore = 5 // Partial score for attempting
      } else if (!output || output.trim() === '') {
        codeScore = 7 // Score for running but no output
      }
      
      await api.post(`/progress/code/${params.lessonId}`, { 
        codeScore,
        code
      })
      stopTracking()
      
      // Show success message and redirect
      alert(`Code submitted successfully! Score: ${codeScore}/10`)
      router.push(`/learn/${params.langId}/lesson/${params.lessonId}`)
    } catch (error: any) {
      console.error('Error submitting code:', error)
      alert('Failed to submit code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingLesson) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!lesson || !lesson.codeExercise) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen flex items-center justify-center">
        <div>
          <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Code Exercise Not Available</h2>
          <p className="text-muted-foreground mb-4">This lesson does not have a code exercise.</p>
          <Link href={`/learn/${params.langId}/lesson/${params.lessonId}`}>
            <Button>Back to Lesson</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href={`/learn/${params.langId}/lesson/${params.lessonId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lesson
          </Button>
        </Link>

        {/* Code Exercise Header */}
        <Card className="mb-6 shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Code Exercise</CardTitle>
            </div>
            {lesson.codeExercise.description && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {lesson.codeExercise.description}
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Code Editor */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Language:</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {lesson.codeExercise.language.toUpperCase()}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Code
                </Button>
              </div>

              <div className="relative">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm bg-[hsl(220_40%_96%)] dark:bg-[hsl(220_30%_10%)] border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isRunning}
                  className="flex-1"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Code
                    </>
                  )}
                </Button>
              </div>

              {/* Output */}
              {output && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Output:</h3>
                  <div className="p-4 bg-muted rounded-lg border">
                    <pre className="whitespace-pre-wrap text-sm">{output}</pre>
                  </div>
                </div>
              )}
              {(lesson.codeExercise.language === 'html' || lesson.codeExercise.language === 'css') && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Preview:</h3>
                  <div className="border rounded-lg overflow-hidden bg-white dark:bg-[hsl(220_30%_8%)]">
                    <iframe
                      key={`${iframeKey}-${code.length}`}
                      onLoad={(e) => {
                        const iframe = e.currentTarget
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                        if (iframeDoc && lesson.codeExercise) {
                          iframeDoc.open()
                          if (lesson.codeExercise.language === 'html') {
                            iframeDoc.write(code)
                          } else {
                            iframeDoc.write(`
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <style>${code}</style>
                              </head>
                              <body>
                                <div class="demo-container">
                                  <h1>CSS Demo</h1>
                                  <p>This is a paragraph styled with your CSS.</p>
                                  <div class="box">Box Element</div>
                                  <button>Button Element</button>
                                </div>
                              </body>
                              </html>
                            `)
                          }
                          iframeDoc.close()
                        }
                      }}
                      className="w-full h-96 border-0"
                      sandbox="allow-scripts allow-same-origin"
                      title="Code Output"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

