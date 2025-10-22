import { StudentHeader } from "@/components/student-header"; // Giả định component này tồn tại
import { CodePlayground } from "@/components/code-playground"; // Giả định component này tồn tại
import { MarkdownRenderer } from "@/components/markdown-renderer"; // Giả định component này tồn tại
import { LessonTOC } from "@/components/lesson-toc"; // Giả định component này tồn tại
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Zap, BookOpen, ScrollText, Loader2, Bug, AlertTriangle, Terminal } from "lucide-react"; // Thêm Terminal
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api"; // Giả định API client tồn tại
import { Separator } from "@/components/ui/separator";
import { MarkCompleteButton } from "@/components/mark-complete-button" // Giả định component này tồn tại
import { cn } from "@/lib/utils"; // Giả định cn utility tồn tại
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";

// Hàm giả định tính toán tiến độ cuộn (chỉ dùng cho UI)
const getScrollProgress = (totalSections: number, lessonId: string) => {
    // Trong môi trường Server Component (Next.js App Router), không thể tính toán scroll thực tế.
    // Đây là một placeholder, trong thực tế sẽ dùng hook client-side.
    return 75; // Giả định 75% cho mục đích hiển thị UI
}

// Thêm prop langId vào params để truy cập đầy đủ path
export default async function LessonDetailPage({ params }: { params: { langId: string, lessonId: string } }) {
  const { langId, lessonId } = params
  // Giả định api.getLessonDetail đã được cập nhật để trả về langId, order, sections và isCompleted
  const lessonDetail = await api.getLessonDetail(lessonId).catch(() => null)
  if (!lessonDetail) notFound()

  // Tải danh sách bài học cùng cấp độ để điều hướng
  const currentLevel = lessonDetail.level || 1; 
  const lessons = await api.getLessons(langId, currentLevel);
  
  const currentIndex = lessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null

  // Tính toán thời gian đọc/học ước tính
  const totalSections = lessonDetail.sections.length;
  const estimatedTimeMinutes = totalSections * 5; // 5 phút/section (mô phỏng)

  // Tính tiến độ giả lập
  const scrollProgress = getScrollProgress(totalSections, lessonId);
  
  // MÔ PHỎNG TRẠNG THÁI LỖI (Giả định trạng thái lỗi do code bị hỏng)
  const isSimulatedError = lessonId === 'html-02-text-formatting' && currentLevel === 1; // Ví dụ: bài này luôn bị lỗi
  
  // Đổi màu chủ đạo thành BLUE-600
  const PRIMARY_COLOR_BASE = 'blue';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Header được tùy chỉnh cho trang học, hiển thị tiêu đề bài học */}
      <StudentHeader 
        lessonTitle={lessonDetail.title}
        courseId={langId}
        isCompleted={lessonDetail.isCompleted} 
        lessonId={lessonId}
      />
      
      {/* Thanh Tiến trình Cố định */}
      <div className="sticky top-0 z-40 w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div 
            className={cn(
                "h-full transition-all duration-500",
                lessonDetail.isCompleted ? "bg-green-500" : `bg-${PRIMARY_COLOR_BASE}-600` // Màu nền chủ đạo
            )}
            style={{ width: `${lessonDetail.isCompleted ? 100 : scrollProgress}%` }}
        ></div>
      </div>
      
      <div className="flex-1 w-full container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          
          {/* Cột Nội dung chính */}
          <main className="space-y-10">
            {/* Thanh tiêu đề chính & Thông tin */}
            <div className="pb-6 border-b dark:border-gray-800">
                <Link href={`/learn/${langId}?level=${currentLevel}`} className={`text-sm text-${PRIMARY_COLOR_BASE}-600 hover:underline flex items-center gap-1 mb-2 font-medium`}>
                    <ArrowLeft className="w-4 h-4" />
                    Trở về {langId.toUpperCase()} - Level {currentLevel}
                </Link>
                <div className="flex items-start justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight dark:text-white">
                        <span className="text-muted-foreground mr-3">#{lessonDetail.order}</span> {lessonDetail.title}
                    </h1>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-muted-foreground">
                    <span className={`flex items-center gap-1.5 text-sm`}>
                        <Clock className={`w-4 h-4 text-${PRIMARY_COLOR_BASE}-600`} /> {/* Màu icon */}
                        Dự kiến {estimatedTimeMinutes} phút
                    </span>
                    <span className={`flex items-center gap-1.5 text-sm`}>
                        <BookOpen className={`w-4 h-4 text-${PRIMARY_COLOR_BASE}-600`} /> {/* Màu icon */}
                        {totalSections} mục nội dung
                    </span>
                </div>
            </div>

            {/* Nội dung bài học */}
            {lessonDetail.sections.map((section, i) => (
              <div key={i} id={`section-${i}`} className="scroll-mt-24 space-y-6">
                {section.type === "theory" ? (
                  <div className="prose dark:prose-invert max-w-none">
                    {/* Heading được làm nổi bật hơn */}
                    <h2 className={`text-3xl font-bold border-l-4 border-${PRIMARY_COLOR_BASE}-600 pl-3 mb-4 mt-8`}>{section.heading}</h2> {/* Màu viền */}
                    {section.content && <MarkdownRenderer content={section.content} />}
                  </div>
                ) : section.type === "demo" && section.demoPayload ? (
                  // NÂNG CẤP UI/UX CHO CODE PLAYGROUND
                  <Card className={cn(
                      "shadow-2xl dark:bg-gray-800 border-2",
                      isSimulatedError ? "border-red-500" : `border-${PRIMARY_COLOR_BASE}-300`
                  )}>
                    <CardContent className="p-0">
                      <div className={`p-4 bg-${PRIMARY_COLOR_BASE}-100 dark:bg-${PRIMARY_COLOR_BASE}-900/20 border-b border-${PRIMARY_COLOR_BASE}-300`}> {/* Màu nền header CodePlayground */}
                        <h3 className={`text-xl font-bold text-${PRIMARY_COLOR_BASE}-600 flex items-center gap-2`}> {/* Màu chữ header CodePlayground */}
                           <Zap className="w-5 h-5" />
                           Thực hành: {section.heading}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                           Chỉnh sửa code và nhấn "Chạy" để xem kết quả trực tiếp.
                        </p>
                      </div>
                      
                      
                      
                      <CodePlayground
                          heading={section.heading}
                          html={section.demoPayload.html || ""}
                          css={section.demoPayload.css || ""}
                          js={section.demoPayload.js || ""}
                        />
                    </CardContent>
                  </Card>
                  
                ) : null}
              </div>
            ))}

            {/* Điều hướng cuối bài học được nâng cấp */}
            <Separator className="my-12" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {prevLesson ? (
                <Link 
                  href={`/learn/${langId}/${prevLesson.id}`} // LINK ĐÃ ĐƯỢC SỬA
                  passHref
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="lg" className="gap-3 text-left h-auto w-full">
                    <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">
                      <p className="text-xs text-muted-foreground">Bài trước</p>
                      <p className="font-semibold truncate">
                        {/* KHÔNG ĐỔI MÀU CHỮ CỦA TIÊU ĐỀ BÀI HỌC (Mặc định) */}
                        {prevLesson.title}
                      </p>
                    </span>
                  </Button>
                </Link>
              ) : (
                 <Link href={`/learn/${langId}?level=${currentLevel}`} passHref className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="gap-2 w-full">
                        <ArrowLeft className="w-5 h-5" />
                        Về Lộ trình
                    </Button>
                </Link>
              )}
              
              {nextLesson ? (
                <Link 
                  href={`/learn/${langId}/${nextLesson.id}`} // LINK ĐÃ ĐƯỢC SỬA
                  passHref
                  className="w-full sm:w-auto"
                >
                  <Button size="lg" className={`gap-3 group text-right h-auto w-full bg-${PRIMARY_COLOR_BASE}-600 hover:bg-${PRIMARY_COLOR_BASE}-700 text-white`}> {/* Đảm bảo nền là blue, chữ là white */}
                     <span className="truncate text-left">
                      <p className="text-xs text-white/80">Bài tiếp theo</p>
                      <p className="font-semibold truncate">
                        {/* MÀU CHỮ VẪN LÀ WHITE/TRẮNG */}
                        {nextLesson.title}
                      </p>
                    </span>
                    <ArrowRight className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/learn/${langId}?level=${currentLevel}`} passHref className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 w-full">
                    <CheckCircle2 className="w-5 h-5" />
                    Hoàn thành Cấp độ
                  </Button>
                </Link>
              )}
            </div>
          </main>

          {/* Cột phải: Mục lục (TOC) cố định (Nâng cấp UI Sidebar) */}
          <aside className="hidden lg:block relative">
            <div className="sticky top-24 space-y-6">
              
              {/* Card CTA Hoàn thành Bài học (Nổi bật) */}
              <Card className={cn(
                  "shadow-lg border-2",
                  lessonDetail.isCompleted ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : `border-${PRIMARY_COLOR_BASE}-500/50 dark:bg-gray-800`
              )}>
                <CardContent className="pt-6 text-center">
                    <CardTitle className={cn("text-lg flex items-center justify-center gap-2 mb-3", lessonDetail.isCompleted ? "text-green-600" : `text-${PRIMARY_COLOR_BASE}-600`)}> {/* Màu chữ CTA */}
                        {lessonDetail.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                        {lessonDetail.isCompleted ? "Bài học Đã Hoàn thành" : "Đánh Dấu Hoàn Thành"}
                    </CardTitle>
                    <MarkCompleteButton lessonId={lessonId} isCompleted={lessonDetail.isCompleted}/>
                </CardContent>
              </Card>

              {/* Bảng Hướng dẫn Gỡ lỗi (MỚI) */}
              <Card className="dark:bg-gray-800 shadow-md border-2 border-red-300 dark:border-red-500/50 hidden">
                 <CardContent className="pt-6">
                    <CardTitle className="text-lg mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                        <Terminal className="w-5 h-5" />
                        Gỡ lỗi Code (Debugging)
                    </CardTitle>
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        <li>**Kiểm tra Console:** Nhấn `F12` hoặc chuột phải -> `Inspect` -> chọn tab `Console` để xem lỗi JavaScript chi tiết nhất.</li>
                        <li>**Lỗi CSS:** Nếu CSS không hoạt động, kiểm tra tab `Elements` để đảm bảo selector của bạn khớp với HTML.</li>
                        <li>**Lỗi Logic:** Nếu code chạy sai kết quả, hãy dùng `console.log()` trong code JavaScript để in giá trị biến ra Console.</li>
                    </ul>
                 </CardContent>
              </Card>

              {/* Mục lục TOC */}
              <Card className="dark:bg-gray-800 shadow-md">
                 <CardContent className="pt-6">
                    <CardTitle className="text-lg mb-4 flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-secondary" />
                        Mục lục Nội dung
                    </CardTitle>
                    <LessonTOC sections={lessonDetail.sections as any} /> 
                 </CardContent>
              </Card>

            </div>
          </aside>
        </div>
      </div>
      
      {/* Footer Điều hướng cố định cho Mobile */}
      <AppFooter />
    </div>
  );
}
