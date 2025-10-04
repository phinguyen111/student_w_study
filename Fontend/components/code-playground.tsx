"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play } from "lucide-react"

interface CodePlaygroundProps {
  heading: string
  html: string
  css: string
  js: string
}

export function CodePlayground({ heading, html, css, js }: CodePlaygroundProps) {
  const [htmlCode, setHtmlCode] = useState(html)
  const [cssCode, setCssCode] = useState(css)
  const [jsCode, setJsCode] = useState(js)
  const [output, setOutput] = useState("")

  const runCode = () => {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
      </html>
    `
    setOutput(fullHtml)
  }

  // Auto-run on mount
  useEffect(() => {
    runCode()
  }, [])

  return (
    <Card className="border-2 border-secondary/20 bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{heading}</span>
          <Button onClick={runCode} size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Chạy
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="mt-4">
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="w-full h-40 p-3 font-mono text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              spellCheck={false}
            />
          </TabsContent>
          <TabsContent value="css" className="mt-4">
            <textarea
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              className="w-full h-40 p-3 font-mono text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              spellCheck={false}
            />
          </TabsContent>
          <TabsContent value="js" className="mt-4">
            <textarea
              value={jsCode}
              onChange={(e) => setJsCode(e.target.value)}
              className="w-full h-40 p-3 font-mono text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              spellCheck={false}
            />
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Kết quả:</h4>
          <div className="border border-border rounded-md bg-background">
            <iframe srcDoc={output} title="Code Preview" sandbox="allow-scripts" className="w-full h-64 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
