'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Lock, CheckCircle2 } from 'lucide-react'

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

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
        {language.name}
      </h1>
      <div className="space-y-4">
        {language.levels.map((level) => (
          <Card key={level._id} className={!level.isUnlocked ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Level {level.levelNumber}: {level.title}
                  </CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {level.isUnlocked ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>
              {level.averageScore > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Average score: {level.averageScore.toFixed(1)}/10
                </p>
              )}
            </CardHeader>
            <CardContent>
              {level.isUnlocked ? (
                <Link href={`/learn/${params.langId}/level/${level._id}`}>
                  <Button>View Lessons</Button>
                </Link>
              ) : (
                <Button disabled>Locked - Complete previous level</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



