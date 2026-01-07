'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkdownContent } from '@/components/MarkdownContent'
import { DynamicCodeEditor } from '@/components/DynamicCodeEditor'
import { ArrowLeft, Code, Loader2, FileCode, Play, RotateCcw, CheckCircle2, FileText, Palette, Zap, AlertCircle, BookOpen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTimeTracker } from '@/hooks/useTimeTracker'
import { useGATracking } from '@/hooks/useGATracking'
import { detectLanguageFromCode, preprocessListedCode } from '@/lib/codeDetect'

interface OutputRule {
  id?: string
  snippet?: string
  points?: number
  penalty?: number
}

interface Lesson {
  _id: string
  title: string
  codeExercise?: {
    starterCode: string
    language: string
    description?: string | { vi?: string; en?: string }
    outputCriteria?: OutputRule[]
  }
}

export default function CodeExercisePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(true)
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
  const [exerciseDescription, setExerciseDescription] = useState<string>('')
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

  // Extract comment instructions from starter code
  const extractInstructions = (starterCode: string) => {
    if (!starterCode) return ''
    
    // Match HTML comments <!-- ... -->
    const commentMatch = starterCode.match(/<!--\s*([\s\S]*?)\s*-->/)
    if (commentMatch) {
      let instructions = commentMatch[1]
      
      // Remove HTML tags from instructions
      instructions = instructions
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/<[^>]+>/g, '')
        .trim()
      
      return instructions
    }
    
    // Match JavaScript comments /* ... */
    const jsCommentMatch = starterCode.match(/\/\*\s*([\s\S]*?)\s*\*\//)
    if (jsCommentMatch) {
      let instructions = jsCommentMatch[1]
      
      // Remove HTML tags from instructions
      instructions = instructions
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/<[^>]+>/g, '')
        .trim()
      
      return instructions
    }
    
    return ''
  }

  // Remove comments from starter code
  const removeComments = (code: string) => {
    if (!code) return ''
    
    // Remove HTML comments <!-- ... -->
    let cleaned = code.replace(/<!--\s*[\s\S]*?\s*-->/g, '')
    
    // Remove JavaScript multi-line comments /* ... */
    cleaned = cleaned.replace(/\/\*\s*[\s\S]*?\s*\*\//g, '')
    
    // Clean up extra newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim()
    
    return cleaned
  }

  // Clean description: remove all HTML tags and angle brackets
  const escapeDescription = (text: string) => {
    if (!text) return ''
    
    // Split by lines and filter out lines containing "Gợi ý:" with HTML tags
    const lines = text.split('\n')
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim()
      // Remove lines that start with "Gợi ý:" and contain HTML tags
      if (trimmed.toLowerCase().includes('gợi ý:') && /<[^>]+>/.test(trimmed)) {
        return false
      }
      // Remove lines that are just HTML tag suggestions
      if (/^Gợi ý:.*<[^>]+>/.test(trimmed)) {
        return false
      }
      return true
    })
    
    // Join back and remove all HTML tags completely
    let cleaned = cleanedLines.join('\n')
    
    // Remove all HTML tags completely (including attributes)
    cleaned = cleaned
      .replace(/&lt;/g, '') // Remove &lt;
      .replace(/&gt;/g, '') // Remove &gt;
      .replace(/<[^>]+>/g, '') // Remove all <tag> and <tag attr="...">
      .replace(/<[^>]*$/g, '') // Remove incomplete tags at end of line
    
    // Clean up extra spaces and newlines
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces with single space
      .trim()
    
    return cleaned
  }

  // Simple format description - just clean and return
  const formatDescription = (text: string) => {
    if (!text) return ''
    return escapeDescription(text)
  }

  // Auto-update preview when code changes
  useEffect(() => {
    if (lesson?.codeExercise) {
      const lang = lesson.codeExercise.language
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
  }, [code, htmlCode, cssCode, jsCode, activeTab, lesson?.codeExercise?.language])

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
      const response = await api.get(`/lessons/${params.lessonId}?lang=en`)
      const lessonData = response.data.lesson
      console.log('Lesson data:', lessonData)
      console.log('CodeExercise:', lessonData.codeExercise)
      setLesson(lessonData)
      if (lessonData?.codeExercise?.language) {
        setSelectedLanguage(lessonData.codeExercise.language)
        const shouldPreview =
          lessonData.codeExercise.language === 'html' ||
          lessonData.codeExercise.language === 'css' ||
          lessonData.codeExercise.language === 'html-css-js'
        setIoTab(shouldPreview ? 'preview' : 'terminal')
      }
      if (lessonData.codeExercise?.starterCode) {
        const starterCode = lessonData.codeExercise.starterCode
        
        // Get description from codeExercise.description
        if (lessonData.codeExercise.description) {
          const desc = lessonData.codeExercise.description
          // Description is now always a string
          const descriptionText = typeof desc === 'string' 
            ? desc 
            : (typeof desc === 'object' ? (desc.en || desc.vi || '') : '')
          setExerciseDescription(descriptionText)
        }
        
        // Extract instructions from comment
        const instructions = extractInstructions(starterCode)
        setExerciseInstructions(instructions)
        
        // Remove comments from starter code before displaying
        const cleanedStarterCode = removeComments(starterCode)
        
        // Check if it's multi-language format (HTML + CSS + JS)
        if (lessonData.codeExercise.language === 'html-css-js') {
          // Try to parse HTML, CSS, JS from starter code
          const htmlMatch = cleanedStarterCode.match(/<html[^>]*>([\s\S]*?)<\/html>/i) || 
                          cleanedStarterCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
          const cssMatch = cleanedStarterCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
          const jsMatch = cleanedStarterCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
          
          setHtmlCode(htmlMatch ? removeComments(htmlMatch[1]) : cleanedStarterCode)
          setCssCode(cssMatch ? removeComments(cssMatch[1]) : '')
          setJsCode(jsMatch ? removeComments(jsMatch[1]) : '')
          setActiveTab('multi')
        } else {
          setCode(cleanedStarterCode)
          setActiveTab('single')
        }
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

  useEffect(() => {
    const shouldMulti = selectedLanguage === 'html-css-js'
    setActiveTab(shouldMulti ? 'multi' : 'single')
    const shouldPreview = shouldMulti || selectedLanguage === 'html' || selectedLanguage === 'css'
    setIoTab(shouldPreview ? 'preview' : 'terminal')
  }, [selectedLanguage])

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    trackButtonClick('Run Code', window.location.pathname)

    try {
      const currentCodeRaw = activeTab === 'multi' ? combineCode() : code
      const currentCode = preprocessListedCode(currentCodeRaw)
      const lang = selectedLanguage || lesson?.codeExercise?.language || 'html'
      const isPreviewMode = activeTab === 'multi' || lang === 'html-css-js' || lang === 'html' || lang === 'css'
      
      if (isPreviewMode) {
        // Force update preview content
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

        // For HTML, CSS, or multi-language (HTML+CSS+JS), update preview
        setOutput('Preview updated!')
        setIframeKey(prev => prev + 1)
        return
      }

      // Non-preview languages: execute via backend (supports stdin)
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
    if (lesson?.codeExercise?.starterCode) {
      const starterCode = lesson.codeExercise.starterCode
      const cleanedStarterCode = removeComments(starterCode)
      
      if (lesson.codeExercise.language === 'html-css-js') {
        const htmlMatch = cleanedStarterCode.match(/<html[^>]*>([\s\S]*?)<\/html>/i) || 
                         cleanedStarterCode.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        const cssMatch = cleanedStarterCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
        const jsMatch = cleanedStarterCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
        
        setHtmlCode(htmlMatch ? removeComments(htmlMatch[1]) : cleanedStarterCode)
        setCssCode(cssMatch ? removeComments(cssMatch[1]) : '')
        setJsCode(jsMatch ? removeComments(jsMatch[1]) : '')
      } else {
        setCode(cleanedStarterCode)
      }
    }
    setOutput('')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    trackButtonClick('Submit Code', window.location.pathname)
    
    try {
      // Calculate code score based on outputCriteria from database
      let codeScore = 0
      
      // Get the final code (combined or single)
      const finalCode = activeTab === 'multi' ? combineCode() : code
      const codeToCheck = finalCode.toLowerCase()
      
      // Get outputCriteria from lesson
      const outputCriteria = lesson?.codeExercise?.outputCriteria || []
      
      console.log('=== SCORING DEBUG START ===')
      console.log('Code length:', finalCode.length)
      console.log('OutputCriteria count:', outputCriteria.length)
      
      // Step 1: Check if code has errors
      const hasError = output && output.toLowerCase().includes('error')
      if (hasError) {
        codeScore = 0
        console.log('Final score: 0 (has error)')
      } else if (outputCriteria.length === 0) {
        // If no outputCriteria, use basic validation
        const starterCode = lesson?.codeExercise?.starterCode || ''
        const codeChanged = finalCode.trim() !== starterCode.trim()
        codeScore = codeChanged ? 5 : 0 // Default score if changed
        console.log('No outputCriteria, using basic validation. Score:', codeScore)
      } else {
        // Step 2: Evaluate each outputCriteria
        let totalPoints = 0
        let totalPenalty = 0
        
        outputCriteria.forEach((criteria: any, index: number) => {
          const snippet = (criteria.snippet || '').toLowerCase().trim()
          const points = criteria.points || 0
          const penalty = criteria.penalty || 0
          
          if (!snippet) {
            console.log(`Criteria ${index + 1}: Empty snippet, skipping`)
            return
          }
          
          // Check if snippet exists in code
          let snippetFound = false
          
          // If snippet is a simple HTML tag like <a>, <img>, <div>, etc.
          // Check for the tag with or without attributes, with or without spaces
          const simpleTagMatch = snippet.match(/^<(\w+)(\s|>|$)/)
          if (simpleTagMatch) {
            const tagName = simpleTagMatch[1]
            // Create regex to match the tag in various forms:
            // - <tagName> (with closing bracket)
            // - <tagName (with space or attribute after)
            // - <tagName> (self-closing)
            // - <tagName (no space before attribute, like <imgsrc)
            // Use word boundary to avoid matching longer tag names (e.g., <a> should not match <abbr>)
            // But for HTML tags, we need to be more flexible
            const tagRegex = new RegExp(`<${tagName}(?:\\s|>|$|[^>]*>)`, 'i')
            snippetFound = tagRegex.test(codeToCheck)
            
            if (!snippetFound) {
              // Also check for tag name directly (handles cases like <imgsrc="...">)
              // This is a fallback for malformed HTML where there's no space between tag and attribute
              const tagNameRegex = new RegExp(`<${tagName}[^>]*>`, 'i')
              snippetFound = tagNameRegex.test(codeToCheck)
            }
            
            // Additional check: if still not found, try to find the tag name as a substring
            // This handles edge cases like <imgsrc (no closing bracket yet)
            if (!snippetFound) {
              snippetFound = codeToCheck.includes(`<${tagName}`)
            }
          } else {
            // For more complex snippets, use includes check
            snippetFound = codeToCheck.includes(snippet)
          }
          
          if (snippetFound) {
            totalPoints += points
            console.log(`✓ Criteria ${index + 1}: Found "${snippet.substring(0, 50)}..." (+${points} points)`)
          } else {
            totalPenalty += penalty
            console.log(`✗ Criteria ${index + 1}: Not found "${snippet.substring(0, 50)}..." (penalty: ${penalty})`)
          }
        })
        
        // Step 3: Calculate final score (max 10)
        codeScore = Math.max(0, Math.min(10, totalPoints - totalPenalty))
        codeScore = Math.round(codeScore * 10) / 10 // Round to 1 decimal place
        
        console.log(`Total points: ${totalPoints}, Total penalty: ${totalPenalty}`)
        console.log(`Calculated score: ${codeScore}/10`)
          
        // Step 4: Check if code was modified from starter code
        const starterCode = lesson?.codeExercise?.starterCode || ''
        const codeChanged = finalCode.trim() !== starterCode.trim()
        
        if (!codeChanged && codeScore > 0) {
            codeScore = 0
          console.log('Score set to 0 (code not changed from starter)')
        }
      }
      
      console.log('=== FINAL SCORE:', codeScore, '/ 10 ===')
      console.log('=== SCORING DEBUG END ===')
      
      await api.post(`/progress/code/${params.lessonId}`, { 
        codeScore,
        code: finalCode
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
      <div className="min-h-screen bg-background">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
          </CardHeader>
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

              {/* Exercise Instructions and Description - Above Code Editor */}
              {exerciseDescription && (
                <Card className="mb-4">
                  <CardHeader className="pb-3 bg-muted/40 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary text-primary-foreground">
                        <Code className="h-4 w-4" />
                      </div>
                      <span className="text-foreground font-semibold">
                        Yêu cầu bài tập
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="bg-muted/30 p-4 rounded border max-h-[400px] overflow-y-auto space-y-4">
                      {/* Display description if available */}
                        <div className="text-sm text-foreground whitespace-pre-wrap">
                          {formatDescription(exerciseDescription)}
                        </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Code Editor - Full width */}
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
                          onChange={setCssCode}
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
                onChange={(v) => {
                  setCode(v)
                  const detected = detectLanguageFromCode(v)
                  if (detected && detected !== selectedLanguage && detected !== 'html-css-js') {
                    setSelectedLanguage(detected)
                  }
                }}
                language={selectedLanguage}
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
                    <AlertCircle className="h-5 w-5 text-destructive" />
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
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
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
                                ? 'bg-destructive/10 border-destructive/20 text-destructive' 
                                : 'bg-muted/40 border-border text-foreground'
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
                      Submit Code
                    </>
                  )}
                </Button>
              </div>

              {/* Terminal / Preview Tabs */}
              {(() => {
                const lang = selectedLanguage || lesson?.codeExercise?.language || 'html'
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
                            className="w-full p-3 bg-muted/40 rounded-lg border border-border text-sm font-mono"
                            placeholder="Input for your program (optional). Example:\n5\n10\n"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Output:</h3>
                        <div className="p-4 bg-muted/40 text-foreground rounded-lg border border-border font-mono text-sm min-h-[120px]">
                          <pre className="whitespace-pre-wrap">{output || ' '}</pre>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                      {isPreviewMode && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-sm">Preview:</h3>
                          <div className="border border-border rounded-lg overflow-hidden bg-background">
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
