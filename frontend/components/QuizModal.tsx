'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy, AlertCircle } from 'lucide-react'

interface Question {
  question: string
  options: (string | { vi?: string; en?: string; [key: string]: any })[]
  correctAnswer: number
  explanation?: string
}

interface QuizModalProps {
  questions: Question[]
  passingScore: number
  onComplete: (quizScore: number, codeScore?: number) => void
  onClose: () => void
}

export function QuizModal({ questions, passingScore, onComplete, onClose }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // Ensure all questions have valid options as strings
  const normalizedQuestions = useMemo(() => {
    return questions.map((q, qIndex) => {
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
        options: normalizedOptions
      }
    })
  }, [questions])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < normalizedQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    normalizedQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    const finalScore = (correct / normalizedQuestions.length) * 10
    setScore(finalScore)
    setShowResults(true)
  }

  const handleSubmit = () => {
    onComplete(score, undefined)
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

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {normalizedQuestions.map((q, index) => {
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
  if (!question || !question.options || question.options.length === 0) {
    return null
  }

  const hasAnswer = selectedAnswers[currentQuestion] !== undefined
  const progress = ((currentQuestion + 1) / normalizedQuestions.length) * 100

  return (
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

