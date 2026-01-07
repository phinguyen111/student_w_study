'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

type HomeCtaKind = 'hero' | 'final'

export function HomeCta({ kind }: { kind: HomeCtaKind }) {
  const { isAuthenticated } = useAuth()

  if (kind === 'hero') {
    return !isAuthenticated ? (
      <Link href="/login">
        <Button
          size="lg"
          className="group w-full sm:w-auto text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    ) : (
      <Link href="/learn">
        <Button
          size="lg"
          className="group w-full sm:w-auto text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
        >
          Continue Learning
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    )
  }

  return !isAuthenticated ? (
    <Link href="/login">
      <Button
        size="lg"
        className="relative text-lg px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
      >
        Start Learning Now
        <Sparkles className="ml-2 h-5 w-5" />
      </Button>
    </Link>
  ) : (
    <Link href="/learn">
      <Button
        size="lg"
        className="relative text-lg px-10 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow"
      >
        Continue Your Journey
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </Link>
  )
}
