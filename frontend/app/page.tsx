'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import logoImage from '@/components/logo.png'
import api from '@/lib/api'
import {
  BookOpen,
  Target,
  BarChart3,
  Code,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'

interface LeaderboardLearner {
  userId: string
  name: string
  email: string
  totalPoints: number
  averageScore: number
  lessonCount: number
  completedLessons: number
  currentStreak: number
  totalStudyTime: number
  lastUpdated?: string
  rank: number
}

interface LanguageLeaderboard {
  languageId: string
  languageName: string
  languageSlug?: string
  languageIcon?: string
  totalLearners: number
  topLearners: LeaderboardLearner[]
}

interface SelectedLearnerDetails {
  languageName: string
  languageIcon?: string
  learner: LeaderboardLearner
}

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LanguageLeaderboard[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [selectedLearner, setSelectedLearner] = useState<SelectedLearnerDetails | null>(null)
  const [isLearnerDialogOpen, setIsLearnerDialogOpen] = useState(false)

  const features = [
    {
      icon: BookOpen,
      title: 'Learn by Level',
      description: 'Progress through structured levels from basics to advanced, each step designed to build a solid foundation',
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Target,
      title: 'Interactive Quiz',
      description: 'Test your knowledge with quizzes after each lesson, get instant feedback and continuously improve',
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Track your learning streak, time, and achievements with intuitive and detailed dashboards',
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

  const formatStudyTime = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins ? ` ${mins}m` : ''}`
  }

  const formatLastUpdated = (value?: string) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleString()
  }

  useEffect(() => {
    let isMounted = true

    const fetchLeaderboard = async () => {
      try {
        setLeaderboardLoading(true)
        const response = await api.get('/progress/leaderboard', {
          params: { limit: 5 },
        })
        if (isMounted) {
          setLeaderboard(response.data.leaderboard || [])
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        if (isMounted) {
          setLeaderboardLoading(false)
        }
      }
    }

    fetchLeaderboard()

    return () => {
      isMounted = false
    }
  }, [])

  const totalLanguages = leaderboard.length
  const totalTrackedLearners = leaderboard.reduce(
    (sum, language) => sum + (language.totalLearners || 0),
    0
  )
  const averageCommunityScore = (() => {
    let scoreSum = 0
    let count = 0
    leaderboard.forEach((language) => {
      language.topLearners.forEach((learner) => {
        if (typeof learner.averageScore === 'number') {
          scoreSum += learner.averageScore
          count += 1
        }
      })
    })
    return count > 0 ? Number(scoreSum / count).toFixed(1) : '0.0'
  })()
  const bestStreak = leaderboard.reduce((max, language) => {
    const topStreak = language.topLearners.reduce(
      (langMax, learner) => Math.max(langMax, learner.currentStreak || 0),
      0
    )
    return Math.max(max, topStreak)
  }, 0)

  const handleViewLearner = (language: LanguageLeaderboard, learner: LeaderboardLearner) => {
    setSelectedLearner({
      languageName: language.languageName,
      languageIcon: language.languageIcon,
      learner,
    })
    setIsLearnerDialogOpen(true)
  }

  const closeLearnerDialog = () => {
    setIsLearnerDialogOpen(false)
    setSelectedLearner(null)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/50 to-purple-50/50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo with Animation */}
            <div className="inline-block mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-32 h-32 mx-auto bg-background/80 backdrop-blur-sm rounded-full p-4 shadow-lg border border-border/50">
                  <Image
                    src={logoImage}
                    alt="Code Catalyst Logo"
                    width={96}
                    height={96}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Main Heading with Code Background */}
            <div className="relative mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {/* Code Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="code-background-wrapper">
                  <div className="code-background-container">
                    <div className="code-background-text">
                      <span className="code-comment">// Welcome to Code Catalyst</span>
                      <br />
                      <span className="code-keyword">function</span> <span className="code-function">learn</span><span className="code-punctuation">()</span> <span className="code-punctuation">{'{'}</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">const</span> <span className="code-variable">skills</span> <span className="code-operator">=</span> <span className="code-punctuation">[</span><span className="code-string">'HTML'</span><span className="code-punctuation">,</span> <span className="code-string">'CSS'</span><span className="code-punctuation">,</span> <span className="code-string">'JS'</span><span className="code-punctuation">]</span><span className="code-punctuation">;</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">const</span> <span className="code-variable">frameworks</span> <span className="code-operator">=</span> <span className="code-punctuation">[</span><span className="code-string">'React'</span><span className="code-punctuation">,</span> <span className="code-string">'Next.js'</span><span className="code-punctuation">]</span><span className="code-punctuation">;</span>
                      <br />
                      <br />
                      &nbsp;&nbsp;<span className="code-keyword">return</span> <span className="code-variable">skills</span><span className="code-punctuation">.</span><span className="code-function">map</span><span className="code-punctuation">(</span><span className="code-variable">skill</span> <span className="code-operator">{'=>'}</span>
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-function">master</span><span className="code-punctuation">(</span><span className="code-variable">skill</span><span className="code-punctuation">)</span>
                      <br />
                      &nbsp;&nbsp;<span className="code-punctuation">)</span><span className="code-punctuation">;</span>
                      <br />
                      <span className="code-punctuation">{'}'}</span>
                      <br />
                      <br />
                      <span className="code-keyword">const</span> <span className="code-variable">catalyst</span> <span className="code-operator">=</span> <span className="code-keyword">new</span> <span className="code-class">CodeCatalyst</span><span className="code-punctuation">()</span><span className="code-punctuation">;</span>
                      <br />
                      <span className="code-variable">catalyst</span><span className="code-punctuation">.</span><span className="code-function">startLearning</span><span className="code-punctuation">()</span><span className="code-punctuation">;</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="relative z-10 text-6xl md:text-7xl font-bold">
                <span className="code-catalyst-text cursor-pointer">
                  Code Catalyst
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Master Full Stack Web Development
            </p>
            <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
              Learn HTML, CSS, JavaScript, and modern frameworks through interactive lessons, hands-on coding, and real-world projects
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
              {!isAuthenticated ? (
                <Link href="/login">
                  <Button size="lg" className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/learn">
                  <Button size="lg" className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                    Continue Learning
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Leaderboard Section */}
      <section className="py-24 px-4 bg-background/70 dark:bg-background/50">
        <div className="container mx-auto">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs tracking-[0.4em] text-primary">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  COMMUNITY
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(185_80%_45%)] via-[hsl(210_60%_55%)] to-[hsl(250_60%_55%)] bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-xl relative z-10 pb-1">
                Language Leaderboard
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                Discover top performers for each language, follow their progress, and get inspired by their learning journey.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground border rounded-2xl px-4 py-3 bg-card/70 shadow-sm">
              <Users className="h-5 w-5 text-primary" />
              <span className="max-w-xs">
                Tracking progress across the entire Code Catalyst community in real time.
              </span>
            </div>
          </div>

          {!leaderboardLoading && leaderboard.length > 0 && (
            <div className="grid gap-4 md:grid-cols-4 mb-10">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                <CardHeader className="p-4 pb-1">
                  <CardDescription>Total languages</CardDescription>
                  <CardTitle className="text-3xl">{totalLanguages}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/20">
                <CardHeader className="p-4 pb-1">
                  <CardDescription>Learners tracked</CardDescription>
                  <CardTitle className="text-3xl">{totalTrackedLearners}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/20">
                <CardHeader className="p-4 pb-1">
                  <CardDescription>Community avg. score</CardDescription>
                  <CardTitle className="text-3xl">{averageCommunityScore}/10</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary/20">
                <CardHeader className="p-4 pb-1">
                  <CardDescription>Longest streak</CardDescription>
                  <CardTitle className="text-3xl">{bestStreak} days</CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {leaderboardLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-48 rounded-2xl border-2 border-dashed border-border/60 bg-card/40 animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
                <CardTitle>No leaderboard data yet</CardTitle>
                <CardDescription>
                  Start learning to claim your spot on the global leaderboard.
                </CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={leaderboard[0]?.languageId} className="w-full">
              <TabsList className="flex w-full overflow-x-auto rounded-full">
                {leaderboard.map((language) => (
                  <TabsTrigger
                    key={language.languageId}
                    value={language.languageId}
                    className="flex-1 min-w-[150px] whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    {language.languageName}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {language.totalLearners} learners
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {leaderboard.map((language) => (
                <TabsContent key={language.languageId} value={language.languageId} className="mt-6">
                  <Card className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Top learners in {language.languageName}
                          </CardTitle>
                          <CardDescription>
                            Showing top {language.topLearners.length} of {language.totalLearners} active learners
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {language.topLearners.map((learner) => (
                          <div
                            key={`${language.languageId}-${learner.userId}`}
                            className="flex flex-col gap-4 rounded-2xl border bg-card/70 p-4 md:flex-row md:items-center md:justify-between hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                #{learner.rank}
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-foreground">{learner.name}</p>
                                <p className="text-sm text-muted-foreground">{learner.email}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                                  <span>Avg score: {learner.averageScore.toFixed(1)}/10</span>
                                  <span>{learner.completedLessons} lessons completed</span>
                                  <span>Streak: {learner.currentStreak} days</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  {learner.lessonCount > 0 
                                    ? (learner.totalPoints / learner.lessonCount).toFixed(1) 
                                    : '0.0'
                                  } pts
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {learner.lessonCount} lessons scored
                                </p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleViewLearner(language, learner)}>
                                View profile
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="code-catalyst-text cursor-pointer">Code Catalyst</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become a full-stack developer, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-6 h-6 text-primary" />
                <h3 className="text-3xl font-bold">Hands-On Coding</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Practice coding directly in your browser with our integrated code editor. Write, test, and debug code in real-time without leaving the platform.
              </p>
              <ul className="space-y-3">
                {['Live code execution', 'Syntax highlighting', 'Error detection', 'Instant feedback'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-primary" />
                <h3 className="text-3xl font-bold">Learn at Your Pace</h3>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Flexible learning paths that adapt to your schedule. Learn when you want, where you want, at the speed that works for you.
              </p>
              <ul className="space-y-3">
                {['Self-paced courses', 'Progress tracking', 'Learning streaks', 'Achievement badges'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-cyan-50/50 via-blue-50/50 to-purple-50/50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto text-center max-w-3xl">
          <Award className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey with <span className="code-catalyst-text cursor-pointer">Code Catalyst</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers learning full-stack web development with Code Catalyst
          </p>
          {!isAuthenticated ? (
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                Start Learning Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/learn">
              <Button size="lg" className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300">
                Continue Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      <AlertDialog
        open={isLearnerDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeLearnerDialog()
          } else {
            setIsLearnerDialogOpen(open)
          }
        }}
      >
        {selectedLearner && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {selectedLearner.learner.name}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Leaderboard rank #{selectedLearner.learner.rank} for{' '}
                {selectedLearner.languageName}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Email</p>
                  <p className="font-semibold break-all">{selectedLearner.learner.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Language</p>
                  <p className="font-semibold">{selectedLearner.languageName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-muted-foreground text-xs uppercase">Average score</p>
                  <p className="text-xl font-semibold">
                    {selectedLearner.learner.averageScore.toFixed(2)}/10
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-muted-foreground text-xs uppercase">Average points</p>
                  <p className="text-xl font-semibold">
                    {selectedLearner.learner.lessonCount > 0
                      ? (selectedLearner.learner.totalPoints / selectedLearner.learner.lessonCount).toFixed(2)
                      : '0.00'
                    } pts
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg border">
                  <p className="text-muted-foreground text-xs uppercase">Lessons scored</p>
                  <p className="text-lg font-semibold">{selectedLearner.learner.lessonCount}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-muted-foreground text-xs uppercase">Lessons completed</p>
                  <p className="text-lg font-semibold">
                    {selectedLearner.learner.completedLessons}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Current streak</p>
                  <p className="font-semibold">
                    {selectedLearner.learner.currentStreak} day
                    {selectedLearner.learner.currentStreak === 1 ? '' : 's'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Study time</p>
                  <p className="font-semibold">
                    {formatStudyTime(selectedLearner.learner.totalStudyTime)}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Last active: {formatLastUpdated(selectedLearner.learner.lastUpdated?.toString())}
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogAction onClick={closeLearnerDialog}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  )
}



