'use client'

import { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { php } from '@codemirror/lang-php'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Play, RotateCcw, Download, Copy, Check } from 'lucide-react'
import api from '@/lib/api'

export type SupportedLanguage = 
  | 'python' 
  | 'javascript' 
  | 'typescript'
  | 'java' 
  | 'cpp' 
  | 'c'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'kotlin'
  | 'r'
  | 'sql'
  | 'bash'
  | 'powershell'
  | 'html'
  | 'css'

interface MultiLanguageCodeEditorProps {
  defaultLanguage?: SupportedLanguage
  defaultCode?: string
  onCodeChange?: (code: string) => void
  onLanguageChange?: (language: SupportedLanguage) => void
  showLanguageSelector?: boolean
  readOnly?: boolean
  height?: string
  starterCode?: string
}

const languageExtensions: Record<string, any> = {
  python: python(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  csharp: cpp(), // Similar syntax
  go: cpp(), // Similar syntax
  rust: rust(),
  ruby: javascript(), // Fallback
  php: php(),
  swift: cpp(), // Fallback
  kotlin: java(),
  r: javascript(), // Fallback
  sql: sql(),
  bash: javascript(), // Fallback
  powershell: javascript(), // Fallback
  html: html(),
  css: css(),
}

const languageInfo: Record<SupportedLanguage, { name: string; extension: string; placeholder: string }> = {
  python: { name: 'Python', extension: '.py', placeholder: 'print("Hello, World!")' },
  javascript: { name: 'JavaScript', extension: '.js', placeholder: 'console.log("Hello, World!");' },
  typescript: { name: 'TypeScript', extension: '.ts', placeholder: 'console.log("Hello, World!");' },
  java: { name: 'Java', extension: '.java', placeholder: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}' },
  cpp: { name: 'C++', extension: '.cpp', placeholder: '#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}' },
  c: { name: 'C', extension: '.c', placeholder: '#include <stdio.h>\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}' },
  csharp: { name: 'C#', extension: '.cs', placeholder: 'using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine("Hello, World!");\n  }\n}' },
  go: { name: 'Go', extension: '.go', placeholder: 'package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, World!")\n}' },
  rust: { name: 'Rust', extension: '.rs', placeholder: 'fn main() {\n  println!("Hello, World!");\n}' },
  ruby: { name: 'Ruby', extension: '.rb', placeholder: 'puts "Hello, World!"' },
  php: { name: 'PHP', extension: '.php', placeholder: '<?php\necho "Hello, World!";\n?>' },
  swift: { name: 'Swift', extension: '.swift', placeholder: 'print("Hello, World!")' },
  kotlin: { name: 'Kotlin', extension: '.kt', placeholder: 'fun main() {\n  println("Hello, World!")\n}' },
  r: { name: 'R', extension: '.r', placeholder: 'print("Hello, World!")' },
  sql: { name: 'SQL', extension: '.sql', placeholder: 'SELECT "Hello, World!";' },
  bash: { name: 'Bash', extension: '.sh', placeholder: '#!/bin/bash\necho "Hello, World!"' },
  powershell: { name: 'PowerShell', extension: '.ps1', placeholder: 'Write-Host "Hello, World!"' },
  html: { name: 'HTML', extension: '.html', placeholder: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>' },
  css: { name: 'CSS', extension: '.css', placeholder: 'body {\n  background-color: #f0f0f0;\n}' },
}

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  '.cm-content': {
    caretColor: '#333333',
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#333333',
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: '#b3d4fc',
  },
  '.cm-activeLine': {
    backgroundColor: '#f5f5f5',
  },
  '.cm-gutters': {
    backgroundColor: '#f8f8f8',
    color: '#999999',
    border: 'none',
    borderRight: '1px solid #e0e0e0',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    minWidth: '3ch',
    padding: '0 8px 0 8px',
  },
  '.cm-scroller': {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  },
}, { dark: false })

const darkThemeEnhanced = EditorView.theme({
  '&': {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
  },
  '.cm-content': {
    caretColor: '#d4d4d4',
  },
  '.cm-focused .cm-cursor': {
    borderLeftColor: '#d4d4d4',
  },
  '.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: '#264f78',
  },
  '.cm-activeLine': {
    backgroundColor: '#2a2d2e',
  },
  '.cm-gutters': {
    backgroundColor: '#252526',
    color: '#858585',
    border: 'none',
    borderRight: '1px solid #3e3e42',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    minWidth: '3ch',
    padding: '0 8px 0 8px',
  },
}, { dark: true })

export function MultiLanguageCodeEditor({
  defaultLanguage = 'python',
  defaultCode = '',
  onCodeChange,
  onLanguageChange,
  showLanguageSelector = true,
  readOnly = false,
  height = '400px',
  starterCode,
}: MultiLanguageCodeEditorProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage)
  const [code, setCode] = useState(defaultCode || starterCode || languageInfo[defaultLanguage].placeholder)
  const [output, setOutput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsDark(theme === 'dark')
    }
  }, [theme, mounted])

  useEffect(() => {
    if (starterCode) {
      setCode(starterCode)
    }
  }, [starterCode])

  const handleCodeChange = (value: string) => {
    setCode(value)
    onCodeChange?.(value)
  }

  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
    // Optionally set placeholder code for new language
    if (!code || code === languageInfo[language].placeholder) {
      setCode(languageInfo[newLanguage].placeholder)
    }
  }

  const handleReset = () => {
    setCode(starterCode || languageInfo[language].placeholder)
    setOutput('')
    setError('')
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code${languageInfo[language].extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRun = async () => {
    setIsRunning(true)
    setOutput('')
    setError('')

    try {
      const response = await api.post('/code/execute', {
        code,
        language,
      })

      if (response.data.success) {
        setOutput(response.data.output || '')
        if (response.data.error) {
          setError(response.data.error)
        }
      } else {
        setError(response.data.error || 'Execution failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to execute code')
    } finally {
      setIsRunning(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Loading editor…
      </div>
    )
  }

  const currentExtension = languageExtensions[language] || javascript()
  const editorTheme = isDark ? [oneDark, darkThemeEnhanced] : [lightTheme]

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showLanguageSelector && (
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            disabled={readOnly}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="r">R</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="powershell">PowerShell</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={readOnly}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={readOnly}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={readOnly}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={handleRun} disabled={isRunning || readOnly}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="border rounded-lg overflow-hidden">
        <CodeMirror
          value={code}
          height={height}
          extensions={[currentExtension, EditorView.lineWrapping]}
          theme={editorTheme}
          onChange={handleCodeChange}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* Terminal Output */}
      {(output || error) && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-2 border-b">
            <span className="text-sm font-medium">Terminal Output</span>
          </div>
          <div className="bg-black text-green-400 font-mono text-sm p-4 min-h-[150px] max-h-[300px] overflow-auto">
            {output && (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
            {error && (
              <pre className="text-red-400 whitespace-pre-wrap mt-2">{error}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
