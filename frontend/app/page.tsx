// page.tsx (Đã cập nhật)

import { Button } from "@/components/ui/button";
import { BookOpen, Code2, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
// Import các Layout Components mới
import AppHeader from "../components/layout/AppHeader"; 
import AppFooter from "../components/layout/AppFooter"; 

// --- Placeholder Components (Giữ nguyên) ---
const FeaturedCourseCard = ({ langId, name, summary, icon, totalLessons }) => (
  <Link href={`/learn/${langId}`} className="block">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-transparent hover:border-primary/50 shadow-md hover:shadow-xl transition-all duration-300 space-y-3 h-full">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold">
          {icon ? icon[0] : 'C'}
        </div>
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <BarChart3 className="w-4 h-4" />
          {totalLessons} Bài học
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h3>
      <p className="text-muted-foreground line-clamp-2">{summary}</p>
      <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
        Bắt đầu học <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  </Link>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border text-center space-y-4 transition-transform hover:-translate-y-1 hover:shadow-xl dark:border-gray-700">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </div>
)
// --- Hết Placeholder Components ---

const featuredCourses = [
  {
    id: 'html',
    langId: 'html',
    name: 'HTML Cơ Bản',
    summary: 'Nắm vững cấu trúc, thẻ cơ bản, liên kết và hình ảnh để xây dựng nền tảng trang web đầu tiên.',
    icon: 'H',
    totalLessons: 7,
  }
  // Thêm các khóa học khác nếu có
];

export default function HomePage() {
  return (
    
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      
      {/* 1. HEADER (Đã tách) */}
      <AppHeader />

      {/* 2. MAIN CONTENT */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32 text-center bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm ring-1 ring-primary/30 animate-pulse">
              🚀 Khởi động sự nghiệp Lập trình Web của bạn!
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-balance text-gray-900 dark:text-white">
              Học Lập Trình Web <span className="text-primary">Thực Chiến</span>, Nắm Vững <span className="text-secondary">Tương Lai</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              Trải nghiệm học tập hiện đại với các bài giảng chi tiết, môi trường thực hành trực tiếp và lộ trình học tập được cá nhân hóa.
            </p>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="bg-gray-100 dark:bg-gray-800 py-16 md:py-24 border-t border-b">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-sm font-semibold uppercase text-primary">LỘ TRÌNH CHUYÊN SÂU</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Bắt đầu với những khóa học nền tảng nhất
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <FeaturedCourseCard 
                  key={course.id} 
                  {...course} 
                />
              ))}
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                <Link href="/learn" className="text-center space-y-2">
                  <p className="text-lg font-semibold text-primary">Xem tất cả khóa học</p>
                  <ArrowRight className="w-6 h-6 text-primary mx-auto" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
               <span className="text-sm font-semibold uppercase text-secondary">LỢI ÍCH</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Tại Sao Chọn LearnCode?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Chúng tôi không chỉ dạy bạn viết code, chúng tôi giúp bạn tư duy như một lập trình viên.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<BookOpen className="w-8 h-8 text-primary" />}
                title="Bài học chi tiết"
                description="Nội dung được biên soạn kỹ lưỡng, dễ hiểu, đi từ những khái niệm nền tảng đến các chủ đề nâng cao."
              />
              <FeatureCard
                icon={<Code2 className="w-8 h-8 text-secondary" />}
                title="Demo tương tác"
                description="Thực hành code ngay trên trình duyệt với môi trường phát triển tích hợp, không cần cài đặt phức tạp."
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-accent" />}
                title="Theo dõi tiến độ"
                description="Hệ thống tự động ghi nhận và trực quan hóa tiến độ học tập, giúp bạn luôn có động lực để tiến về phía trước."
              />
            </div>
          </div>
        </section>
      </main>

      {/* 3. FOOTER (Đã tách) */}
      <AppFooter />
    </div>
  );
}