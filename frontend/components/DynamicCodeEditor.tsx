'use client'

import dynamic from 'next/dynamic'

export const DynamicCodeEditor = dynamic(
  () => import('./CodeEditor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  }
)









