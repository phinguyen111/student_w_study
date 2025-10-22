"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LessonSection } from "@/lib/mock-api"

interface LessonTOCProps {
  sections: LessonSection[]
}

export function LessonTOC({ sections }: LessonTOCProps) {
  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-base">Mục lục</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted",
                section.type === "demo" && "text-secondary font-medium",
              )}
            >
              {section.heading}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
