import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLevel2Lessons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find Level 2
    let level2 = await Level.findOne({ levelNumber: 2 })
      .populate('languageId')
      .sort({ createdAt: 1 })

    if (!level2) {
      const htmlLang = await Language.findOne({ 
        $or: [
          { name: { $regex: /html|css|javascript/i } },
          { slug: { $regex: /html|css|javascript/i } }
        ]
      })
      
      if (htmlLang) {
        level2 = await Level.findOne({ 
          levelNumber: 2,
          languageId: htmlLang._id 
        }).populate('languageId')
      }
    }

    if (!level2) {
      console.error('Level 2 not found. Please create Level 2 first.')
      process.exit(1)
    }

    console.log(`Found Level 2: ${level2.title} (ID: ${level2._id})`)

    // Lesson 1: Advanced HTML - Forms and Semantic HTML
    const lesson1 = {
      levelId: level2._id,
      lessonNumber: 1,
      title: {
        en: 'Advanced HTML: Forms and Semantic HTML',
        vi: 'HTML Nâng cao: Forms và Semantic HTML'
      },
      content: {
        en: `# Advanced HTML: Forms and Semantic HTML

## Introduction

Welcome to Level 2! Now that you've mastered the basics, let's dive deeper into HTML. In this lesson, we'll explore HTML forms for user input and semantic HTML elements that give meaning to your content.

## HTML Forms

Forms are essential for collecting user input. The \`<form>\` element wraps all form controls.

### Form Structure

\`\`\`html
<form action="/submit" method="post">
  <!-- Form elements go here -->
</form>
\`\`\`

### Input Types

HTML5 provides many input types:

* \`text\` - Single-line text input
* \`email\` - Email address input
* \`password\` - Password input (hidden)
* \`number\` - Numeric input
* \`date\` - Date picker
* \`checkbox\` - Checkbox input
* \`radio\` - Radio button input
* \`submit\` - Submit button
* \`button\` - Clickable button

### Form Elements

\`\`\`html
<form>
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <label for="age">Age:</label>
  <input type="number" id="age" name="age" min="1" max="120">
  
  <label>
    <input type="checkbox" name="newsletter"> Subscribe to newsletter
  </label>
  
  <label>Gender:</label>
  <input type="radio" id="male" name="gender" value="male">
  <label for="male">Male</label>
  <input type="radio" id="female" name="gender" value="female">
  <label for="female">Female</label>
  
  <label for="message">Message:</label>
  <textarea id="message" name="message" rows="4" cols="50"></textarea>
  
  <label for="country">Country:</label>
  <select id="country" name="country">
    <option value="">Select a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="vn">Vietnam</option>
  </select>
  
  <button type="submit">Submit</button>
</form>
\`\`\`

### Form Attributes

* \`action\` - Where to send form data
* \`method\` - HTTP method (get/post)
* \`required\` - Makes field mandatory
* \`placeholder\` - Hint text in input
* \`min\` / \`max\` - Minimum/maximum values
* \`pattern\` - Validation pattern

## Semantic HTML

Semantic HTML uses elements that clearly describe their meaning. This improves accessibility and SEO.

### Semantic Elements

* \`<header>\` - Header section
* \`<nav>\` - Navigation links
* \`<main>\` - Main content
* \`<article>\` - Independent content
* \`<section>\` - Thematic grouping
* \`<aside>\` - Sidebar content
* \`<footer>\` - Footer section
* \`<figure>\` - Images, diagrams
* \`<figcaption>\` - Caption for figure

### Example Structure

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Semantic HTML Example</title>
</head>
<body>
    <header>
        <h1>Website Title</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Article content...</p>
        </article>
        
        <section>
            <h2>Section Title</h2>
            <p>Section content...</p>
        </section>
    </main>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Additional information...</p>
    </aside>
    
    <footer>
        <p>&copy; 2025 My Website</p>
    </footer>
</body>
</html>
\`\`\`

## Lesson Summary

You've learned about HTML forms for collecting user input and semantic HTML elements that provide meaning to your content. These are essential skills for building interactive and accessible websites!`,
        vi: `# HTML Nâng cao: Forms và Semantic HTML

## Giới thiệu

Chào mừng đến Level 2! Bây giờ bạn đã thành thạo những điều cơ bản, hãy đi sâu hơn vào HTML. Trong bài học này, chúng ta sẽ khám phá HTML forms để thu thập đầu vào người dùng và các phần tử semantic HTML mang lại ý nghĩa cho nội dung của bạn.

## HTML Forms

Forms rất cần thiết để thu thập đầu vào người dùng. Phần tử \`<form>\` bao bọc tất cả các điều khiển form.

### Cấu trúc Form

\`\`\`html
<form action="/submit" method="post">
  <!-- Các phần tử form ở đây -->
</form>
\`\`\`

### Các loại Input

HTML5 cung cấp nhiều loại input:

* \`text\` - Input văn bản một dòng
* \`email\` - Input địa chỉ email
* \`password\` - Input mật khẩu (ẩn)
* \`number\` - Input số
* \`date\` - Date picker
* \`checkbox\` - Input checkbox
* \`radio\` - Input radio button
* \`submit\` - Nút submit
* \`button\` - Nút có thể nhấp

### Các phần tử Form

\`\`\`html
<form>
  <label for="name">Tên:</label>
  <input type="text" id="name" name="name" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <label for="age">Tuổi:</label>
  <input type="number" id="age" name="age" min="1" max="120">
  
  <label>
    <input type="checkbox" name="newsletter"> Đăng ký nhận bản tin
  </label>
  
  <label>Giới tính:</label>
  <input type="radio" id="male" name="gender" value="male">
  <label for="male">Nam</label>
  <input type="radio" id="female" name="gender" value="female">
  <label for="female">Nữ</label>
  
  <label for="message">Tin nhắn:</label>
  <textarea id="message" name="message" rows="4" cols="50"></textarea>
  
  <label for="country">Quốc gia:</label>
  <select id="country" name="country">
    <option value="">Chọn quốc gia</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="vn">Vietnam</option>
  </select>
  
  <button type="submit">Gửi</button>
</form>
\`\`\`

### Form Attributes

* \`action\` - Nơi gửi dữ liệu form
* \`method\` - Phương thức HTTP (get/post)
* \`required\` - Làm cho trường bắt buộc
* \`placeholder\` - Văn bản gợi ý trong input
* \`min\` / \`max\` - Giá trị tối thiểu/tối đa
* \`pattern\` - Pattern validation

## Semantic HTML

Semantic HTML sử dụng các phần tử mô tả rõ ràng ý nghĩa của chúng. Điều này cải thiện khả năng truy cập và SEO.

### Semantic Elements

* \`<header>\` - Phần header
* \`<nav>\` - Các liên kết điều hướng
* \`<main>\` - Nội dung chính
* \`<article>\` - Nội dung độc lập
* \`<section>\` - Nhóm theo chủ đề
* \`<aside>\` - Nội dung sidebar
* \`<footer>\` - Phần footer
* \`<figure>\` - Hình ảnh, sơ đồ
* \`<figcaption>\` - Chú thích cho figure

### Ví dụ Cấu trúc

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Ví dụ Semantic HTML</title>
</head>
<body>
    <header>
        <h1>Tiêu đề Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Trang chủ</a></li>
                <li><a href="#about">Giới thiệu</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Tiêu đề Bài viết</h2>
            <p>Nội dung bài viết...</p>
        </article>
        
        <section>
            <h2>Tiêu đề Section</h2>
            <p>Nội dung section...</p>
        </section>
    </main>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Thông tin bổ sung...</p>
    </aside>
    
    <footer>
        <p>&copy; 2025 Website của tôi</p>
    </footer>
</body>
</html>
\`\`\`

## Tóm tắt bài học

Bạn đã học về HTML forms để thu thập đầu vào người dùng và các phần tử semantic HTML cung cấp ý nghĩa cho nội dung của bạn. Đây là những kỹ năng cần thiết để xây dựng các trang web tương tác và có thể truy cập!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Advanced HTML Example</title>
</head>
<body>
    <header>
        <h1>My Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Contact Form</h2>
            <form>
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
                
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4"></textarea>
                
                <button type="submit">Submit</button>
            </form>
        </article>
    </main>
    
    <footer>
        <p>&copy; 2025</p>
    </footer>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Contact Form</title>
</head>
<body>
    <!-- Add your HTML here -->
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web với form liên hệ sử dụng Semantic HTML!

Yêu cầu:

1. **Semantic HTML**: Sử dụng ít nhất 5 semantic elements:
   - <header> với <nav>
   - <main>
   - <article> hoặc <section>
   - <footer>
   - <form>

2. **HTML Form**: Tạo một form liên hệ với:
   - Input type="text" cho tên (với label và required)
   - Input type="email" cho email (với label và required)
   - Input type="number" cho tuổi (với label, min, max)
   - Textarea cho tin nhắn (với label)
   - Select dropdown cho quốc gia (với ít nhất 3 options)
   - Checkbox cho "Đồng ý điều khoản"
   - Radio buttons cho giới tính (ít nhất 2 options)
   - Button type="submit"

3. **Form Attributes**: Sử dụng:
   - required attribute
   - placeholder attribute
   - min và max cho number input
   - name attribute cho tất cả inputs

4. **Structure**: Sử dụng proper semantic structure với header, main, và footer

Chúc may mắn! 📝`,
        outputCriteria: [
          { snippet: '<form', points: 2, penalty: 0 },
          { snippet: '<input type="text"', points: 1, penalty: 0 },
          { snippet: '<input type="email"', points: 1, penalty: 0 },
          { snippet: '<input type="number"', points: 1, penalty: 0 },
          { snippet: '<input type="checkbox"', points: 1, penalty: 0 },
          { snippet: '<input type="radio"', points: 1, penalty: 0 },
          { snippet: '<textarea', points: 1, penalty: 0 },
          { snippet: '<select', points: 1, penalty: 0 },
          { snippet: '<option', points: 0.5, penalty: 0 },
          { snippet: '<label', points: 1, penalty: 0 },
          { snippet: 'required', points: 1.5, penalty: 0 },
          { snippet: 'placeholder=', points: 1, penalty: 0 },
          { snippet: 'min=', points: 0.5, penalty: 0 },
          { snippet: 'max=', points: 0.5, penalty: 0 },
          { snippet: '<header>', points: 1, penalty: 0 },
          { snippet: '<nav>', points: 1, penalty: 0 },
          { snippet: '<main>', points: 1, penalty: 0 },
          { snippet: '<article>', points: 1, penalty: 0 },
          { snippet: '<section>', points: 1, penalty: 0 },
          { snippet: '<footer>', points: 1, penalty: 0 },
          { snippet: 'type="submit"', points: 1, penalty: 0 }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    // Lesson 2: Advanced CSS - Advanced Selectors and CSS Variables
    const lesson2 = {
      levelId: level2._id,
      lessonNumber: 2,
      title: {
        en: 'Advanced CSS: Advanced Selectors, Pseudo-classes, and CSS Variables',
        vi: 'CSS Nâng cao: Advanced Selectors, Pseudo-classes, và CSS Variables'
      },
      content: {
        en: `# Advanced CSS: Advanced Selectors, Pseudo-classes, and CSS Variables

## Introduction

Welcome to advanced CSS! In this lesson, we'll explore powerful CSS features that make styling more efficient and maintainable.

## Advanced Selectors

### Descendant Selector

Selects all descendants (not just direct children):

\`\`\`css
.container p {
  color: blue;
}
\`\`\`

### Adjacent Sibling Selector (+)

Selects the next sibling element:

\`\`\`css
h1 + p {
  margin-top: 0;
}
\`\`\`

### General Sibling Selector (~)

Selects all following siblings:

\`\`\`css
h1 ~ p {
  color: gray;
}
\`\`\`

### Attribute Selectors

Select elements based on attributes:

\`\`\`css
input[type="text"] {
  border: 1px solid blue;
}

a[href^="https"] {
  color: green;
}

img[alt*="logo"] {
  width: 100px;
}
\`\`\`

## Pseudo-classes

Pseudo-classes select elements in a specific state:

### Link and User Action Pseudo-classes

* \`:link\` - Unvisited links
* \`:visited\` - Visited links
* \`:hover\` - Mouse over element
* \`:active\` - Element being activated
* \`:focus\` - Element has focus

\`\`\`css
a:link { color: blue; }
a:visited { color: purple; }
a:hover { color: red; }
a:active { color: orange; }
input:focus { border: 2px solid blue; }
\`\`\`

### Structural Pseudo-classes

* \`:first-child\` - First child element
* \`:last-child\` - Last child element
* \`:nth-child(n)\` - nth child element
* \`:nth-of-type(n)\` - nth element of its type

\`\`\`css
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(2n) { background-color: lightgray; }
p:nth-of-type(2) { color: blue; }
\`\`\`

## CSS Variables (Custom Properties)

CSS variables allow you to store values for reuse:

\`\`\`css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size: 16px;
  --spacing: 20px;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size);
  padding: var(--spacing);
}

.card {
  border: 2px solid var(--secondary-color);
}
\`\`\`

Variables can be overridden in specific scopes:

\`\`\`css
.dark-theme {
  --primary-color: #ffffff;
  --secondary-color: #000000;
}
\`\`\`

## Pseudo-elements

Pseudo-elements style specific parts of elements:

* \`::before\` - Content before element
* \`::after\` - Content after element
* \`::first-line\` - First line of text
* \`::first-letter\` - First letter of text

\`\`\`css
p::before {
  content: "Note: ";
  font-weight: bold;
}

p::first-letter {
  font-size: 2em;
  color: red;
}
\`\`\`

## Lesson Summary

You've learned advanced CSS selectors, pseudo-classes, pseudo-elements, and CSS variables. These tools make your CSS more powerful, maintainable, and efficient!`,
        vi: `# CSS Nâng cao: Advanced Selectors, Pseudo-classes, và CSS Variables

## Giới thiệu

Chào mừng đến với CSS nâng cao! Trong bài học này, chúng ta sẽ khám phá các tính năng CSS mạnh mẽ làm cho styling hiệu quả và dễ bảo trì hơn.

## Advanced Selectors

### Descendant Selector

Chọn tất cả các phần tử con cháu (không chỉ con trực tiếp):

\`\`\`css
.container p {
  color: blue;
}
\`\`\`

### Adjacent Sibling Selector (+)

Chọn phần tử anh em tiếp theo:

\`\`\`css
h1 + p {
  margin-top: 0;
}
\`\`\`

### General Sibling Selector (~)

Chọn tất cả các phần tử anh em sau:

\`\`\`css
h1 ~ p {
  color: gray;
}
\`\`\`

### Attribute Selectors

Chọn phần tử dựa trên attributes:

\`\`\`css
input[type="text"] {
  border: 1px solid blue;
}

a[href^="https"] {
  color: green;
}

img[alt*="logo"] {
  width: 100px;
}
\`\`\`

## Pseudo-classes

Pseudo-classes chọn phần tử trong trạng thái cụ thể:

### Link và User Action Pseudo-classes

* \`:link\` - Liên kết chưa truy cập
* \`:visited\` - Liên kết đã truy cập
* \`:hover\` - Chuột trên phần tử
* \`:active\` - Phần tử đang được kích hoạt
* \`:focus\` - Phần tử có focus

\`\`\`css
a:link { color: blue; }
a:visited { color: purple; }
a:hover { color: red; }
a:active { color: orange; }
input:focus { border: 2px solid blue; }
\`\`\`

### Structural Pseudo-classes

* \`:first-child\` - Phần tử con đầu tiên
* \`:last-child\` - Phần tử con cuối cùng
* \`:nth-child(n)\` - Phần tử con thứ n
* \`:nth-of-type(n)\` - Phần tử thứ n của loại của nó

\`\`\`css
li:first-child { font-weight: bold; }
li:last-child { border-bottom: none; }
li:nth-child(2n) { background-color: lightgray; }
p:nth-of-type(2) { color: blue; }
\`\`\`

## CSS Variables (Custom Properties)

CSS variables cho phép bạn lưu trữ giá trị để tái sử dụng:

\`\`\`css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size: 16px;
  --spacing: 20px;
}

.button {
  background-color: var(--primary-color);
  font-size: var(--font-size);
  padding: var(--spacing);
}

.card {
  border: 2px solid var(--secondary-color);
}
\`\`\`

Variables có thể được ghi đè trong các scope cụ thể:

\`\`\`css
.dark-theme {
  --primary-color: #ffffff;
  --secondary-color: #000000;
}
\`\`\`

## Pseudo-elements

Pseudo-elements style các phần cụ thể của phần tử:

* \`::before\` - Nội dung trước phần tử
* \`::after\` - Nội dung sau phần tử
* \`::first-line\` - Dòng đầu tiên của văn bản
* \`::first-letter\` - Chữ cái đầu tiên của văn bản

\`\`\`css
p::before {
  content: "Lưu ý: ";
  font-weight: bold;
}

p::first-letter {
  font-size: 2em;
  color: red;
}
\`\`\`

## Tóm tắt bài học

Bạn đã học về advanced CSS selectors, pseudo-classes, pseudo-elements, và CSS variables. Những công cụ này làm cho CSS của bạn mạnh mẽ hơn, dễ bảo trì và hiệu quả hơn!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <style>
        :root {
            --primary: #3498db;
            --secondary: #2ecc71;
        }
        
        .container p {
            color: var(--primary);
        }
        
        a:hover {
            color: var(--secondary);
        }
        
        li:nth-child(2n) {
            background: lightgray;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Styled with CSS variables</p>
    </div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Advanced CSS</title>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="container">
        <h1>Title</h1>
        <p>First paragraph</p>
        <p>Second paragraph</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
        <a href="#">Link</a>
        <input type="text" placeholder="Enter text">
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Sử dụng Advanced CSS Selectors, Pseudo-classes, và CSS Variables!

Yêu cầu:

1. **CSS Variables**: Tạo ít nhất 3 CSS variables trong :root:
   - --primary-color
   - --secondary-color
   - --font-size hoặc --spacing
   - Sử dụng var() để áp dụng các variables này

2. **Advanced Selectors**: Sử dụng ít nhất 2 loại:
   - Descendant selector (ví dụ: .container p)
   - Adjacent sibling selector (+) hoặc General sibling selector (~)
   - Attribute selector (ví dụ: input[type="text"])

3. **Pseudo-classes**: Sử dụng ít nhất 3 pseudo-classes:
   - :hover (cho link hoặc button)
   - :focus (cho input)
   - :first-child, :last-child, hoặc :nth-child()
   - :nth-of-type() (tùy chọn)

4. **Pseudo-elements**: Sử dụng ít nhất 1:
   - ::before hoặc ::after (với content)
   - ::first-letter hoặc ::first-line

5. **Styling**: Áp dụng các styles khác nhau cho các elements

Chúc may mắn! 🎨`,
        outputCriteria: [
          { snippet: ':root {', points: 1.5, penalty: 0 },
          { snippet: '--', points: 2, penalty: 0 },
          { snippet: 'var(', points: 2, penalty: 0 },
          { snippet: ' + ', points: 1.5, penalty: 0 },
          { snippet: ' ~ ', points: 1.5, penalty: 0 },
          { snippet: '[', points: 1.5, penalty: 0 },
          { snippet: ':hover', points: 1, penalty: 0 },
          { snippet: ':focus', points: 1, penalty: 0 },
          { snippet: ':first-child', points: 1, penalty: 0 },
          { snippet: ':last-child', points: 1, penalty: 0 },
          { snippet: ':nth-child', points: 1.5, penalty: 0 },
          { snippet: ':nth-of-type', points: 1.5, penalty: 0 },
          { snippet: '::before', points: 1.5, penalty: 0 },
          { snippet: '::after', points: 1.5, penalty: 0 },
          { snippet: '::first-letter', points: 1, penalty: 0 },
          { snippet: '::first-line', points: 1, penalty: 0 },
          { snippet: 'content:', points: 1, penalty: 0 }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    // Lesson 3: Advanced Layouts - Advanced Grid and Flexbox
    const lesson3 = {
      levelId: level2._id,
      lessonNumber: 3,
      title: {
        en: 'Advanced Layouts: Advanced Grid and Flexbox Techniques',
        vi: 'Layouts Nâng cao: Kỹ thuật Grid và Flexbox Nâng cao'
      },
      content: {
        en: `# Advanced Layouts: Advanced Grid and Flexbox Techniques

## Introduction

Now that you know the basics of Flexbox and Grid, let's explore advanced techniques to create complex, responsive layouts.

## Advanced Flexbox

### Flex Direction

Control the direction of flex items:

\`\`\`css
.container {
  display: flex;
  flex-direction: row; /* or column, row-reverse, column-reverse */
}
\`\`\`

### Flex Wrap

Allow items to wrap to new lines:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap; /* or nowrap, wrap-reverse */
}
\`\`\`

### Flex Shorthand

The \`flex\` property is shorthand for \`flex-grow\`, \`flex-shrink\`, and \`flex-basis\`:

\`\`\`css
.item {
  flex: 1 1 200px; /* grow shrink basis */
}

.item-2 {
  flex: 2; /* grow twice as much */
}
\`\`\`

### Align Content

Aligns flex lines when there's extra space:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: center; /* or flex-start, flex-end, space-between, space-around, stretch */
}
\`\`\`

## Advanced CSS Grid

### Grid Template Areas

Name grid areas for easier layout:

\`\`\`css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
\`\`\`

### Grid Lines and Spanning

Items can span multiple rows/columns:

\`\`\`css
.item {
  grid-column: 1 / 3; /* span from line 1 to 3 */
  grid-row: 1 / 2; /* span from line 1 to 2 */
}

.item-2 {
  grid-column: span 2; /* span 2 columns */
  grid-row: span 3; /* span 3 rows */
}
\`\`\`

### Auto-fit and Auto-fill

Create responsive grids automatically:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
\`\`\`

### Grid Alignment

Align items within grid cells:

\`\`\`css
.container {
  display: grid;
  align-items: center; /* vertical alignment */
  justify-items: center; /* horizontal alignment */
}
\`\`\`

## Combining Flexbox and Grid

Use both together for complex layouts:

\`\`\`css
.page {
  display: grid;
  grid-template-areas: "header" "main" "footer";
}

.main {
  display: flex;
  flex-direction: column;
}
\`\`\`

## Lesson Summary

You've mastered advanced Flexbox and Grid techniques! These powerful tools allow you to create any layout you can imagine.`,
        vi: `# Layouts Nâng cao: Kỹ thuật Grid và Flexbox Nâng cao

## Giới thiệu

Bây giờ bạn đã biết những điều cơ bản của Flexbox và Grid, hãy khám phá các kỹ thuật nâng cao để tạo các layout phức tạp, responsive.

## Advanced Flexbox

### Flex Direction

Kiểm soát hướng của flex items:

\`\`\`css
.container {
  display: flex;
  flex-direction: row; /* hoặc column, row-reverse, column-reverse */
}
\`\`\`

### Flex Wrap

Cho phép items wrap sang dòng mới:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap; /* hoặc nowrap, wrap-reverse */
}
\`\`\`

### Flex Shorthand

Property \`flex\` là shorthand cho \`flex-grow\`, \`flex-shrink\`, và \`flex-basis\`:

\`\`\`css
.item {
  flex: 1 1 200px; /* grow shrink basis */
}

.item-2 {
  flex: 2; /* grow gấp đôi */
}
\`\`\`

### Align Content

Căn chỉnh các dòng flex khi có không gian thừa:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: center; /* hoặc flex-start, flex-end, space-between, space-around, stretch */
}
\`\`\`

## Advanced CSS Grid

### Grid Template Areas

Đặt tên các vùng grid để layout dễ dàng hơn:

\`\`\`css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
\`\`\`

### Grid Lines và Spanning

Items có thể span nhiều hàng/cột:

\`\`\`css
.item {
  grid-column: 1 / 3; /* span từ line 1 đến 3 */
  grid-row: 1 / 2; /* span từ line 1 đến 2 */
}

.item-2 {
  grid-column: span 2; /* span 2 cột */
  grid-row: span 3; /* span 3 hàng */
}
\`\`\`

### Auto-fit và Auto-fill

Tạo grids responsive tự động:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
\`\`\`

### Grid Alignment

Căn chỉnh items trong các ô grid:

\`\`\`css
.container {
  display: grid;
  align-items: center; /* căn chỉnh dọc */
  justify-items: center; /* căn chỉnh ngang */
}
\`\`\`

## Kết hợp Flexbox và Grid

Sử dụng cả hai cùng nhau cho layouts phức tạp:

\`\`\`css
.page {
  display: grid;
  grid-template-areas: "header" "main" "footer";
}

.main {
  display: flex;
  flex-direction: column;
}
\`\`\`

## Tóm tắt bài học

Bạn đã thành thạo các kỹ thuật Flexbox và Grid nâng cao! Những công cụ mạnh mẽ này cho phép bạn tạo bất kỳ layout nào bạn có thể tưởng tượng.`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <style>
        .container {
            display: grid;
            grid-template-areas:
                "header header"
                "sidebar main"
                "footer footer";
            grid-template-columns: 200px 1fr;
            gap: 10px;
        }
        
        .header { grid-area: header; }
        .sidebar { grid-area: sidebar; }
        .main { grid-area: main; }
        .footer { grid-area: footer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Header</div>
        <div class="sidebar">Sidebar</div>
        <div class="main">Main</div>
        <div class="footer">Footer</div>
    </div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Advanced Layout</title>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Header</div>
        <div class="sidebar">Sidebar</div>
        <div class="main">Main Content</div>
        <div class="footer">Footer</div>
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một layout nâng cao với Advanced Grid và Flexbox!

Yêu cầu:

1. **Grid Template Areas**: Sử dụng grid-template-areas để tạo layout:
   - Header (full width)
   - Sidebar và Main (side by side)
   - Footer (full width)
   - Sử dụng grid-area để gán các phần tử

2. **Advanced Grid Properties**:
   - grid-template-columns với fr units
   - grid-template-rows
   - gap property
   - Sử dụng ít nhất 1 grid-column hoặc grid-row span

3. **Advanced Flexbox** (trong một phần của layout):
   - flex-wrap: wrap
   - flex shorthand property (ví dụ: flex: 1)
   - align-content (nếu có nhiều dòng)

4. **Responsive**: Sử dụng minmax() hoặc auto-fit/auto-fill trong grid

5. **Combination**: Kết hợp Grid và Flexbox trong cùng một layout

Chúc may mắn! 🎯`,
        outputCriteria: [
          { snippet: 'grid-template-areas:', points: 2, penalty: 0 },
          { snippet: 'grid-area:', points: 1.5, penalty: 0 },
          { snippet: 'grid-template-columns:', points: 1.5, penalty: 0 },
          { snippet: 'grid-template-rows:', points: 1, penalty: 0 },
          { snippet: 'fr', points: 1.5, penalty: 0 },
          { snippet: 'grid-column:', points: 1.5, penalty: 0 },
          { snippet: 'grid-row:', points: 1.5, penalty: 0 },
          { snippet: 'span', points: 1, penalty: 0 },
          { snippet: 'flex-wrap:', points: 1.5, penalty: 0 },
          { snippet: 'flex:', points: 1.5, penalty: 0 },
          { snippet: 'align-content:', points: 1, penalty: 0 },
          { snippet: 'minmax(', points: 1.5, penalty: 0 },
          { snippet: 'auto-fit', points: 1.5, penalty: 0 },
          { snippet: 'auto-fill', points: 1.5, penalty: 0 },
          { snippet: 'repeat(', points: 1, penalty: 0 }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    // Lesson 4: Advanced JavaScript - Functions and Events
    const lesson4 = {
      levelId: level2._id,
      lessonNumber: 4,
      title: {
        en: 'Advanced JavaScript: Functions, Events, and DOM Manipulation',
        vi: 'JavaScript Nâng cao: Functions, Events, và DOM Manipulation'
      },
      content: {
        en: `# Advanced JavaScript: Functions, Events, and DOM Manipulation

## Introduction

Let's dive deeper into JavaScript! In this lesson, we'll explore functions, event handling, and advanced DOM manipulation techniques.

## JavaScript Functions

Functions are reusable blocks of code.

### Function Declarations

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("World")); // "Hello, World!"
\`\`\`

### Function Expressions

\`\`\`javascript
const greet = function(name) {
  return "Hello, " + name + "!";
};
\`\`\`

### Arrow Functions

\`\`\`javascript
const greet = (name) => {
  return "Hello, " + name + "!";
};

// Shorter version
const add = (a, b) => a + b;
\`\`\`

### Function Parameters

Functions can have default parameters:

\`\`\`javascript
function greet(name = "Guest") {
  return "Hello, " + name + "!";
}
\`\`\`

## Event Handling

### addEventListener

The modern way to handle events:

\`\`\`javascript
const button = document.getElementById('myButton');

button.addEventListener('click', function() {
  alert('Button clicked!');
});

// Using arrow function
button.addEventListener('click', () => {
  console.log('Clicked!');
});
\`\`\`

### Common Events

* \`click\` - Mouse click
* \`mouseenter\` - Mouse enters element
* \`mouseleave\` - Mouse leaves element
* \`keydown\` - Key pressed
* \`keyup\` - Key released
* \`input\` - Input value changed
* \`submit\` - Form submitted
* \`change\` - Select/checkbox/radio changed

### Event Object

Events provide information about what happened:

\`\`\`javascript
button.addEventListener('click', function(event) {
  console.log(event.target); // The element that was clicked
  console.log(event.type); // "click"
  event.preventDefault(); // Prevent default behavior
});
\`\`\`

## Advanced DOM Manipulation

### Query Selector

More flexible element selection:

\`\`\`javascript
// Select first matching element
const element = document.querySelector('.myClass');

// Select all matching elements
const elements = document.querySelectorAll('.myClass');
\`\`\`

### Creating and Appending Elements

\`\`\`javascript
// Create element
const newDiv = document.createElement('div');
newDiv.textContent = 'New content';
newDiv.className = 'my-class';

// Append to parent
const parent = document.getElementById('container');
parent.appendChild(newDiv);

// Insert before
const sibling = document.querySelector('.sibling');
parent.insertBefore(newDiv, sibling);
\`\`\`

### Removing Elements

\`\`\`javascript
// Remove element
const element = document.getElementById('toRemove');
element.remove();

// Remove child
const parent = document.getElementById('parent');
const child = document.getElementById('child');
parent.removeChild(child);
\`\`\`

### Modifying Attributes and Classes

\`\`\`javascript
// Set/get attributes
element.setAttribute('data-id', '123');
const id = element.getAttribute('data-id');

// Classes
element.classList.add('new-class');
element.classList.remove('old-class');
element.classList.toggle('active');
element.classList.contains('active'); // true/false
\`\`\`

## Lesson Summary

You've learned about JavaScript functions, event handling, and advanced DOM manipulation. These are essential skills for creating interactive web applications!`,
        vi: `# JavaScript Nâng cao: Functions, Events, và DOM Manipulation

## Giới thiệu

Hãy đi sâu hơn vào JavaScript! Trong bài học này, chúng ta sẽ khám phá functions, event handling, và các kỹ thuật DOM manipulation nâng cao.

## JavaScript Functions

Functions là các khối code có thể tái sử dụng.

### Function Declarations

\`\`\`javascript
function greet(name) {
  return "Xin chào, " + name + "!";
}

console.log(greet("Thế giới")); // "Xin chào, Thế giới!"
\`\`\`

### Function Expressions

\`\`\`javascript
const greet = function(name) {
  return "Xin chào, " + name + "!";
};
\`\`\`

### Arrow Functions

\`\`\`javascript
const greet = (name) => {
  return "Xin chào, " + name + "!";
};

// Phiên bản ngắn hơn
const add = (a, b) => a + b;
\`\`\`

### Function Parameters

Functions có thể có default parameters:

\`\`\`javascript
function greet(name = "Khách") {
  return "Xin chào, " + name + "!";
}
\`\`\`

## Event Handling

### addEventListener

Cách hiện đại để xử lý events:

\`\`\`javascript
const button = document.getElementById('myButton');

button.addEventListener('click', function() {
  alert('Nút đã được nhấp!');
});

// Sử dụng arrow function
button.addEventListener('click', () => {
  console.log('Đã nhấp!');
});
\`\`\`

### Common Events

* \`click\` - Nhấp chuột
* \`mouseenter\` - Chuột vào phần tử
* \`mouseleave\` - Chuột rời phần tử
* \`keydown\` - Phím được nhấn
* \`keyup\` - Phím được thả
* \`input\` - Giá trị input thay đổi
* \`submit\` - Form được submit
* \`change\` - Select/checkbox/radio thay đổi

### Event Object

Events cung cấp thông tin về những gì đã xảy ra:

\`\`\`javascript
button.addEventListener('click', function(event) {
  console.log(event.target); // Phần tử đã được nhấp
  console.log(event.type); // "click"
  event.preventDefault(); // Ngăn chặn hành vi mặc định
});
\`\`\`

## Advanced DOM Manipulation

### Query Selector

Lựa chọn phần tử linh hoạt hơn:

\`\`\`javascript
// Chọn phần tử khớp đầu tiên
const element = document.querySelector('.myClass');

// Chọn tất cả phần tử khớp
const elements = document.querySelectorAll('.myClass');
\`\`\`

### Creating và Appending Elements

\`\`\`javascript
// Tạo phần tử
const newDiv = document.createElement('div');
newDiv.textContent = 'Nội dung mới';
newDiv.className = 'my-class';

// Append vào parent
const parent = document.getElementById('container');
parent.appendChild(newDiv);

// Insert before
const sibling = document.querySelector('.sibling');
parent.insertBefore(newDiv, sibling);
\`\`\`

### Removing Elements

\`\`\`javascript
// Xóa phần tử
const element = document.getElementById('toRemove');
element.remove();

// Xóa child
const parent = document.getElementById('parent');
const child = document.getElementById('child');
parent.removeChild(child);
\`\`\`

### Modifying Attributes và Classes

\`\`\`javascript
// Set/get attributes
element.setAttribute('data-id', '123');
const id = element.getAttribute('data-id');

// Classes
element.classList.add('new-class');
element.classList.remove('old-class');
element.classList.toggle('active');
element.classList.contains('active'); // true/false
\`\`\`

## Tóm tắt bài học

Bạn đã học về JavaScript functions, event handling, và advanced DOM manipulation. Đây là những kỹ năng cần thiết để tạo các ứng dụng web tương tác!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Advanced JavaScript Example</title>
</head>
<body>
    <button id="btn">Click Me</button>
    <div id="container"></div>
    
    <script>
        function createElement(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div;
        }
        
        const button = document.getElementById('btn');
        button.addEventListener('click', () => {
            const container = document.getElementById('container');
            const newElement = createElement('New item added!');
            container.appendChild(newElement);
        });
    </script>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Interactive Page</title>
</head>
<body>
    <button id="addBtn">Add Item</button>
    <button id="removeBtn">Remove Item</button>
    <input type="text" id="input" placeholder="Enter text">
    <div id="container"></div>
    
    <script>
        // Add your JavaScript here
    </script>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web tương tác với Advanced JavaScript!

Yêu cầu:

1. **Functions**: Tạo ít nhất 2 functions:
   - Function declaration (function keyword)
   - Arrow function hoặc function expression
   - Sử dụng parameters và return values

2. **Event Handling**: Sử dụng addEventListener cho ít nhất 3 events:
   - click event
   - input hoặc change event
   - Một event khác (mouseenter, keydown, etc.)

3. **DOM Manipulation**:
   - Sử dụng querySelector hoặc querySelectorAll
   - Tạo elements với createElement
   - Append elements với appendChild
   - Remove elements với remove() hoặc removeChild()
   - Sử dụng classList (add, remove, toggle)

4. **Event Object**: Sử dụng event object:
   - event.target
   - event.preventDefault() (nếu cần)
   - event.type

5. **Interactive Features**: Tạo các tính năng tương tác:
   - Thêm items vào danh sách khi click button
   - Xóa items khi click button khác
   - Cập nhật content dựa trên input

Chúc may mắn! 💻`,
        outputCriteria: [
          { snippet: 'function ', points: 1.5, penalty: 0 },
          { snippet: '=>', points: 1.5, penalty: 0 },
          { snippet: 'addEventListener', points: 2, penalty: 0 },
          { snippet: "'click'", points: 1, penalty: 0 },
          { snippet: "'input'", points: 1, penalty: 0 },
          { snippet: "'change'", points: 1, penalty: 0 },
          { snippet: 'querySelector', points: 1.5, penalty: 0 },
          { snippet: 'querySelectorAll', points: 1.5, penalty: 0 },
          { snippet: 'createElement', points: 2, penalty: 0 },
          { snippet: 'appendChild', points: 2, penalty: 0 },
          { snippet: '.remove()', points: 1.5, penalty: 0 },
          { snippet: 'removeChild', points: 1.5, penalty: 0 },
          { snippet: 'classList.add', points: 1, penalty: 0 },
          { snippet: 'classList.remove', points: 1, penalty: 0 },
          { snippet: 'classList.toggle', points: 1, penalty: 0 },
          { snippet: 'event.target', points: 1.5, penalty: 0 },
          { snippet: 'preventDefault', points: 1, penalty: 0 },
          { snippet: 'return', points: 0.5, penalty: 0 }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    // Lesson 5: JavaScript Fundamentals - Arrays, Objects, Loops
    const lesson5 = {
      levelId: level2._id,
      lessonNumber: 5,
      title: {
        en: 'JavaScript Fundamentals: Arrays, Objects, and Loops',
        vi: 'JavaScript Cơ bản: Arrays, Objects, và Loops'
      },
      content: {
        en: `# JavaScript Fundamentals: Arrays, Objects, and Loops

## Introduction

Understanding arrays, objects, and loops is fundamental to JavaScript programming. Let's master these concepts!

## Arrays

Arrays store multiple values in a single variable.

### Creating Arrays

\`\`\`javascript
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];
const mixed = ['text', 123, true];
\`\`\`

### Array Methods

\`\`\`javascript
// Add/Remove
fruits.push('grape'); // Add to end
fruits.pop(); // Remove from end
fruits.unshift('mango'); // Add to start
fruits.shift(); // Remove from start

// Find
fruits.indexOf('banana'); // Returns index
fruits.includes('apple'); // Returns true/false

// Transform
fruits.map(item => item.toUpperCase());
fruits.filter(item => item.length > 5);
fruits.forEach(item => console.log(item));
\`\`\`

### Array Length

\`\`\`javascript
const length = fruits.length; // Number of items
\`\`\`

## Objects

Objects store key-value pairs.

### Creating Objects

\`\`\`javascript
const person = {
  name: 'John',
  age: 30,
  city: 'New York'
};

// Access properties
console.log(person.name); // "John"
console.log(person['age']); // 30

// Add/Modify
person.email = 'john@example.com';
person.age = 31;
\`\`\`

### Object Methods

\`\`\`javascript
const person = {
  name: 'John',
  greet: function() {
    return "Hello, " + this.name;
  }
};

// Or with arrow function
const person2 = {
  name: 'Jane',
  greet: () => {
    return "Hello, " + this.name;
  }
};
\`\`\`

## Loops

Loops repeat code multiple times.

### For Loop

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

### For...of Loop (Arrays)

\`\`\`javascript
const fruits = ['apple', 'banana', 'orange'];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

### For...in Loop (Objects)

\`\`\`javascript
const person = { name: 'John', age: 30 };
for (const key in person) {
  console.log(key + ': ' + person[key]);
}
\`\`\`

### While Loop

\`\`\`javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
\`\`\`

### Array.forEach

\`\`\`javascript
fruits.forEach(function(fruit, index) {
  console.log(index + ': ' + fruit);
});
\`\`\`

## Combining Concepts

\`\`\`javascript
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];

users.forEach(user => {
  console.log(user.name + ' is ' + user.age);
});
\`\`\`

## Lesson Summary

You've learned about arrays, objects, and loops in JavaScript. These are essential building blocks for all JavaScript programming!`,
        vi: `# JavaScript Cơ bản: Arrays, Objects, và Loops

## Giới thiệu

Hiểu về arrays, objects, và loops là nền tảng của lập trình JavaScript. Hãy thành thạo các khái niệm này!

## Arrays

Arrays lưu trữ nhiều giá trị trong một biến.

### Tạo Arrays

\`\`\`javascript
const fruits = ['táo', 'chuối', 'cam'];
const numbers = [1, 2, 3, 4, 5];
const mixed = ['văn bản', 123, true];
\`\`\`

### Array Methods

\`\`\`javascript
// Thêm/Xóa
fruits.push('nho'); // Thêm vào cuối
fruits.pop(); // Xóa từ cuối
fruits.unshift('xoài'); // Thêm vào đầu
fruits.shift(); // Xóa từ đầu

// Tìm
fruits.indexOf('chuối'); // Trả về index
fruits.includes('táo'); // Trả về true/false

// Transform
fruits.map(item => item.toUpperCase());
fruits.filter(item => item.length > 5);
fruits.forEach(item => console.log(item));
\`\`\`

### Array Length

\`\`\`javascript
const length = fruits.length; // Số lượng items
\`\`\`

## Objects

Objects lưu trữ các cặp key-value.

### Tạo Objects

\`\`\`javascript
const person = {
  name: 'John',
  age: 30,
  city: 'New York'
};

// Truy cập properties
console.log(person.name); // "John"
console.log(person['age']); // 30

// Thêm/Sửa
person.email = 'john@example.com';
person.age = 31;
\`\`\`

### Object Methods

\`\`\`javascript
const person = {
  name: 'John',
  greet: function() {
    return "Xin chào, " + this.name;
  }
};

// Hoặc với arrow function
const person2 = {
  name: 'Jane',
  greet: () => {
    return "Xin chào, " + this.name;
  }
};
\`\`\`

## Loops

Loops lặp lại code nhiều lần.

### For Loop

\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // 0, 1, 2, 3, 4
}
\`\`\`

### For...of Loop (Arrays)

\`\`\`javascript
const fruits = ['táo', 'chuối', 'cam'];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

### For...in Loop (Objects)

\`\`\`javascript
const person = { name: 'John', age: 30 };
for (const key in person) {
  console.log(key + ': ' + person[key]);
}
\`\`\`

### While Loop

\`\`\`javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}
\`\`\`

### Array.forEach

\`\`\`javascript
fruits.forEach(function(fruit, index) {
  console.log(index + ': ' + fruit);
});
\`\`\`

## Kết hợp Concepts

\`\`\`javascript
const users = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];

users.forEach(user => {
  console.log(user.name + ' là ' + user.age);
});
\`\`\`

## Tóm tắt bài học

Bạn đã học về arrays, objects, và loops trong JavaScript. Đây là những khối xây dựng cần thiết cho tất cả lập trình JavaScript!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>JavaScript Arrays and Objects</title>
</head>
<body>
    <div id="output"></div>
    
    <script>
        const users = [
            { name: 'John', age: 30 },
            { name: 'Jane', age: 25 }
        ];
        
        users.forEach(user => {
            console.log(user.name + ' is ' + user.age);
        });
    </script>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Arrays and Objects</title>
</head>
<body>
    <button id="displayBtn">Display Items</button>
    <div id="output"></div>
    
    <script>
        // Add your JavaScript here
    </script>
</body>
</html>`,
        description: `🎯 Bài tập: Làm việc với Arrays, Objects, và Loops trong JavaScript!

Yêu cầu:

1. **Arrays**: Tạo ít nhất 1 array với:
   - Ít nhất 3 items
   - Sử dụng array methods: push(), pop(), forEach(), map(), hoặc filter()

2. **Objects**: Tạo ít nhất 1 object với:
   - Ít nhất 3 properties
   - Truy cập properties bằng cả dot notation và bracket notation
   - Thêm/sửa properties

3. **Loops**: Sử dụng ít nhất 2 loại loops:
   - for loop
   - for...of loop (cho arrays)
   - for...in loop (cho objects)
   - while loop
   - forEach() method

4. **Array of Objects**: Tạo một array chứa objects và:
   - Sử dụng forEach() hoặc for...of để lặp qua
   - Truy cập properties của objects trong array
   - Hiển thị hoặc xử lý dữ liệu

5. **DOM Integration**: 
   - Sử dụng loops để tạo elements động
   - Hiển thị array/object data trên trang
   - Sử dụng addEventListener để trigger actions

Chúc may mắn! 📊`,
        outputCriteria: [
          { snippet: 'const [', points: 1.5, penalty: 0 },
          { snippet: 'let [', points: 1, penalty: 0 },
          { snippet: 'var [', points: 1, penalty: 0 },
          { snippet: '.push(', points: 1, penalty: 0 },
          { snippet: '.pop()', points: 1, penalty: 0 },
          { snippet: '.forEach(', points: 2, penalty: 0 },
          { snippet: '.map(', points: 1.5, penalty: 0 },
          { snippet: '.filter(', points: 1.5, penalty: 0 },
          { snippet: 'for (', points: 1.5, penalty: 0 },
          { snippet: 'for (const', points: 1.5, penalty: 0 },
          { snippet: 'for...of', points: 1.5, penalty: 0 },
          { snippet: 'for...in', points: 1.5, penalty: 0 },
          { snippet: 'while (', points: 1.5, penalty: 0 },
          { snippet: '{', points: 0.5, penalty: 0 },
          { snippet: ':', points: 0.5, penalty: 0 },
          { snippet: '.length', points: 1, penalty: 0 },
          { snippet: 'this.', points: 1, penalty: 0 }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    // Create all lessons
    const lessons = [lesson1, lesson2, lesson3, lesson4, lesson5]
    const createdLessons = []

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i]
      
      // Check if lesson already exists
      const existing = await Lesson.findOne({
        levelId: level2._id,
        lessonNumber: lesson.lessonNumber
      })

      if (existing) {
        console.log(`Lesson ${lesson.lessonNumber} already exists. Deleting...`)
        await Lesson.findByIdAndDelete(existing._id)
      }

      const created = await Lesson.create(lesson)
      
      // Add to level
      const level = await Level.findById(level2._id)
      if (level && !level.lessons.includes(created._id)) {
        level.lessons.push(created._id)
        await level.save()
      }

      createdLessons.push(created)
      console.log(`✅ Created Lesson ${lesson.lessonNumber}: ${created.title.en}`)
    }

    console.log(`\n✅ Successfully created ${createdLessons.length} lessons for Level 2!`)
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createLevel2Lessons()

