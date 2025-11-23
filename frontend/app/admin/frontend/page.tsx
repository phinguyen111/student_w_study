'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Save, X } from 'lucide-react'

export default function FrontendManagement() {
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    questions: [] as any[],
    passingScore: 7,
    assignedTo: [] as string[],
    deadline: ''
  })

  const [users, setUsers] = useState<any[]>([])
  const [quizAssignments, setQuizAssignments] = useState<any[]>([])
  const [showCreateAssignment, setShowCreateAssignment] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchQuizAssignments()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchQuizAssignments = async () => {
    try {
      const response = await api.get('/admin/quiz-assignments')
      setQuizAssignments(response.data.assignments || [])
    } catch (error) {
      console.error('Error fetching quiz assignments:', error)
    }
  }

  const addQuestion = (type: 'multiple-choice' | 'code' = 'multiple-choice') => {
    if (type === 'code') {
      setNewAssignment({
        ...newAssignment,
        questions: [...newAssignment.questions, {
          type: 'code',
          question: '',
          codeType: 'html',
          starterCode: { html: '', css: '', javascript: '' },
          expectedOutput: '',
          explanation: ''
        }]
      })
    } else {
      setNewAssignment({
        ...newAssignment,
        questions: [...newAssignment.questions, {
          type: 'multiple-choice',
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: ''
        }]
      })
    }
  }

  const removeQuestion = (index: number) => {
    setNewAssignment({
      ...newAssignment,
      questions: newAssignment.questions.filter((_, i) => i !== index)
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...newAssignment.questions]
    if (field === 'type' && value === 'code') {
      updatedQuestions[index] = {
        type: 'code',
        question: updatedQuestions[index].question || '',
        codeType: 'html',
        starterCode: { html: '', css: '', javascript: '' },
        expectedOutput: '',
        explanation: ''
      }
    } else if (field === 'type' && value === 'multiple-choice') {
      updatedQuestions[index] = {
        type: 'multiple-choice',
        question: updatedQuestions[index].question || '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    } else {
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    }
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const handleStarterCodeChange = (qIndex: number, lang: 'html' | 'css' | 'javascript', value: string) => {
    const updatedQuestions = [...newAssignment.questions]
    const currentStarterCode = updatedQuestions[qIndex].starterCode || { html: '', css: '', javascript: '' }
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      starterCode: {
        ...currentStarterCode,
        [lang]: value
      }
    }
    setNewAssignment({ ...newAssignment, questions: updatedQuestions })
  }

  const toggleUserAssignment = (userId: string) => {
    const assignedTo = newAssignment.assignedTo.includes(userId)
      ? newAssignment.assignedTo.filter(id => id !== userId)
      : [...newAssignment.assignedTo, userId]
    setNewAssignment({ ...newAssignment, assignedTo })
  }

  const handleCreateQuizAssignment = async () => {
    try {
      if (!newAssignment.title || newAssignment.questions.length === 0 || newAssignment.assignedTo.length === 0 || !newAssignment.deadline) {
        alert('Please fill in all required fields')
        return
      }

      const normalizedQuestions = newAssignment.questions.map((q) => {
        if (q.type === 'code') {
          return {
            type: 'code',
            question: q.question,
            codeType: q.codeType || 'html',
            starterCode: {
              html: q.starterCode?.html || '',
              css: q.starterCode?.css || '',
              javascript: q.starterCode?.javascript || ''
            },
            expectedOutput: q.expectedOutput || '',
            explanation: q.explanation || undefined
          }
        } else {
          return {
            type: 'multiple-choice',
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || 0,
            explanation: q.explanation || undefined
          }
        }
      })

      const assignmentData = {
        ...newAssignment,
        questions: normalizedQuestions
      }

      await api.post('/admin/quiz-assignments', assignmentData)
      fetchQuizAssignments()
      setShowCreateAssignment(false)
      setNewAssignment({
        title: '',
        description: '',
        questions: [],
        passingScore: 7,
        assignedTo: [],
        deadline: ''
      })
      alert('Quiz assignment created successfully!')
    } catch (error: any) {
      console.error('Error creating quiz assignment:', error)
      alert(error.response?.data?.message || 'Error creating quiz assignment')
    }
  }

  return (
    <div className="space-y-6 mt-6">
      {showCreateAssignment && (
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle>Create New Quiz Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="Quiz Assignment Title"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                className="w-full p-2 border rounded-lg"
                rows={3}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Assignment description"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Passing Score (0-10) *</label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={newAssignment.passingScore}
                  onChange={(e) => setNewAssignment({ ...newAssignment, passingScore: parseFloat(e.target.value) || 7 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Deadline *</label>
                <Input
                  type="datetime-local"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assign To Users *</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-2">
                {users.filter(u => u.role !== 'admin').map((user) => (
                  <label key={user._id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={newAssignment.assignedTo.includes(user._id)}
                      onChange={() => toggleUserAssignment(user._id)}
                    />
                    <span>{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Questions *</label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => addQuestion('multiple-choice')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Text Question
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addQuestion('code')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Code Question
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {newAssignment.questions.map((q, qIndex) => (
                  <Card key={qIndex} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Question {qIndex + 1}</span>
                        <select
                          className="text-xs px-2 py-1 border rounded"
                          value={q.type || 'multiple-choice'}
                          onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                        >
                          <option value="multiple-choice">Text Question</option>
                          <option value="code">Code Question</option>
                        </select>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Question text"
                        value={typeof q.question === 'string' ? q.question : ''}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      />
                      {q.type === 'code' ? (
                        <>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Code Type *</label>
                            <select
                              className="w-full p-2 border rounded"
                              value={q.codeType || 'html'}
                              onChange={(e) => updateQuestion(qIndex, 'codeType', e.target.value)}
                            >
                              <option value="html">HTML</option>
                              <option value="css">CSS</option>
                              <option value="javascript">JavaScript</option>
                              <option value="html-css-js">HTML + CSS + JavaScript</option>
                            </select>
                          </div>
                          {q.codeType === 'html-css-js' ? (
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium mb-1 block">HTML Starter Code</label>
                                <textarea
                                  className="w-full p-2 border rounded-lg font-mono text-sm"
                                  rows={4}
                                  placeholder="HTML starter code"
                                  value={q.starterCode?.html || ''}
                                  onChange={(e) => handleStarterCodeChange(qIndex, 'html', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">CSS Starter Code</label>
                                <textarea
                                  className="w-full p-2 border rounded-lg font-mono text-sm"
                                  rows={4}
                                  placeholder="CSS starter code"
                                  value={q.starterCode?.css || ''}
                                  onChange={(e) => handleStarterCodeChange(qIndex, 'css', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">JavaScript Starter Code</label>
                                <textarea
                                  className="w-full p-2 border rounded-lg font-mono text-sm"
                                  rows={4}
                                  placeholder="JavaScript starter code"
                                  value={q.starterCode?.javascript || ''}
                                  onChange={(e) => handleStarterCodeChange(qIndex, 'javascript', e.target.value)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="text-xs font-medium mb-1 block">Starter Code</label>
                              <textarea
                                className="w-full p-2 border rounded-lg font-mono text-sm"
                                rows={6}
                                placeholder={`${q.codeType?.toUpperCase()} starter code`}
                                value={q.starterCode?.[q.codeType as 'html' | 'css' | 'javascript'] || ''}
                                onChange={(e) => {
                                  const lang = q.codeType as 'html' | 'css' | 'javascript'
                                  handleStarterCodeChange(qIndex, lang, e.target.value)
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <label className="text-xs font-medium mb-1 block">Expected Output *</label>
                            <textarea
                              className="w-full p-2 border rounded-lg font-mono text-sm"
                              rows={4}
                              placeholder="Expected output or result"
                              value={q.expectedOutput || ''}
                              onChange={(e) => updateQuestion(qIndex, 'expectedOutput', e.target.value)}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {q.options && q.options.map((opt: string, optIndex: number) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={q.correctAnswer === optIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                                className="w-4 h-4"
                              />
                              <Input
                                placeholder={`Option ${optIndex + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const newOptions = [...(q.options || [])]
                                  newOptions[optIndex] = e.target.value
                                  updateQuestion(qIndex, 'options', newOptions)
                                }}
                              />
                            </div>
                          ))}
                        </>
                      )}
                      <Input
                        placeholder="Explanation (optional)"
                        value={q.explanation || ''}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateQuizAssignment}>
                <Save className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
              <Button variant="outline" onClick={() => {
                setShowCreateAssignment(false)
                setNewAssignment({
                  title: '',
                  description: '',
                  questions: [],
                  passingScore: 7,
                  assignedTo: [],
                  deadline: ''
                })
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Quiz Assignments</h2>
          <Button onClick={() => setShowCreateAssignment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {quizAssignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">No quiz assignments yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizAssignments.map((assignment) => (
              <Card key={assignment._id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Questions: {assignment.questions?.length || 0}</p>
                  <p>Passing Score: {assignment.passingScore}/10</p>
                  <p>Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

