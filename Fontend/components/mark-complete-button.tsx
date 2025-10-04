"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Circle } from "lucide-react"
import { useState, useTransition } from "react"

interface MarkCompleteButtonProps {
  lessonId: string
  initialCompleted: boolean
}

export function MarkCompleteButton({ lessonId, initialCompleted }: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const toggleComplete = async () => {
    const newState = !isCompleted

    // Optimistic update
    setIsCompleted(newState)

    startTransition(async () => {
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, markCompleted: newState }),
        })

        if (!response.ok) throw new Error("Failed to update progress")

        toast({
          title: newState ? "Đã đánh dấu hoàn thành" : "Đã bỏ đánh dấu",
          description: newState ? "Tiến độ của bạn đã được cập nhật" : "Bạn có thể học lại bài này",
        })
      } catch (error) {
        // Revert on error
        setIsCompleted(!newState)
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật tiến độ. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Button
      onClick={toggleComplete}
      disabled={isPending}
      variant={isCompleted ? "secondary" : "default"}
      className="gap-2"
    >
      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      {isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
    </Button>
  )
}
