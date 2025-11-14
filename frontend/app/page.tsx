'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import logoImage from '@/components/logo.png'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <div className="inline-block mb-6">
          <div className="relative w-24 h-24 mx-auto">
            <Image
              src={logoImage}
              alt="Code Catalyst Logo"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent">
          Code Catalyst
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Master Full Stack Web Development
        </p>
        {!isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
          </div>
        ) : (
          <Link href="/learn">
            <Button size="lg">Continue Learning</Button>
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>📚 Learn by Level</CardTitle>
            <CardDescription>
              Progress through structured levels from basics to advanced, each step designed to build a solid foundation
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎯 Interactive Quiz</CardTitle>
            <CardDescription>
              Test your knowledge with quizzes after each lesson, get instant feedback and continuously improve
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Track Progress</CardTitle>
            <CardDescription>
              Track your learning streak, time, and achievements with intuitive and detailed dashboards
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}



