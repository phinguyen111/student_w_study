import { LessonRow } from "@/components/lesson-row"
import { ProgressBar } from "@/components/progress-bar"
import { mockApi } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, GraduationCap } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface LessonListPageProps {
  params: Promise<{ langId: string }>
}

export default async function LessonListPage({ params }: LessonListPageProps) {
  const { langId } = await params
  const languages = await mockApi.getLanguages()
  const language = languages.find((l) => l.id === langId)

  if (!language) {
    notFound()
  }

  const lessons = await mockApi.getLessons(langId)
  const progress = await mockApi.getUserProgress(langId)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">LearnCode</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/learn">
              <Button variant="ghost">Khóa học</Button>
            </Link>
            <Link href="/me/progress">
              <Button variant="ghost">Tiến độ</Button>
            </Link>
            <Button variant="outline">Đăng nhập</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Khóa học
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{language.name}</span>
          </div>

          {/* Language Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{language.name}</CardTitle>
              <CardDescription className="text-base">{language.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBar completed={progress.completed} total={progress.total} percent={progress.percent} />
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Danh sách bài học</h2>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="completed">Đã hoàn thành</SelectItem>
                  <SelectItem value="incomplete">Chưa hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lessons List */}
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Chưa có bài học nào cho ngôn ngữ này
                </CardContent>
              </Card>
            ) : (
              lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} />)
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
