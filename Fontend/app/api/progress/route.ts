import { mockApi } from "@/lib/mock-api"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lessonId, markCompleted } = body

    if (!lessonId || typeof markCompleted !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    await mockApi.markLessonComplete(lessonId, markCompleted)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating progress:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
