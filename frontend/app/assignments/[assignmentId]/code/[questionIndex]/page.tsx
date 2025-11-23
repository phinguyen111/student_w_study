'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeEditor } from '@/components/CodeEditor'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2, FileText, Palette, Zap, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuizTracker } from '@/hooks/useQuizTracker'
import { useGATracking } from '@/hooks/useGATracking'

interface CodeQuestion {
  type: 'code'
  question: string
  codeType: 'html' | 'css' | 'javascript' | 'html-css-js'
  starterCode: {
    html?: string
    css?: string
    javascript?: string
  } | string
  expectedOutput: string
  explanation?: string
}

export default function CodeQuizAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const assignmentId = Array.isArray(params.assignmentId) ? params.assignmentId[0] : params.assignmentId
  const questionIndex = parseInt(Array.isArray(params.questionIndex) ? params.questionIndex[0] : params.questionIndex || '0')
  
  const [assignment, setAssignment] = useState<any>(null)
  const [question, setQuestion] = useState<CodeQuestion | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [code, setCode] = useState('')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single')
  const [previewContent, setPreviewContent] = useState('')
  const [htmlErrors, setHtmlErrors] = useState<any[]>([])
  const [cssErrors, setCssErrors] = useState<any[]>([])
  const [jsErrors, setJsErrors] = useState<any[]>([])
  const [codeErrors, setCodeErrors] = useState<any[]>([])
  const [exerciseInstructions, setExerciseInstructions] = useState<string>('')

  const { startTracking, endTracking, isTracking } = useQuizTracker({
    assignmentId: assignmentId || '',
    quizType: 'assignment',
  })

  const { trackQuizAction, trackButtonClick } = useGATracking()

  const combineCode = () => {
    const html = htmlCode.trim() || '<p>No HTML content yet</p>'
    const css = cssCode.trim() || '/* Add your CSS here */'
    const js = jsCode.trim() || '// Add your JavaScript here'
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
${js}
    </script>
</body>
</html>`
  }

  const extractInstructions = (starterCode: string) => {
    if (!starterCode) return ''
    
    const commentMatch = starterCode.match(/<!--\s*([\s\S]*?)\s*-->/)
    if (commentMatch) {
      let instructions = commentMatch[1]
      instructions = instructions
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/<[^>]+>/g, '')
        .trim()
      return instructions
    }
    
    const jsCommentMatch = starterCode.match(/\/\*\s*([\s\S]*?)\s*\*\//)
    if (jsCommentMatch) {
      let instructions = jsCommentMatch[1]
      instructions = instructions
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/<[^>]+>/g, '')
        .trim()
      return instructions
    }
    
    return ''
  }

  const removeComments = (code: string) => {
    if (!code) return ''
    let cleaned = code.replace(/<!--\s*[\s\S]*?\s*-->/g, '')
    cleaned = cleaned.replace(/\/\*\s*[\s\S]*?\s*\*\//g, '')
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()
    return cleaned
  }

  const escapeDescription = (text: string) => {
    if (!text) return ''
    const lines = text.split('\n')
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim()
      if (trimmed.toLowerCase().includes('gợi ý:') && /<[^>]+>/.test(trimmed)) {
        return false
      }
      if (/^Gợi ý:.*<[^>]+>/.test(trimmed)) {
        return false
      }
      return true
    })
    
    let cleaned = cleanedLines.join('\n')
    cleaned = cleaned
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/<[^>]*$/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim()
    
    return cleaned
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && assignmentId) {
      fetchAssignment()
      startTracking()
    }

    return () => {
      if (isTracking) {
        endTracking()
      }
    }
  }, [isAuthenticated, assignmentId])

  useEffect(() => {
    if (question) {
      const lang = question.codeType
      if (lang === 'html' || lang === 'css' || lang === 'html-css-js' || activeTab === 'multi') {
        if (activeTab === 'multi' || lang === 'html-css-js') {
          setPreviewContent(combineCode())
        } else if (lang === 'html') {
          setPreviewContent(code || '<!DOCTYPE html><html><head><title>Preview</title></head><body><p>No content yet</p></body></html>')
        } else if (lang === 'css') {
          setPreviewContent(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${code || '/* Add your CSS here */'}</style>
</head>
<body>
    <div class="demo-container">
        <h1>CSS Demo</h1>
        <p>This is a paragraph styled with your CSS.</p>
        <div class="box">Box Element</div>
        <button>Button Element</button>
        <input type="text" placeholder="Input field">
        <textarea placeholder="Textarea"></textarea>
    </div>
</body>
</html>`)
        }
      }
    }
  }, [code, htmlCode, cssCode, jsCode, activeTab, question?.codeType])

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/progress/quiz-assignments/${assignmentId}`)
      const assignmentData = response.data.assignment
      setAssignment(assignmentData)
      
      if (assignmentData.questions && assignmentData.questions[questionIndex]) {
        const q = assignmentData.questions[questionIndex]
        if (q.type === 'code') {
          setQuestion(q)
          
      // Handle starterCode - can be object or string
      let starterCodeObj: { html?: string; css?: string; javascript?: string; [key: string]: any } = typeof q.starterCode === 'string' 
        ? (() => {
            try {
              return JSON.parse(q.starterCode)
            } catch {
              return {
                [q.codeType]: q.starterCode
              }
            }
          })()
        : q.starterCode
      
      const instructions = extractInstructions(
        q.codeType === 'html-css-js' 
          ? (starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || '')
          : (starterCodeObj[q.codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || '')
      )
      setExerciseInstructions(instructions)
      
      if (q.codeType === 'html-css-js') {
        setHtmlCode(removeComments(starterCodeObj.html || ''))
        setCssCode(removeComments(starterCodeObj.css || ''))
        setJsCode(removeComments(starterCodeObj.javascript || ''))
        setActiveTab('multi')
      } else {
        const codeValue = starterCodeObj[q.codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || ''
        const cleanedStarterCode = removeComments(codeValue)
        setCode(cleanedStarterCode)
        setActiveTab('single')
      }
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleRun = () => {
    setIsRunning(true)
    setOutput('')
    trackButtonClick('Run Code', window.location.pathname)

    try {
      const currentCode = activeTab === 'multi' ? combineCode() : code
      const lang = question?.codeType || 'html'
      
      if (activeTab === 'multi' || lang === 'html-css-js') {
        setPreviewContent(combineCode())
      } else if (lang === 'html') {
        setPreviewContent(code || '<!DOCTYPE html><html><head><title>Preview</title></head><body><p>No content yet</p></body></html>')
      } else if (lang === 'css') {
        setPreviewContent(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${code || '/* Add your CSS here */'}</style>
</head>
<body>
    <div class="demo-container">
        <h1>CSS Demo</h1>
        <p>This is a paragraph styled with your CSS.</p>
        <div class="box">Box Element</div>
        <button>Button Element</button>
        <input type="text" placeholder="Input field">
        <textarea placeholder="Textarea"></textarea>
    </div>
</body>
</html>`)
      }
      
      if (lang === 'javascript' && activeTab === 'single') {
        try {
          const result = eval(currentCode)
          if (result !== undefined) {
            setOutput(String(result))
          } else {
            setOutput('Code executed successfully!')
          }
        } catch (error: any) {
          setOutput(`Error: ${error.message}`)
        }
      } else {
        setOutput('Preview updated!')
        setIframeKey(prev => prev + 1)
        
        if (activeTab === 'multi' && jsCode.trim()) {
          try {
            const result = eval(jsCode)
            if (result !== undefined) {
              setOutput(`Preview updated! JavaScript output: ${String(result)}`)
            }
          } catch (error: any) {
            setOutput(`Preview updated! JavaScript error: ${error.message}`)
          }
        }
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    if (question) {
      let starterCodeObj: { html?: string; css?: string; javascript?: string; [key: string]: any } = typeof question.starterCode === 'string'
        ? (() => {
            try {
              return JSON.parse(question.starterCode)
            } catch {
              return {
                [question.codeType]: question.starterCode
              }
            }
          })()
        : question.starterCode
      
      if (question.codeType === 'html-css-js') {
        setHtmlCode(removeComments(starterCodeObj.html || ''))
        setCssCode(removeComments(starterCodeObj.css || ''))
        setJsCode(removeComments(starterCodeObj.javascript || ''))
      } else {
        const codeValue = starterCodeObj[question.codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || ''
        setCode(removeComments(codeValue))
      }
    }
    setOutput('')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    trackButtonClick('Submit Code', window.location.pathname)
    
    try {
      const finalCode = activeTab === 'multi' ? combineCode() : code
      
      // Save code answer temporarily
      await api.post(`/progress/quiz-assignments/${assignmentId}/save-code-answer`, {
        questionIndex,
        code: finalCode,
        codeType: question?.codeType
      })
      
      // Store in localStorage for final submission
      const savedAnswers = JSON.parse(localStorage.getItem(`quiz-${assignmentId}-answers`) || '[]')
      savedAnswers[questionIndex] = {
        codeAnswer: finalCode,
        codeType: question?.codeType
      }
      localStorage.setItem(`quiz-${assignmentId}-answers`, JSON.stringify(savedAnswers))
      
      trackButtonClick('Submit Code Answer', window.location.pathname)
      
      // Navigate to next question or submit final quiz
      const nextQuestionIndex = questionIndex + 1
      if (assignment?.questions && nextQuestionIndex < assignment.questions.length) {
        const nextQuestion = assignment.questions[nextQuestionIndex]
        if (nextQuestion.type === 'code') {
          router.push(`/assignments/${assignmentId}/code/${nextQuestionIndex}`)
        } else {
          // Next question is multiple-choice, go back to assignments page to continue in modal
          router.push(`/assignments`)
        }
      } else {
        // All questions answered, submit final quiz
        await submitFinalQuiz()
      }
    } catch (error: any) {
      console.error('Error submitting code:', error)
      alert(error.response?.data?.message || 'Failed to submit code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitFinalQuiz = async () => {
    try {
      const savedAnswers = JSON.parse(localStorage.getItem(`quiz-${assignmentId}-answers`) || '[]')
      
      // Format answers for submission
      const formattedAnswers = assignment?.questions.map((q: any, index: number) => {
        if (q.type === 'code') {
          return savedAnswers[index] || { codeAnswer: '', codeType: q.codeType }
        }
        return savedAnswers[index] || null
      }) || []
      
      // Submit final quiz
      await api.post(`/progress/quiz-assignments/${assignmentId}/submit`, {
        answers: formattedAnswers,
        timeTaken: 0
      })
      
      // Clear saved answers
      localStorage.removeItem(`quiz-${assignmentId}-answers`)
      
      if (isTracking) {
        await endTracking(new Date())
      }
      
      router.push(`/assignments`)
    } catch (error: any) {
      console.error('Error submitting final quiz:', error)
      alert(error.response?.data?.message || 'Failed to submit quiz. Please try again.')
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!question || question.type !== 'code') {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen flex items-center justify-center">
        <div>
          <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Code Question Not Found</h2>
          <p className="text-muted-foreground mb-4">This question is not a code question.</p>
          <Link href={`/assignments`}>
            <Button>Back to Assignments</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Link href={`/assignments`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Button>
        </Link>

        {/* Code Question Header */}
        <Card className="mb-6 shadow-lg border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Code Question {questionIndex + 1}</CardTitle>
                  {assignment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {assignment.title} - Question {questionIndex + 1} of {assignment.questions.length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question Text */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
            {question.explanation && (
              <p className="text-muted-foreground">{question.explanation}</p>
            )}
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Language:</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                    {question.codeType.toUpperCase()}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Code
                </Button>
              </div>

              {/* Exercise Instructions */}
              {exerciseInstructions && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Yêu cầu bài tập
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-foreground whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded border max-h-[300px] overflow-y-auto">
                      {escapeDescription(exerciseInstructions)}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Code Editor */}
              <div>
                {question.codeType === 'html-css-js' || activeTab === 'multi' ? (
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="html">
                        <FileText className="h-4 w-4 mr-2" />
                        HTML
                      </TabsTrigger>
                      <TabsTrigger value="css">
                        <Palette className="h-4 w-4 mr-2" />
                        CSS
                      </TabsTrigger>
                      <TabsTrigger value="javascript">
                        <Zap className="h-4 w-4 mr-2" />
                        JavaScript
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="html" className="mt-4">
                      <CodeEditor
                        value={htmlCode}
                        onChange={setHtmlCode}
                        language="html"
                        height="400px"
                        placeholder="Write your HTML here..."
                        showErrors={true}
                        onErrorsChange={setHtmlErrors}
                      />
                    </TabsContent>
                    <TabsContent value="css" className="mt-4">
                      <CodeEditor
                        value={cssCode}
                        onChange={setCssCode}
                        language="css"
                        height="400px"
                        placeholder="Write your CSS here..."
                        showErrors={true}
                        onErrorsChange={setCssErrors}
                      />
                    </TabsContent>
                    <TabsContent value="javascript" className="mt-4">
                      <CodeEditor
                        value={jsCode}
                        onChange={setJsCode}
                        language="javascript"
                        height="400px"
                        placeholder="Write your JavaScript here..."
                        showErrors={true}
                        onErrorsChange={setJsErrors}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={question.codeType}
                    height="500px"
                    placeholder="Write your code here..."
                    showErrors={true}
                    onErrorsChange={setCodeErrors}
                  />
                )}
              </div>

              {/* Syntax Errors Panel */}
              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    Syntax Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const allErrors = activeTab === 'multi' 
                      ? [...htmlErrors, ...cssErrors, ...jsErrors]
                      : codeErrors
                    const totalErrors = allErrors.length

                    if (totalErrors === 0 && (code.trim().length > 0 || htmlCode.trim().length > 0 || cssCode.trim().length > 0 || jsCode.trim().length > 0)) {
                      return (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>No syntax errors</span>
                        </div>
                      )
                    }

                    if (totalErrors === 0) {
                      return (
                        <div className="text-sm text-muted-foreground p-3 text-center">
                          Start typing to see syntax errors
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                          {totalErrors} error{totalErrors > 1 ? 's' : ''} found
                        </div>
                        {allErrors.map((error, index) => (
                          <div 
                            key={index} 
                            className={`text-xs p-2 rounded border ${
                              error.severity === 'error' 
                                ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' 
                                : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                            }`}
                          >
                            <div className="font-medium mb-1">
                              Line {error.line}
                            </div>
                            <div className="text-xs">
                              {error.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

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
                      Submit Answer
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

              {/* Preview */}
              {(question.codeType === 'html' || question.codeType === 'css' || question.codeType === 'html-css-js' || activeTab === 'multi') && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Preview:</h3>
                  <div className="border rounded-lg overflow-hidden bg-white dark:bg-[hsl(220_30%_8%)]">
                    <iframe
                      key={`preview-${iframeKey}-${activeTab === 'multi' ? htmlCode.length + cssCode.length + jsCode.length : code.length}`}
                      srcDoc={previewContent}
                      className="w-full h-96 border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Code Preview"
                      style={{ minHeight: '400px' }}
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


