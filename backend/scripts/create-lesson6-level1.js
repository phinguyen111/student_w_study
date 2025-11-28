import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson6 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find Level 1
    let level1 = await Level.findOne({ levelNumber: 1 })
      .populate('languageId')
      .sort({ createdAt: 1 })

    if (!level1) {
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

    // Check if lesson 6 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 6
    })

    if (existingLesson) {
      console.log('Lesson 6 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 6')
    }

    // Create lesson 6 content based on CodeSignal
    const lesson6 = {
      levelId: level1._id,
      lessonNumber: 6,
      title: {
        en: 'Mastering Adaptive Web Design: Responsive Layouts and Media Queries in CSS',
        vi: 'Thành thạo Thiết kế Web Thích ứng: Responsive Layouts và Media Queries trong CSS'
      },
      content: {
        en: `# Mastering Adaptive Web Design: Responsive Layouts and Media Queries in CSS

## Introduction to Responsive Web Design

Welcome to an exciting chapter! We know that **HTML**, **CSS**, and **JavaScript** are the key languages that bring web pages to life. But devices like smartphones, tablets, laptops, or smartwatches which are used to view our pages come in various sizes. The solution? **Responsive Web Design**. It ensures that web pages detect the viewer's screen size and orientation and adjusts the layout accordingly. It's similar to words in a book reflowing to fit pages of different sizes. Now, let's delve deeper!

## Understanding Media Queries

To make your site responsive, you should embrace CSS **Media Queries**. These are instrumental in Responsive Web Design. Media queries implement certain CSS rules when specific conditions are fulfilled. For example, the following is a simple media query that applies a rule when the browser window is less than 600 pixels wide:

\`\`\`css
@media screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}
\`\`\`

In the above segment, \`screen\` is the media **type** and \`(max-width: 600px)\` is the **media feature**. It changes the body's background color to light blue when the viewport is 600 pixels wide or less.

## Creating Responsive Layouts with Media Queries

Media queries modify layouts based on screen size. For example, a webpage layout on a large screen (like a desktop) would differ from that on a smaller screen (like a smartphone). Here's an example:

\`\`\`html
<div class="container">
  <div class="sidebar">Sidebar</div>
  <div class="main-content">Main Content</div>
</div>
\`\`\`

And the corresponding CSS in \`styles.css\`:

\`\`\`css
.container {
  display: flex;
}

.sidebar {
  width: 25%;
  margin-left: 1%;
}

.main-content {
  width: 73%;
  margin-left: 1%;
}

@media screen and (max-width: 600px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .main-content {
    width: 100%;
  }
}
\`\`\`

Note that when we give a value as a percentage, such as \`margin-left: 1%;\`, it means that the left margin is set to 1% of the total width of the parent element. For example, if the parent element has a width of 800px, a \`margin-left: 1%;\` on the child element would be equivalent to 8px.

## Mobile-First Approach in Responsive Design

We can initially structure for big screens and then adapt it for smaller screens. However, in web development, a widely recognized approach is the **Mobile-First Design**. It includes designing for small screens first and then scaling up for larger screens.

Here's an example to illustrate:

\`\`\`css
/* Mobile-first: Base styles for small screens */
.container {
  width: 100%;
  padding: 10px;
}

/* Tablet and larger screens */
@media screen and (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Desktop screens */
@media screen and (min-width: 1024px) {
  .container {
    width: 1000px;
  }
}
\`\`\`

## Lesson Summary

That concludes our lesson! Today, you've unlocked a key aspect of web development! You've learned about:

* Responsive website design — what it involves and why it is significant.
* Media queries — why we use them and their syntax.
* Creating Responsive layouts using Media Queries — how they enhance viewer experience.
* The **Mobile-First** design approach — how it ensures a better responsive design.

It's now time to practice. In the upcoming exercises, you'll build a responsive webpage layout that should adapt to different screen sizes. Enhance your web-development skills and explore more in the following exercises! Good luck!`,
        vi: `# Thành thạo Thiết kế Web Thích ứng: Responsive Layouts và Media Queries trong CSS

## Giới thiệu về Responsive Web Design

Chào mừng đến với một chương thú vị! Chúng ta biết rằng **HTML**, **CSS**, và **JavaScript** là các ngôn ngữ chính làm cho các trang web trở nên sống động. Nhưng các thiết bị như điện thoại thông minh, máy tính bảng, laptop, hoặc smartwatch được sử dụng để xem các trang của chúng ta có nhiều kích thước khác nhau. Giải pháp? **Responsive Web Design**. Nó đảm bảo rằng các trang web phát hiện kích thước và hướng màn hình của người xem và điều chỉnh layout tương ứng. Nó tương tự như các từ trong một cuốn sách được sắp xếp lại để vừa với các trang có kích thước khác nhau. Bây giờ, hãy đi sâu hơn!

## Hiểu về Media Queries

Để làm cho trang web của bạn responsive, bạn nên sử dụng CSS **Media Queries**. Chúng rất quan trọng trong Responsive Web Design. Media queries thực hiện các quy tắc CSS nhất định khi các điều kiện cụ thể được đáp ứng. Ví dụ, sau đây là một media query đơn giản áp dụng một quy tắc khi cửa sổ trình duyệt nhỏ hơn 600 pixel:

\`\`\`css
@media screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}
\`\`\`

Trong đoạn trên, \`screen\` là **media type** và \`(max-width: 600px)\` là **media feature**. Nó thay đổi màu nền của body thành màu xanh nhạt khi viewport rộng 600 pixel hoặc ít hơn.

## Tạo Responsive Layouts với Media Queries

Media queries điều chỉnh layouts dựa trên kích thước màn hình. Ví dụ, layout của một trang web trên màn hình lớn (như desktop) sẽ khác với layout trên màn hình nhỏ hơn (như điện thoại thông minh). Đây là một ví dụ:

\`\`\`html
<div class="container">
  <div class="sidebar">Sidebar</div>
  <div class="main-content">Nội dung chính</div>
</div>
\`\`\`

Và CSS tương ứng trong \`styles.css\`:

\`\`\`css
.container {
  display: flex;
}

.sidebar {
  width: 25%;
  margin-left: 1%;
}

.main-content {
  width: 73%;
  margin-left: 1%;
}

@media screen and (max-width: 600px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .main-content {
    width: 100%;
  }
}
\`\`\`

Lưu ý rằng khi chúng ta đưa ra một giá trị dưới dạng phần trăm, chẳng hạn như \`margin-left: 1%;\`, có nghĩa là margin trái được đặt thành 1% tổng chiều rộng của phần tử cha. Ví dụ, nếu phần tử cha có chiều rộng 800px, \`margin-left: 1%;\` trên phần tử con sẽ tương đương với 8px.

## Mobile-First Approach trong Responsive Design

Chúng ta có thể ban đầu cấu trúc cho màn hình lớn và sau đó thích ứng cho màn hình nhỏ hơn. Tuy nhiên, trong phát triển web, một cách tiếp cận được công nhận rộng rãi là **Mobile-First Design**. Nó bao gồm thiết kế cho màn hình nhỏ trước và sau đó mở rộng cho màn hình lớn hơn.

Đây là một ví dụ để minh họa:

\`\`\`css
/* Mobile-first: Base styles cho màn hình nhỏ */
.container {
  width: 100%;
  padding: 10px;
}

/* Tablet và màn hình lớn hơn */
@media screen and (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Màn hình desktop */
@media screen and (min-width: 1024px) {
  .container {
    width: 1000px;
  }
}
\`\`\`

## Tóm tắt bài học

Đó là kết thúc bài học của chúng ta! Hôm nay, bạn đã mở khóa một khía cạnh quan trọng của phát triển web! Bạn đã học về:

* Responsive website design — nó liên quan đến gì và tại sao nó quan trọng.
* Media queries — tại sao chúng ta sử dụng chúng và cú pháp của chúng.
* Tạo Responsive layouts sử dụng Media Queries — cách chúng nâng cao trải nghiệm người xem.
* Cách tiếp cận **Mobile-First** design — cách nó đảm bảo một responsive design tốt hơn.

Bây giờ là lúc thực hành. Trong các bài tập sắp tới, bạn sẽ xây dựng một layout trang web responsive phải thích ứng với các kích thước màn hình khác nhau. Nâng cao kỹ năng phát triển web của bạn và khám phá thêm trong các bài tập sau! Chúc may mắn!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Responsive Web Design</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Base styles */
        .container {
            display: flex;
        }
        
        .sidebar {
            width: 25%;
            background-color: lightblue;
            padding: 20px;
        }
        
        .main-content {
            width: 73%;
            background-color: lightgreen;
            padding: 20px;
            margin-left: 2%;
        }
        
        /* Media query for small screens */
        @media screen and (max-width: 600px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
            }
            
            .main-content {
                width: 100%;
                margin-left: 0;
            }
        }
        
        /* Mobile-first example */
        .mobile-first {
            width: 100%;
            padding: 10px;
        }
        
        @media screen and (min-width: 768px) {
            .mobile-first {
                width: 750px;
                margin: 0 auto;
            }
        }
        
        @media screen and (min-width: 1024px) {
            .mobile-first {
                width: 1000px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">Sidebar</div>
        <div class="main-content">Main Content</div>
    </div>
    
    <div class="mobile-first">
        <h2>Mobile-First Container</h2>
        <p>This container adapts to different screen sizes.</p>
    </div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Responsive Page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="container">
        <header class="header">Header</header>
        <div class="content-wrapper">
            <aside class="sidebar">Sidebar</aside>
            <main class="main-content">Main Content</main>
        </div>
        <footer class="footer">Footer</footer>
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web responsive hoàn chỉnh!

Sử dụng Media Queries để tạo một layout thích ứng với các kích thước màn hình khác nhau:

1. **Media Queries**: Tạo ít nhất 2 media queries với:
   - @media screen and (max-width: ...) cho màn hình nhỏ
   - @media screen and (min-width: ...) cho màn hình lớn (mobile-first approach)
   - Sử dụng các breakpoints phổ biến: 600px, 768px, 1024px

2. **Responsive Layout**: 
   - Layout desktop: sidebar và main content nằm ngang (sử dụng flexbox hoặc grid)
   - Layout mobile: sidebar và main content xếp dọc (flex-direction: column)
   - Điều chỉnh width, padding, margin cho từng breakpoint

3. **Mobile-First Approach** (khuyến khích):
   - Thiết kế cho màn hình nhỏ trước
   - Sử dụng min-width để mở rộng cho màn hình lớn hơn

4. **Viewport Meta Tag**: Đảm bảo có thẻ <meta name="viewport" content="width=device-width, initial-scale=1.0"> trong <head>

5. **Responsive Properties**: Sử dụng ít nhất 3 properties responsive từ:
   - width (%, px, auto)
   - flex-direction
   - display (flex, grid, block)
   - padding, margin
   - font-size

Yêu cầu:
- Phải có ít nhất 2 media queries
- Layout phải thay đổi rõ ràng giữa desktop và mobile
- Phải có viewport meta tag
- Code phải là HTML và CSS hợp lệ
- Trang web phải hiển thị tốt trên cả màn hình lớn và nhỏ

Chúc may mắn! 📱💻`,
        outputCriteria: [
          {
            snippet: '@media',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'screen and',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'max-width:',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'min-width:',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: '600px',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '768px',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '1024px',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'flex-direction: column',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'width: 100%',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'viewport',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'device-width',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'initial-scale=1.0',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'display: flex',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'display: grid',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'width:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'padding:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'margin:',
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

    const createdLesson = await Lesson.create(lesson6)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 6 created successfully!')
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

createLesson6()

