'use client'

import { useEffect, useState, useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { lintGutter, linter } from '@codemirror/lint'
import { useTheme } from 'next-themes'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'html' | 'javascript' | 'css' | 'python' | 'html-css-js'
  height?: string
  placeholder?: string
  readOnly?: boolean
  showErrors?: boolean
  onErrorsChange?: (errors: any[]) => void
}

// HTML Linter
const htmlLinter = linter((view) => {
  const errors: any[] = []
  const content = view.state.doc.toString()
  
  // Check for unclosed tags
  const openTags: string[] = []
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  let match
  
  while ((match = tagRegex.exec(content)) !== null) {
    const tagName = match[1].toLowerCase()
    const isClosing = match[0].startsWith('</')
    
    if (isClosing) {
      const lastOpen = openTags.lastIndexOf(tagName)
      if (lastOpen === -1) {
        errors.push({
          from: match.index,
          to: match.index + match[0].length,
          severity: 'error',
          message: `Closing tag </${tagName}> without matching opening tag`
        })
      } else {
        openTags.splice(lastOpen, 1)
      }
    } else if (!match[0].endsWith('/>')) {
      // Self-closing tags are handled, but void elements shouldn't be closed
      const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
      if (!voidElements.includes(tagName)) {
        openTags.push(tagName)
      }
    }
  }
  
  // Check for unclosed tags
  openTags.forEach(tagName => {
    const lastIndex = content.lastIndexOf(`<${tagName}`)
    if (lastIndex !== -1) {
      errors.push({
        from: lastIndex,
        to: lastIndex + tagName.length + 1,
        severity: 'warning',
        message: `Unclosed <${tagName}> tag`
      })
    }
  })
  
  // Check for common HTML errors
  if (content.includes('<!DOCTYPE') && !content.includes('<html')) {
    errors.push({
      from: 0,
      to: 10,
      severity: 'warning',
      message: 'Missing <html> tag after DOCTYPE'
    })
  }
  
  return errors
})

// CSS Linter
const cssLinter = linter((view) => {
  const errors: any[] = []
  const content = view.state.doc.toString()
  const lines = content.split('\n')
  
  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim()
    
    // Check for unclosed braces
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    
    // Check for missing semicolons (basic check)
    if (trimmed && !trimmed.endsWith('{') && !trimmed.endsWith('}') && 
        !trimmed.endsWith(';') && !trimmed.startsWith('/*') && 
        !trimmed.startsWith('*') && !trimmed.startsWith('//') &&
        trimmed.includes(':') && !trimmed.includes('@')) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex !== -1 && !trimmed.substring(colonIndex).includes(';')) {
        const lineStart = content.split('\n').slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0)
        errors.push({
          from: lineStart + trimmed.indexOf(':'),
          to: lineStart + trimmed.length,
          severity: 'warning',
          message: 'Missing semicolon'
        })
      }
    }
    
    // Check for invalid property values
    if (trimmed.includes(':') && !trimmed.includes('url(') && !trimmed.includes('calc(')) {
      const parts = trimmed.split(':')
      if (parts.length === 2) {
        const value = parts[1].trim().replace(';', '').trim()
        if (value === '' || value === '{') {
          const lineStart = content.split('\n').slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0)
          errors.push({
            from: lineStart,
            to: lineStart + trimmed.length,
            severity: 'error',
            message: 'Empty CSS property value'
          })
        }
      }
    }
  })
  
  // Check for balanced braces
  const totalOpen = (content.match(/\{/g) || []).length
  const totalClose = (content.match(/\}/g) || []).length
  if (totalOpen !== totalClose) {
    errors.push({
      from: 0,
      to: Math.min(10, content.length),
      severity: 'error',
      message: `Unbalanced braces: ${totalOpen} opening, ${totalClose} closing`
    })
  }
  
  return errors
})

// JavaScript Linter
const jsLinter = linter((view) => {
  const errors: any[] = []
  const content = view.state.doc.toString()
  
  try {
    // Try to parse as JavaScript
    // Use Function constructor to check syntax without executing
    new Function(content)
  } catch (e: any) {
    // Extract line number from error if possible
    const match = e.message.match(/line (\d+)/i)
    const lineNum = match ? parseInt(match[1]) - 1 : 0
    const lines = content.split('\n')
    const lineStart = lines.slice(0, lineNum).join('\n').length + (lineNum > 0 ? 1 : 0)
    const lineEnd = lineStart + (lines[lineNum]?.length || 0)
    
    errors.push({
      from: lineStart,
      to: lineEnd,
      severity: 'error',
      message: e.message || 'Syntax error'
    })
  }
  
  // Check for common JavaScript errors
  const openBraces = (content.match(/\{/g) || []).length
  const closeBraces = (content.match(/\}/g) || []).length
  const openParens = (content.match(/\(/g) || []).length
  const closeParens = (content.match(/\)/g) || []).length
  const openBrackets = (content.match(/\[/g) || []).length
  const closeBrackets = (content.match(/\]/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push({
      from: 0,
      to: Math.min(10, content.length),
      severity: 'error',
      message: `Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`
    })
  }
  
  if (openParens !== closeParens) {
    errors.push({
      from: 0,
      to: Math.min(10, content.length),
      severity: 'error',
      message: `Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`
    })
  }
  
  if (openBrackets !== closeBrackets) {
    errors.push({
      from: 0,
      to: Math.min(10, content.length),
      severity: 'error',
      message: `Unbalanced brackets: ${openBrackets} opening, ${closeBrackets} closing`
    })
  }
  
  return errors
})

const languageExtensions = {
  html: [html(), lintGutter(), htmlLinter],
  javascript: [javascript({ jsx: false }), lintGutter(), jsLinter],
  css: [css(), lintGutter(), cssLinter],
  python: [javascript(), lintGutter(), jsLinter], // Fallback to JavaScript for Python
  'html-css-js': [html(), lintGutter(), htmlLinter], // For combined editing
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
      
      if (language === 'javascript') {
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
      ...(languageExtensions[language] || languageExtensions.html),
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

