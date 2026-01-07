'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DynamicCodeEditor } from '@/components/DynamicCodeEditor'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2, FileText, Palette, Zap, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuizTracker } from '@/hooks/useQuizTracker'
import { useGATracking } from '@/hooks/useGATracking'
import { detectLanguageFromCode, preprocessListedCode } from '@/lib/codeDetect'

interface CodeQuestion {
  type: 'code'
  question: string
  codeType: string
  starterCode: {
    html?: string
    css?: string
    javascript?: string
  } | string
  expectedOutput: string
  explanation?: string
}

type CodeEditorLanguage = 'html' | 'javascript' | 'css' | 'python' | 'html-css-js'

function toCodeEditorLanguage(input: string | undefined | null): CodeEditorLanguage {
  const v = String(input || '').toLowerCase()
  if (v === 'html' || v === 'javascript' || v === 'css' || v === 'python' || v === 'html-css-js') return v
  return 'javascript'
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('html')
  const [code, setCode] = useState('')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [output, setOutput] = useState('')
  const [stdinInput, setStdinInput] = useState('')
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
  const [ioTab, setIoTab] = useState<'terminal' | 'preview'>('preview')

  const fallbackLanguages = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'html-css-js', label: 'HTML + CSS + JS' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' },
    { id: 'c', label: 'C' },
    { id: 'csharp', label: 'C#' },
    { id: 'go', label: 'Go' },
    { id: 'rust', label: 'Rust' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'php', label: 'PHP' },
    { id: 'swift', label: 'Swift' },
    { id: 'kotlin', label: 'Kotlin' },
    { id: 'r', label: 'R' },
    { id: 'sql', label: 'SQL' },
    { id: 'bash', label: 'Bash' },
    { id: 'powershell', label: 'PowerShell' },
  ]

  const [languageOptions, setLanguageOptions] = useState(fallbackLanguages)

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/code/languages')
        const list = res?.data?.languages
        if (!Array.isArray(list)) return

        const remote = list
          .map((l: any) => ({
            id: String(l?.id || '').toLowerCase(),
            label: String(l?.name || l?.id || '').trim() || String(l?.id || '').toUpperCase(),
          }))
          .filter((l: any) => l.id)

        const byId = new Map()
        for (const f of fallbackLanguages) byId.set(f.id, f)
        for (const r of remote) if (!byId.has(r.id)) byId.set(r.id, r)

        const merged = Array.from(byId.values())
        const pinned = fallbackLanguages.map((l) => l.id)
        merged.sort((a, b) => {
          const ap = pinned.indexOf(a.id)
          const bp = pinned.indexOf(b.id)
          if (ap !== -1 || bp !== -1) return (ap === -1 ? 999 : ap) - (bp === -1 ? 999 : bp)
          return a.label.localeCompare(b.label)
        })

        if (!cancelled && merged.length) setLanguageOptions(merged)
      } catch {
        // keep fallback
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

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
      const lang = selectedLanguage || question.codeType
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
  }, [code, htmlCode, cssCode, jsCode, activeTab, question?.codeType, selectedLanguage])

  useEffect(() => {
    const shouldMulti = selectedLanguage === 'html-css-js'
    setActiveTab(shouldMulti ? 'multi' : 'single')
    const shouldPreview = shouldMulti || selectedLanguage === 'html' || selectedLanguage === 'css'
    setIoTab(shouldPreview ? 'preview' : 'terminal')
  }, [selectedLanguage])

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/progress/quiz-assignments/${assignmentId}`)
      const assignmentData = response.data.assignment
      setAssignment(assignmentData)
      
      if (assignmentData.questions && assignmentData.questions[questionIndex]) {
        const q = assignmentData.questions[questionIndex]
        if (q.type === 'code') {
          setQuestion(q)
          setSelectedLanguage(q.codeType || 'html')
          const shouldMulti = q.codeType === 'html-css-js'
          setActiveTab(shouldMulti ? 'multi' : 'single')
          const shouldPreview = shouldMulti || q.codeType === 'html' || q.codeType === 'css'
          setIoTab(shouldPreview ? 'preview' : 'terminal')
          
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

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    trackButtonClick('Run Code', window.location.pathname)

    try {
      const currentCodeRaw = activeTab === 'multi' ? combineCode() : code
      const currentCode = preprocessListedCode(currentCodeRaw)
      const lang = selectedLanguage || question?.codeType || 'html'
      const isPreviewMode = activeTab === 'multi' || lang === 'html-css-js' || lang === 'html' || lang === 'css'
      
      if (isPreviewMode) {
        if (activeTab === 'multi' || lang === 'html-css-js') {
          setPreviewContent(combineCode())
        } else if (lang === 'html') {
          setPreviewContent(currentCode || '<!DOCTYPE html><html><head><title>Preview</title></head><body><p>No content yet</p></body></html>')
        } else if (lang === 'css') {
          setPreviewContent(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${currentCode || '/* Add your CSS here */'}</style>
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

        setOutput('Preview updated!')
        setIframeKey(prev => prev + 1)
        return
      }

      const response = await api.post('/code/execute', {
        code: currentCode,
        language: lang,
        input: stdinInput,
      })

      const data = response?.data
      if (!data?.success) {
        setOutput(data?.error || 'Execution failed')
        return
      }

      const combinedOutput = [data.output, data.error ? `\n${data.error}` : '']
        .filter(Boolean)
        .join('')
      setOutput(combinedOutput || 'Program executed successfully (no output)')
    } catch (error: any) {
      setOutput(error?.response?.data?.error || error?.message || 'Execution failed')
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
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    {languageOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
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
                {selectedLanguage === 'html-css-js' || activeTab === 'multi' ? (
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
                      <DynamicCodeEditor
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
                      <DynamicCodeEditor
                        value={cssCode}
                        onChange={(v) => {
                          setCode(v)
                          const detected = detectLanguageFromCode(v)
                          if (detected && detected !== selectedLanguage && detected !== 'html-css-js') {
                            setSelectedLanguage(detected)
                          }
                        }}
                        language="css"
                        height="400px"
                        placeholder="Write your CSS here..."
                        showErrors={true}
                        onErrorsChange={setCssErrors}
                      />
                    </TabsContent>
                    <TabsContent value="javascript" className="mt-4">
                      <DynamicCodeEditor
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
                  <DynamicCodeEditor
                    value={code}
                    onChange={setCode}
                    language={toCodeEditorLanguage(question.codeType)}
                    height="500px"
                    placeholder="Write your code here..."
                    showErrors={true}
                    onErrorsChange={setCodeErrors}
                  />
                )}
              </div>

              {/* Syntax Errors Panel - Below Code Editor */}
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

              {/* Terminal / Preview Tabs */}
              {(() => {
                const lang = selectedLanguage || question?.codeType || 'html'
                const isPreviewMode = activeTab === 'multi' || lang === 'html-css-js' || lang === 'html' || lang === 'css'

                return (
                  <Tabs value={ioTab} onValueChange={(v) => setIoTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="terminal">Terminal</TabsTrigger>
                      <TabsTrigger value="preview" disabled={!isPreviewMode}>
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="terminal" className="mt-4 space-y-3">
                      {!isPreviewMode && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">Input (stdin):</h3>
                          <textarea
                            value={stdinInput}
                            onChange={(e) => setStdinInput(e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-muted rounded-lg border text-sm font-mono"
                            placeholder="Input for your program (optional). Example:\n5\n10\n"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Output:</h3>
                        <div className="p-4 bg-black text-green-400 rounded-lg border font-mono text-sm min-h-[120px]">
                          <pre className="whitespace-pre-wrap">{output || ' '}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                      {isPreviewMode && (
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
                    </TabsContent>
                  </Tabs>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


