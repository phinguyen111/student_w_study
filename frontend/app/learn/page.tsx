import { LanguageCard } from "@/components/language-card" // Giả định component này đã được nâng cấp
import { Button } from "@/components/ui/button"
import { GraduationCap, BookMarked, UserCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils" 
import AppHeader from "@/components/layout/AppHeader"; 
import AppFooter from "@/components/layout/AppFooter"; 

// Giả định có component Avatar (từ shadcn/ui hoặc tương tự)
const Avatar = ({ src, alt }) => (
  <img 
    src={src} 
    alt={alt} 
    className="w-10 h-10 rounded-full border-2 border-primary cursor-pointer transition hover:scale-105" 
  />
)

export default async function LearnPage() {
  // api.getLanguages() giờ trả về cả totalLessons
  const languages = await api.getLanguages()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900"> {/* Đổi màu nền nhẹ nhàng */}
      {/* Header - Nâng cấp */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Banner/Hero Section - Nâng cấp UI/UX */}
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-8 md:p-12 text-center space-y-4 border-2 border-primary/20">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary">
              Bắt Đầu Hành Trình Lập Trình Web
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-4xl mx-auto dark:text-gray-200">
              Chọn một khóa học dưới đây. Mỗi lộ trình được thiết kế chi tiết với lý thuyết, ví dụ trực quan (Demo) và bài tập thực hành. Đảm bảo bạn nắm vững kiến thức từ cơ bản đến nâng cao.
            </p>
            <Link href={languages[0] ? `/learn/${languages[0].id}` : '/learn'} passHref>
              <Button size="lg" className="mt-4 shadow-lg hover:shadow-xl transition-shadow bg-primary text-white hover:bg-primary/90">
                Khám phá Khóa học Đầu tiên <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Ngôn ngữ học tập */}
          <div className="space-y-6 pt-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white border-b pb-2">
              Các Ngôn ngữ & Công nghệ Hiện có
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Truyền thêm totalLessons vào LanguageCard */}
              {languages.map((language, index) => (
                <LanguageCard 
                  key={language.id} 
                  language={language} 
                  totalLessons={language.totalLessons} // Thông tin bổ sung
                  className={cn(
                    "animate-fade-in transition-transform hover:scale-[1.02] hover:shadow-lg",
                    // Giả định animation-delay được xử lý tốt hơn trong CSS
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </div>
          
          {/* Logic: Phần Tiến độ Nổi bật (mô phỏng) */}
          <div className="bg-secondary/20 dark:bg-secondary/30 p-6 rounded-lg border border-secondary shadow-md mt-12">
            <h3 className="text-2xl font-bold text-secondary-foreground flex items-center gap-2">
              <BookMarked className="w-6 h-6" />
              Tiến độ Cá nhân
            </h3>
            <p className="mt-2 text-secondary-foreground/80">
              Bạn đang ở bài 02: Văn bản và định dạng của khóa HTML. Hãy tiếp tục học để hoàn thành mục tiêu.
            </p>
            <Link href="/lessons/html-02-text-formatting" passHref>
              <Button variant="secondary" className="mt-4">
                Tiếp tục học ngay
              </Button>
            </Link>
          </div>
          
        </div>
      </main>

       {/* Footer */}
      <AppFooter />
    </div>
  )
}