// app/learn/[langId]/page.tsx
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, ChevronRight, CheckCircle, Clock, Zap, Code2, Hourglass, Sparkles, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";

type PageProps = {
  params: { langId: string };
  searchParams?: { level?: string };
};

// Ép trang động (tránh cache/SSG gây 404 khi API lỗi vặt trong lúc dev)
export const dynamic = "force-dynamic";

// Helpers
const getLessonStateByIndex = (idx: number, completedCount: number, total: number) => {
  const isCompleted = idx < completedCount;
  const isCurrent = completedCount < total && idx === completedCount;
  return { isCompleted, isCurrent };
};

const LessonTimelineItem = ({
  lesson,
  isCompleted,
  isCurrent,
  langId,
  isLast,
}: {
  lesson: any;
  isCompleted: boolean;
  isCurrent: boolean;
  langId: string;
  isLast: boolean;
}) => (
  <div className="flex">
    {/* Timeline Marker */}
    <div className="flex flex-col items-center mr-4">
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 transition-colors duration-300",
          isCompleted
            ? "bg-green-500 border-green-700"
            : isCurrent
            ? "bg-blue-500 border-blue-700 shadow-md shadow-blue-500/50"
            : "bg-white border-gray-400 dark:bg-gray-800 dark:border-gray-500"
        )}
      />
      {!isLast ? (
        <div className="w-px h-full bg-gray-300 dark:bg-gray-700" />
      ) : (
        <div className="w-px h-1/2 bg-transparent" />
      )}
    </div>

    {/* Content */}
    <div className="flex-1 pb-8">
      <Link href={`/learn/${langId}/${lesson.id}`} className="block">
        <Card
          className={cn(
            "hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 cursor-pointer",
            isCompleted && "border-green-400 bg-green-50/50 dark:bg-green-900/10",
            isCurrent && "border-blue-500 ring-2 ring-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10"
          )}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <h4 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
                {lesson.order}. {lesson.title}
                {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                {isCurrent && <Zap className="w-4 h-4 text-blue-500" />}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Dự kiến {lesson.sections?.length ? lesson.sections.length * 5 : 0} phút |
                <Code2 className="w-3 h-3" />
                {Array.isArray(lesson.sections)
                  ? lesson.sections.filter((s: any) => s?.type === "demo").length
                  : 0}{" "}
                ví dụ thực hành
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </CardContent>
        </Card>
      </Link>
    </div>
  </div>
);

const LevelCard = ({
  level,
  title,
  description,
  isActive,
  langId,
  isLocked = false,
}: {
  level: number;
  title: string;
  description?: string;
  isActive: boolean;
  langId: string;
  isLocked?: boolean;
}) => {
  const isAvailable = !isLocked;
  return (
    <Link href={isAvailable ? `/learn/${langId}?level=${level}` : "#"} className={cn("w-full block", !isAvailable && "pointer-events-none")}>
      <div
        className={cn(
          "p-4 border rounded-lg transition-all duration-200 cursor-pointer relative",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] border-primary"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700",
          !isAvailable && "opacity-60 grayscale"
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className={cn("font-bold text-lg", isActive && "text-primary-foreground")}>Level {level}: {title}</h3>
          {isAvailable ? (
            <Trophy className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-primary")} />
          ) : (
            <Lock className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <p className={cn("mt-1 text-sm", isActive ? "text-primary-foreground/90" : "text-muted-foreground")}>{description}</p>
      </div>
    </Link>
  );
};

export default async function LessonListPage({ params, searchParams }: PageProps) {
  const { langId } = params;

  // Tải dữ liệu thật từ API, bắt lỗi riêng từng call để không 404 oan
  const [lang, progress] = await Promise.all([
    api.getLanguage(langId).catch((e: unknown) => {
      console.error("getLanguage error:", e);
      return null;
    }),
    api.getProgress(langId).catch((e: unknown) => {
      console.error("getProgress error:", e);
      return { completed: 0, total: 0, percent: 0 };
    }),
  ]);

  if (!lang) {
    // Chỉ notFound nếu ngôn ngữ thực sự không tồn tại
    return notFound();
  }

  const currentLevel =
    searchParams?.level ? Number(searchParams.level) : lang.levels?.[0]?.level;

  const lessons =
    (await api.getLessons(langId, currentLevel).catch((e: unknown) => {
      console.error("getLessons error:", e);
      return [];
    })) ?? [];

  const currentLevelData = lang.levels?.find((lv: any) => lv.level === currentLevel);
  const completedCount = Math.min(progress?.completed ?? 0, lessons.length);
  const isCurrentLevelCompleted = lessons.length > 0 && completedCount >= lessons.length;

  // Tiến độ cấp độ hiện tại
  const currentLevelPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const progressColor =
    currentLevelPercent === 100 ? "text-green-500" : currentLevelPercent > 50 ? "text-yellow-500" : "text-red-500";

  // Bài đang học
  const currentIndex = Math.min(completedCount, Math.max(lessons.length - 1, 0));
  const currentLesson = lessons[completedCount < lessons.length ? currentIndex : lessons.length - 1];

  // Level kế tiếp
  const currentLevelIndex = lang.levels?.findIndex((l: any) => l.level === currentLevel) ?? -1;
  const nextLevelData = currentLevelIndex >= 0 ? lang.levels[currentLevelIndex + 1] : undefined;

  return (
    <>
      <AppHeader />

      {/* Hero Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-10 md:py-12 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <Link href="/learn" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Trở về tất cả khóa học
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                {currentLevelData?.title} ({lang.name})
              </h2>
              {!isCurrentLevelCompleted && currentLesson && (
                <span className="hidden sm:inline-flex items-center bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-900/20 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">
                  <Zap className="w-3 h-3 mr-1" /> Đang học: Bài {currentLesson.order}
                </span>
              )}
              {isCurrentLevelCompleted && (
                <span className="hidden sm:inline-flex items-center bg-green-500/10 text-green-600 dark:text-green-400 dark:bg-green-900/20 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" /> Đã hoàn thành cấp độ!
                </span>
              )}
            </div>
            <p className="mt-2 text-lg text-muted-foreground max-w-4xl">
              {currentLevelData?.description || lang.summary}
            </p>
          </div>

          {(currentLesson || isCurrentLevelCompleted) && (
            <Link
              href={
                isCurrentLevelCompleted && nextLevelData
                  ? `/learn/${langId}?level=${nextLevelData.level}`
                  : currentLesson
                  ? `/learn/${langId}/${currentLesson.id}`
                  : "#"
              }
              className="hidden md:block flex-shrink-0"
            >
              <Button
                size="lg"
                className={cn(
                  "h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all duration-300",
                  isCurrentLevelCompleted ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
                )}
              >
                {isCurrentLevelCompleted
                  ? `Chuyển sang ${nextLevelData?.title || "Khóa học tiếp theo"}`
                  : "Bắt đầu/Tiếp tục học"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 space-y-8 sticky top-24 self-start">
            {/* Tiến độ cấp độ */}
            <Card
              className={cn(
                "shadow-lg border-2 border-transparent transition-all duration-500",
                currentLevelPercent === 100
                  ? "bg-gradient-to-r from-green-400 to-green-600 text-white animate-bounce-slow shadow-green-500/50"
                  : "dark:bg-gray-800 border-primary/20"
              )}
            >
              <CardHeader className="pb-4">
                <CardTitle
                  className={cn(
                    "text-xl flex items-center gap-2",
                    currentLevelPercent === 100 ? "text-white" : progressColor
                  )}
                >
                  {currentLevelPercent === 100 ? <Sparkles className="w-5 h-5 text-yellow-300" /> : <Hourglass className="w-5 h-5" />}
                  {currentLevelPercent === 100 ? "CHÚC MỪNG!" : "Tiến độ Cấp độ"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar completed={completedCount} total={lessons.length} percent={currentLevelPercent} />
                <p
                  className={cn(
                    "mt-3 text-sm text-center font-bold",
                    currentLevelPercent === 100 ? "text-white" : progressColor
                  )}
                >
                  {currentLevelPercent}% Đã hoàn thành!
                </p>
              </CardContent>
            </Card>

            {/* Lựa chọn cấp độ */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold dark:text-white">Toàn bộ Lộ trình</h3>
              <div className="flex flex-col gap-3">
                {lang.levels?.map((lv: any) => (
                  <LevelCard
                    key={lv.level}
                    level={lv.level}
                    title={lv.title}
                    description={lv.description}
                    isActive={currentLevel === lv.level}
                    langId={langId}
                    // Rule khóa mở: ví dụ khóa level > 1 khi tổng percent < 50 (có thể đổi theo business của bạn)
                    isLocked={lv.level > 1 && (progress?.percent ?? 0) < 50}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-8 lg:col-span-9">
            {(currentLesson || isCurrentLevelCompleted) && (
              <Link
                href={
                  isCurrentLevelCompleted && nextLevelData
                    ? `/learn/${langId}?level=${nextLevelData.level}`
                    : currentLesson
                    ? `/learn/${langId}/${currentLesson.id}`
                    : "#"
                }
                className="md:hidden mb-6 block"
              >
                <Button
                  size="lg"
                  className={cn(
                    "w-full h-12 text-lg shadow-xl",
                    isCurrentLevelCompleted ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {isCurrentLevelCompleted ? `Chuyển sang ${nextLevelData?.title || "Khóa học tiếp theo"}` : "Tiếp tục học"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}

            <Card className="dark:bg-gray-800 shadow-xl border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-2xl dark:text-white">Lộ trình bài học</CardTitle>
                <CardDescription>
                  Hoàn thành {lessons.length} bước để chinh phục cấp độ {currentLevelData?.level}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-0 pl-10 md:pl-16">
                {lessons.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="font-semibold">Chưa có bài học</p>
                    <p className="text-sm">Nội dung cho cấp độ này đang được cập nhật. Vui lòng quay lại sau!</p>
                  </div>
                ) : (
                  lessons.map((lesson: any, index: number) => {
                    const { isCompleted, isCurrent } = getLessonStateByIndex(index, completedCount, lessons.length);
                    return (
                      <LessonTimelineItem
                        key={lesson.id}
                        lesson={lesson}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        langId={langId}
                        isLast={index === lessons.length - 1}
                      />
                    );
                  })
                )}

                {isCurrentLevelCompleted && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-4 h-4 rounded-full border-2 bg-yellow-500 border-yellow-700" />
                      <div className="w-px h-0 bg-gray-300 dark:bg-gray-700" />
                    </div>
                    <div className="flex-1 pb-8 pt-1">
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                        <Trophy className="w-5 h-5" /> HOÀN THÀNH CẤP ĐỘ!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <AppFooter />
    </>
  );
}
