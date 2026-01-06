'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useTheme } from 'next-themes'
import { Copy, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const { theme } = useTheme()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [styles, setStyles] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    import('react-syntax-highlighter/dist/cjs/styles/prism').then((mod) => {
      setStyles({
        dark: mod.vscDarkPlus,
        light: mod.oneLight
      })
    })
  }, [])

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!mounted || !styles) {
    // Fallback while loading
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    )
  }

  const currentStyle = theme === 'dark' ? styles.dark : styles.light

  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={{
          // Headings with anchor links
          h1: ({ node, ...props }) => (
            <h1 
              id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
              className="text-4xl font-bold mt-8 mb-4 text-foreground scroll-mt-20"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2 
              id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
              className="text-3xl font-bold mt-6 mb-3 text-foreground scroll-mt-20 border-b border-border pb-2"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 
              id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
              className="text-2xl font-semibold mt-4 mb-2 text-foreground scroll-mt-20"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-base font-semibold mt-2 mb-2 text-foreground" {...props} />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-base leading-7 mb-4 text-foreground" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 mb-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-base leading-7 text-foreground" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a 
              className="text-primary underline hover:text-primary/80 transition-colors font-medium" 
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Code blocks with syntax highlighting
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const codeString = String(children).replace(/\n$/, '')
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`

            if (!inline && match) {
              return (
                <div className="relative my-6 group">
                  <div className="absolute top-3 right-3 z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeString, codeId)}
                      className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedCode === codeId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    language={match[1]}
                    style={currentStyle}
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              )
            }

            // Inline code
            return (
              <code 
                className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono text-foreground"
                {...props}
              >
                {children}
              </code>
            )
          },

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground bg-muted/50 py-2 rounded-r"
              {...props}
            />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-border rounded-lg" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border hover:bg-muted/50 transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold text-foreground" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-border px-4 py-2 text-foreground" {...props} />
          ),

          // Images
          img: ({ node, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="rounded-lg my-6 shadow-lg max-w-full h-auto border border-border"
              alt={alt || ''}
              {...props}
            />
          ),

          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t border-border" {...props} />
          ),

          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),

          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

