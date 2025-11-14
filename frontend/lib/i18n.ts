export type Language = 'vi' | 'en'

export const translations = {
  vi: {
    // Navigation
    learn: 'Học tập',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    logout: 'Đăng xuất',
    profile: 'Hồ sơ',
    admin: 'Quản trị',
    language: 'Ngôn ngữ',
    
    // Common
    back: 'Quay lại',
    submit: 'Gửi',
    cancel: 'Hủy',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    create: 'Tạo mới',
    loading: 'Đang tải...',
    error: 'Lỗi',
    success: 'Thành công',
    
    // Lesson
    lesson: 'Bài học',
    lessons: 'Các bài học',
    level: 'Cấp độ',
    levels: 'Các cấp độ',
    codeExample: 'Ví dụ code',
    codeExercise: 'Bài tập code',
    takeQuiz: 'Làm Quiz',
    quiz: 'Câu hỏi',
    questions: 'câu hỏi',
    readyToTest: 'Sẵn sàng kiểm tra kiến thức?',
    completeQuiz: 'Hoàn thành quiz để mở khóa tiến độ',
    choosePractice: 'Chọn cách bạn muốn luyện tập',
    practiceCoding: 'Luyện code',
    
    // Code Exercise
    codeExerciseTitle: 'Bài tập Code',
    writeCodeHere: 'Viết code của bạn ở đây...',
    runCode: 'Chạy Code',
    resetCode: 'Đặt lại Code',
    output: 'Kết quả',
    preview: 'Xem trước',
    codeSubmitted: 'Code đã được nộp thành công!',
    codeExerciseNotAvailable: 'Bài tập code không có sẵn',
    noCodeExercise: 'Bài học này không có bài tập code.',
    goBackToLesson: 'Quay lại Bài học',
    
    // Quiz
    quizTitle: 'Quiz & Bài tập Code',
    quizQuestions: 'Câu hỏi Quiz',
    question: 'Câu hỏi',
    of: 'của',
    next: 'Tiếp theo',
    previous: 'Trước',
    submitQuiz: 'Nộp Quiz',
    quizResults: 'Kết quả Quiz',
    congratulations: 'Chúc mừng! Bạn đã đậu!',
    needToPass: 'Bạn cần ít nhất {score} điểm để đậu',
    youGot: 'Bạn đã làm đúng',
    outOf: 'trong số',
    questionsCorrect: 'câu hỏi',
    continueLearning: 'Tiếp tục học',
    
    // Code Quiz
    codeExerciseTab: 'Bài tập Code',
    runTests: 'Chạy Tests',
    submitCode: 'Nộp Code',
    testResults: 'Kết quả Test',
    testsPassed: 'tests đã pass',
    expected: 'Kỳ vọng',
    got: 'Nhận được',
    
    // Profile (email, name, role already defined above)
    email: 'Email',
    name: 'Tên',
    role: 'Vai trò',
    
    // Admin
    dashboard: 'Bảng điều khiển',
    users: 'Người dùng',
    content: 'Nội dung',
    
    // Home
    masterFullStack: 'Thành thạo Full Stack Web Development',
    getStarted: 'Bắt đầu',
    learnByLevel: 'Học theo cấp độ',
    learnByLevelDesc: 'Tiến bộ qua các cấp độ có cấu trúc từ cơ bản đến nâng cao',
    interactiveQuizzes: 'Quiz tương tác',
    interactiveQuizzesDesc: 'Kiểm tra kiến thức của bạn với quiz sau mỗi bài học',
    trackProgress: 'Theo dõi tiến độ',
    trackProgressDesc: 'Theo dõi chuỗi học tập, thời gian và thành tích của bạn',
    
    // Auth
    enterCredentials: 'Nhập thông tin đăng nhập để truy cập tài khoản',
    password: 'Mật khẩu',
    loggingIn: 'Đang đăng nhập...',
    dontHaveAccount: 'Chưa có tài khoản?',
    signUp: 'Đăng ký',
    createAccount: 'Tạo tài khoản mới để bắt đầu học',
    creatingAccount: 'Đang tạo tài khoản...',
    alreadyHaveAccount: 'Đã có tài khoản?',
    loginFailed: 'Đăng nhập thất bại',
    registrationFailed: 'Đăng ký thất bại',
    
    // Learn
    chooseLanguage: 'Chọn ngôn ngữ',
    startLearning: 'Bắt đầu học',
    startLesson: 'Bắt đầu bài học',
    
    // Profile
    streak: 'Chuỗi',
    days: 'ngày',
    studyTime: 'Thời gian học',
    hours: 'giờ',
    minutesTotal: 'phút tổng cộng',
    lessonsCompleted: 'Bài học đã hoàn thành',
    levelProgress: 'Tiến độ cấp độ',
    yourScoresByLevel: 'Điểm số của bạn theo cấp độ',
    averageScore: 'Điểm trung bình',
    
    // Quiz
    progress: 'Tiến độ',
    explanation: 'Giải thích',
    correctAnswer: 'Đáp án đúng',
    yourAnswer: 'Câu trả lời của bạn',
    
    // Language Page
    languageNotFound: 'Không tìm thấy ngôn ngữ',
    viewLessons: 'Xem bài học',
    locked: 'Đã khóa',
    completePreviousLevel: 'Hoàn thành cấp độ trước',
  },
  en: {
    // Navigation
    learn: 'Learn',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    admin: 'Admin',
    language: 'Language',
    
    // Common
    back: 'Back',
    to: 'to',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Lesson
    lesson: 'Lesson',
    lessons: 'Lessons',
    level: 'Level',
    levels: 'Levels',
    codeExample: 'Code Example',
    codeExercise: 'Code Exercise',
    takeQuiz: 'Take Quiz',
    quiz: 'Quiz',
    questions: 'questions',
    readyToTest: 'Ready to test your knowledge?',
    completeQuiz: 'Complete the quiz to unlock your progress',
    choosePractice: 'Choose how you want to practice',
    practiceCoding: 'Practice coding',
    
    // Code Exercise
    codeExerciseTitle: 'Code Exercise',
    writeCodeHere: 'Write your code here...',
    runCode: 'Run Code',
    resetCode: 'Reset Code',
    output: 'Output',
    preview: 'Preview',
    codeSubmitted: 'Code submitted successfully!',
    codeExerciseNotAvailable: 'Code Exercise not available',
    noCodeExercise: 'This lesson doesn\'t have a code exercise.',
    goBackToLesson: 'Go Back to Lesson',
    
    // Quiz
    quizTitle: 'Quiz & Code Exercise',
    quizQuestions: 'Quiz Questions',
    question: 'Question',
    of: 'of',
    next: 'Next',
    previous: 'Previous',
    submitQuiz: 'Submit Quiz',
    quizResults: 'Quiz Results',
    congratulations: 'Congratulations! You passed!',
    needToPass: 'You need at least {score} to pass',
    youGot: 'You got',
    outOf: 'out of',
    questionsCorrect: 'questions correct',
    continueLearning: 'Continue Learning',
    
    // Code Quiz
    codeExerciseTab: 'Code Exercise',
    runTests: 'Run Tests',
    submitCode: 'Submit Code',
    testResults: 'Test Results',
    testsPassed: 'tests passed',
    expected: 'Expected',
    got: 'Got',
    
    // Profile (profile already defined above in Navigation)
    email: 'Email',
    name: 'Name',
    role: 'Role',
    
    // Admin
    dashboard: 'Dashboard',
    users: 'Users',
    content: 'Content',
    
    // Home
    masterFullStack: 'Master Full Stack Web Development',
    getStarted: 'Get Started',
    learnByLevel: 'Learn by Level',
    learnByLevelDesc: 'Progress through structured levels from basics to advanced',
    interactiveQuizzes: 'Interactive Quizzes',
    interactiveQuizzesDesc: 'Test your knowledge with quizzes after each lesson',
    trackProgress: 'Track Progress',
    trackProgressDesc: 'Monitor your learning streak, time, and achievements',
    
    // Auth
    enterCredentials: 'Enter your credentials to access your account',
    password: 'Password',
    loggingIn: 'Logging in...',
    dontHaveAccount: 'Don\'t have an account?',
    signUp: 'Sign up',
    createAccount: 'Create a new account to start learning',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account?',
    loginFailed: 'Login failed',
    registrationFailed: 'Registration failed',
    
    // Learn
    chooseLanguage: 'Choose a Language',
    startLearning: 'Start Learning',
    startLesson: 'Start Lesson',
    
    // Profile
    streak: 'Streak',
    days: 'days',
    studyTime: 'Study Time',
    hours: 'hours',
    minutesTotal: 'minutes total',
    lessonsCompleted: 'Lessons Completed',
    levelProgress: 'Level Progress',
    yourScoresByLevel: 'Your scores by level',
    averageScore: 'Average Score',
    
    // Quiz
    progress: 'Progress',
    explanation: 'Explanation',
    correctAnswer: 'Correct Answer',
    yourAnswer: 'Your Answer',
    
    // Language Page
    languageNotFound: 'Language not found',
    viewLessons: 'View Lessons',
    locked: 'Locked',
    completePreviousLevel: 'Complete previous level',
  }
}

export function getTranslation(key: string, lang: Language = 'en'): string {
  const keys = key.split('.')
  let value: any = translations[lang]
  
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en
      for (const k2 of keys) {
        value = value?.[k2]
      }
      break
    }
  }
  
  return typeof value === 'string' ? value : key
}

export function t(key: string, lang: Language = 'en', params?: Record<string, string>): string {
  let translation = getTranslation(key, lang)
  
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value)
    })
  }
  
  return translation
}

