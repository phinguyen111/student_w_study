'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Language {
  _id: string
  name: string
  slug: string
  description: string
  icon: string
}

export default function LearnPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [languages, setLanguages] = useState<Language[]>([])
  const [loadingLangs, setLoadingLangs] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchLanguages()
    }
  }, [isAuthenticated])

  const fetchLanguages = async () => {
    try {
      const response = await api.get('/languages?lang=en')
      setLanguages(response.data.languages)
    } catch (error) {
      console.error('Error fetching languages:', error)
    } finally {
      setLoadingLangs(false)
    }
  }

  if (loading || loadingLangs) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen bg-gradient-to-br from-[hsl(185_80%_98%)] via-[hsl(210_60%_98%)] to-[hsl(250_60%_98%)] dark:from-[hsl(220_30%_8%)] dark:via-[hsl(230_30%_10%)] dark:to-[hsl(240_30%_12%)]">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
        Choose a Language
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {languages.map((lang) => (
          <Card key={lang._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">
                {lang.icon} {lang.name}
              </CardTitle>
              <CardDescription>{lang.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/learn/${lang._id}`}>
                <Button className="w-full">Start Learning</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



