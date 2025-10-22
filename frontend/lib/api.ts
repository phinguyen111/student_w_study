export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
const getLessons = (langId: string, level?: number) =>
  getJson<Lesson[]>(`/api/languages/${langId}/lessons${level ? `?level=${level}` : ''}`);

export const api = {
  getLanguages: () => getJson<Language[]>('/api/languages'),
  getLanguage: (langId: string) => getJson<Language>(`/api/languages/${langId}`),
  getLessons, // dùng hàm mới ở trên
  getLessonDetail: (lessonId: string) => getJson<Lesson>(`/api/lessons/${lessonId}`),
  getProgress: (langId: string) =>
    getJson<{ completed: number; total: number; percent: number }>(`/api/progress/${langId}`),
  markComplete: (lessonId: string) =>
    getJson(`/api/progress/mark-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId }),
    }),
};

// Types front-end (đơn giản hóa)
export type Language = {
  id: string; name: string; summary?: string;
  levels: { level:number; title:string; description?:string }[];
}
export type LessonSection =
  | { type: 'theory'; heading: string; content?: string }
  | { type: 'demo'; heading: string; demoPayload?: { html?:string; css?:string; js?:string } };

export type Lesson = {
  id: string; langId: string; title: string; level: number; order: number;
  sections: LessonSection[];
}
