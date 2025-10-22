"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, User } from "lucide-react"
import { useState, useTransition } from "react"

interface UserRoleToggleProps {
  userId: string
  currentRole: "student" | "admin"
}

export function UserRoleToggle({ userId, currentRole }: UserRoleToggleProps) {
  const [role, setRole] = useState(currentRole)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const toggleRole = () => {
    const newRole = role === "admin" ? "student" : "admin"

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        })

        if (!response.ok) throw new Error("Failed to update role")

        setRole(newRole)
        toast({
          title: "Đã cập nhật vai trò",
          description: `Người dùng hiện là ${newRole === "admin" ? "quản trị viên" : "học viên"}`,
        })
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật vai trò. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Button
      onClick={toggleRole}
      disabled={isPending}
      variant={role === "admin" ? "default" : "outline"}
      size="sm"
      className="gap-2"
    >
      {role === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
      {role === "admin" ? "Admin" : "Student"}
    </Button>
  )
}
