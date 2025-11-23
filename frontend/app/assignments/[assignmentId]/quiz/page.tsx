'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeEditor } from '@/components/CodeEditor'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2, FileText, Palette, Zap, AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
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

interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  question: string
  options: string[]
  correctAnswer?: number
  explanation?: string
}

type Question = CodeQuestion | MultipleChoiceQuestion

export default function QuizAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const assignmentId = Array.isArray(params.assignmentId) ? params.assignmentId[0] : params.assignmentId
  
  const [assignment, setAssignment] = useState<any>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loadingData, setLoadingData] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [codeAnswers, setCodeAnswers] = useState<Record<number, string>>({})
  
  // Code editor states (for current code question)
  const [code, setCode] = useState('')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [activeTab, setActiveTab] = useState<'single' | 'multi'>('single')
  const [activeFileTab, setActiveFileTab] = useState<'html' | 'css' | 'javascript'>('html')
  const [previewContent, setPreviewContent] = useState('')
  const [htmlErrors, setHtmlErrors] = useState<any[]>([])
  const [cssErrors, setCssErrors] = useState<any[]>([])
  const [jsErrors, setJsErrors] = useState<any[]>([])
  const [codeErrors, setCodeErrors] = useState<any[]>([])
  const [exerciseInstructions, setExerciseInstructions] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (assignment && assignment.questions) {
      // Initialize selectedAnswers array if not already initialized
      if (selectedAnswers.length !== assignment.questions.length) {
        const answers = new Array(assignment.questions.length).fill(null)
        setSelectedAnswers(answers)
      }
      
      // Load current question
      loadCurrentQuestion()
    }
  }, [assignment, currentQuestionIndex])

  useEffect(() => {
    if (assignment?.questions && currentQuestionIndex < assignment.questions.length) {
      const currentQ = assignment.questions[currentQuestionIndex]
      if (currentQ.type === 'code') {
        const lang = currentQ.codeType
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
    }
  }, [code, htmlCode, cssCode, jsCode, activeTab, assignment?.questions, currentQuestionIndex])

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/progress/quiz-assignments/${assignmentId}`)
      const assignmentData = response.data.assignment
      setAssignment(assignmentData)
      
      trackQuizAction('start', assignmentId || '', assignmentData.title, {
        quiz_type: 'assignment',
        passing_score: assignmentData.passingScore,
        questions_count: assignmentData.questions.length
      })
    } catch (error) {
      console.error('Error fetching assignment:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadCurrentQuestion = () => {
    if (!assignment?.questions || currentQuestionIndex >= assignment.questions.length) return
    
    const q = assignment.questions[currentQuestionIndex]
    
    if (q.type === 'code') {
      // Load saved code answer if exists
      const savedCode = codeAnswers[currentQuestionIndex]
      
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
      
      if (savedCode) {
        // Load saved answer
        if (q.codeType === 'html-css-js') {
          // Try to parse saved code
          try {
            const parsed = JSON.parse(savedCode)
            setHtmlCode(parsed.html || '')
            setCssCode(parsed.css || '')
            setJsCode(parsed.javascript || '')
            setActiveTab('multi')
          } catch {
            // If not JSON, treat as combined code
            setHtmlCode(savedCode)
            setActiveTab('multi')
          }
        } else {
          setCode(savedCode)
          setActiveTab('single')
        }
      } else {
        // Load starter code
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
      
      // Reset output when switching questions
      setOutput('')
    } else {
      // Multiple-choice question - answer is already in selectedAnswers array
      // Reset code editor states
      setCode('')
      setHtmlCode('')
      setCssCode('')
      setJsCode('')
      setOutput('')
      setExerciseInstructions('')
    }
  }

  const handleRun = () => {
    setIsRunning(true)
    setOutput('')
    trackButtonClick('Run Code', window.location.pathname)

    try {
      const currentCode = activeTab === 'multi' ? combineCode() : code
      const currentQ = assignment?.questions[currentQuestionIndex] as CodeQuestion
      const lang = currentQ?.codeType || 'html'
      
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
    if (!assignment?.questions || currentQuestionIndex >= assignment.questions.length) return
    
    const q = assignment.questions[currentQuestionIndex] as CodeQuestion
    if (q.type !== 'code') return
    
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
    
    if (q.codeType === 'html-css-js') {
      setHtmlCode(removeComments(starterCodeObj.html || ''))
      setCssCode(removeComments(starterCodeObj.css || ''))
      setJsCode(removeComments(starterCodeObj.javascript || ''))
    } else {
      const codeValue = starterCodeObj[q.codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || ''
      setCode(removeComments(codeValue))
    }
    setOutput('')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const saveCurrentAnswer = () => {
    if (!assignment?.questions || currentQuestionIndex >= assignment.questions.length) return
    
    const currentQ = assignment.questions[currentQuestionIndex]
    if (currentQ.type === 'code') {
      const finalCode = activeTab === 'multi' ? combineCode() : code
      setCodeAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: finalCode
      }))
    }
  }

  const handleNext = () => {
    // Save current answer before moving
    saveCurrentAnswer()
    
    if (currentQuestionIndex < (assignment?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setOutput('')
    }
  }

  const handlePrevious = () => {
    // Save current answer before moving
    saveCurrentAnswer()
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setOutput('')
    }
  }

  const combineStarterCode = (starterCodeObj: any, codeType: string): string => {
    if (codeType === 'html-css-js') {
      const html = starterCodeObj.html || ''
      const css = starterCodeObj.css || ''
      const js = starterCodeObj.javascript || ''
      
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
    } else {
      return starterCodeObj[codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || ''
    }
  }

  const calculateCodeScore = (codeAnswer: string, question: CodeQuestion): number => {
    // Get starter code
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
    
    // Combine starter code based on codeType
    const starterCode = question.codeType === 'html-css-js'
      ? combineStarterCode(starterCodeObj, question.codeType)
      : (starterCodeObj[question.codeType] || starterCodeObj.html || starterCodeObj.css || starterCodeObj.javascript || '')
    
    const starterCodeLower = starterCode.toLowerCase()
    const codeLower = codeAnswer.toLowerCase()
    
    // Step 1: Check if code has errors (basic check)
    const hasError = codeAnswer.includes('error') || codeAnswer.includes('Error')
    
    if (hasError) {
      return 0
    }
    
    // Step 2: Check if code was modified from starter code
    const codeChanged = codeAnswer.trim() !== starterCode.trim()
    
    if (!codeChanged) {
      return 0
    }
    
    // Step 3: Count elements in starter code
    const starterH1 = (starterCodeLower.match(/<h1[^>]*>/g) || []).length
    const starterH2 = (starterCodeLower.match(/<h2[^>]*>/g) || []).length
    const starterP = (starterCodeLower.match(/<p[^>]*>/g) || []).length
    const starterA = (starterCodeLower.match(/<a[^>]*href\s*=/g) || []).length
    const starterImg = (starterCodeLower.match(/<img[^>]*src\s*=/g) || []).length
    
    // Step 4: Count elements in current code
    const currentH1 = (codeLower.match(/<h1[^>]*>/g) || []).length
    const currentH2 = (codeLower.match(/<h2[^>]*>/g) || []).length
    const currentP = (codeLower.match(/<p[^>]*>/g) || []).length
    const currentA = (codeLower.match(/<a[^>]*href\s*=/g) || []).length
    const currentImg = (codeLower.match(/<img[^>]*src\s*=/g) || []).length
    
    // Step 5: Count NEW elements that user added
    let requirementsMet = 0
    const totalRequirements = 5
    
    if (currentH1 > starterH1 || (currentH1 > 0 && starterH1 === 0)) {
      requirementsMet++
    }
    if (currentH2 > starterH2 || (currentH2 > 0 && starterH2 === 0)) {
      requirementsMet++
    }
    if (currentP > starterP || (currentP > 0 && starterP === 0)) {
      requirementsMet++
    }
    if (currentA > starterA || (currentA > 0 && starterA === 0)) {
      requirementsMet++
    }
    if (currentImg > starterImg || (currentImg > 0 && starterImg === 0)) {
      requirementsMet++
    }
    
    // Step 6: Check if code has meaningful changes
    const codeWithoutStarter = codeAnswer.replace(starterCode, '').trim()
    const hasMeaningfulChanges = codeWithoutStarter.length > 10
    
    if (!hasMeaningfulChanges) {
      return 0
    }
    
    if (requirementsMet === 0) {
      return 1
    }
    
    // Step 7: Calculate score based on requirements met
    const baseScore = (requirementsMet / totalRequirements) * 10
    let codeScore = Math.round(baseScore * 10) / 10
    
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
    
    return codeScore
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    trackButtonClick('Submit Quiz', window.location.pathname)
    
    try {
      // Save current answer first
      saveCurrentAnswer()
      
      // Wait a bit for state to update, then collect all answers
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Format all answers for submission with code scores
      const formattedAnswers = assignment?.questions.map((q: Question, index: number) => {
        if (q.type === 'code') {
          // Get code answer - use current code if it's the current question, otherwise use saved
          let codeAnswer = ''
          if (index === currentQuestionIndex) {
            // Current question - use current code state
            codeAnswer = activeTab === 'multi' ? combineCode() : code
          } else {
            // Other questions - use saved answer
            codeAnswer = codeAnswers[index] || ''
          }
          
          // Calculate code score using same logic as code lesson
          const codeScore = calculateCodeScore(codeAnswer, q as CodeQuestion)
          
          return {
            codeAnswer: codeAnswer,
            codeType: q.codeType,
            codeScore: codeScore
          }
        } else {
          // Multiple-choice question
          return selectedAnswers[index] !== null && selectedAnswers[index] !== undefined 
            ? selectedAnswers[index] 
            : null
        }
      }) || []
      
      // Submit quiz
      const response = await api.post(`/progress/quiz-assignments/${assignmentId}/submit`, {
        answers: formattedAnswers,
        timeTaken: 0
      })
      
      if (isTracking) {
        await endTracking(new Date())
      }
      
      trackQuizAction('submit', assignmentId || '', assignment?.title, {
        quiz_type: 'assignment',
        questions_count: assignment?.questions.length,
        quiz_score: response.data?.result?.score
      })
      
      // Redirect to assignments page
      router.push(`/assignments`)
    } catch (error: any) {
      console.error('Error submitting quiz:', error)
      alert(error.response?.data?.message || 'Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!assignment || !assignment.questions || assignment.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen flex items-center justify-center">
        <div>
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-4">This quiz assignment doesn't exist or has no questions.</p>
          <Link href={`/assignments`}>
            <Button>Back to Assignments</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQuestion = assignment.questions[currentQuestionIndex] as Question
  const progress = ((currentQuestionIndex + 1) / assignment.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === assignment.questions.length - 1
  
  // Check if current question has an answer
  const hasAnswer = currentQuestion.type === 'code' 
    ? (activeTab === 'multi' 
        ? (htmlCode.trim().length > 0 || cssCode.trim().length > 0 || jsCode.trim().length > 0)
        : code.trim().length > 0)
    : (selectedAnswers[currentQuestionIndex] !== null && selectedAnswers[currentQuestionIndex] !== undefined)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Progress */}
        <div className="mb-6">
          <Link href={`/assignments`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
          
          <Card className="shadow-lg border-2 mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{assignment?.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Question {currentQuestionIndex + 1} of {assignment?.questions.length}
                    </span>
                    <span>Passing: {assignment?.passingScore}/10</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Question Content */}
        {currentQuestion.type === 'code' ? (
          <>
            {/* Code Exercise Header */}
            <Card className="mb-6 shadow-lg border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Code Exercise</CardTitle>
                </div>
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
                        {currentQuestion.codeType.toUpperCase()}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Code
                    </Button>
                  </div>

                  {/* Exercise Instructions from Comment - Above Code Editor */}
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

                  {/* Code Editor - Full width */}
                  <div>
                    {currentQuestion.codeType === 'html-css-js' || activeTab === 'multi' ? (
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
                        language={currentQuestion.codeType}
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
                  {/* Preview - Always show for HTML, CSS, or multi-language */}
                  {(currentQuestion.codeType === 'html' || currentQuestion.codeType === 'css' || currentQuestion.codeType === 'html-css-js' || activeTab === 'multi') && (
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
          </>
        ) : (
          /* Multiple-choice Question */
          <Card className="mb-6 shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
                {currentQuestion.explanation && (
                  <p className="text-muted-foreground mb-4">{currentQuestion.explanation}</p>
                )}
              </div>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === index
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
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
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={isLastQuestion ? handleSubmit : handleNext}
            disabled={!hasAnswer || isSubmitting}
            className="flex items-center gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isLastQuestion ? (
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
      </div>
    </div>
  )
}

