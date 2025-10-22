import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  completed: number
  total: number
  percent: number
}

export function ProgressBar({ completed, total, percent }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completed} / {total} bài học
        </span>
        <span className="font-semibold text-primary">{percent}%</span>
      </div>
      <Progress value={percent} className="h-3" />
    </div>
  )
}
