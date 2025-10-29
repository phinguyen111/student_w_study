import { StudentHeader } from "@/components/student-header"
import { CodePlayground } from "@/components/code-playground"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { LessonTOC } from "@/components/lesson-toc"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, BookOpen, ScrollText, Zap, Target, Lightbulb } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"
import { Separator } from "@/components/ui/separator"
import { MarkCompleteButton } from "@/components/mark-complete-button"
import { cn } from "@/lib/utils"
import AppFooter from "@/components/layout/AppFooter"
import BareHeartbeatClient from "./BareHeartbeatClient"

export default async function LessonDetailPage({ params }: { params: { langId: string; lessonId: string } }) {
  const { langId, lessonId } = params

  const lessonDetail = await api.getLessonDetail(lessonId).catch(() => null)
  if (!lessonDetail) notFound()

  const currentLevel: number = lessonDetail.level || 1
  const lessons = await api.getLessons(langId, currentLevel)
  const currentIndex = lessons.findIndex((l: any) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  const totalSections: number = (lessonDetail.sections || []).length
  const isCompleted: boolean = !!lessonDetail.isCompleted

  const estimatedTime = Math.ceil(
    (lessonDetail.sections || []).reduce((acc: number, section: any) => {
      const wordCount = (section.content || "").split(/\s+/).length
      return acc + wordCount
    }, 0) / 200,
  )

  return (
    <>
      {/* Heartbeat tracker */}
      <BareHeartbeatClient langId={langId} lessonId={lessonId} />
      <div className="flex flex-col min-h-screen bg-background dark:bg-gray-900">
        <StudentHeader
          lessonTitle={lessonDetail.title}
          courseId={langId}
          isCompleted={isCompleted}
          lessonId={lessonId}
        />

        {/* Progress bar */}
        <div className="sticky top-0 z-40 w-full h-1 bg-border dark:bg-gray-700">
          <div
            className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : "bg-blue-600")}
            style={{ width: isCompleted ? "100%" : "0%" }}
          />
        </div>

        <div className="flex-1 w-full container mx-auto px-4 py-8 md:py-12">
          <div className="grid lg:grid-cols-[1fr_300px] gap-12">
            <main className="space-y-10">
              <div className="pb-6 border-b dark:border-gray-800">
                <Link
                  href={`/learn/${langId}?level=${currentLevel}`}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3 font-medium transition-colors hover:text-blue-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {langId.toUpperCase()} - Level {currentLevel}
                </Link>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-extrabold tracking-tight dark:text-white text-balance">
                      <span className="text-muted-foreground mr-3">#{lessonDetail.order}</span> {lessonDetail.title}
                    </h1>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {estimatedTime} phút đọc
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    {totalSections} mục nội dung
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-sm px-2 py-1 rounded-full",
                      isCompleted
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                  </span>
                </div>
              </div>

              {lessonDetail.objectives && lessonDetail.objectives.length > 0 && (
                <Card className="border-l-4 border-l-blue-600 bg-blue-50/50 dark:bg-blue-900/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Mục tiêu bài học</h3>
                        <ul className="space-y-1.5">
                          {lessonDetail.objectives.map((obj: string, i: number) => (
                            <li key={i} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                              <span className="text-blue-600 font-bold mt-0.5">•</span>
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(lessonDetail.sections || []).map((section: any, i: number) => (
                <div
                  key={i}
                  id={`section-${i}`}
                  className="scroll-mt-24 space-y-6 animate-in fade-in duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Section indicator */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span>
                      Phần {i + 1} của {totalSections}
                    </span>
                  </div>

                  {section.type === "theory" ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <h2 className="text-3xl font-bold border-l-4 border-blue-600 pl-4 mb-4 mt-0">
                        {section.heading}
                      </h2>
                      {section.content && <MarkdownRenderer content={section.content} />}
                    </div>
                  ) : section.type === "demo" && section.demoPayload ? (
                    <Card className="shadow-lg dark:bg-gray-800 border-2 border-blue-300 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/10 border-b border-blue-300">
                          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-300 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Thực hành: {section.heading}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Chỉnh sửa code và nhấn "Chạy" để xem kết quả trực tiếp.
                          </p>
                        </div>
                        <CodePlayground
                          heading={section.heading}
                          html={section.demoPayload.html || ""}
                          css={section.demoPayload.css || ""}
                          js={section.demoPayload.js || ""}
                        />
                      </CardContent>
                    </Card>
                  ) : null}
                </div>
              ))}

              {lessonDetail.keyTakeaways && lessonDetail.keyTakeaways.length > 0 && (
                <>
                  <Separator className="my-12" />
                  <Card className="border-l-4 border-l-green-600 bg-green-50/50 dark:bg-green-900/10">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Những điểm chính</h3>
                          <ul className="space-y-1.5">
                            {lessonDetail.keyTakeaways.map((takeaway: string, i: number) => (
                              <li key={i} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                                <span className="text-green-600 font-bold mt-0.5">✓</span>
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Separator className="my-12" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevLesson ? (
                  <Link href={`/learn/${langId}/${prevLesson.id}`} passHref className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-3 text-left h-auto w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-transparent"
                    >
                      <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">
                        <p className="text-xs text-muted-foreground">Bài trước</p>
                        <p className="font-semibold truncate">{prevLesson.title}</p>
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/${langId}?level=${currentLevel}`} passHref className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 w-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-transparent"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Về Lộ trình
                    </Button>
                  </Link>
                )}

                {nextLesson ? (
                  <Link href={`/learn/${langId}/${nextLesson.id}`} passHref className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="gap-3 group text-right h-auto w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                    >
                      <span className="truncate text-left">
                        <p className="text-xs text-white/80">Bài tiếp theo</p>
                        <p className="font-semibold truncate">{nextLesson.title}</p>
                      </span>
                      <ArrowRight className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/${langId}?level=${currentLevel}`} passHref className="w-full sm:w-auto">
                    <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 w-full transition-colors">
                      <CheckCircle2 className="w-5 h-5" />
                      Hoàn thành Cấp độ
                    </Button>
                  </Link>
                )}
              </div>
            </main>

            <aside className="hidden lg:block relative">
              <div className="sticky top-24 space-y-6">
                <Card
                  className={cn(
                    "shadow-lg border-2 transition-all duration-300",
                    isCompleted
                      ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                      : "border-blue-500/50 dark:bg-gray-800",
                  )}
                >
                  <CardContent className="pt-6 text-center">
                    <CardTitle
                      className={cn(
                        "text-lg flex items-center justify-center gap-2 mb-3",
                        isCompleted ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      {isCompleted ? "Bài học Đã Hoàn thành" : "Đánh Dấu Hoàn Thành"}
                    </CardTitle>
                    <MarkCompleteButton lessonId={lessonId} isCompleted={isCompleted} />
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <CardTitle className="text-lg mb-4 flex items-center gap-2">
                      <ScrollText className="w-5 h-5 text-blue-600" />
                      Mục lục Nội dung
                    </CardTitle>
                    <LessonTOC sections={lessonDetail.sections as any} />
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>

        <AppFooter />
      </div>
    </>
  )
}
