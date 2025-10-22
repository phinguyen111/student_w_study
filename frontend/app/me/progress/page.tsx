import { StudentHeader } from "@/components/student-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { mockApi } from "@/lib/mock-api"
import { BookOpen, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import AppFooter from "@/components/layout/AppFooter"
import AppHeader from "@/components/layout/AppHeader"

export default async function ProgressPage() {
  const languages = await mockApi.getLanguages()

  // Get recent lessons across all languages
  const recentLessons = []
  for (const lang of languages) {
    const lessons = await mockApi.getLessons(lang.id)
    const completed = lessons.filter((l) => l.isCompleted).slice(0, 2)
    recentLessons.push(
      ...completed.map((lesson) => ({
        ...lesson,
        langId: lang.id,
        langName: lang.name,
      })),
    )
  }

  // Calculate overall stats
  const totalLessons = languages.reduce((sum, lang) => sum + lang.lessonCount, 0)
  const completedLessons = Math.round(
    languages.reduce((sum, lang) => sum + (lang.lessonCount * lang.progressPct) / 100, 0),
  )
  const overallPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Hoàn chỉnh */} 
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Tiến độ học tập</h1>
            <p className="text-lg text-muted-foreground">Theo dõi quá trình học tập của bạn</p>
          </div>

          {/* Overall Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng bài học</CardTitle>
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalLessons}</div>
                <p className="text-xs text-muted-foreground mt-1">Trên tất cả các khóa học</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{completedLessons}</div>
                <p className="text-xs text-muted-foreground mt-1">{overallPercent}% tổng tiến độ</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian học</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(completedLessons * 12)}</div>
                <p className="text-xs text-muted-foreground mt-1">Phút đã học</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress by Language */}
          <Card>
            <CardHeader>
              <CardTitle>Tiến độ theo ngôn ngữ</CardTitle>
              <CardDescription>Xem chi tiết tiến độ từng khóa học</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {languages.map((language) => (
                <Link key={language.id} href={`/learn/${language.id}`} className="block group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{language.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((language.lessonCount * language.progressPct) / 100)} / {language.lessonCount} bài
                          học
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary">{language.progressPct}%</span>
                    </div>
                    <Progress value={language.progressPct} className="h-3" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Completed Lessons */}
          {recentLessons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bài học gần đây</CardTitle>
                <CardDescription>Các bài học bạn đã hoàn thành</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLessons.slice(0, 5).map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/lesson/${lesson.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">{lesson.langName}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        {lesson.durationMin} phút
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      {/* Footer Hoàn chỉnh */}
      <AppFooter />
    </div>
  )
}
