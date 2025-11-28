import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson2 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find Level 1
    let level1 = await Level.findOne({ levelNumber: 1 })
      .populate('languageId')
      .sort({ createdAt: 1 })

    if (!level1) {
      const Language = (await import('../models/Language.js')).default
      const htmlLang = await Language.findOne({ 
        $or: [
          { name: { $regex: /html|css|javascript/i } },
          { slug: { $regex: /html|css|javascript/i } }
        ]
      })
      
      if (htmlLang) {
        level1 = await Level.findOne({ 
          levelNumber: 1,
          languageId: htmlLang._id 
        }).populate('languageId')
      }
    }

    if (!level1) {
      console.error('Level 1 not found. Please check your database.')
      process.exit(1)
    }

    console.log(`Found Level 1: ${level1.title} (ID: ${level1._id})`)

    // Check if lesson 2 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 2
    })

    if (existingLesson) {
      console.log('Lesson 2 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 2')
    }

    // Create lesson 2 content based on CodeSignal
    const lesson2 = {
      levelId: level1._id,
      lessonNumber: 2,
      title: {
        en: 'Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting',
        vi: 'Cấu trúc và Tổ chức Nội dung Web với HTML Lists, Tables, và Formatting'
      },
      content: {
        en: `# Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting

## Introduction

Excited about diving deeper into **HTML**? Our focus today is structuring web content using HTML. In this lesson, we'll explore HTML lists, tables, and formatting tags. These elements organize and clarify your web pages, enhancing the user experience. Let's get started.

## Exploring HTML Lists

Lists offer an efficient presentation of organized information. HTML includes both unordered (with bullet points) and ordered (numbered) lists.

### Unordered Lists

Often, we use unordered lists for text items of equal importance. The \`<ul>\` tag signifies the list, and the \`<li>\` tag encloses each item.

Consider this shopping list example:

\`\`\`html
<ul>
  <li>Apples</li>
  <li>Bananas</li>
  <li>Oranges</li>
</ul>
\`\`\`

This code produces a list with bullet points. Each bullet point introduces a new item, signifying an unordered list.

### Ordered Lists

When sequence matters, like in instructions, we use ordered lists. The tag for ordered lists is \`<ol>\` while \`<li>\` is for the list items.

Here's an ordered list example representing a cooking recipe:

\`\`\`html
<ol>
  <li>Preheat the oven</li>
  <li>Mix ingredients</li>
  <li>Bake for 30 minutes</li>
</ol>
\`\`\`

Executing this code results in numbered items — a perfect fit for step-by-step instructions.

### Nesting Lists

When you need a hierarchical structure, nested lists are handy. For example, a categorized shopping list could utilize nested lists.

Here's how:

\`\`\`html
<ul>
  <li>Fruits
    <ul>
      <li>Apples</li>
      <li>Bananas</li>
    </ul>
  </li>
  <li>Vegetables
    <ul>
      <li>Carrots</li>
      <li>Broccoli</li>
    </ul>
  </li>
</ul>
\`\`\`

Each nested \`<ul>\` forms subcategories under the main list items.

## Understanding HTML Tables

Tables, invaluable for displaying data in a structured manner, simplify the organization and reading of complex data.

In HTML, tables use the \`<table>\` tag. The \`<tr>\` tag facilities new rows, and \`<td>\` is for cells within the rows. Headers use the \`<th>\` tag.

Let's construct a student grade table:

\`\`\`html
<table>
  <tr>
    <th>Student</th>
    <th>Grade</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>A</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>B</td>
  </tr>
</table>
\`\`\`

This creates a clear, tabulated display of students and their grades.

## Formatting Text with HTML

Webpages often need to display formatted text, perhaps for a heading or to emphasize a word. HTML offers tags to achieve this:

* \`<b>\` makes text bold.
* \`<i>\` italicizes text.
* \`<u>\` underlines text.
* \`<s>\` strikes through text.
* \`<br>\` inserts a line break.
* \`<hr>\` draws a horizontal line.

For example:

\`\`\`html
<p>This is <b>bold</b> and this is <i>italic</i>.</p>
<p>This is <u>underlined</u> and this is <s>strikethrough</s>.</p>
<br>
<hr>
\`\`\`

However, \`<b>\` and \`<i>\` tags are presentational. For a more modern approach, use the \`<strong>\` and \`<em>\` semantic tags instead.

## HTML Entities

Special characters like \`<\` or \`&\` require HTML entities to display.

* \`&lt;\` for \`<\`
* \`&gt;\` for \`>\`
* \`&amp;\` for \`&\`
* \`&deg;\` for \`°\`
* \`&copy;\` for \`©\`

Here's an example:

\`\`\`html
<p>The temperature is 25&deg;C</p>
<p>&copy; 2025 My Company</p>
\`\`\`

## Lesson Summary

Great job! Through this lesson, you've learned to organize and structure **HTML** content using lists, tables, and formatting. Now's the time to cement this learning through real-life exercises — a critical step toward becoming an efficient web developer.`,
        vi: `# Cấu trúc và Tổ chức Nội dung Web với HTML Lists, Tables, và Formatting

## Giới thiệu

Bạn có hứng thú tìm hiểu sâu hơn về **HTML**? Hôm nay chúng ta sẽ tập trung vào việc cấu trúc nội dung web bằng HTML. Trong bài học này, chúng ta sẽ khám phá các thẻ HTML lists, tables, và formatting. Những phần tử này giúp tổ chức và làm rõ các trang web của bạn, nâng cao trải nghiệm người dùng. Hãy bắt đầu!

## Khám phá HTML Lists

Lists cung cấp một cách trình bày hiệu quả cho thông tin có tổ chức. HTML bao gồm cả unordered lists (có dấu đầu dòng) và ordered lists (có đánh số).

### Unordered Lists

Thường thì chúng ta sử dụng unordered lists cho các mục văn bản có tầm quan trọng ngang nhau. Thẻ \`<ul>\` đánh dấu danh sách, và thẻ \`<li>\` bao quanh mỗi mục.

Hãy xem ví dụ danh sách mua sắm này:

\`\`\`html
<ul>
  <li>Táo</li>
  <li>Chuối</li>
  <li>Cam</li>
</ul>
\`\`\`

Đoạn code này tạo ra một danh sách có dấu đầu dòng. Mỗi dấu đầu dòng giới thiệu một mục mới, biểu thị một unordered list.

### Ordered Lists

Khi thứ tự quan trọng, như trong hướng dẫn, chúng ta sử dụng ordered lists. Thẻ cho ordered lists là \`<ol>\` trong khi \`<li>\` dành cho các mục trong danh sách.

Đây là ví dụ ordered list đại diện cho công thức nấu ăn:

\`\`\`html
<ol>
  <li>Làm nóng lò</li>
  <li>Trộn nguyên liệu</li>
  <li>Nướng trong 30 phút</li>
</ol>
\`\`\`

Thực thi code này tạo ra các mục được đánh số — hoàn hảo cho hướng dẫn từng bước.

### Nested Lists

Khi bạn cần cấu trúc phân cấp, nested lists rất hữu ích. Ví dụ, một danh sách mua sắm được phân loại có thể sử dụng nested lists.

Đây là cách:

\`\`\`html
<ul>
  <li>Trái cây
    <ul>
      <li>Táo</li>
      <li>Chuối</li>
    </ul>
  </li>
  <li>Rau củ
    <ul>
      <li>Cà rốt</li>
      <li>Bông cải xanh</li>
    </ul>
  </li>
</ul>
\`\`\`

Mỗi \`<ul>\` lồng nhau tạo thành các danh mục phụ dưới các mục danh sách chính.

## Hiểu về HTML Tables

Tables, vô giá cho việc hiển thị dữ liệu một cách có cấu trúc, đơn giản hóa việc tổ chức và đọc dữ liệu phức tạp.

Trong HTML, tables sử dụng thẻ \`<table>\`. Thẻ \`<tr>\` tạo các hàng mới, và \`<td>\` dành cho các ô trong hàng. Headers sử dụng thẻ \`<th>\`.

Hãy xây dựng một bảng điểm học sinh:

\`\`\`html
<table>
  <tr>
    <th>Học sinh</th>
    <th>Điểm</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>A</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>B</td>
  </tr>
</table>
\`\`\`

Điều này tạo ra một hiển thị rõ ràng, dạng bảng của học sinh và điểm số của họ.

## Formatting Text với HTML

Các trang web thường cần hiển thị văn bản được định dạng, có thể cho tiêu đề hoặc để nhấn mạnh một từ. HTML cung cấp các thẻ để đạt được điều này:

* \`<b>\` làm cho văn bản đậm.
* \`<i>\` làm cho văn bản in nghiêng.
* \`<u>\` gạch chân văn bản.
* \`<s>\` gạch ngang văn bản.
* \`<br>\` chèn ngắt dòng.
* \`<hr>\` vẽ một đường ngang.

Ví dụ:

\`\`\`html
<p>Đây là <b>đậm</b> và đây là <i>nghiêng</i>.</p>
<p>Đây là <u>gạch chân</u> và đây là <s>gạch ngang</s>.</p>
<br>
<hr>
\`\`\`

Tuy nhiên, các thẻ \`<b>\` và \`<i>\` là presentational. Để tiếp cận hiện đại hơn, hãy sử dụng các thẻ semantic \`<strong>\` và \`<em>\` thay thế.

## HTML Entities

Các ký tự đặc biệt như \`<\` hoặc \`&\` yêu cầu HTML entities để hiển thị.

* \`&lt;\` cho \`<\`
* \`&gt;\` cho \`>\`
* \`&amp;\` cho \`&\`
* \`&deg;\` cho \`°\`
* \`&copy;\` cho \`©\`

Đây là ví dụ:

\`\`\`html
<p>Nhiệt độ là 25&deg;C</p>
<p>&copy; 2025 Công ty của tôi</p>
\`\`\`

## Tóm tắt bài học

Làm tốt lắm! Qua bài học này, bạn đã học cách tổ chức và cấu trúc nội dung **HTML** bằng cách sử dụng lists, tables, và formatting. Bây giờ là lúc củng cố việc học này thông qua các bài tập thực tế — một bước quan trọng để trở thành một web developer hiệu quả.`
      },
      codeExample: `<!-- Example: Complete HTML page with lists, tables, and formatting -->
<!DOCTYPE html>
<html>
<head>
    <title>HTML Lists, Tables, and Formatting</title>
</head>
<body>
    <h1>My Web Page</h1>
    
    <!-- Unordered List -->
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
    </ul>
    
    <!-- Ordered List -->
    <ol>
        <li>Step 1</li>
        <li>Step 2</li>
    </ol>
    
    <!-- Table -->
    <table>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
        </tr>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </table>
    
    <!-- Formatting -->
    <p>This is <b>bold</b> and <i>italic</i> text.</p>
    <p>Temperature: 25&deg;C</p>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Create a Recipe Page</title>
</head>
<body>
    <h1>Recipe Page</h1>
    <!-- Add your code here -->
</body>
</html>`,
        description: `🎯 Exercise: Create a complete recipe page!

Use the following HTML elements to build your recipe page:

1. **Unordered List (<ul> and <li>)**: Create an ingredients list with at least 3 items
2. **Ordered List (<ol> and <li>)**: Create cooking instructions with at least 3 steps
3. **Table (<table>, <tr>, <th>, <td>)**: Create a nutrition facts table with at least 2 rows (including header row)
4. **Formatting Tags**: Use at least 2 different formatting tags from: <b>, <i>, <u>, <s>, <strong>, <em>
5. **HTML Entities**: Use at least 1 HTML entity (like &deg; for temperature or &copy; for copyright)

Requirements:
- Must include all 5 elements above
- Code must be valid HTML
- Use proper structure and organization

Good luck! 🍳`,
        outputCriteria: [
          {
            snippet: '<ul>',
            points: 2,
            penalty: 0
          },
          {
            snippet: '<li>',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<ol>',
            points: 2,
            penalty: 0
          },
          {
            snippet: '<table>',
            points: 2,
            penalty: 0
          },
          {
            snippet: '<tr>',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<th>',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<td>',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<b>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '<i>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '<u>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '<s>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '<strong>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '<em>',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '&deg;',
            points: 1,
            penalty: 0
          },
          {
            snippet: '&copy;',
            points: 1,
            penalty: 0
          },
          {
            snippet: '&lt;',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '&gt;',
            points: 0.5,
            penalty: 0
          }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    const createdLesson = await Lesson.create(lesson2)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 2 created successfully!')
    console.log(`Lesson ID: ${createdLesson._id}`)
    console.log(`Title: ${createdLesson.title.en}`)
    console.log(`Level: ${level1.title}`)
    console.log(`OutputCriteria count: ${createdLesson.codeExercise.outputCriteria.length}`)
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

createLesson2()

