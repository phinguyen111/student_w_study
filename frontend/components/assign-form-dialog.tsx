"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { useState } from "react"
import type { FormTemplate, User } from "@/lib/mock-api"

interface AssignFormDialogProps {
  templates: FormTemplate[]
  users: User[]
  defaultTemplateId?: string
  children?: React.ReactNode
}

export function AssignFormDialog({ templates, users, defaultTemplateId, children }: AssignFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [templateId, setTemplateId] = useState(defaultTemplateId || "")
  const [userId, setUserId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateId || !userId || !dueDate || !dueTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const dueAt = new Date(`${dueDate}T${dueTime}:00Z`).toISOString()

      const response = await fetch("/api/admin/forms/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, userId, dueAt }),
      })

      if (!response.ok) throw new Error("Failed to assign form")

      toast({
        title: "Đã giao bài tập",
        description: "Bài tập đã được giao cho học viên",
      })

      setOpen(false)
      setTemplateId(defaultTemplateId || "")
      setUserId("")
      setDueDate("")
      setDueTime("")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể giao bài tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Giao bài tập
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Giao bài tập</DialogTitle>
            <DialogDescription>Chọn mẫu bài tập và học viên để giao bài</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Mẫu bài tập</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Chọn mẫu bài tập" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Học viên</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Chọn học viên" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Ngày hạn nộp</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime">Giờ hạn nộp</Label>
                <Input id="dueTime" type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang giao..." : "Giao bài"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
