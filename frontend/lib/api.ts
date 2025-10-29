// frontend/lib/api.ts
// ------------------------------------------------------
// ✅ API client dùng cho frontend Next.js (Vercel + Local)
// ------------------------------------------------------

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://student-swin-study.onrender.com";

// 🔹 Hàm fetch JSON chung có xử lý lỗi
async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store", // tránh cache khi SSR
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      console.error(`❌ API lỗi: ${res.status} ${res.statusText} (${url})`);
      throw new Error(`Request failed: ${res.status}`);
    }

    const data = (await res.json()) as T;
    return data;
  } catch (err) {
    console.error(`⚠️ Lỗi fetch ${url}:`, err);
    throw err;
  }
}

// ------------------------------------------------------
// 🔹 Các API cụ thể (đồng bộ với backend Render)
// ------------------------------------------------------
const getLessons = (langId: string, level?: number) =>
  getJson<Lesson[]>(
    `/api/languages/${langId}/lessons${level ? `?level=${level}` : ""}`
  );

export const api = {
  // Lấy danh sách ngôn ngữ
  getLanguages: () => getJson<Language[]>("/api/languages"),

  // Lấy thông tin chi tiết 1 ngôn ngữ
  getLanguage: (langId: string) =>
    getJson<Language>(`/api/languages/${langId}`),

  // Lấy danh sách bài học
  getLessons,

  // Lấy chi tiết bài học cụ thể
  getLessonDetail: (lessonId: string) =>
    getJson<Lesson>(`/api/lessons/${lessonId}`),

  // Lấy tiến độ học tập theo ngôn ngữ
  getProgress: (langId: string) =>
    getJson<{ completed: number; total: number; percent: number }>(
      `/api/progress/${langId}`
    ),

  // Đánh dấu bài học đã hoàn thành
  markComplete: (lessonId: string) =>
    getJson(`/api/progress/mark-complete`, {
      method: "POST",
      body: JSON.stringify({ lessonId }),
    }),
};

// ------------------------------------------------------
// 🔹 TypeScript types (Frontend sử dụng)
// ------------------------------------------------------
export type Language = {
  id: string;
  name: string;
  summary?: string;
  levels: { level: number; title: string; description?: string }[];
};

export type LessonSection =
  | { type: "theory"; heading: string; content?: string }
  | {
      type: "demo";
      heading: string;
      demoPayload?: { html?: string; css?: string; js?: string };
    };

export type Lesson = {
  id: string;
  langId: string;
  title: string;
  level: number;
  order: number;
  sections: LessonSection[];
};
