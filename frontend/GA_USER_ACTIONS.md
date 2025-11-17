# Google Analytics User Actions Tracking Guide

## Tổng quan

Hệ thống đã được tích hợp Google Analytics để theo dõi toàn diện các hành động của người dùng trên website.

## Các hành động được track tự động

### 1. **Button Clicks** (Tự động)
- Tất cả button clicks được track tự động
- Event: `button_click`
- Parameters: button_name, button_location, button_id, button_type

### 2. **Link Clicks** (Tự động)
- Tất cả link clicks (internal và external)
- Event: `link_click`
- Parameters: link_text, link_url, is_external, link_id

### 3. **Form Submissions** (Tự động)
- Tất cả form submissions
- Event: `form_submit`
- Parameters: form_name, form_success, form_action, form_method

### 4. **Page Views** (Tự động)
- Tự động track khi navigate giữa các pages
- Sử dụng Next.js router events

### 5. **JavaScript Errors** (Tự động)
- Track tất cả JavaScript errors
- Event: `error`
- Parameters: error_type, error_message, error_location, error_line, error_column

### 6. **Unhandled Promise Rejections** (Tự động)
- Track promise rejections không được handle
- Event: `error`
- Parameters: error_type, error_message

## Các hành động được track thủ công

### Authentication Actions
```typescript
trackAuthAction('login', true, { user_email: email })
trackAuthAction('register', true, { user_email: email })
trackAuthAction('logout', true)
```

### Quiz Actions
```typescript
trackQuizAction('start', quizId, quizTitle)
trackQuizAction('submit', quizId, quizTitle, { quiz_score: 8.5, passed: true })
trackQuizAction('abandon', quizId, quizTitle, { abandon_reason: 'user_choice' })
trackQuizAction('question_view', quizId, undefined, { question_index: 2 })
trackQuizAction('answer_select', quizId, undefined, { question_index: 1, selected_answer: 2 })
```

### Lesson Actions
```typescript
trackLessonAction('view', lessonId, lessonTitle)
trackLessonAction('complete', lessonId, lessonTitle, { quiz_score: 9, code_score: 8 })
trackLessonAction('code_submit', lessonId, lessonTitle, { code_score: 10 })
```

### Navigation
```typescript
trackNavigation('/learn', '/profile', 'click')
```

### Custom Events
```typescript
trackCustomEvent('custom_event_name', {
  event_category: 'Custom',
  custom_param: 'value'
})
```

## Các Events được track

### User Interaction Events
- `button_click` - Button clicks
- `link_click` - Link clicks
- `form_submit` - Form submissions
- `search` - Search queries
- `file_download` - File downloads
- `video_interaction` - Video play/pause/complete

### Learning Events
- `quiz_action` - Quiz interactions (start, submit, abandon, etc.)
- `lesson_action` - Lesson interactions (view, complete, code_submit)
- `quiz_external_visit` - External website visits during quiz
- `quiz_suspicious_activity` - Suspicious activities during quiz

### Authentication Events
- `auth_action` - Login, register, logout

### Engagement Events
- `scroll_depth` - Scroll milestones (25%, 50%, 75%, 100%)
- `time_on_page` - Time spent on page
- `page_view` - Page views

### Exit Events
- `exit_link_click` - External link clicks
- `exit_beforeunload` - Page unload
- `exit_visibility_hidden` - Tab switch away
- `exit_intent` - Exit intent detection

### Error Events
- `error` - JavaScript errors and promise rejections

## Sử dụng trong Code

### Import hook
```typescript
import { useGATracking } from '@/hooks/useGATracking'

const { trackButtonClick, trackQuizAction } = useGATracking()
```

### Track button click
```typescript
<Button onClick={() => {
  trackButtonClick('Save Progress', window.location.pathname)
  handleSave()
}}>
  Save
</Button>
```

### Track quiz action
```typescript
const handleQuizStart = () => {
  trackQuizAction('start', quizId, quizTitle)
  // ... start quiz logic
}
```

### Track lesson completion
```typescript
const handleLessonComplete = (score: number) => {
  trackLessonAction('complete', lessonId, lessonTitle, {
    quiz_score: score,
    passed: score >= 7
  })
}
```

## Event Parameters

### Common Parameters
- `event_category` - Loại event
- `event_label` - Label mô tả
- `value` - Giá trị số
- `page_path` - Đường dẫn trang hiện tại
- `page_title` - Tiêu đề trang

### Quiz-Specific Parameters
- `quiz_id` - ID của quiz
- `quiz_title` - Tiêu đề quiz
- `quiz_action` - Hành động (start, submit, abandon, etc.)
- `quiz_score` - Điểm số
- `quiz_type` - Loại quiz (assignment, lesson)
- `passed` - Đã pass chưa
- `time_taken` - Thời gian làm bài (seconds)
- `questions_count` - Số câu hỏi
- `question_index` - Index câu hỏi hiện tại
- `selected_answer` - Câu trả lời được chọn

### Lesson-Specific Parameters
- `lesson_id` - ID của lesson
- `lesson_title` - Tiêu đề lesson
- `lesson_action` - Hành động (view, complete, code_submit)
- `quiz_score` - Điểm quiz
- `code_score` - Điểm code exercise
- `exercise_type` - Loại exercise (code, quiz)

### Authentication Parameters
- `auth_action` - Hành động (login, register, logout)
- `auth_success` - Thành công hay không
- `user_email` - Email của user (không track password)

## Xem dữ liệu trong Google Analytics

1. Vào Google Analytics > Reports > Engagement > Events
2. Tìm events theo tên
3. Click vào event để xem chi tiết:
   - Event count
   - Users
   - Parameters
   - Timeline

## Best Practices

1. **Track quan trọng**: Chỉ track các hành động quan trọng, không spam
2. **Meaningful labels**: Sử dụng labels có ý nghĩa
3. **Consistent naming**: Sử dụng naming convention nhất quán
4. **Privacy**: Không track thông tin nhạy cảm (passwords, credit cards, etc.)
5. **Performance**: Tracking không nên ảnh hưởng đến performance

## Debugging

### Kiểm tra events trong Console
```javascript
// Check if gtag is available
console.log(window.gtag)

// Check dataLayer
console.log(window.dataLayer)

// Test event
window.gtag('event', 'test_event', {
  event_category: 'Test',
  event_label: 'Test Label'
})
```

### Kiểm tra trong GA4 Real-time
1. Vào Google Analytics > Reports > Realtime
2. Xem events đang được track real-time
3. Kiểm tra parameters

## Lưu ý

1. **Privacy**: Hệ thống không track thông tin cá nhân nhạy cảm
2. **Performance**: Tracking được tối ưu để không ảnh hưởng performance
3. **Reliability**: Sử dụng sendBeacon cho exit events
4. **User ID**: Tự động set user ID khi login để track user journey

