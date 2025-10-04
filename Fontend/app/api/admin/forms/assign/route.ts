import { mockApi } from "@/lib/mock-api"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { templateId, userId, dueAt } = body

    if (!templateId || !userId || !dueAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await mockApi.assignForm(templateId, userId, dueAt)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error assigning form:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
