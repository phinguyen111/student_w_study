import { Button } from "@/components/ui/button"
import { BookOpen, Code2, GraduationCap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl font-bold text-balance">
              Học lập trình web từ <span className="text-primary">cơ bản</span> đến{" "}
              <span className="text-secondary">nâng cao</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Nền tảng học tập hiện đại với các bài học tương tác, demo code trực tiếp và theo dõi tiến độ chi tiết
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/learn">
                <Button size="lg" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Bắt đầu học
                </Button>
              </Link>
              <Link href="/admin">
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Code2 className="w-5 h-5" />
                  Quản trị
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Bài học chi tiết</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nội dung được biên soạn kỹ lưỡng từ cơ bản đến nâng cao
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                <Code2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Demo tương tác</h3>
              <p className="text-muted-foreground leading-relaxed">
                Thực hành code ngay trong trình duyệt với editor tích hợp
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Theo dõi tiến độ</h3>
              <p className="text-muted-foreground leading-relaxed">
                Đánh dấu hoàn thành và xem tổng quan tiến độ học tập
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025 LearnCode. Nền tảng học lập trình web hiện đại.
        </div>
      </footer>
    </div>
  )
}
