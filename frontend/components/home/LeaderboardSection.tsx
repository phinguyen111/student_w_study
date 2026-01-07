'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Trophy, Users } from 'lucide-react'

interface StudyTimelineEntry {
  date: string
  minutes: number
}

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
  studyTimeline?: StudyTimelineEntry[]
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

export function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LanguageLeaderboard[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [selectedLearner, setSelectedLearner] = useState<SelectedLearnerDetails | null>(null)
  const [isLearnerDialogOpen, setIsLearnerDialogOpen] = useState(false)

  const formatStudyTime = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins ? ` ${mins}m` : ''}`
  }

  const formatTimelineDate = (value?: string) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const formatTimelineMinutes = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '0m'
    if (minutes < 60) return `${minutes}m`
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

    // Fetch after initial paint/hydration (static content already shown)
    fetchLeaderboard()

    return () => {
      isMounted = false
    }
  }, [])

  const totalLanguages = leaderboard.length
  const totalTrackedLearners = useMemo(
    () => leaderboard.reduce((sum, language) => sum + (language.totalLearners || 0), 0),
    [leaderboard]
  )

  const averageCommunityScore = useMemo(() => {
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
  }, [leaderboard])

  const bestStreak = useMemo(
    () =>
      leaderboard.reduce((max, language) => {
        const topStreak = language.topLearners.reduce(
          (langMax, learner) => Math.max(langMax, learner.currentStreak || 0),
          0
        )
        return Math.max(max, topStreak)
      }, 0),
    [leaderboard]
  )

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
    <>
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
                <div
                  key={index}
                  className="h-48 rounded-2xl border-2 border-dashed border-border/60 bg-card/40 animate-pulse"
                />
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
                            <div className="flex flex-1 flex-col gap-3">
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
                            </div>
                            {learner.studyTimeline && learner.studyTimeline.length > 0 && (
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground md:flex-1">
                                {learner.studyTimeline.map((entry, index) => (
                                  <div
                                    key={`${learner.userId}-timeline-${index}`}
                                    className="px-3 py-1 rounded-full bg-muted/50 border border-border/60 flex items-center gap-1"
                                  >
                                    <span className="font-semibold text-foreground">
                                      {formatTimelineDate(entry.date)}
                                    </span>
                                    <span className="text-muted-foreground/80">
                                      • {formatTimelineMinutes(entry.minutes)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-foreground">
                                  {learner.lessonCount > 0
                                    ? (learner.totalPoints / learner.lessonCount).toFixed(1)
                                    : '0.0'}{' '}
                                  pts
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {learner.lessonCount} lessons scored
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLearner(language, learner)}
                              >
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
              <AlertDialogTitle className="text-2xl">{selectedLearner.learner.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Leaderboard rank #{selectedLearner.learner.rank} for {selectedLearner.languageName}
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
                  <p className="text-xl font-semibold">{selectedLearner.learner.averageScore.toFixed(2)}/10</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40">
                  <p className="text-muted-foreground text-xs uppercase">Average points</p>
                  <p className="text-xl font-semibold">
                    {selectedLearner.learner.lessonCount > 0
                      ? (selectedLearner.learner.totalPoints / selectedLearner.learner.lessonCount).toFixed(2)
                      : '0.00'}{' '}
                    pts
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
                  <p className="text-lg font-semibold">{selectedLearner.learner.completedLessons}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Current streak</p>
                  <p className="font-semibold">
                    {selectedLearner.learner.currentStreak} day{selectedLearner.learner.currentStreak === 1 ? '' : 's'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">Study time</p>
                  <p className="font-semibold">{formatStudyTime(selectedLearner.learner.totalStudyTime)}</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Last active: {formatLastUpdated(selectedLearner.learner.lastUpdated?.toString())}
              </div>

              {selectedLearner.learner.studyTimeline && selectedLearner.learner.studyTimeline.length > 0 && (
                <div className="mt-4">
                  <p className="text-muted-foreground text-xs uppercase mb-2">Recent study timeline</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLearner.learner.studyTimeline.map((entry, index) => (
                      <div
                        key={`${selectedLearner.learner.userId}-modal-timeline-${index}`}
                        className="px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-xs"
                      >
                        <span className="font-semibold mr-1">{formatTimelineDate(entry.date)}</span>
                        <span className="text-muted-foreground">• {formatTimelineMinutes(entry.minutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogAction onClick={closeLearnerDialog}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}
