# Format Dữ Liệu Tạo Quiz Assignment

## 1. Multiple-Choice Question (Câu hỏi trắc nghiệm)

```javascript
{
  type: 'multiple-choice',  // BẮT BUỘC
  question: 'Câu hỏi của bạn?',  // BẮT BUỘC
  options: [  // BẮT BUỘC - Mảng các lựa chọn
    'Lựa chọn 1',
    'Lựa chọn 2',
    'Lựa chọn 3',
    'Lựa chọn 4'
  ],
  correctAnswer: 0,  // BẮT BUỘC - Index của đáp án đúng (0, 1, 2, 3...)
  explanation: 'Giải thích đáp án (tùy chọn)'
}
```

## 2. Code Question (Câu hỏi code)

```javascript
{
  type: 'code',  // BẮT BUỘC - Phải là 'code'
  question: 'Viết code để tạo một heading với nội dung "Hello World"',  // BẮT BUỘC
  codeType: 'html',  // BẮT BUỘC - 'html', 'css', 'javascript', hoặc 'html-css-js'
  starterCode: {  // BẮT BUỘC - Phải là object
    html: '<div>\n  <!-- Viết code của bạn ở đây -->\n</div>',
    css: '/* Viết CSS của bạn ở đây */',
    javascript: '// Viết JavaScript của bạn ở đây'
  },
  expectedOutput: 'Mô tả output mong đợi: Một heading h1 với text "Hello World"',  // BẮT BUỘC
  explanation: 'Giải thích (tùy chọn)'
}
```

## 3. Ví dụ đầy đủ khi tạo Quiz Assignment

```javascript
const assignmentData = {
  title: 'Bài tập HTML cơ bản',
  description: 'Làm bài tập về HTML',
  questions: [
    // Multiple-choice question
    {
      type: 'multiple-choice',
      question: 'Thẻ nào dùng để tạo heading lớn nhất?',
      options: ['<h1>', '<h6>', '<p>', '<div>'],
      correctAnswer: 0,  // <h1> là đáp án đúng
      explanation: '<h1> là thẻ heading lớn nhất'
    },
    // Code question
    {
      type: 'code',  // QUAN TRỌNG: Phải có type: 'code'
      question: 'Tạo một heading h1 với nội dung "Welcome"',
      codeType: 'html',  // hoặc 'css', 'javascript', 'html-css-js'
      starterCode: {
        html: '<div>\n  <!-- Viết code của bạn -->\n</div>',
        css: '',
        javascript: ''
      },
      expectedOutput: 'Một heading h1 hiển thị text "Welcome"',
      explanation: 'Sử dụng thẻ <h1>Welcome</h1>'
    }
  ],
  passingScore: 7,  // Điểm tối thiểu để pass (0-10)
  assignedTo: ['user_id_1', 'user_id_2'],  // Mảng các user ID
  deadline: '2024-12-31T23:59:59.000Z'  // ISO date string
}
```

## 4. Lưu ý quan trọng

### Cho Code Questions:
- ✅ **BẮT BUỘC**: `type: 'code'` - Nếu không có, hệ thống sẽ coi là multiple-choice và yêu cầu `correctAnswer`
- ✅ **BẮT BUỘC**: `codeType` - Phải là một trong: 'html', 'css', 'javascript', 'html-css-js'
- ✅ **BẮT BUỘC**: `starterCode` - Phải là **object** với các key: `html`, `css`, `javascript`
- ✅ **BẮT BUỘC**: `expectedOutput` - Mô tả output mong đợi
- ❌ **KHÔNG CẦN**: `options` và `correctAnswer` cho code questions

### Cho Multiple-Choice Questions:
- ✅ **BẮT BUỘC**: `type: 'multiple-choice'` (hoặc không có type, mặc định là multiple-choice)
- ✅ **BẮT BUỘC**: `options` - Mảng các lựa chọn
- ✅ **BẮT BUỘC**: `correctAnswer` - Index của đáp án đúng (bắt đầu từ 0)
- ❌ **KHÔNG CẦN**: `codeType`, `starterCode`, `expectedOutput`

## 5. Ví dụ Code Question với HTML-CSS-JS

```javascript
{
  type: 'code',
  question: 'Tạo một button màu đỏ, khi click sẽ hiển thị alert "Hello"',
  codeType: 'html-css-js',
  starterCode: {
    html: '<div>\n  <!-- Tạo button ở đây -->\n</div>',
    css: '/* Style button ở đây */',
    javascript: '// Thêm event listener ở đây'
  },
  expectedOutput: 'Một button màu đỏ, khi click hiển thị alert "Hello"',
  explanation: 'Sử dụng HTML để tạo button, CSS để style màu đỏ, JavaScript để thêm click event'
}
```

## 6. Lỗi thường gặp

### Lỗi: "correctAnswer is required"
**Nguyên nhân**: Form không gửi `type: 'code'` khi tạo code question
**Giải pháp**: Đảm bảo khi chọn "Code Question", form gửi `type: 'code'` trong question object

### Lỗi: "codeType is required"
**Nguyên nhân**: Thiếu field `codeType` trong code question
**Giải pháp**: Thêm `codeType: 'html'` (hoặc 'css', 'javascript', 'html-css-js')

### Lỗi: "starterCode is required"
**Nguyên nhân**: `starterCode` không phải là object hoặc thiếu
**Giải pháp**: Đảm bảo `starterCode` là object: `{ html: '...', css: '...', javascript: '...' }`

