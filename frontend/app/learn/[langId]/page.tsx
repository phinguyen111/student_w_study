'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  useEffect(() => {
    if (isAuthenticated && params.langId) {
      fetchLanguage()
    }
  }, [isAuthenticated, params.langId])

  const fetchLanguage = async () => {
    try {
      const response = await api.get(`/languages/${params.langId}?lang=en`)
      setLanguage(response.data.language)
    } catch (error) {
      console.error('Error fetching language:', error)
    } finally {
      setLoadingLang(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <Link href="/learn">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Languages
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
        {language.name}
      </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Master {language.name} step by step through structured levels and hands-on practice.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                  {language.levels.length} Levels
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} Lessons
                </div>
                {completedLevels > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {completedLevels} Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {language.levels.map((level, index) => {
            const progress = level.averageScore > 0 ? (level.averageScore / 10) * 100 : 0
            const lessonCount = level.lessons?.length || 0
            
            return (
              <Card 
                key={level._id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  !level.isUnlocked 
                    ? 'opacity-60 border-dashed' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                {level.isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                )}
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
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
                      <CardTitle className="text-2xl mb-2">
                        {level.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {level.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
              {level.averageScore > 0 && (
                    <div className="mt-4 space-y-2">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {lessonCount} lesson{lessonCount > 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
                <CardContent className="relative">
              {level.isUnlocked ? (
                <Link href={`/learn/${params.langId}/level/${level._id}`}>
                      <Button className="w-full group">
                        View Lessons
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                </Link>
              ) : (
                    <Button disabled className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Locked - Complete previous level
                    </Button>
              )}
            </CardContent>
          </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}




              <Card 
                key={level._id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  !level.isUnlocked 
                    ? 'opacity-60 border-dashed' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                {level.isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                )}
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
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
                      <CardTitle className="text-2xl mb-2">
                        {level.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {level.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
              {level.averageScore > 0 && (
                    <div className="mt-4 space-y-2">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {lessonCount} lesson{lessonCount > 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
                <CardContent className="relative">
              {level.isUnlocked ? (
                <Link href={`/learn/${params.langId}/level/${level._id}`}>
                      <Button className="w-full group">
                        View Lessons
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                </Link>
              ) : (
                    <Button disabled className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Locked - Complete previous level
                    </Button>
              )}
            </CardContent>
          </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}




              <Card 
                key={level._id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  !level.isUnlocked 
                    ? 'opacity-60 border-dashed' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                {level.isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                )}
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
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
                      <CardTitle className="text-2xl mb-2">
                        {level.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {level.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
              {level.averageScore > 0 && (
                    <div className="mt-4 space-y-2">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {lessonCount} lesson{lessonCount > 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
                <CardContent className="relative">
              {level.isUnlocked ? (
                <Link href={`/learn/${params.langId}/level/${level._id}`}>
                      <Button className="w-full group">
                        View Lessons
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                </Link>
              ) : (
                    <Button disabled className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Locked - Complete previous level
                    </Button>
              )}
            </CardContent>
          </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}




              <Card 
                key={level._id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  !level.isUnlocked 
                    ? 'opacity-60 border-dashed' 
                    : 'border-2 hover:border-primary/50'
                }`}
              >
                {level.isUnlocked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                )}
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
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
                      <CardTitle className="text-2xl mb-2">
                        {level.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {level.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {level.averageScore > 0 && (
                    <div className="mt-4 space-y-2">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      {lessonCount} lesson{lessonCount > 1 ? 's' : ''}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="relative">
                  {level.isUnlocked ? (
                    <Link href={`/learn/${params.langId}/level/${level._id}`}>
                      <Button className="w-full group">
                        View Lessons
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Locked - Complete previous level
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}



