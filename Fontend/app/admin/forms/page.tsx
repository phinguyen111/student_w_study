import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { mockApi } from "@/lib/mock-api"
import { FileText, Send } from "lucide-react"
import { AssignFormDialog } from "@/components/assign-form-dialog"

export default async function FormsPage() {
  const templates = await mockApi.getFormTemplates()
  const users = await mockApi.getUsers("student")

  // Mock assignments data
  const assignments = [
    {
      id: "a1",
      templateId: "quiz-html-basics",
      userId: "u1",
      userName: "Nguyễn Văn An",
      templateTitle: "Quiz: HTML Basics",
      dueAt: "2025-10-15T15:00:00Z",
      status: "assigned" as const,
    },
    {
      id: "a2",
      templateId: "quiz-html-basics",
      userId: "u2",
      userName: "Trần Thị Bình",
      templateTitle: "Quiz: HTML Basics",
      dueAt: "2025-10-10T15:00:00Z",
      status: "overdue" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bài tập</h1>
          <p className="text-muted-foreground mt-1">Giao bài tập và theo dõi bài nộp</p>
        </div>
        <AssignFormDialog templates={templates} users={users} />
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Mẫu bài tập</TabsTrigger>
          <TabsTrigger value="assignments">Đã giao ({assignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách mẫu bài tập</CardTitle>
              <CardDescription>Các mẫu bài tập có sẵn trong hệ thống</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{template.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{template.fields.length} câu hỏi</p>
                        <div className="flex items-center gap-2 mt-2">
                          {template.fields.map((field) => (
                            <Badge key={field.id} variant="outline" className="text-xs">
                              {field.type === "mcq" ? "Trắc nghiệm" : field.type === "code" ? "Code" : "Văn bản"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Xem chi tiết
                      </Button>
                      <AssignFormDialog templates={templates} users={users} defaultTemplateId={template.id}>
                        <Button size="sm" className="gap-2">
                          <Send className="w-4 h-4" />
                          Giao bài
                        </Button>
                      </AssignFormDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bài tập đã giao</CardTitle>
              <CardDescription>Theo dõi trạng thái và hạn nộp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const dueDate = new Date(assignment.dueAt)
                  const isOverdue = assignment.status === "overdue"

                  return (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{assignment.templateTitle}</p>
                          <Badge variant={isOverdue ? "destructive" : "secondary"}>
                            {assignment.status === "assigned"
                              ? "Đã giao"
                              : assignment.status === "submitted"
                                ? "Đã nộp"
                                : "Quá hạn"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Học viên: {assignment.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          Hạn nộp: {dueDate.toLocaleDateString("vi-VN")} {dueDate.toLocaleTimeString("vi-VN")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Xem chi tiết
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
