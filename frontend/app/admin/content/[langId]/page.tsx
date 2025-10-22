import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockApi } from "@/lib/mock-api"
import { ArrowLeft, Clock, Edit, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ContentLangPageProps {
  params: Promise<{ langId: string }>
}

export default async function ContentLangPage({ params }: ContentLangPageProps) {
  const { langId } = await params
  const languages = await mockApi.getLanguages()
  const language = languages.find((l) => l.id === langId)

  if (!language) {
    notFound()
  }

  const lessons = await mockApi.getLessons(langId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/content">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{language.name}</h1>
          <p className="text-muted-foreground mt-1">{language.summary}</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm bài học
        </Button>
      </div>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài học ({lessons.length})</CardTitle>
          <CardDescription>Quản lý nội dung và sections của từng bài học</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{lesson.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {lesson.durationMin} phút
                      </div>
                      {lesson.isCompleted && <Badge variant="secondary">Có demo</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Edit className="w-4 h-4" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
