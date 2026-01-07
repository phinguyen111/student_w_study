'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Layers } from 'lucide-react'

interface Lesson {
  _id: string
  lessonNumber: number
  title: string
  levelId: {
    _id: string
    title: string
    levelNumber: number
  }
}

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && params.levelId) {
      fetchLessons()
    }
  }, [isAuthenticated, params.levelId])

  const fetchLessons = async () => {
    try {
      const response = await api.get(`/lessons/level/${params.levelId}?lang=en`)
      setLessons(response.data.lessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoadingLessons(false)
    }
  }

  if (loading || loadingLessons) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const levelMeta = lessons[0]?.levelId
  const levelTitle = levelMeta?.title
  const levelNumber = levelMeta?.levelNumber

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href={`/learn/${params.langId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Levels
          </Button>
        </Link>

        {/* Header (match learning pages) */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="inline-block text-4xl md:text-5xl font-bold mb-4 pb-1 leading-[1.12] bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
                {levelTitle || 'Lessons'}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Pick a lesson to continue your level journey.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                {typeof levelNumber === 'number' && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Layers className="h-4 w-4" />
                    Level {levelNumber}
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground">
                  <BookOpen className="h-4 w-4" />
                  {lessons.length} Lessons
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline / Steps (roadmap) */}
        <div className="relative pl-12 md:pl-16">
          <div className="absolute left-5 md:left-7 top-2 bottom-2 w-px bg-border/70" />

          <div className="grid gap-5">
            {lessons.map((lesson) => (
              <div key={lesson._id} className="relative">
                {/* Step marker */}
              

                {/* Step card */}
                <Card className="relative overflow-hidden border border-border/60 bg-card/80 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                  <CardContent className="relative p-6 md:p-7">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">
                          Lesson {lesson.lessonNumber}
                        </p>
                        <CardTitle className="mt-2 text-xl md:text-2xl leading-snug overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {lesson.title}
                        </CardTitle>
                      </div>

                      <div className="md:shrink-0">
                        <Link href={`/learn/${params.langId}/lesson/${lesson._id}`} className="flex">
                          <Button className="w-full md:w-auto group border border-primary/25">
                            Start Lesson
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



