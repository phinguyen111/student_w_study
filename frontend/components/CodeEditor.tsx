'use client'

import { useEffect, useState, useMemo } from 'react'
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

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  placeholder?: string
  readOnly?: boolean
  showErrors?: boolean
  onErrorsChange?: (errors: any[]) => void
}

const languageExtensions: Record<string, any> = {
  html: html(),
  css: css(),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  python: python(),
  java: java(),
  cpp: cpp(),
  c: cpp(),
  csharp: cpp(),
  go: cpp(),
  rust: rust(),
  ruby: javascript(),
  php: php(),
  swift: cpp(),
  kotlin: java(),
  r: javascript(),
  sql: sql(),
  bash: javascript(),
  powershell: javascript(),
  'html-css-js': html(),
}

// Custom light theme similar to W3Schools
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
  '.cm-foldGutter': {
    width: '14px',
  },
  '.cm-scroller': {
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  },
}, { dark: false })

// Enhanced dark theme
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

export function CodeEditor({
  value,
  onChange,
  language,
  height = '400px',
  placeholder = 'Write your code here...',
  readOnly = false,
  showErrors = true,
  onErrorsChange,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [errors, setErrors] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsDark(theme === 'dark')
    }
  }, [theme, mounted])

  // Validate code and collect errors
  useEffect(() => {
    if (!showErrors || !mounted) return

    const validateCode = () => {
      const newErrors: any[] = []
      
      if (language === 'html' || language === 'html-css-js') {
        const openTags: string[] = []
        const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
        let match
        
        while ((match = tagRegex.exec(value)) !== null) {
          const tagName = match[1].toLowerCase()
          const isClosing = match[0].startsWith('</')
          
          if (isClosing) {
            const lastOpen = openTags.lastIndexOf(tagName)
            if (lastOpen === -1) {
              newErrors.push({
                line: value.substring(0, match.index).split('\n').length,
                message: `Closing tag </${tagName}> without matching opening tag`,
                severity: 'error'
              })
            } else {
              openTags.splice(lastOpen, 1)
            }
          } else if (!match[0].endsWith('/>')) {
            const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
            if (!voidElements.includes(tagName)) {
              openTags.push(tagName)
            }
          }
        }
        
        openTags.forEach(tagName => {
          newErrors.push({
            line: value.split(`<${tagName}`).length - 1,
            message: `Unclosed <${tagName}> tag`,
            severity: 'warning'
          })
        })
      }
      
      if (language === 'css') {
        const totalOpen = (value.match(/\{/g) || []).length
        const totalClose = (value.match(/\}/g) || []).length
        if (totalOpen !== totalClose) {
          newErrors.push({
            line: 1,
            message: `Unbalanced braces: ${totalOpen} opening, ${totalClose} closing`,
            severity: 'error'
          })
        }
      }
      
      if (language === 'javascript' || language === 'typescript') {
        try {
          new Function(value)
        } catch (e: any) {
          const match = e.message.match(/line (\d+)/i)
          const lineNum = match ? parseInt(match[1]) : 1
          newErrors.push({
            line: lineNum,
            message: e.message || 'Syntax error',
            severity: 'error'
          })
        }
        
        const openBraces = (value.match(/\{/g) || []).length
        const closeBraces = (value.match(/\}/g) || []).length
        if (openBraces !== closeBraces) {
          newErrors.push({
            line: 1,
            message: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`,
            severity: 'error'
          })
        }
      }
      
      setErrors(newErrors)
      if (onErrorsChange) {
        onErrorsChange(newErrors)
      }
    }

    const timeoutId = setTimeout(validateCode, 500)
    return () => clearTimeout(timeoutId)
  }, [value, language, showErrors, mounted, onErrorsChange])

  const themeExtension = useMemo(() => {
    return isDark ? [oneDark, darkThemeEnhanced] : [lightTheme]
  }, [isDark])

  const extensions = useMemo(() => {
    const baseExtensions = [
      languageExtensions[language] || languageExtensions.javascript,
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ 'data-gramm': 'false' }), // Disable Grammarly
    ]
    return baseExtensions
  }, [language])

  if (!mounted) {
    return (
      <div 
        className="w-full border rounded-lg bg-[hsl(220_40%_96%)] dark:bg-[hsl(220_30%_10%)] font-mono text-sm"
        style={{ height, padding: '1rem' }}
      >
        <div className="text-muted-foreground">{placeholder}</div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="border rounded-lg overflow-hidden shadow-sm">
      <CodeMirror
        value={value}
        height={height}
        theme={themeExtension}
          extensions={extensions}
        onChange={onChange}
        placeholder={placeholder}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightSelectionMatches: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: true,
          searchKeymap: true,
          lintKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          defaultKeymap: true,
          historyKeymap: true,
          drawSelection: true,
            tabSize: 2,
        }}
      />
      </div>
    </div>
  )
}
