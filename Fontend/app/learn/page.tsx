import { LanguageCard } from "@/components/language-card"
import { mockApi } from "@/lib/mock-api"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default async function LearnPage() {
  const languages = await mockApi.getLanguages()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-balance">Chọn ngôn ngữ lập trình</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Bắt đầu hành trình học lập trình web của bạn với các khóa học từ cơ bản đến nâng cao
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((language) => (
              <LanguageCard key={language.id} language={language} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
