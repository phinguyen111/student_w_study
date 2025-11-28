'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CodeEditor } from '@/components/CodeEditor'
import { X, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy, AlertCircle, Play, RotateCcw, Code2, ListChecks } from 'lucide-react'
import { useQuizTracker } from '@/hooks/useQuizTracker'

type LocalizedString = string | { vi?: string; en?: string }

interface Question {
  question: string
  options?: (string | { vi?: string; en?: string; [key: string]: any })[]
  correctAnswer?: number
  explanation?: LocalizedString
  type?: 'multiple-choice' | 'code'
  codeType?: 'html' | 'css' | 'javascript' | 'html-css-js'
  starterCode?: {
    html?: string
    css?: string
    javascript?: string
  }
  expectedOutput?: string
  outputCriteria?: Array<{
    id?: string
    snippet: string
    points: number
    penalty?: number
  }>
}

interface QuizModalProps {
  questions: Question[]
  passingScore: number
  lessonId?: string
  onComplete: (quizScore: number, codeScore?: number, sessionId?: string) => void
  onClose: () => void
}

export function QuizModal({ questions, passingScore, lessonId, onComplete, onClose }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [codeAnswers, setCodeAnswers] = useState<Array<{ html?: string; css?: string; javascript?: string }>>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [iframeKey, setIframeKey] = useState(0)
  const [previewOutput, setPreviewOutput] = useState<string>('')
  const startTimeRef = useRef<number | null>(null)
  const questionTimesRef = useRef<Array<{ questionIndex: number; startTime: number; endTime?: number }>>([])

  // Initialize quiz tracking
  const { startTracking, endTracking, isTracking, sessionId } = useQuizTracker({
    lessonId: lessonId || undefined,
    quizType: 'lesson',
    onSessionStart: (sessionId) => {
      startTimeRef.current = Date.now()
      questionTimesRef.current = []
      // Track first question start
      questionTimesRef.current.push({
        questionIndex: 0,
        startTime: Date.now()
      })
    }
  })

  // Start tracking when modal opens
  useEffect(() => {
    if (lessonId && !isTracking) {
      startTracking()
    }

    return () => {
      // End tracking when modal closes (only if not already ended)
      if (isTracking) {
        endTracking()
      }
    }
  }, [lessonId, isTracking, startTracking, endTracking])

  // Initialize code answers
  useEffect(() => {
    const initialCodeAnswers = questions.map((q) => {
      if (q.type === 'code' && q.starterCode) {
        return {
          html: q.starterCode.html || '',
          css: q.starterCode.css || '',
          javascript: q.starterCode.javascript || ''
        }
      }
      return { html: '', css: '', javascript: '' }
    })
    setCodeAnswers(initialCodeAnswers)
  }, [questions])

  // Ensure all questions have valid options as strings
  const normalizedQuestions = useMemo(() => {
    return questions.map((q, qIndex) => {
      // Skip normalization for code questions
      if (q.type === 'code') {
        return q
      }

      // Normalize options to always be array of strings
      let normalizedOptions: string[] = []
      
      // Debug: log original options
      if (qIndex === 0) {
        console.log('Original question options:', q.options, 'Type:', typeof q.options, 'IsArray:', Array.isArray(q.options))
      }
      
      if (Array.isArray(q.options)) {
        normalizedOptions = q.options.map((opt, optIndex) => {
          if (typeof opt === 'string') {
            return opt
          }
          if (opt && typeof opt === 'object') {
            // Handle {vi: "...", en: "..."} format
            const optObj = opt as { vi?: string; en?: string; [key: string]: any }
            const value = optObj.en || optObj.vi
            if (value) {
              return String(value)
            }
            // If no en/vi, try to extract any string property
            for (const key in optObj) {
              if (key !== '_id' && key !== '__v' && typeof optObj[key] === 'string' && optObj[key]) {
                return String(optObj[key])
              }
            }
            return JSON.stringify(opt)
          }
          return String(opt)
        })
      } else if (q.options && typeof q.options === 'object') {
        // Handle case where options is an object with numeric keys (Mongoose quirk)
        const keys = Object.keys(q.options)
          .filter(k => !isNaN(Number(k)) && k !== '_id' && k !== '__v')
          .map(Number)
          .sort((a, b) => a - b)
        
        normalizedOptions = keys.map(key => {
          const opt = (q.options as any)[key]
          if (typeof opt === 'string') {
            return opt
          }
          if (opt && typeof opt === 'object') {
            const optObj = opt as { vi?: string; en?: string; [key: string]: any }
            const value = optObj.en || optObj.vi
            if (value) {
              return String(value)
            }
            for (const key in optObj) {
              if (key !== '_id' && key !== '__v' && typeof optObj[key] === 'string' && optObj[key]) {
                return String(optObj[key])
              }
            }
            return JSON.stringify(opt)
          }
          return String(opt)
        })
      }
      
      // Debug: log normalized options
      if (qIndex === 0) {
        console.log('Normalized options:', normalizedOptions)
      }
      
      return {
        ...q,
        type: q.type || 'multiple-choice',
        options: normalizedOptions
      }
    })
  }, [questions])

  const handleCodeChange = (type: 'html' | 'css' | 'javascript', value: string) => {
    const newCodeAnswers = [...codeAnswers]
    if (!newCodeAnswers[currentQuestion]) {
      newCodeAnswers[currentQuestion] = { html: '', css: '', javascript: '' }
    }
    newCodeAnswers[currentQuestion] = {
      ...newCodeAnswers[currentQuestion],
      [type]: value
    }
    setCodeAnswers(newCodeAnswers)
  }

  const handleResetCode = () => {
    const question = normalizedQuestions[currentQuestion]
    if (question.type === 'code' && question.starterCode) {
      const newCodeAnswers = [...codeAnswers]
      newCodeAnswers[currentQuestion] = {
        html: question.starterCode.html || '',
        css: question.starterCode.css || '',
        javascript: question.starterCode.javascript || ''
      }
      setCodeAnswers(newCodeAnswers)
      setPreviewOutput('')
    }
  }

  const handleRunCode = () => {
    const question = normalizedQuestions[currentQuestion]
    if (question.type === 'code') {
      const code = codeAnswers[currentQuestion] || { html: '', css: '', javascript: '' }
      
      if (question.codeType === 'javascript') {
        try {
          const result = eval(code.javascript || '')
          if (result !== undefined) {
            setPreviewOutput(String(result))
          } else {
            setPreviewOutput('Code executed successfully!')
          }
        } catch (error: any) {
          setPreviewOutput(`Error: ${error.message}`)
        }
      } else {
        setPreviewOutput('Code ready for preview!')
        setIframeKey(prev => prev + 1)
      }
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    // Track time spent on current question
    const currentQuestionTime = questionTimesRef.current.find(
      qt => qt.questionIndex === currentQuestion && !qt.endTime
    )
    if (currentQuestionTime) {
      currentQuestionTime.endTime = Date.now()
    }

    // Reset preview when moving to next question
    setPreviewOutput('')
    setIframeKey(0)

    if (currentQuestion < normalizedQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1
      setCurrentQuestion(nextQuestion)
      
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

      // Reset preview when moving to previous question
      setPreviewOutput('')
      setIframeKey(0)

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
    // Track time spent on last question
    const currentQuestionTime = questionTimesRef.current.find(
      qt => qt.questionIndex === currentQuestion && !qt.endTime
    )
    if (currentQuestionTime) {
      currentQuestionTime.endTime = Date.now()
    }

    let correct = 0
    normalizedQuestions.forEach((q, index) => {
      if (q.type === 'code') {
        // For code questions, check if code was written (basic check)
        const code = codeAnswers[index] || { html: '', css: '', javascript: '' }
        const hasCode = !!(code.html || code.css || code.javascript)
        // For now, give points if code exists. Can be enhanced with actual code validation
        if (hasCode) {
          correct++
        }
      } else {
        if (selectedAnswers[index] === q.correctAnswer) {
          correct++
        }
      }
    })
    const finalScore = (correct / normalizedQuestions.length) * 10
    setScore(finalScore)
    setShowResults(true)
  }

  const handleSubmit = async () => {
    // End tracking session
    if (isTracking) {
      await endTracking(new Date())
    }
    
    // Calculate total time and question statistics
    const totalTime = startTimeRef.current 
      ? Date.now() - startTimeRef.current 
      : 0
    
    onComplete(score, undefined, sessionId || undefined)
    onClose()
  }

  const handleClose = async () => {
    // End tracking if user closes modal without submitting
    if (isTracking && !showResults) {
      await endTracking()
    }
    onClose()
  }

  if (showResults) {
    const passed = score >= passingScore
    const correctCount = Math.round((score / 10) * normalizedQuestions.length)
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
        <Card className="w-full max-w-3xl max-h-[90vh] shadow-2xl border-2 animate-in zoom-in-95 duration-200 flex flex-col">
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className={`h-6 w-6 ${passed ? 'text-yellow-500' : 'text-gray-400'}`} />
                Quiz Results
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
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
                You got {correctCount} out of {normalizedQuestions.length} questions correct
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{correctCount}/{normalizedQuestions.length}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(correctCount / normalizedQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
              {normalizedQuestions.map((q, index) => {
                const isCodeQ = q.type === 'code'
                const userAnswer = selectedAnswers[index]
                const isCorrect = isCodeQ 
                  ? !!(codeAnswers[index]?.html || codeAnswers[index]?.css || codeAnswers[index]?.javascript)
                  : userAnswer === q.correctAnswer
                const codeAnswer = codeAnswers[index] || { html: '', css: '', javascript: '' }
                
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
                    
                    {isCodeQ ? (
                      <div className="ml-8 space-y-3">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Your Code:</div>
                        {(codeAnswer.html || q.codeType === 'html' || q.codeType === 'html-css-js') && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">HTML:</div>
                            <div className="p-3 bg-muted rounded-lg border font-mono text-xs overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{codeAnswer.html || '(empty)'}</pre>
                            </div>
                          </div>
                        )}
                        {(codeAnswer.css || q.codeType === 'css' || q.codeType === 'html-css-js') && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">CSS:</div>
                            <div className="p-3 bg-muted rounded-lg border font-mono text-xs overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{codeAnswer.css || '(empty)'}</pre>
                            </div>
                          </div>
                        )}
                        {(codeAnswer.javascript || q.codeType === 'javascript' || q.codeType === 'html-css-js') && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">JavaScript:</div>
                            <div className="p-3 bg-muted rounded-lg border font-mono text-xs overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{codeAnswer.javascript || '(empty)'}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 ml-8">
                        {q.options?.map((option, optIndex) => {
                          // Ensure option is always a string
                          const optionText = typeof option === 'string' 
                            ? option 
                            : (option && typeof option === 'object' && ('en' in option || 'vi' in option)
                                ? (option.en || option.vi || String(option))
                                : String(option))
                          
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
                                <span>{optionText}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {q.explanation && (
                      <div className="mt-3 ml-8 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          <strong>Explanation:</strong> {getExplanationText(q.explanation)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex-shrink-0 pt-4 border-t">
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Continue Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = normalizedQuestions[currentQuestion]
  if (!question) {
    return null
  }

  // Check if question has valid options (for multiple-choice) or is a code question
  if (question.type !== 'code' && (!question.options || question.options.length === 0)) {
    return null
  }

  const isCodeQuestion = question.type === 'code'
  const hasAnswer = isCodeQuestion 
    ? !!(codeAnswers[currentQuestion]?.html || codeAnswers[currentQuestion]?.css || codeAnswers[currentQuestion]?.javascript)
    : selectedAnswers[currentQuestion] !== undefined
  const progress = ((currentQuestion + 1) / normalizedQuestions.length) * 100
  const currentCode = codeAnswers[currentQuestion] || { html: '', css: '', javascript: '' }

  const getExplanationText = (value?: Question['explanation']) => {
    if (!value) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
      return value.en || value.vi || ''
    }
    return ''
  }

  const extractCommentBlock = (code?: string) => {
    if (!code) return ''
    const htmlComment = code.match(/<!--([\s\S]*?)-->/)
    if (htmlComment) return htmlComment[1].trim()
    const blockComment = code.match(/\/\*([\s\S]*?)\*\//)
    if (blockComment) return blockComment[1].trim()
    const hashComment = code.match(/#\s*Yêu cầu:([\s\S]*)/i)
    if (hashComment) return hashComment[1].trim()
    return ''
  }

  const getStarterCodePreview = (starterCode?: Question['starterCode'], codeType?: Question['codeType']) => {
    if (!starterCode) return ''
    if (codeType === 'html-css-js') {
      return [starterCode.html, starterCode.css, starterCode.javascript].filter(Boolean).join('\n')
    }
    if (codeType) {
      const langKey = codeType as 'html' | 'css' | 'javascript'
      return starterCode[langKey] || ''
    }
    return starterCode.html || starterCode.css || starterCode.javascript || ''
  }

  const getCodeQuestionRequirementPreview = (question: Question) => {
    const snippet = getStarterCodePreview(question.starterCode, question.codeType)
    const comment = extractCommentBlock(snippet)
    if (comment) return comment
    if (question.expectedOutput?.trim()) return question.expectedOutput.trim()
    return getExplanationText(question.explanation)
  }

  const requirementPreview = isCodeQuestion ? getCodeQuestionRequirementPreview(question) : ''
  const readOnlyRules = isCodeQuestion && Array.isArray(question.outputCriteria)
    ? question.outputCriteria
    : []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] shadow-2xl border-2 animate-in zoom-in-95 duration-200 flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl">Quiz</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <CardDescription className="text-base">
                Question {currentQuestion + 1} of {normalizedQuestions.length}
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
        <CardContent className="pt-6 overflow-y-auto flex-1 min-h-0">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 leading-tight">{question.question}</h3>
            
            {isCodeQuestion ? (
              <div className="space-y-4">
                {(requirementPreview || readOnlyRules.length) && (
                  <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                    {requirementPreview && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Code2 className="h-4 w-4 text-primary" />
                          Yêu cầu bài tập
                        </div>
                        <div className="rounded-lg border bg-background/80 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-auto p-3">
                          {requirementPreview}
                        </div>
                      </div>
                    )}
                    {readOnlyRules.length ? (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <ListChecks className="h-4 w-4" />
                          Output rules & scoring
                        </div>
                        <div className="space-y-2">
                          {readOnlyRules.map((rule, index) => (
                            <div
                              key={rule.id || `student-preview-rule-${currentQuestion}-${index}`}
                              className="flex items-center justify-between gap-3 rounded-lg border bg-background/70 p-2"
                            >
                              <div className="flex-1 text-xs font-mono whitespace-pre-wrap pr-4">
                                {rule.snippet?.trim() || `Rule ${index + 1}`}
                              </div>
                              <div className="text-right text-xs min-w-[80px]">
                                <p className="font-semibold text-emerald-600">
                                  {Number(rule.points || 0).toFixed(2)} pts
                                </p>
                                {rule.penalty ? (
                                  <p className="text-red-500">
                                    - {Number(rule.penalty || 0).toFixed(2)} pts
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                {/* Code Type Selection */}
                {question.codeType === 'html-css-js' && (
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="html">HTML</TabsTrigger>
                      <TabsTrigger value="css">CSS</TabsTrigger>
                      <TabsTrigger value="javascript">JS</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="html" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">HTML Code</span>
                          <Button variant="outline" size="sm" onClick={handleResetCode}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <CodeEditor
                          value={currentCode.html || ''}
                          onChange={(value) => handleCodeChange('html', value)}
                          language="html"
                          height="300px"
                          placeholder="Write your HTML code here..."
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="css" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">CSS Code</span>
                          <Button variant="outline" size="sm" onClick={handleResetCode}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <CodeEditor
                          value={currentCode.css || ''}
                          onChange={(value) => handleCodeChange('css', value)}
                          language="css"
                          height="300px"
                          placeholder="Write your CSS code here..."
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="javascript" className="mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">JavaScript Code</span>
                          <Button variant="outline" size="sm" onClick={handleResetCode}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <CodeEditor
                          value={currentCode.javascript || ''}
                          onChange={(value) => handleCodeChange('javascript', value)}
                          language="javascript"
                          height="300px"
                          placeholder="Write your JavaScript code here..."
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Single Code Type */}
                {question.codeType && question.codeType !== 'html-css-js' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {question.codeType === 'html' ? 'HTML' : 
                         question.codeType === 'css' ? 'CSS' : 'JavaScript'} Code
                      </span>
                      <Button variant="outline" size="sm" onClick={handleResetCode}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                    <CodeEditor
                      value={
                        question.codeType === 'html' ? (currentCode.html || '') :
                        question.codeType === 'css' ? (currentCode.css || '') :
                        (currentCode.javascript || '')
                      }
                      onChange={(value) => {
                        if (question.codeType === 'html') handleCodeChange('html', value)
                        else if (question.codeType === 'css') handleCodeChange('css', value)
                        else handleCodeChange('javascript', value)
                      }}
                      language={question.codeType}
                      height="300px"
                      placeholder={`Write your ${question.codeType.toUpperCase()} code here...`}
                    />
                  </div>
                )}

                {/* Run Code Button */}
                <Button
                  onClick={handleRunCode}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Code
                </Button>

                {/* Output/Preview */}
                {previewOutput && question.codeType === 'javascript' && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Output:</h4>
                    <div className="p-4 bg-muted rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm">{previewOutput}</pre>
                    </div>
                  </div>
                )}

                {(question.codeType === 'html' || question.codeType === 'css' || question.codeType === 'html-css-js') && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Preview:</h4>
                    <div className="border rounded-lg overflow-hidden bg-white dark:bg-[hsl(220_30%_8%)]">
                      <iframe
                        key={`${iframeKey}-${currentCode.html?.length || 0}-${currentCode.css?.length || 0}`}
                        onLoad={(e) => {
                          const iframe = e.currentTarget
                          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
                          if (iframeDoc) {
                            iframeDoc.open()
                            if (question.codeType === 'html' || question.codeType === 'html-css-js') {
                              const htmlContent = currentCode.html || ''
                              const cssContent = question.codeType === 'html-css-js' 
                                ? (currentCode.css || '')
                                : ''
                              
                              iframeDoc.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  ${cssContent ? `<style>${cssContent}</style>` : ''}
                                </head>
                                <body>
                                  ${htmlContent}
                                  ${currentCode.javascript ? `<script>${currentCode.javascript}</script>` : ''}
                                </body>
                                </html>
                              `)
                            } else if (question.codeType === 'css') {
                              iframeDoc.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <style>${currentCode.css || ''}</style>
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
            ) : (
              <div className="space-y-3">
                {question.options?.map((option, index) => {
                  // Ensure option is always a string
                  const optionText = typeof option === 'string' 
                    ? option 
                    : (option && typeof option === 'object' && ('en' in option || 'vi' in option)
                        ? (option.en || option.vi || String(option))
                        : String(option))
                  
                  const isSelected = selectedAnswers[currentQuestion] === index
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
                        <span className="text-base">{optionText}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
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
              onClick={handleNext}
              disabled={!hasAnswer}
              className="flex items-center gap-2"
              size="lg"
            >
              {currentQuestion === normalizedQuestions.length - 1 ? (
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
  )
}

