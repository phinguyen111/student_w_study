import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, FileText } from "lucide-react"

export default function SubmissionsPage() {
  // Mock submissions data
  const submissions = [
    {
      id: "s1",
      userName: "Nguyễn Văn An",
      templateTitle: "Quiz: HTML Basics",
      submittedAt: "2025-10-14T10:30:00Z",
      score: 85,
      status: "graded" as const,
    },
    {
      id: "s2",
      userName: "Trần Thị Bình",
      templateTitle: "Quiz: HTML Basics",
      submittedAt: "2025-10-14T14:20:00Z",
      score: null,
      status: "pending" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bài nộp</h1>
        <p className="text-muted-foreground mt-1">Xem và chấm điểm bài tập của học viên</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ chấm</SelectItem>
                <SelectItem value="graded">Đã chấm</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Bài tập" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bài tập</SelectItem>
                <SelectItem value="quiz-html-basics">Quiz: HTML Basics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài nộp ({submissions.length})</CardTitle>
          <CardDescription>Xem chi tiết và chấm điểm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {submissions.map((submission) => {
              const submittedDate = new Date(submission.submittedAt)

              return (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{submission.templateTitle}</p>
                        <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                          {submission.status === "graded" ? "Đã chấm" : "Chờ chấm"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Học viên: {submission.userName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {submittedDate.toLocaleDateString("vi-VN")} {submittedDate.toLocaleTimeString("vi-VN")}
                        </div>
                        {submission.score !== null && (
                          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                            <CheckCircle2 className="w-4 h-4" />
                            {submission.score}/100
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    {submission.status === "graded" ? "Xem chi tiết" : "Chấm điểm"}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
