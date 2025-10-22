import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockApi } from "@/lib/mock-api"
import { Search } from "lucide-react"
import { UserRoleToggle } from "@/components/user-role-toggle"

export default async function UsersPage() {
  const users = await mockApi.getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
        <p className="text-muted-foreground mt-1">Xem và quản lý học viên, phân quyền</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm theo tên hoặc email..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="student">Học viên</SelectItem>
                <SelectItem value="admin">Quản trị</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng ({users.length})</CardTitle>
          <CardDescription>Quản lý vai trò và xem tiến độ học tập</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary text-lg">{user.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{user.name}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Quản trị" : "Học viên"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {Object.keys(user.progress).length > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        {Object.entries(user.progress).map(([lang, percent]) => (
                          <span key={lang} className="text-xs text-muted-foreground">
                            {lang.toUpperCase()}: <span className="font-semibold text-primary">{percent}%</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserRoleToggle userId={user.id} currentRole={user.role} />
                  <Button variant="outline" size="sm">
                    Xem chi tiết
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
