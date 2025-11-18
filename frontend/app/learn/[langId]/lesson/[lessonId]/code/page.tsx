'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/MarkdownContent'
import { CodeEditor } from '@/components/CodeEditor'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2 } from 'lucide-react'
import { useTimeTracker } from '@/hooks/useTimeTracker'
import { useGATracking } from '@/hooks/useGATracking'

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
  const { trackLessonAction, trackButtonClick } = useGATracking()

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
      
      // Track code exercise view
      if (lessonData) {
        trackLessonAction('view', lessonData._id, lessonData.title, {
          exercise_type: 'code'
        })
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
    trackButtonClick('Run Code', window.location.pathname)

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
    trackButtonClick('Submit Code', window.location.pathname)
    
    try {
      // Calculate code score based on actual code quality and requirements
      let codeScore = 0
      
      // Get starter code
      const starterCode = lesson?.codeExercise?.starterCode || ''
      const starterCodeLower = starterCode.toLowerCase()
      const codeLower = code.toLowerCase()
      
      console.log('=== SCORING DEBUG START ===')
      console.log('Starter code length:', starterCode.length)
      console.log('Current code length:', code.length)
      
      // Step 1: Check if code has errors
      const hasError = output && output.toLowerCase().includes('error')
      console.log('Step 1 - Has error?', hasError)
      
      if (hasError) {
        codeScore = 0
        console.log('Final score: 0 (has error)')
      } else {
        // Step 2: Check if code was modified from starter code
        const codeChanged = code.trim() !== starterCode.trim()
        console.log('Step 2 - Code changed?', codeChanged)
        console.log('Starter code (first 100 chars):', starterCode.substring(0, 100))
        console.log('Current code (first 100 chars):', code.substring(0, 100))
        
        if (!codeChanged) {
          codeScore = 0
          console.log('Final score: 0 (code not changed)')
        } else {
          // Step 3: Count elements in starter code
          const starterH1 = (starterCodeLower.match(/<h1[^>]*>/g) || []).length
          const starterH2 = (starterCodeLower.match(/<h2[^>]*>/g) || []).length
          const starterP = (starterCodeLower.match(/<p[^>]*>/g) || []).length
          const starterA = (starterCodeLower.match(/<a[^>]*href\s*=/g) || []).length
          const starterImg = (starterCodeLower.match(/<img[^>]*src\s*=/g) || []).length
          
          console.log('Step 3 - Elements in starter code:', {
            h1: starterH1,
            h2: starterH2,
            p: starterP,
            a: starterA,
            img: starterImg
          })
          
          // Step 4: Count elements in current code
          const currentH1 = (codeLower.match(/<h1[^>]*>/g) || []).length
          const currentH2 = (codeLower.match(/<h2[^>]*>/g) || []).length
          const currentP = (codeLower.match(/<p[^>]*>/g) || []).length
          const currentA = (codeLower.match(/<a[^>]*href\s*=/g) || []).length
          const currentImg = (codeLower.match(/<img[^>]*src\s*=/g) || []).length
          
          console.log('Step 4 - Elements in current code:', {
            h1: currentH1,
            h2: currentH2,
            p: currentP,
            a: currentA,
            img: currentImg
          })
          
          // Step 5: Only count NEW elements that user added
          // A requirement is met if current code has it AND it's new (more than starter)
          let requirementsMet = 0
          const totalRequirements = 5
          
          // Check each requirement: must exist in current code AND be new
          if (currentH1 > starterH1) {
            requirementsMet++
            console.log('✓ H1 requirement met (new)')
          } else if (currentH1 > 0 && starterH1 === 0) {
            requirementsMet++
            console.log('✓ H1 requirement met (added)')
          } else {
            console.log('✗ H1 requirement NOT met')
          }
          
          if (currentH2 > starterH2) {
            requirementsMet++
            console.log('✓ H2 requirement met (new)')
          } else if (currentH2 > 0 && starterH2 === 0) {
            requirementsMet++
            console.log('✓ H2 requirement met (added)')
          } else {
            console.log('✗ H2 requirement NOT met')
          }
          
          if (currentP > starterP) {
            requirementsMet++
            console.log('✓ P requirement met (new)')
          } else if (currentP > 0 && starterP === 0) {
            requirementsMet++
            console.log('✓ P requirement met (added)')
          } else {
            console.log('✗ P requirement NOT met')
          }
          
          if (currentA > starterA) {
            requirementsMet++
            console.log('✓ A requirement met (new)')
          } else if (currentA > 0 && starterA === 0) {
            requirementsMet++
            console.log('✓ A requirement met (added)')
          } else {
            console.log('✗ A requirement NOT met')
          }
          
          if (currentImg > starterImg) {
            requirementsMet++
            console.log('✓ IMG requirement met (new)')
          } else if (currentImg > 0 && starterImg === 0) {
            requirementsMet++
            console.log('✓ IMG requirement met (added)')
          } else {
            console.log('✗ IMG requirement NOT met')
          }
          
          console.log('Step 5 - Requirements met:', requirementsMet, '/', totalRequirements)
          
          // Step 6: Check if code has meaningful changes
          const codeWithoutStarter = code.replace(starterCode, '').trim()
          const hasMeaningfulChanges = codeWithoutStarter.length > 10
          console.log('Step 6 - Has meaningful changes?', hasMeaningfulChanges, '(new content length:', codeWithoutStarter.length, ')')
          
          if (!hasMeaningfulChanges) {
            codeScore = 0
            console.log('Final score: 0 (no meaningful changes)')
          } else if (requirementsMet === 0) {
            codeScore = 1
            console.log('Final score: 1 (no requirements met)')
          } else {
            // Step 7: Calculate score based on requirements met
            const baseScore = (requirementsMet / totalRequirements) * 10
            codeScore = Math.round(baseScore * 10) / 10
            
            // Apply maximum limits based on requirements met
            if (requirementsMet === 1) {
              codeScore = Math.min(codeScore, 2)
            } else if (requirementsMet === 2) {
              codeScore = Math.min(codeScore, 4)
            } else if (requirementsMet === 3) {
              codeScore = Math.min(codeScore, 6)
            } else if (requirementsMet === 4) {
              codeScore = Math.min(codeScore, 8)
            }
            
            console.log('Step 7 - Base score:', baseScore, 'Final score:', codeScore)
          }
        }
      }
      
      console.log('=== FINAL SCORE:', codeScore, '/ 10 ===')
      console.log('=== SCORING DEBUG END ===')
      
      await api.post(`/progress/code/${params.lessonId}`, { 
        codeScore,
        code
      })
      
      // Track code submission
      trackLessonAction('code_submit', Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId, lesson?.title, {
        code_score: codeScore,
        has_output: !!output,
        output_length: output?.length || 0
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

              <CodeEditor
                value={code}
                onChange={setCode}
                language={lesson.codeExercise.language}
                height="500px"
                placeholder="Write your code here..."
              />

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

