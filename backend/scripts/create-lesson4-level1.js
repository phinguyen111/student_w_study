import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson4 = async () => {
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

    // Check if lesson 4 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 4
    })

    if (existingLesson) {
      console.log('Lesson 4 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 4')
    }

    // Create lesson 4 content based on CodeSignal
    const lesson4 = {
      levelId: level1._id,
      lessonNumber: 4,
      title: {
        en: 'Mastering CSS: Display Properties and Designing Layouts',
        vi: 'Thành thạo CSS: Display Properties và Thiết kế Layout'
      },
      content: {
        en: `# Mastering CSS: Display Properties and Designing Layouts

## Introduction and Lesson Objectives

Hello, learners! Today, we're going to explore important parts of making a website with CSS: the CSS Box Model, Flexbox, and Grid.

* **CSS Box Model**: Think of every piece on your website as a box. The Box Model is what we use in CSS to manage where each box goes, how much space it takes up, and how it interacts with other boxes.
* **Flexbox**: Sometimes, we want what's in the boxes to adjust itself nicely. This is where Flexbox comes in. Using Flexbox, we can control how elements inside a box align and order themselves.
* **Grid**: If we want to lay out our boxes in a grid, like a table or a chessboard, the Grid system is the tool we use. It makes complex designs simple, letting us quickly decide what goes in which row or column.

Here's what we'll learn in this course:

* Understand the CSS Box Model and its role in organizing your website.
* Master the CSS \`flexbox\` and \`grid\` systems, becoming pro at how they manage boxes.
* Practice using these systems to build neat and well-structured web pages.

Ready to dig in? Let's go!

## Delving into the CSS Box Model

Each HTML element can be viewed as a box. The \`Box Model\` encompasses:

* **Content**: The actual element content.
* **Padding**: The space that surrounds the content.
* **Border**: The box's perimeter.
* **Margin**: Space outside the box.

Let's put this into action using a simple paragraph:

\`\`\`css
p {
  padding: 20px;
  border: 2px solid black;
  margin: 10px;
}
\`\`\`

By manipulating the padding, border, and margin, you can position and resize HTML elements, which aids in layout design.

## Flexbox Layout Basics

Introducing **Flexbox**, a layout model that brings harmony and order to your web pages. In a Flexbox layout, all HTML elements find a place with good coordination, much like a Wheelbarrow race! Let's dive into Flexbox!

\`\`\`css
.flex_demo {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.flex_demo > div {
  background-color: lightblue;
  padding: 20px;
}
\`\`\`

\`\`\`html
<div class="flex_demo">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
\`\`\`

In this HTML code, we have created a Flex container \`.flex_demo\` and positioned the child \`div\` elements evenly and centrally along both axes. Here's what the properties do:

1. \`display: flex;\` turns the element into a Flex container.
2. \`justify-content: space-around;\` controls the alignment of items on the horizontal line in the current line. The \`space-around\` value means that items are evenly distributed in the line with equal space around them. Other possible values of the \`justify-content\` property include:
   * \`center\`: Items are centrally aligned.
   * \`space-between\`: There's equal space between each item, but not between the items and the container.
   * \`flex-start\`: Items are aligned at the start of the container.
   * \`flex-end\`: Items are aligned at the end of the container.
3. \`align-items: center;\` aligns flex items along the cross axis of the current line of the flex container. It's analogous to \`justify-content\` but in the perpendicular direction. The \`center\` value aligns the items at the center of the container. Other possible values of the \`align-items\` property include:
   * \`flex-start\`: Items align to the top of the container.
   * \`flex-end\`: Items align to the bottom of the container.

Now, you might be wondering about the \`.flex_demo > div\` part. This notation is called the "child combinator" (\`>\`). The \`>\` combinator selects elements that are direct children of a specified element. In this example, \`.flex_demo > div\` selects all \`div\` elements that are direct children of the element with the \`flex_demo\` class.

## Into the Grid: CSS Grid Layout

Now let's explore the **CSS Grid Layout**, a powerful tool for creating webpage layouts. It arranges the layout into rows and columns, much like pieces in a board game. Intriguing, isn't it?

\`\`\`css
.grid_demo {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
}

.grid_demo > div {
  background-color: lightblue;
  padding: 20px;
  text-align: center;
}
\`\`\`

\`\`\`html
<div class="grid_demo">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
\`\`\`

The CSS class \`.grid_demo\` lays out HTML elements in a grid layout, giving a totally new perspective for web layout design. Let's understand this grid layout step by step:

1. \`display: grid;\` is applied to convert our container element into a Grid layout.
2. \`grid-template-columns: auto auto;\` This tells the browser to generate a grid layout with two columns of equal width. The number of times "auto" is repeated determines the number of columns.
3. \`gap: 10px;\` defines the size of the gap between the rows and columns in the grid.
4. \`.grid_demo > div\` is an example of the child selector (\`>\`) that we discussed previously. In this case, all direct \`div\` children of \`.grid_demo\` will have a \`background-color\` of lightblue, \`padding\` of 20px, and the text in each division will be centered within its container.

## Lesson Summary

Well done! We've ventured further into CSS, concentrating on learning the ins and outs of positioning elements and designing layouts with powerful techniques like \`Flexbox\` and \`Grid\`. Up next, we have practical exercises to solidify this newly gained knowledge. Each progressive step increases our understanding of CSS, empowering us to create feature-rich, aesthetically pleasing web pages. Let's continue learning, and as always, happy coding!`,
        vi: `# Thành thạo CSS: Display Properties và Thiết kế Layout

## Giới thiệu và Mục tiêu bài học

Xin chào các học viên! Hôm nay, chúng ta sẽ khám phá các phần quan trọng của việc tạo website với CSS: CSS Box Model, Flexbox, và Grid.

* **CSS Box Model**: Hãy nghĩ về mỗi phần trên website của bạn như một chiếc hộp. Box Model là những gì chúng ta sử dụng trong CSS để quản lý vị trí của mỗi hộp, không gian mà nó chiếm, và cách nó tương tác với các hộp khác.
* **Flexbox**: Đôi khi, chúng ta muốn những gì trong các hộp tự điều chỉnh một cách đẹp mắt. Đây là nơi Flexbox xuất hiện. Sử dụng Flexbox, chúng ta có thể kiểm soát cách các phần tử bên trong một hộp căn chỉnh và sắp xếp chúng.
* **Grid**: Nếu chúng ta muốn bố trí các hộp của mình trong một lưới, giống như bảng hoặc bàn cờ, hệ thống Grid là công cụ chúng ta sử dụng. Nó làm cho các thiết kế phức tạp trở nên đơn giản, cho phép chúng ta nhanh chóng quyết định cái gì đi vào hàng hoặc cột nào.

Đây là những gì chúng ta sẽ học trong khóa học này:

* Hiểu CSS Box Model và vai trò của nó trong việc tổ chức website của bạn.
* Thành thạo các hệ thống CSS \`flexbox\` và \`grid\`, trở thành chuyên gia về cách chúng quản lý các hộp.
* Thực hành sử dụng các hệ thống này để xây dựng các trang web gọn gàng và có cấu trúc tốt.

Sẵn sàng bắt đầu? Hãy đi thôi!

## Đi sâu vào CSS Box Model

Mỗi phần tử HTML có thể được xem như một hộp. \`Box Model\` bao gồm:

* **Content**: Nội dung thực tế của phần tử.
* **Padding**: Không gian bao quanh nội dung.
* **Border**: Chu vi của hộp.
* **Margin**: Không gian bên ngoài hộp.

Hãy đưa điều này vào thực tế bằng cách sử dụng một đoạn văn đơn giản:

\`\`\`css
p {
  padding: 20px;
  border: 2px solid black;
  margin: 10px;
}
\`\`\`

Bằng cách thao tác padding, border, và margin, bạn có thể định vị và thay đổi kích thước các phần tử HTML, điều này hỗ trợ trong thiết kế layout.

## Cơ bản về Flexbox Layout

Giới thiệu **Flexbox**, một mô hình layout mang lại sự hài hòa và trật tự cho các trang web của bạn. Trong một Flexbox layout, tất cả các phần tử HTML tìm thấy vị trí với sự phối hợp tốt, giống như một cuộc đua xe cút kít! Hãy đi sâu vào Flexbox!

\`\`\`css
.flex_demo {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.flex_demo > div {
  background-color: lightblue;
  padding: 20px;
}
\`\`\`

\`\`\`html
<div class="flex_demo">
  <div>Mục 1</div>
  <div>Mục 2</div>
  <div>Mục 3</div>
</div>
\`\`\`

Trong code HTML này, chúng ta đã tạo một Flex container \`.flex_demo\` và định vị các phần tử con \`div\` đều và tập trung dọc theo cả hai trục. Đây là những gì các properties làm:

1. \`display: flex;\` biến phần tử thành một Flex container.
2. \`justify-content: space-around;\` kiểm soát việc căn chỉnh các mục trên đường ngang trong dòng hiện tại. Giá trị \`space-around\` có nghĩa là các mục được phân bố đều trong dòng với khoảng cách bằng nhau xung quanh chúng. Các giá trị khác có thể của property \`justify-content\` bao gồm:
   * \`center\`: Các mục được căn giữa.
   * \`space-between\`: Có khoảng cách bằng nhau giữa mỗi mục, nhưng không giữa các mục và container.
   * \`flex-start\`: Các mục được căn ở đầu container.
   * \`flex-end\`: Các mục được căn ở cuối container.
3. \`align-items: center;\` căn chỉnh các flex items dọc theo trục chéo của dòng hiện tại của flex container. Nó tương tự như \`justify-content\` nhưng theo hướng vuông góc. Giá trị \`center\` căn chỉnh các mục ở trung tâm của container. Các giá trị khác có thể của property \`align-items\` bao gồm:
   * \`flex-start\`: Các mục căn ở đầu container.
   * \`flex-end\`: Các mục căn ở cuối container.

Bây giờ, bạn có thể tự hỏi về phần \`.flex_demo > div\`. Ký hiệu này được gọi là "child combinator" (\`>\`). Combinator \`>\` chọn các phần tử là con trực tiếp của một phần tử được chỉ định. Trong ví dụ này, \`.flex_demo > div\` chọn tất cả các phần tử \`div\` là con trực tiếp của phần tử có class \`flex_demo\`.

## Vào Grid: CSS Grid Layout

Bây giờ hãy khám phá **CSS Grid Layout**, một công cụ mạnh mẽ để tạo layout trang web. Nó sắp xếp layout thành các hàng và cột, giống như các quân cờ trong một trò chơi bàn cờ. Thú vị phải không?

\`\`\`css
.grid_demo {
  display: grid;
  grid-template-columns: auto auto;
  gap: 10px;
}

.grid_demo > div {
  background-color: lightblue;
  padding: 20px;
  text-align: center;
}
\`\`\`

\`\`\`html
<div class="grid_demo">
  <div>Mục 1</div>
  <div>Mục 2</div>
  <div>Mục 3</div>
  <div>Mục 4</div>
</div>
\`\`\`

CSS class \`.grid_demo\` bố trí các phần tử HTML trong một grid layout, mang lại một góc nhìn hoàn toàn mới cho thiết kế web layout. Hãy hiểu grid layout này từng bước:

1. \`display: grid;\` được áp dụng để chuyển đổi phần tử container của chúng ta thành Grid layout.
2. \`grid-template-columns: auto auto;\` Điều này cho trình duyệt biết tạo một grid layout với hai cột có chiều rộng bằng nhau. Số lần "auto" được lặp lại xác định số cột.
3. \`gap: 10px;\` xác định kích thước của khoảng cách giữa các hàng và cột trong grid.
4. \`.grid_demo > div\` là một ví dụ về child selector (\`>\`) mà chúng ta đã thảo luận trước đó. Trong trường hợp này, tất cả các phần tử con \`div\` trực tiếp của \`.grid_demo\` sẽ có \`background-color\` là lightblue, \`padding\` là 20px, và văn bản trong mỗi phần sẽ được căn giữa trong container của nó.

## Tóm tắt bài học

Làm tốt lắm! Chúng ta đã đi sâu hơn vào CSS, tập trung vào việc học các chi tiết về định vị phần tử và thiết kế layout với các kỹ thuật mạnh mẽ như \`Flexbox\` và \`Grid\`. Tiếp theo, chúng ta có các bài tập thực hành để củng cố kiến thức mới có được này. Mỗi bước tiến bộ tăng cường sự hiểu biết của chúng ta về CSS, trao quyền cho chúng ta tạo ra các trang web phong phú tính năng và đẹp mắt. Hãy tiếp tục học tập, và như mọi khi, chúc bạn code vui vẻ!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>CSS Box Model, Flexbox, and Grid</title>
    <style>
        /* Box Model Example */
        .box {
            padding: 20px;
            border: 2px solid black;
            margin: 10px;
            background-color: lightblue;
        }
        
        /* Flexbox Example */
        .flex-container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            height: 200px;
            background-color: lightgray;
        }
        
        .flex-item {
            background-color: lightblue;
            padding: 20px;
        }
        
        /* Grid Example */
        .grid-container {
            display: grid;
            grid-template-columns: auto auto auto;
            gap: 10px;
        }
        
        .grid-item {
            background-color: lightblue;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="box">Box Model Example</div>
    
    <div class="flex-container">
        <div class="flex-item">Flex 1</div>
        <div class="flex-item">Flex 2</div>
        <div class="flex-item">Flex 3</div>
    </div>
    
    <div class="grid-container">
        <div class="grid-item">Grid 1</div>
        <div class="grid-item">Grid 2</div>
        <div class="grid-item">Grid 3</div>
        <div class="grid-item">Grid 4</div>
    </div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Create a Layout</title>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Header</div>
        <div class="content">
            <div class="sidebar">Sidebar</div>
            <div class="main">Main Content</div>
        </div>
        <div class="footer">Footer</div>
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một layout trang web hoàn chỉnh!

Sử dụng CSS Box Model, Flexbox, và Grid để tạo một layout đẹp mắt với các yêu cầu sau:

1. **CSS Box Model**: Sử dụng padding, border, và margin cho ít nhất 2 phần tử khác nhau
2. **Flexbox**: Tạo một flex container với:
   - display: flex
   - justify-content (sử dụng một trong: center, space-around, space-between, flex-start, flex-end)
   - align-items (sử dụng một trong: center, flex-start, flex-end)
3. **Grid**: Tạo một grid layout với:
   - display: grid
   - grid-template-columns (tạo ít nhất 2 cột)
   - gap (khoảng cách giữa các items)
4. **Child Selector**: Sử dụng child combinator (>) ít nhất 1 lần để style các phần tử con
5. **Styling**: Sử dụng ít nhất 3 CSS properties khác nhau từ: background-color, color, padding, margin, border, text-align

Yêu cầu:
- Phải sử dụng cả Box Model, Flexbox, và Grid
- Phải có ít nhất 1 child selector
- Code phải là HTML và CSS hợp lệ
- Layout phải có cấu trúc rõ ràng và đẹp mắt

Chúc may mắn! 🎨`,
        outputCriteria: [
          {
            snippet: 'padding:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'border:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'margin:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'display: flex',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'justify-content:',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'align-items:',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'display: grid',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'grid-template-columns:',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'gap:',
            points: 1,
            penalty: 0
          },
          {
            snippet: '>',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'background-color:',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'color:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'text-align:',
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

    const createdLesson = await Lesson.create(lesson4)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 4 created successfully!')
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

createLesson4()

