'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
      const response = await api.get(`/lessons/level/${params.levelId}`)
      setLessons(response.data.lessons)
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoadingLessons(false)
    }
  }

  if (loading || loadingLessons) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Link href={`/learn/${params.langId}`}>
        <Button variant="ghost" className="mb-4">← Quay lại</Button>
      </Link>
      <h1 className="text-4xl font-bold mb-8">Các bài học</h1>
      <div className="space-y-4">
        {lessons.map((lesson) => (
          <Card key={lesson._id}>
            <CardHeader>
              <CardTitle>
                Bài học {lesson.lessonNumber}: {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/learn/${params.langId}/lesson/${lesson._id}`}>
                <Button>Bắt đầu bài học</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}



