import { StudentHeader } from "@/components/student-header"
import { CodePlayground } from "@/components/code-playground"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { LessonTOC } from "@/components/lesson-toc"
import { Button } from "@/components/ui/button"
import { mockApi } from "@/lib/mock-api"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MarkCompleteButton } from "@/components/mark-complete-button"

interface LessonDetailPageProps {
  params: Promise<{ lessonId: string }>
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { lessonId } = await params
  const lessonDetail = await mockApi.getLessonDetail(lessonId)

  if (!lessonDetail) {
    notFound()
  }

  // Extract language from lessonId (e.g., "html-02-tags" -> "html")
  const langId = lessonId.split("-")[0]
  const lessons = await mockApi.getLessons(langId)
  const currentIndex = lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const isCompleted = lessons[currentIndex]?.isCompleted || false

  return (
    <div className="min-h-screen flex flex-col">
      <StudentHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/learn" className="hover:text-foreground transition-colors">
              Khóa học
            </Link>
            <span>/</span>
            <Link href={`/learn/${langId}`} className="hover:text-foreground transition-colors">
              {langId.toUpperCase()}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{lessonDetail.title}</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_280px] gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-balance">{lessonDetail.title}</h1>
                <div className="flex items-center gap-3">
                  <MarkCompleteButton lessonId={lessonId} initialCompleted={isCompleted} />
                </div>
              </div>

              {/* Sections with inline demos */}
              <div className="space-y-8">
                {lessonDetail.sections.map((section, index) => (
                  <div key={index} id={`section-${index}`} className="scroll-mt-24">
                    {section.type === "theory" ? (
                      <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-balance">{section.heading}</h2>
                        {section.content && <MarkdownRenderer content={section.content} />}
                      </div>
                    ) : section.type === "demo" && section.demoPayload ? (
                      <CodePlayground
                        heading={section.heading}
                        html={section.demoPayload.html}
                        css={section.demoPayload.css}
                        js={section.demoPayload.js}
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t">
                {prevLesson ? (
                  <Link href={`/lesson/${prevLesson.id}`}>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <ArrowLeft className="w-4 h-4" />
                      Bài trước
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextLesson ? (
                  <Link href={`/lesson/${nextLesson.id}`}>
                    <Button className="gap-2">
                      Bài tiếp theo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/learn/${langId}`}>
                    <Button className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Hoàn thành khóa học
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar TOC */}
            <aside className="hidden lg:block">
              <LessonTOC sections={lessonDetail.sections} />
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
