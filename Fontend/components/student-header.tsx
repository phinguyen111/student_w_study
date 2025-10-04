import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export function StudentHeader() {
  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">LearnCode</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/learn">
            <Button variant="ghost">Khóa học</Button>
          </Link>
          <Link href="/me/progress">
            <Button variant="ghost">Tiến độ</Button>
          </Link>
          <Button variant="outline">Đăng nhập</Button>
        </nav>
      </div>
    </header>
  )
}
