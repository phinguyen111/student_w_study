import { mockApi } from "@/lib/mock-api"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { role } = body

    if (!role || (role !== "student" && role !== "admin")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await mockApi.updateUserRole(userId, role)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
