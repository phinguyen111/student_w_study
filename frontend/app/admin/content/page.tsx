import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockApi } from "@/lib/mock-api"
import { BookOpen, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"

export default async function ContentPage() {
  const languages = await mockApi.getLanguages()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý nội dung</h1>
          <p className="text-muted-foreground mt-1">Tạo và chỉnh sửa khóa học, bài học</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm ngôn ngữ
        </Button>
      </div>

      {/* Languages List */}
      <div className="grid md:grid-cols-2 gap-6">
        {languages.map((language) => (
          <Card key={language.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{language.name}</CardTitle>
                    <CardDescription>{language.summary}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{language.lessonCount} bài học</span>
                <Badge variant="secondary">{language.progressPct}% TB</Badge>
              </div>
              <Link href={`/admin/content/${language.id}`}>
                <Button variant="outline" className="w-full gap-2 bg-transparent">
                  Quản lý bài học
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
