'use client'

import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useTheme } from 'next-themes'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'html' | 'javascript' | 'css' | 'python'
  height?: string
  placeholder?: string
  readOnly?: boolean
}

const languageExtensions = {
  html: html(),
  javascript: javascript(),
  css: css(),
  python: javascript(), // Fallback to JavaScript for Python
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
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsDark(theme === 'dark')
    }
  }, [theme, mounted])

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

  const themeExtension = isDark ? [oneDark, darkThemeEnhanced] : [lightTheme]

  return (
    <div className="relative border rounded-lg overflow-hidden shadow-sm">
      <CodeMirror
        value={value}
        height={height}
        theme={themeExtension}
        extensions={[languageExtensions[language], EditorView.lineWrapping]}
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
        }}
      />
    </div>
  )
}

