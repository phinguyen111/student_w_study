// Mock API data and functions for the learning platform
// This simulates backend API responses

export interface Language {
  id: string
  name: string
  summary: string
  lessonCount: number
  progressPct: number
}

export interface Lesson {
  id: string
  title: string
  durationMin: number
  isCompleted: boolean
}

export interface LessonSection {
  type: "theory" | "demo"
  heading: string
  content?: string
  demoKind?: "codeplay"
  demoPayload?: {
    html: string
    css: string
    js: string
  }
}

export interface LessonDetail {
  id: string
  title: string
  sections: LessonSection[]
}

export interface UserProgress {
  completed: number
  total: number
  percent: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "student" | "admin"
  progress: Record<string, number>
}

export interface FormTemplate {
  id: string
  title: string
  fields: FormField[]
}

export interface FormField {
  id: string
  label: string
  type: "mcq" | "code" | "text"
  options?: string[]
  lang?: string
}

export interface Assignment {
  id: string
  templateId: string
  userId: string
  dueAt: string
  status: "assigned" | "submitted" | "overdue"
  score?: number
}

// Mock data
const mockLanguages: Language[] = [
  { id: "html", name: "HTML", summary: "Cơ bản đến nâng cao", lessonCount: 24, progressPct: 58 },
  { id: "css", name: "CSS", summary: "Layout, Flex, Grid", lessonCount: 30, progressPct: 10 },
  { id: "javascript", name: "JavaScript", summary: "Lập trình web động", lessonCount: 42, progressPct: 0 },
]

const mockLessons: Record<string, Lesson[]> = {
  html: [
    { id: "html-01-intro", title: "Giới thiệu HTML", durationMin: 8, isCompleted: true },
    { id: "html-02-tags", title: "Thẻ cơ bản", durationMin: 12, isCompleted: true },
    { id: "html-03-links", title: "Liên kết và hình ảnh", durationMin: 15, isCompleted: false },
    { id: "html-04-forms", title: "Biểu mẫu HTML", durationMin: 20, isCompleted: false },
  ],
  css: [
    { id: "css-01-intro", title: "Giới thiệu CSS", durationMin: 10, isCompleted: true },
    { id: "css-02-selectors", title: "Bộ chọn CSS", durationMin: 15, isCompleted: false },
    { id: "css-03-flexbox", title: "Flexbox Layout", durationMin: 25, isCompleted: false },
  ],
  javascript: [
    { id: "js-01-intro", title: "Giới thiệu JavaScript", durationMin: 12, isCompleted: false },
    { id: "js-02-variables", title: "Biến và kiểu dữ liệu", durationMin: 18, isCompleted: false },
  ],
}

const mockLessonDetails: Record<string, LessonDetail> = {
  "html-02-tags": {
    id: "html-02-tags",
    title: "Thẻ cơ bản",
    sections: [
      {
        type: "theory",
        heading: "Thẻ tiêu đề và đoạn văn",
        content: `# Thẻ tiêu đề và đoạn văn

HTML cung cấp các thẻ để tạo cấu trúc nội dung:

- **Thẻ tiêu đề**: \`<h1>\` đến \`<h6>\` - \`<h1>\` là quan trọng nhất
- **Thẻ đoạn văn**: \`<p>\` - Dùng để tạo đoạn văn bản

Ví dụ:
\`\`\`html
<h1>Tiêu đề chính</h1>
<h2>Tiêu đề phụ</h2>
<p>Đây là một đoạn văn bản.</p>
\`\`\``,
      },
      {
        type: "demo",
        heading: "Demo: Thẻ tiêu đề",
        demoKind: "codeplay",
        demoPayload: {
          html: "<h1>Tiêu đề chính</h1>\n<h2>Tiêu đề phụ</h2>\n<p>Đây là một đoạn văn bản với nội dung mô tả.</p>",
          css: "h1 { color: #d97706; font-family: sans-serif; }\nh2 { color: #6366f1; }\np { line-height: 1.6; }",
          js: "",
        },
      },
      {
        type: "theory",
        heading: "Thẻ liên kết",
        content: `# Thẻ liên kết

Thẻ \`<a>\` (anchor) được sử dụng để tạo liên kết:

\`\`\`html
<a href="https://example.com">Nhấn vào đây</a>
\`\`\`

Thuộc tính quan trọng:
- \`href\`: Đường dẫn đến trang đích
- \`target="_blank"\`: Mở liên kết trong tab mới`,
      },
      {
        type: "demo",
        heading: "Demo: Liên kết",
        demoKind: "codeplay",
        demoPayload: {
          html: '<a href="https://example.com" target="_blank">Truy cập Example.com</a>\n<br><br>\n<a href="#section">Liên kết nội bộ</a>',
          css: "a { color: #6366f1; text-decoration: none; font-weight: 500; }\na:hover { text-decoration: underline; }",
          js: "",
        },
      },
    ],
  },
}

const mockUsers: User[] = [
  { id: "u1", name: "Nguyễn Văn An", email: "an@example.com", role: "student", progress: { html: 58, css: 10 } },
  { id: "u2", name: "Trần Thị Bình", email: "binh@example.com", role: "student", progress: { html: 25, css: 0 } },
  { id: "u3", name: "Admin User", email: "admin@example.com", role: "admin", progress: {} },
]

const mockFormTemplates: FormTemplate[] = [
  {
    id: "quiz-html-basics",
    title: "Quiz: HTML Basics",
    fields: [
      {
        id: "q1",
        label: "Mục đích của thẻ <head> là gì?",
        type: "mcq",
        options: ["Chứa nội dung hiển thị", "Chứa metadata và liên kết", "Tạo tiêu đề trang", "Không có mục đích"],
      },
      {
        id: "q2",
        label: "Viết một đoạn HTML tạo tiêu đề và đoạn văn",
        type: "code",
        lang: "html",
      },
    ],
  },
]

// Mock API functions
export const mockApi = {
  // Languages
  getLanguages: async (): Promise<Language[]> => {
    await delay(300)
    return mockLanguages
  },

  // Lessons
  getLessons: async (langId: string): Promise<Lesson[]> => {
    await delay(300)
    return mockLessons[langId] || []
  },

  // Lesson detail
  getLessonDetail: async (lessonId: string): Promise<LessonDetail | null> => {
    await delay(300)
    return mockLessonDetails[lessonId] || null
  },

  // Progress
  getUserProgress: async (langId: string): Promise<UserProgress> => {
    await delay(300)
    const lessons = mockLessons[langId] || []
    const completed = lessons.filter((l) => l.isCompleted).length
    return {
      completed,
      total: lessons.length,
      percent: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
    }
  },

  markLessonComplete: async (lessonId: string, completed: boolean): Promise<void> => {
    await delay(300)
    // Update mock data
    for (const langId in mockLessons) {
      const lesson = mockLessons[langId].find((l) => l.id === lessonId)
      if (lesson) {
        lesson.isCompleted = completed
        break
      }
    }
  },

  // Admin - Users
  getUsers: async (role?: "student" | "admin", query?: string): Promise<User[]> => {
    await delay(300)
    let users = [...mockUsers]
    if (role) {
      users = users.filter((u) => u.role === role)
    }
    if (query) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()),
      )
    }
    return users
  },

  updateUserRole: async (userId: string, role: "student" | "admin"): Promise<void> => {
    await delay(300)
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      user.role = role
    }
  },

  // Admin - Form templates
  getFormTemplates: async (): Promise<FormTemplate[]> => {
    await delay(300)
    return mockFormTemplates
  },

  // Admin - Assignments
  assignForm: async (templateId: string, userId: string, dueAt: string): Promise<void> => {
    await delay(300)
    console.log("[v0] Form assigned:", { templateId, userId, dueAt })
  },
}

// Helper function to simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
