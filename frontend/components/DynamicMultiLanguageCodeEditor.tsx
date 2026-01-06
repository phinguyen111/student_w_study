'use client'

import dynamic from 'next/dynamic'

export const DynamicMultiLanguageCodeEditor = dynamic(
  () => import('./MultiLanguageCodeEditor').then((mod) => ({ default: mod.MultiLanguageCodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Loading multi-language code editor…
      </div>
    ),
  }
)
