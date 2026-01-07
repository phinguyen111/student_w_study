'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lock, CheckCircle2, ArrowRight, Layers, BookOpen } from 'lucide-react'

interface Level {
  _id: string
  levelNumber: number
  title: string
  description: string
  isUnlocked: boolean
  averageScore: number
  lessons: any[]
}

interface Language {
  _id: string
  name: string
  levels: Level[]
}

export default function LanguagePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [language, setLanguage] = useState<Language | null>(null)
  const [loadingLang, setLoadingLang] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  const fetchLanguage = useCallback(async () => {
    try {
      setLoadingLang(true)
      const response = await api.get(`/languages/${params.langId}?lang=en`)
      setLanguage(response.data.language)
    } catch (error) {
      console.error('Error fetching language:', error)
    } finally {
      setLoadingLang(false)
    }
  }, [params.langId])

  useEffect(() => {
    if (isAuthenticated && params.langId) {
      fetchLanguage()
    }
  }, [isAuthenticated, params.langId, fetchLanguage])

  if (loading || loadingLang) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!language) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Language not found</p>
      </div>
    )
  }

  const totalLessons = language.levels.reduce((sum, level) => sum + (level.lessons?.length || 0), 0)
  const completedLevels = language.levels.filter(level => level.isUnlocked && level.averageScore >= 9).length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Languages
            </Button>
          </Link>

          <Card className="relative overflow-hidden border border-border/60 bg-card/80 rounded-3xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
            <CardContent className="relative p-6 sm:p-8 md:p-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="inline-block text-3xl sm:text-4xl md:text-5xl font-bold mb-4 pb-1 leading-[1.12] bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
                    {language.name}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Master {language.name} step by step through structured levels and hands-on practice.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                      {language.levels.length} Levels
                    </div>
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground">
                      <BookOpen className="h-4 w-4" />
                      {totalLessons} Lessons
                    </div>
                    {completedLevels > 0 && (
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        {completedLevels} Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Levels */}
        <div className="grid gap-5">
          {language.levels.map((level) => {
            const progress = level.averageScore > 0 ? (level.averageScore / 10) * 100 : 0
            const lessonCount = level.lessons?.length || 0

            return (
              <Card
                key={level._id}
                className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
                  level.isUnlocked
                    ? 'border border-border/60 bg-card/80 shadow-md hover:shadow-xl'
                    : 'border border-border/60 border-dashed bg-card/60 shadow-sm opacity-70'
                }`}
              >
                    {level.isUnlocked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 opacity-0 hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                      </>
                    )}
                    <CardContent className="relative p-6 md:p-7">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                              LEVEL {level.levelNumber}
                            </span>
                            {level.isUnlocked ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <CardTitle className="text-xl sm:text-2xl md:text-3xl leading-snug overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                            {level.title}
                          </CardTitle>
                          <CardDescription className="text-base mt-2 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                            {level.description}
                          </CardDescription>

                          <div className="mt-4 space-y-2">
                            {level.averageScore > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-semibold">{level.averageScore.toFixed(1)}/10</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {lessonCount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {lessonCount} lesson{lessonCount > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="md:shrink-0">
                          {level.isUnlocked ? (
                            <Link href={`/learn/${params.langId}/level/${level._id}`} className="flex">
                              <Button className="w-full md:w-auto group">
                                View Lessons
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          ) : (
                            <Button disabled className="w-full md:w-auto">
                              <Lock className="h-4 w-4 mr-2" />
                              Locked
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
