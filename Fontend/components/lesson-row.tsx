import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import Link from "next/link"
import type { Lesson } from "@/lib/mock-api"

interface LessonRowProps {
  lesson: Lesson
}

export function LessonRow({ lesson }: LessonRowProps) {
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {lesson.isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-balance">{lesson.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{lesson.durationMin} phút</span>
              </div>
            </div>
            {lesson.isCompleted && (
              <Badge variant="secondary" className="flex-shrink-0">
                Đã hoàn thành
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
