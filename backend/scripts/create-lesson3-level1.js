import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson3 = async () => {
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

    // Check if lesson 3 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 3
    })

    if (existingLesson) {
      console.log('Lesson 3 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 3')
    }

    // Create lesson 3 content based on CodeSignal
    const lesson3 = {
      levelId: level1._id,
      lessonNumber: 3,
      title: {
        en: 'Dressing Up Your Webpages: Beginning with CSS Styling',
        vi: 'Trang trí Trang Web của Bạn: Bắt đầu với CSS Styling'
      },
      content: {
        en: `# Dressing Up Your Webpages: Beginning with CSS Styling

## Introducing CSS

Hello there! Today, we are venturing into an exploration of **CSS** (**C**ascading **S**tyle **S**heets), a language that contributes endlessly to bringing color, life, and structure to webpages. Think about this: once you have constructed a building with bare walls with HTML, CSS becomes the tool that paints the walls, decorates the room, and makes it cozy. Amazing, isn't it? Let's dive in!

## Basic Syntax of CSS

The syntax of CSS is similar to writing commands for your dog — you choose the dog's name (selector), and then tell it what to do (declarations). For instance, let's create a CSS rule-set:

\`\`\`css
h1 {
  color: blue;
  font-size: 12px;
}
\`\`\`

In this example, \`h1\` is the selector (our pet), \`color\` and \`font-size\` are the properties (commands), and \`blue\` and \`12px\` are the corresponding values that indicate how to perform the command. This code makes all \`<h1>\` elements have a blue text that is \`12 pixels\` big.

## Connecting CSS to HTML

There are three ways we can connect CSS to HTML:

### Inline CSS

We apply styles directly within the HTML element using the \`style\` attribute:

\`\`\`html
<h1 style="color: blue; font-size: 12px;">Hello World</h1>
\`\`\`

### Internal CSS

Here, CSS rules reside within the \`<style>\` tag inside the \`head\` section of the HTML document.

\`\`\`html
<head>
  <style>
    h1 {
      color: blue;
      font-size: 12px;
    }
  </style>
</head>
\`\`\`

### External CSS

For larger projects, we link separate .css files to the HTML document using the \`<link>\` tag:

\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

Accompanied by the corresponding \`styles.css\`:

\`\`\`css
h1 {
  color: blue;
  font-size: 12px;
}
\`\`\`

## CSS Selectors

CSS selectors are used to "find" HTML elements based on properties of the elements. There are several different types of selectors in CSS:

### Element Selector

This targets HTML elements by their tag name. Any style assigned to an element selector will apply to all elements with that tag on a page. For instance:

\`\`\`css
p {
  color: red;
  font-weight: bold;
}
\`\`\`

In this example, all \`<p>\` (paragraph) elements on the page would receive the styles specified (in this case, they will have red text in bold).

### Class Selector

This targets HTML elements with a particular class attribute. They are preceded by a dot (.) in CSS:

\`\`\`css
/* This is a comment in CSS */
.important-text {
  color: red;
  font-weight: bold;
}
\`\`\`

In your HTML, you'd then add the class attribute with the value \`important-text\` to the elements you want affected:

\`\`\`html
<p class="important-text">This text is important!</p>
\`\`\`

This class can be reused across multiple elements on your page, allowing them all to share the same styles.

### Id Selector

This targets a unique HTML element by its id attribute. It is preceded by a hash (#) in CSS:

\`\`\`css
#header {
  background-color: blue;
  color: white;
}
\`\`\`

And, in HTML you'd assign this id to one specific element:

\`\`\`html
<div id="header">Welcome to my website</div>
\`\`\`

Remember, id is meant to be unique, and should only be applied to one element on a page.

By mastering these selectors, you'll be able to control the presentation of every element on your page for a beautiful and consistent design.

## Understanding Div and Span Tags, Block-level and Inline Elements

\`div\` and \`span\` tags group HTML elements, allowing a style to be applied swiftly to all elements within the group.

### Div Element

This is a block-level element. By default, block-level elements create line breaks before and after themselves, and occupy the full width of their parent element.

\`\`\`html
<div style="background-color: yellow;">
  <h2>Title</h2>
  <p>Paragraph</p>
</div>
\`\`\`

In this case both \`h2\` and \`p\` elements will have a yellow background occupying not only the text but the full row.

### Span Element

This is an inline element, meaning it only occupies necessary space and doesn't cause line breaks.

\`\`\`html
<p>This is a <span style="color: blue;">blue</span> word.</p>
\`\`\`

Notice that the word "blue" is colored in blue. That's the \`span\` tag at work!

### Key Concepts

To help you understand this better, let's define some additional terms:

* In HTML, elements are often enclosed within other elements. The enclosing element is called the **parent element**, and the enclosed elements are known as **child elements**. In the above example, the \`div\` element is a parent element to the \`h2\` and \`p\` child elements.
* **Block-level Elements:** By default, a block-level element starts on a new line, causes a line break after itself, and expands to fill the full width of its parent element. \`<div>\`, \`<p>\`, and \`<h1>\` through \`<h6>\` are some examples. Though these elements behave this way by default, their behavior can be modified using advanced CSS techniques.
* **Inline Elements:** On the other hand, inline elements do not start on a new line and do not cause a line break after them. They take up only as much width as necessary for their content. Multiple inline elements can be placed next to each other on the same line. Examples of inline elements include \`<span>\`, \`<a>\`, \`<img>\`, etc.

Understanding the concepts of parent and child elements, as well as block-level and inline elements, and how to use \`div\` and \`span\` tags are essential for effective webpage layout and styling.

## Lesson Summary

Congratulations! You have successfully mastered the basics of CSS. The knowledge you acquired today is the first step towards creating appealing and dynamic webpages. Up next, we have hands-on exercises to reinforce your understanding. Remember, practice is the ladder to mastery. Let's dive in and code happily!`,
        vi: `# Trang trí Trang Web của Bạn: Bắt đầu với CSS Styling

## Giới thiệu CSS

Xin chào! Hôm nay, chúng ta sẽ khám phá **CSS** (**C**ascading **S**tyle **S**heets), một ngôn ngữ góp phần không ngừng vào việc mang lại màu sắc, sự sống động và cấu trúc cho các trang web. Hãy nghĩ về điều này: một khi bạn đã xây dựng một tòa nhà với những bức tường trần bằng HTML, CSS trở thành công cụ sơn tường, trang trí phòng và làm cho nó ấm cúng. Thật tuyệt vời phải không? Hãy bắt đầu!

## Cú pháp cơ bản của CSS

Cú pháp của CSS tương tự như viết lệnh cho chú chó của bạn — bạn chọn tên chú chó (selector), và sau đó nói với nó phải làm gì (declarations). Ví dụ, hãy tạo một CSS rule-set:

\`\`\`css
h1 {
  color: blue;
  font-size: 12px;
}
\`\`\`

Trong ví dụ này, \`h1\` là selector (thú cưng của chúng ta), \`color\` và \`font-size\` là các properties (lệnh), và \`blue\` và \`12px\` là các giá trị tương ứng cho biết cách thực hiện lệnh. Code này làm cho tất cả các phần tử \`<h1>\` có văn bản màu xanh dương với kích thước \`12 pixels\`.

## Kết nối CSS với HTML

Có ba cách chúng ta có thể kết nối CSS với HTML:

### Inline CSS

Chúng ta áp dụng styles trực tiếp trong phần tử HTML bằng cách sử dụng thuộc tính \`style\`:

\`\`\`html
<h1 style="color: blue; font-size: 12px;">Hello World</h1>
\`\`\`

### Internal CSS

Ở đây, các quy tắc CSS nằm trong thẻ \`<style>\` bên trong phần \`head\` của tài liệu HTML.

\`\`\`html
<head>
  <style>
    h1 {
      color: blue;
      font-size: 12px;
    }
  </style>
</head>
\`\`\`

### External CSS

Đối với các dự án lớn hơn, chúng ta liên kết các file .css riêng biệt với tài liệu HTML bằng cách sử dụng thẻ \`<link>\`:

\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

Kèm theo file \`styles.css\` tương ứng:

\`\`\`css
h1 {
  color: blue;
  font-size: 12px;
}
\`\`\`

## CSS Selectors

CSS selectors được sử dụng để "tìm" các phần tử HTML dựa trên các thuộc tính của phần tử. Có nhiều loại selectors khác nhau trong CSS:

### Element Selector

Điều này nhắm vào các phần tử HTML theo tên thẻ của chúng. Bất kỳ style nào được gán cho element selector sẽ áp dụng cho tất cả các phần tử có thẻ đó trên trang. Ví dụ:

\`\`\`css
p {
  color: red;
  font-weight: bold;
}
\`\`\`

Trong ví dụ này, tất cả các phần tử \`<p>\` (đoạn văn) trên trang sẽ nhận được các styles được chỉ định (trong trường hợp này, chúng sẽ có văn bản màu đỏ và đậm).

### Class Selector

Điều này nhắm vào các phần tử HTML có thuộc tính class cụ thể. Chúng được đặt trước bởi dấu chấm (.) trong CSS:

\`\`\`css
/* Đây là comment trong CSS */
.important-text {
  color: red;
  font-weight: bold;
}
\`\`\`

Trong HTML của bạn, sau đó bạn sẽ thêm thuộc tính class với giá trị \`important-text\` vào các phần tử bạn muốn ảnh hưởng:

\`\`\`html
<p class="important-text">Văn bản này quan trọng!</p>
\`\`\`

Class này có thể được tái sử dụng trên nhiều phần tử trên trang của bạn, cho phép tất cả chúng chia sẻ cùng một style.

### Id Selector

Điều này nhắm vào một phần tử HTML duy nhất bằng thuộc tính id của nó. Nó được đặt trước bởi dấu hash (#) trong CSS:

\`\`\`css
#header {
  background-color: blue;
  color: white;
}
\`\`\`

Và, trong HTML bạn sẽ gán id này cho một phần tử cụ thể:

\`\`\`html
<div id="header">Chào mừng đến với trang web của tôi</div>
\`\`\`

Hãy nhớ, id được dùng để duy nhất, và chỉ nên được áp dụng cho một phần tử trên trang.

Bằng cách nắm vững các selectors này, bạn sẽ có thể kiểm soát cách trình bày của mọi phần tử trên trang của mình để có một thiết kế đẹp và nhất quán.

## Hiểu về Div và Span Tags, Block-level và Inline Elements

Thẻ \`div\` và \`span\` nhóm các phần tử HTML, cho phép một style được áp dụng nhanh chóng cho tất cả các phần tử trong nhóm.

### Phần tử Div

Đây là một phần tử block-level. Theo mặc định, các phần tử block-level tạo ngắt dòng trước và sau chúng, và chiếm toàn bộ chiều rộng của phần tử cha.

\`\`\`html
<div style="background-color: yellow;">
  <h2>Tiêu đề</h2>
  <p>Đoạn văn</p>
</div>
\`\`\`

Trong trường hợp này cả phần tử \`h2\` và \`p\` sẽ có nền màu vàng chiếm không chỉ văn bản mà cả hàng đầy đủ.

### Phần tử Span

Đây là một phần tử inline, có nghĩa là nó chỉ chiếm không gian cần thiết và không gây ngắt dòng.

\`\`\`html
<p>Đây là một từ <span style="color: blue;">màu xanh</span>.</p>
\`\`\`

Lưu ý rằng từ "màu xanh" được tô màu xanh. Đó là thẻ \`span\` đang hoạt động!

### Các khái niệm chính

Để giúp bạn hiểu rõ hơn, hãy định nghĩa một số thuật ngữ bổ sung:

* Trong HTML, các phần tử thường được bao bọc trong các phần tử khác. Phần tử bao bọc được gọi là **phần tử cha**, và các phần tử được bao bọc được gọi là **phần tử con**. Trong ví dụ trên, phần tử \`div\` là phần tử cha của các phần tử con \`h2\` và \`p\`.
* **Block-level Elements:** Theo mặc định, một phần tử block-level bắt đầu trên một dòng mới, gây ngắt dòng sau chính nó, và mở rộng để lấp đầy toàn bộ chiều rộng của phần tử cha. \`<div>\`, \`<p>\`, và \`<h1>\` đến \`<h6>\` là một số ví dụ. Mặc dù các phần tử này hoạt động theo cách này theo mặc định, hành vi của chúng có thể được sửa đổi bằng các kỹ thuật CSS nâng cao.
* **Inline Elements:** Mặt khác, các phần tử inline không bắt đầu trên một dòng mới và không gây ngắt dòng sau chúng. Chúng chỉ chiếm nhiều chiều rộng như cần thiết cho nội dung của chúng. Nhiều phần tử inline có thể được đặt cạnh nhau trên cùng một dòng. Các ví dụ về phần tử inline bao gồm \`<span>\`, \`<a>\`, \`<img>\`, v.v.

Hiểu các khái niệm về phần tử cha và con, cũng như block-level và inline elements, và cách sử dụng thẻ \`div\` và \`span\` là điều cần thiết cho bố cục và styling trang web hiệu quả.

## Tóm tắt bài học

Chúc mừng! Bạn đã thành công nắm vững những điều cơ bản của CSS. Kiến thức bạn có được hôm nay là bước đầu tiên hướng tới việc tạo ra các trang web hấp dẫn và động. Tiếp theo, chúng ta có các bài tập thực hành để củng cố sự hiểu biết của bạn. Hãy nhớ, thực hành là thang dẫn đến sự thành thạo. Hãy bắt đầu và code một cách vui vẻ!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>CSS Styling Example</title>
    <style>
        /* Element Selector */
        h1 {
            color: blue;
            font-size: 24px;
        }
        
        /* Class Selector */
        .important-text {
            color: red;
            font-weight: bold;
        }
        
        /* ID Selector */
        #header {
            background-color: lightblue;
            padding: 20px;
        }
        
        /* Div styling */
        .container {
            background-color: yellow;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div id="header">
        <h1>Welcome</h1>
    </div>
    
    <div class="container">
        <h2>Title</h2>
        <p>This is a paragraph with <span class="important-text">important text</span>.</p>
    </div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Style Your Page</title>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div id="header">
        <h1>My Styled Page</h1>
    </div>
    
    <div class="content">
        <h2>Section Title</h2>
        <p>This is a paragraph with some <span>highlighted text</span>.</p>
        <p class="important">This is an important message.</p>
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web được style đẹp mắt!

Sử dụng CSS để style trang web của bạn với các yêu cầu sau:

1. **Element Selector**: Sử dụng ít nhất 2 element selectors (ví dụ: h1, p, div) để style các phần tử HTML
2. **Class Selector**: Tạo và sử dụng ít nhất 1 class selector (bắt đầu bằng dấu chấm .) để style nhiều phần tử
3. **ID Selector**: Sử dụng ít nhất 1 ID selector (bắt đầu bằng dấu #) để style một phần tử duy nhất
4. **CSS Properties**: Sử dụng ít nhất 5 CSS properties khác nhau từ: color, background-color, font-size, font-weight, padding, margin, text-align, border
5. **Div và Span**: Sử dụng <div> (block-level) và <span> (inline) để nhóm và style các phần tử

Yêu cầu:
- Phải sử dụng cả 3 loại selectors (element, class, ID)
- Phải có ít nhất 5 CSS properties khác nhau
- Code phải là HTML và CSS hợp lệ
- Trang web phải có màu sắc và styling rõ ràng

Chúc may mắn! 🎨`,
        outputCriteria: [
          {
            snippet: 'h1 {',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'h2 {',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'p {',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'div {',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: '.',
            points: 2,
            penalty: 0
          },
          {
            snippet: '#',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'color:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'background-color:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'font-size:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'font-weight:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'padding:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'margin:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'text-align:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'border:',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<div',
            points: 1,
            penalty: 0
          },
          {
            snippet: '<span',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'class=',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'id=',
            points: 1,
            penalty: 0
          }
        ]
      },
      quiz: {
        questions: [],
        passingScore: 7
      }
    }

    const createdLesson = await Lesson.create(lesson3)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 3 created successfully!')
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

createLesson3()

