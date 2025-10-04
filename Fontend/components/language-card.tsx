import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import type { Language } from "@/lib/mock-api"

interface LanguageCardProps {
  language: Language
}

export function LanguageCard({ language }: LanguageCardProps) {
  return (
    <Link href={`/learn/${language.id}`}>
      <Card className="transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold">{language.name}</CardTitle>
              <CardDescription className="mt-2">{language.summary}</CardDescription>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{language.lessonCount} bài học</span>
            <span className="font-semibold text-primary">{language.progressPct}%</span>
          </div>
          <Progress value={language.progressPct} className="h-2" />
        </CardContent>
      </Card>
    </Link>
  )
}
