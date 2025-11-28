import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const addQuizQuestions = async () => {
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
      console.error('Level 1 not found.')
      process.exit(1)
    }

    console.log(`Found Level 1: ${level1.title}`)

    // Quiz questions for each lesson
    const quizData = {
      2: [
        {
          type: 'multiple-choice',
          question: {
            en: 'Which tag is used to create an unordered list?',
            vi: 'Thẻ nào được sử dụng để tạo một danh sách không có thứ tự?'
          },
          options: [
            { en: '<ul>', vi: '<ul>' },
            { en: '<ol>', vi: '<ol>' },
            { en: '<li>', vi: '<li>' },
            { en: '<list>', vi: '<list>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<ul> is used for unordered lists (bullet points), while <ol> is for ordered lists (numbered).',
            vi: '<ul> được sử dụng cho danh sách không có thứ tự (dấu đầu dòng), trong khi <ol> dành cho danh sách có thứ tự (đánh số).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which tag is used to create table rows?',
            vi: 'Thẻ nào được sử dụng để tạo các hàng trong bảng?'
          },
          options: [
            { en: '<tr>', vi: '<tr>' },
            { en: '<td>', vi: '<td>' },
            { en: '<th>', vi: '<th>' },
            { en: '<row>', vi: '<row>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<tr> creates table rows, <td> creates table cells, and <th> creates table headers.',
            vi: '<tr> tạo các hàng trong bảng, <td> tạo các ô trong bảng, và <th> tạo các tiêu đề bảng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which HTML entity represents the copyright symbol?',
            vi: 'HTML entity nào đại diện cho ký hiệu bản quyền?'
          },
          options: [
            { en: '&copy;', vi: '&copy;' },
            { en: '&deg;', vi: '&deg;' },
            { en: '&amp;', vi: '&amp;' },
            { en: '&lt;', vi: '&lt;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '&copy; is the HTML entity for the copyright symbol ©.',
            vi: '&copy; là HTML entity cho ký hiệu bản quyền ©.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which tag makes text bold in HTML?',
            vi: 'Thẻ nào làm cho văn bản đậm trong HTML?'
          },
          options: [
            { en: '<b>', vi: '<b>' },
            { en: '<i>', vi: '<i>' },
            { en: '<u>', vi: '<u>' },
            { en: '<s>', vi: '<s>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<b> makes text bold, <i> makes it italic, <u> underlines, and <s> strikes through.',
            vi: '<b> làm cho văn bản đậm, <i> làm cho nó in nghiêng, <u> gạch chân, và <s> gạch ngang.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct HTML for creating an ordered list with 3 items?',
            vi: 'HTML đúng để tạo một danh sách có thứ tự với 3 mục là gì?'
          },
          options: [
            { en: '<ol><li>Item 1</li><li>Item 2</li><li>Item 3</li></ol>', vi: '<ol><li>Item 1</li><li>Item 2</li><li>Item 3</li></ol>' },
            { en: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>', vi: '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>' },
            { en: '<list><item>Item 1</item><item>Item 2</item><item>Item 3</item></list>', vi: '<list><item>Item 1</item><item>Item 2</item><item>Item 3</item></list>' },
            { en: '<ol>Item 1 Item 2 Item 3</ol>', vi: '<ol>Item 1 Item 2 Item 3</ol>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Ordered lists use <ol> for the container and <li> for each list item.',
            vi: 'Danh sách có thứ tự sử dụng <ol> cho container và <li> cho mỗi mục danh sách.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which tag is used to create table header cells?',
            vi: 'Thẻ nào được sử dụng để tạo các ô tiêu đề trong bảng?'
          },
          options: [
            { en: '<th>', vi: '<th>' },
            { en: '<td>', vi: '<td>' },
            { en: '<tr>', vi: '<tr>' },
            { en: '<header>', vi: '<header>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<th> creates table header cells, which are typically bold and centered.',
            vi: '<th> tạo các ô tiêu đề trong bảng, thường được in đậm và căn giữa.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which tag inserts a line break?',
            vi: 'Thẻ nào chèn ngắt dòng?'
          },
          options: [
            { en: '<br>', vi: '<br>' },
            { en: '<hr>', vi: '<hr>' },
            { en: '<break>', vi: '<break>' },
            { en: '<line>', vi: '<line>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<br> inserts a line break, while <hr> creates a horizontal rule.',
            vi: '<br> chèn ngắt dòng, trong khi <hr> tạo một đường ngang.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the HTML entity for the less-than symbol (<)?',
            vi: 'HTML entity cho ký hiệu nhỏ hơn (<) là gì?'
          },
          options: [
            { en: '&lt;', vi: '&lt;' },
            { en: '&gt;', vi: '&gt;' },
            { en: '&amp;', vi: '&amp;' },
            { en: '&less;', vi: '&less;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '&lt; represents the less-than symbol <, while &gt; represents >.',
            vi: '&lt; đại diện cho ký hiệu nhỏ hơn <, trong khi &gt; đại diện cho >.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which semantic tag should be used instead of <b> for important text?',
            vi: 'Thẻ semantic nào nên được sử dụng thay vì <b> cho văn bản quan trọng?'
          },
          options: [
            { en: '<strong>', vi: '<strong>' },
            { en: '<em>', vi: '<em>' },
            { en: '<important>', vi: '<important>' },
            { en: '<bold>', vi: '<bold>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<strong> is the semantic tag for important text, while <b> is presentational.',
            vi: '<strong> là thẻ semantic cho văn bản quan trọng, trong khi <b> là presentational.'
          }
        }
      ],
      3: [
        {
          type: 'multiple-choice',
          question: {
            en: 'Which CSS property is used to change the text color?',
            vi: 'CSS property nào được sử dụng để thay đổi màu văn bản?'
          },
          options: [
            { en: 'color', vi: 'color' },
            { en: 'text-color', vi: 'text-color' },
            { en: 'font-color', vi: 'font-color' },
            { en: 'background-color', vi: 'background-color' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The color property is used to set the text color of an element.',
            vi: 'Property color được sử dụng để đặt màu văn bản của một phần tử.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you select an element with id="header" in CSS?',
            vi: 'Làm thế nào để chọn một phần tử có id="header" trong CSS?'
          },
          options: [
            { en: '#header', vi: '#header' },
            { en: '.header', vi: '.header' },
            { en: 'header', vi: 'header' },
            { en: '*header', vi: '*header' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'ID selectors use the # symbol, class selectors use ., and element selectors use the tag name directly.',
            vi: 'ID selector sử dụng ký hiệu #, class selector sử dụng ., và element selector sử dụng tên thẻ trực tiếp.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you select an element with class="container" in CSS?',
            vi: 'Làm thế nào để chọn một phần tử có class="container" trong CSS?'
          },
          options: [
            { en: '.container', vi: '.container' },
            { en: '#container', vi: '#container' },
            { en: 'container', vi: 'container' },
            { en: '&container', vi: '&container' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Class selectors use the . symbol before the class name.',
            vi: 'Class selector sử dụng ký hiệu . trước tên class.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which is a block-level element?',
            vi: 'Phần tử nào là block-level element?'
          },
          options: [
            { en: '<div>', vi: '<div>' },
            { en: '<span>', vi: '<span>' },
            { en: '<a>', vi: '<a>' },
            { en: '<img>', vi: '<img>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<div> is a block-level element that takes full width. <span>, <a>, and <img> are inline elements.',
            vi: '<div> là một phần tử block-level chiếm toàn bộ chiều rộng. <span>, <a>, và <img> là các phần tử inline.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct way to link an external CSS file?',
            vi: 'Cách đúng để liên kết một file CSS bên ngoài là gì?'
          },
          options: [
            { en: '<link rel="stylesheet" href="style.css">', vi: '<link rel="stylesheet" href="style.css">' },
            { en: '<style src="style.css">', vi: '<style src="style.css">' },
            { en: '<css href="style.css">', vi: '<css href="style.css">' },
            { en: '<script src="style.css">', vi: '<script src="style.css">' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'External CSS files are linked using the <link> tag with rel="stylesheet" and href pointing to the CSS file.',
            vi: 'File CSS bên ngoài được liên kết bằng thẻ <link> với rel="stylesheet" và href trỏ đến file CSS.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which CSS property changes the font size?',
            vi: 'CSS property nào thay đổi kích thước font?'
          },
          options: [
            { en: 'font-size', vi: 'font-size' },
            { en: 'text-size', vi: 'text-size' },
            { en: 'size', vi: 'size' },
            { en: 'font', vi: 'font' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'font-size is used to set the size of text, e.g., font-size: 16px;',
            vi: 'font-size được sử dụng để đặt kích thước văn bản, ví dụ: font-size: 16px;'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between <div> and <span>?',
            vi: 'Sự khác biệt giữa <div> và <span> là gì?'
          },
          options: [
            { en: '<div> is block-level, <span> is inline', vi: '<div> là block-level, <span> là inline' },
            { en: '<div> is inline, <span> is block-level', vi: '<div> là inline, <span> là block-level' },
            { en: 'They are the same', vi: 'Chúng giống nhau' },
            { en: '<div> is for text, <span> is for images', vi: '<div> dành cho văn bản, <span> dành cho hình ảnh' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<div> is a block-level element (takes full width), while <span> is inline (only takes necessary space).',
            vi: '<div> là phần tử block-level (chiếm toàn bộ chiều rộng), trong khi <span> là inline (chỉ chiếm không gian cần thiết).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Can multiple HTML elements have the same class name?',
            vi: 'Nhiều phần tử HTML có thể có cùng tên class không?'
          },
          options: [
            { en: 'Yes', vi: 'Có' },
            { en: 'No', vi: 'Không' },
            { en: 'Only in CSS', vi: 'Chỉ trong CSS' },
            { en: 'Only in JavaScript', vi: 'Chỉ trong JavaScript' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Yes, multiple elements can share the same class name, allowing you to style them all at once.',
            vi: 'Có, nhiều phần tử có thể chia sẻ cùng tên class, cho phép bạn style tất cả chúng cùng một lúc.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Where should the <style> tag be placed in an HTML document?',
            vi: 'Thẻ <style> nên được đặt ở đâu trong tài liệu HTML?'
          },
          options: [
            { en: 'Inside the <head> section', vi: 'Bên trong phần <head>' },
            { en: 'Inside the <body> section', vi: 'Bên trong phần <body>' },
            { en: 'At the end of the document', vi: 'Ở cuối tài liệu' },
            { en: 'Anywhere in the document', vi: 'Bất cứ đâu trong tài liệu' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The <style> tag should be placed in the <head> section for internal CSS.',
            vi: 'Thẻ <style> nên được đặt trong phần <head> cho internal CSS.'
          }
        }
      ],
      4: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the CSS Box Model consist of?',
            vi: 'CSS Box Model bao gồm những gì?'
          },
          options: [
            { en: 'Content, Padding, Border, Margin', vi: 'Content, Padding, Border, Margin' },
            { en: 'Width, Height, Padding, Margin', vi: 'Width, Height, Padding, Margin' },
            { en: 'Content, Border, Margin', vi: 'Content, Border, Margin' },
            { en: 'Padding, Border, Margin', vi: 'Padding, Border, Margin' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The CSS Box Model consists of Content (inner), Padding (space around content), Border (perimeter), and Margin (space outside).',
            vi: 'CSS Box Model bao gồm Content (bên trong), Padding (không gian xung quanh nội dung), Border (chu vi), và Margin (không gian bên ngoài).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which property is used to create a Flexbox container?',
            vi: 'Property nào được sử dụng để tạo một Flexbox container?'
          },
          options: [
            { en: 'display: flex;', vi: 'display: flex;' },
            { en: 'display: grid;', vi: 'display: grid;' },
            { en: 'display: block;', vi: 'display: block;' },
            { en: 'flex: 1;', vi: 'flex: 1;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'display: flex; converts an element into a Flexbox container.',
            vi: 'display: flex; chuyển đổi một phần tử thành một Flexbox container.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which property controls horizontal alignment in Flexbox?',
            vi: 'Property nào kiểm soát căn chỉnh ngang trong Flexbox?'
          },
          options: [
            { en: 'justify-content', vi: 'justify-content' },
            { en: 'align-items', vi: 'align-items' },
            { en: 'flex-direction', vi: 'flex-direction' },
            { en: 'flex-wrap', vi: 'flex-wrap' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'justify-content controls alignment along the main axis (horizontal by default), while align-items controls the cross axis.',
            vi: 'justify-content kiểm soát căn chỉnh dọc theo trục chính (ngang theo mặc định), trong khi align-items kiểm soát trục chéo.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which property is used to create a CSS Grid layout?',
            vi: 'Property nào được sử dụng để tạo một CSS Grid layout?'
          },
          options: [
            { en: 'display: grid;', vi: 'display: grid;' },
            { en: 'display: flex;', vi: 'display: flex;' },
            { en: 'grid: true;', vi: 'grid: true;' },
            { en: 'layout: grid;', vi: 'layout: grid;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'display: grid; converts an element into a Grid container.',
            vi: 'display: grid; chuyển đổi một phần tử thành một Grid container.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the child combinator (>) do in CSS?',
            vi: 'Child combinator (>) làm gì trong CSS?'
          },
          options: [
            { en: 'Selects direct children only', vi: 'Chỉ chọn các phần tử con trực tiếp' },
            { en: 'Selects all descendants', vi: 'Chọn tất cả các phần tử con cháu' },
            { en: 'Selects siblings', vi: 'Chọn các phần tử anh em' },
            { en: 'Selects parent elements', vi: 'Chọn các phần tử cha' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The > combinator selects only direct children, not all descendants.',
            vi: 'Combinator > chỉ chọn các phần tử con trực tiếp, không phải tất cả các phần tử con cháu.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does justify-content: space-between do in Flexbox?',
            vi: 'justify-content: space-between làm gì trong Flexbox?'
          },
          options: [
            { en: 'Equal space between items, no space at edges', vi: 'Khoảng cách bằng nhau giữa các mục, không có khoảng cách ở các cạnh' },
            { en: 'Equal space around all items', vi: 'Khoảng cách bằng nhau xung quanh tất cả các mục' },
            { en: 'Items centered', vi: 'Các mục được căn giữa' },
            { en: 'Items at the start', vi: 'Các mục ở đầu' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'space-between distributes items with equal space between them, but no space between items and container edges.',
            vi: 'space-between phân bố các mục với khoảng cách bằng nhau giữa chúng, nhưng không có khoảng cách giữa các mục và các cạnh container.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does grid-template-columns: auto auto create?',
            vi: 'grid-template-columns: auto auto tạo ra gì?'
          },
          options: [
            { en: 'A grid with 2 equal-width columns', vi: 'Một grid với 2 cột có chiều rộng bằng nhau' },
            { en: 'A grid with 2 rows', vi: 'Một grid với 2 hàng' },
            { en: 'A grid with auto rows', vi: 'Một grid với các hàng tự động' },
            { en: 'A flex container', vi: 'Một flex container' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'grid-template-columns: auto auto creates 2 columns of equal width. Each "auto" represents one column.',
            vi: 'grid-template-columns: auto auto tạo ra 2 cột có chiều rộng bằng nhau. Mỗi "auto" đại diện cho một cột.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the purpose of the gap property in CSS Grid?',
            vi: 'Mục đích của property gap trong CSS Grid là gì?'
          },
          options: [
            { en: 'Sets space between grid rows and columns', vi: 'Đặt khoảng cách giữa các hàng và cột grid' },
            { en: 'Sets the grid size', vi: 'Đặt kích thước grid' },
            { en: 'Creates gaps in content', vi: 'Tạo khoảng trống trong nội dung' },
            { en: 'Hides grid lines', vi: 'Ẩn các đường grid' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'gap sets the size of the space between grid rows and columns.',
            vi: 'gap đặt kích thước của khoảng cách giữa các hàng và cột grid.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which property controls vertical alignment in Flexbox?',
            vi: 'Property nào kiểm soát căn chỉnh dọc trong Flexbox?'
          },
          options: [
            { en: 'align-items', vi: 'align-items' },
            { en: 'justify-content', vi: 'justify-content' },
            { en: 'align-content', vi: 'align-content' },
            { en: 'vertical-align', vi: 'vertical-align' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'align-items controls alignment along the cross axis (vertical by default in a row flex container).',
            vi: 'align-items kiểm soát căn chỉnh dọc theo trục chéo (dọc theo mặc định trong một flex container hàng).'
          }
        }
      ],
      5: [
        {
          type: 'multiple-choice',
          question: {
            en: 'Which position value makes an element fixed to the viewport?',
            vi: 'Giá trị position nào làm cho một phần tử cố định vào viewport?'
          },
          options: [
            { en: 'position: fixed;', vi: 'position: fixed;' },
            { en: 'position: absolute;', vi: 'position: absolute;' },
            { en: 'position: relative;', vi: 'position: relative;' },
            { en: 'position: static;', vi: 'position: static;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'position: fixed; positions an element relative to the viewport, so it stays in place when scrolling.',
            vi: 'position: fixed; định vị một phần tử tương đối với viewport, vì vậy nó giữ nguyên vị trí khi cuộn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct syntax for a CSS transition?',
            vi: 'Cú pháp đúng cho một CSS transition là gì?'
          },
          options: [
            { en: 'transition: property duration timing-function;', vi: 'transition: property duration timing-function;' },
            { en: 'transition: duration property;', vi: 'transition: duration property;' },
            { en: 'transition: timing-function property duration;', vi: 'transition: timing-function property duration;' },
            { en: 'transition: property;', vi: 'transition: property;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The correct syntax is: transition: property duration timing-function;',
            vi: 'Cú pháp đúng là: transition: property duration timing-function;'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which timing function makes a transition start slow and end slow?',
            vi: 'Timing function nào làm cho transition bắt đầu chậm và kết thúc chậm?'
          },
          options: [
            { en: 'ease-in-out', vi: 'ease-in-out' },
            { en: 'ease', vi: 'ease' },
            { en: 'linear', vi: 'linear' },
            { en: 'ease-in', vi: 'ease-in' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'ease-in-out starts slow, speeds up in the middle, and ends slow.',
            vi: 'ease-in-out bắt đầu chậm, tăng tốc ở giữa, và kết thúc chậm.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What keyword is used to define CSS animations?',
            vi: 'Từ khóa nào được sử dụng để định nghĩa CSS animations?'
          },
          options: [
            { en: '@keyframes', vi: '@keyframes' },
            { en: '@animation', vi: '@animation' },
            { en: '@frames', vi: '@frames' },
            { en: 'keyframes', vi: 'keyframes' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '@keyframes is used to define the animation sequence with percentages (0%, 100%, etc.).',
            vi: '@keyframes được sử dụng để định nghĩa chuỗi animation với phần trăm (0%, 100%, v.v.).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What value makes an animation repeat infinitely?',
            vi: 'Giá trị nào làm cho animation lặp lại vô tận?'
          },
          options: [
            { en: 'infinite', vi: 'infinite' },
            { en: 'repeat', vi: 'repeat' },
            { en: 'always', vi: 'always' },
            { en: 'loop', vi: 'loop' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'animation-iteration-count: infinite; makes the animation repeat forever.',
            vi: 'animation-iteration-count: infinite; làm cho animation lặp lại mãi mãi.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does position: relative do?',
            vi: 'position: relative làm gì?'
          },
          options: [
            { en: 'Allows element to move from its normal position', vi: 'Cho phép phần tử di chuyển từ vị trí bình thường của nó' },
            { en: 'Fixes element to viewport', vi: 'Cố định phần tử vào viewport' },
            { en: 'Removes element from flow', vi: 'Loại bỏ phần tử khỏi luồng' },
            { en: 'Makes element invisible', vi: 'Làm cho phần tử không nhìn thấy' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'position: relative allows an element to be offset from its normal position using top, right, bottom, left, while still occupying space in the flow.',
            vi: 'position: relative cho phép một phần tử được offset từ vị trí bình thường của nó bằng cách sử dụng top, right, bottom, left, trong khi vẫn chiếm không gian trong luồng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the :hover pseudoclass used for?',
            vi: 'Pseudoclass :hover được sử dụng để làm gì?'
          },
          options: [
            { en: 'Apply styles when mouse hovers over element', vi: 'Áp dụng styles khi chuột hover trên phần tử' },
            { en: 'Apply styles when element is clicked', vi: 'Áp dụng styles khi phần tử được nhấp' },
            { en: 'Apply styles when element is focused', vi: 'Áp dụng styles khi phần tử được focus' },
            { en: 'Apply styles when element is active', vi: 'Áp dụng styles khi phần tử đang active' }
          ],
          correctAnswer: 0,
          explanation: {
            en: ':hover applies styles when the user hovers their mouse pointer over an element.',
            vi: ':hover áp dụng styles khi người dùng di chuột qua một phần tử.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does animation-direction: alternate do?',
            vi: 'animation-direction: alternate làm gì?'
          },
          options: [
            { en: 'Animation plays forward then backward', vi: 'Animation phát tiến rồi lùi' },
            { en: 'Animation plays only forward', vi: 'Animation chỉ phát tiến' },
            { en: 'Animation plays only backward', vi: 'Animation chỉ phát lùi' },
            { en: 'Animation stops', vi: 'Animation dừng' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'alternate makes the animation play forward on odd iterations and backward on even iterations.',
            vi: 'alternate làm cho animation phát tiến trên các lần lặp lẻ và lùi trên các lần lặp chẵn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which CSS property name in JavaScript would be backgroundColor?',
            vi: 'Tên CSS property nào trong JavaScript sẽ là backgroundColor?'
          },
          options: [
            { en: 'background-color', vi: 'background-color' },
            { en: 'background_color', vi: 'background_color' },
            { en: 'backgroundcolor', vi: 'backgroundcolor' },
            { en: 'bg-color', vi: 'bg-color' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'In JavaScript, CSS properties with hyphens are converted to camelCase, so background-color becomes backgroundColor.',
            vi: 'Trong JavaScript, CSS properties có dấu gạch ngang được chuyển đổi sang camelCase, vì vậy background-color trở thành backgroundColor.'
          }
        }
      ],
      6: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What is Responsive Web Design?',
            vi: 'Responsive Web Design là gì?'
          },
          options: [
            { en: 'Design that adapts to different screen sizes', vi: 'Thiết kế thích ứng với các kích thước màn hình khác nhau' },
            { en: 'Design that only works on mobile', vi: 'Thiết kế chỉ hoạt động trên mobile' },
            { en: 'Design that only works on desktop', vi: 'Thiết kế chỉ hoạt động trên desktop' },
            { en: 'Design with animations', vi: 'Thiết kế có animations' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Responsive Web Design ensures web pages adapt to different screen sizes and devices.',
            vi: 'Responsive Web Design đảm bảo các trang web thích ứng với các kích thước màn hình và thiết bị khác nhau.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct syntax for a media query?',
            vi: 'Cú pháp đúng cho một media query là gì?'
          },
          options: [
            { en: '@media screen and (max-width: 600px)', vi: '@media screen and (max-width: 600px)' },
            { en: '@media (max-width: 600px)', vi: '@media (max-width: 600px)' },
            { en: 'media query screen (max-width: 600px)', vi: 'media query screen (max-width: 600px)' },
            { en: '@query screen and (max-width: 600px)', vi: '@query screen and (max-width: 600px)' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The correct syntax is @media screen and (max-width: 600px) { ... }',
            vi: 'Cú pháp đúng là @media screen and (max-width: 600px) { ... }'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does max-width: 600px mean in a media query?',
            vi: 'max-width: 600px có nghĩa là gì trong một media query?'
          },
          options: [
            { en: 'Apply styles when screen is 600px or less', vi: 'Áp dụng styles khi màn hình là 600px hoặc nhỏ hơn' },
            { en: 'Apply styles when screen is 600px or more', vi: 'Áp dụng styles khi màn hình là 600px hoặc lớn hơn' },
            { en: 'Set maximum width to 600px', vi: 'Đặt chiều rộng tối đa là 600px' },
            { en: 'Set minimum width to 600px', vi: 'Đặt chiều rộng tối thiểu là 600px' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'max-width: 600px applies styles when the viewport width is 600px or smaller.',
            vi: 'max-width: 600px áp dụng styles khi chiều rộng viewport là 600px hoặc nhỏ hơn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the Mobile-First approach?',
            vi: 'Mobile-First approach là gì?'
          },
          options: [
            { en: 'Design for small screens first, then scale up', vi: 'Thiết kế cho màn hình nhỏ trước, sau đó mở rộng' },
            { en: 'Design for large screens first, then scale down', vi: 'Thiết kế cho màn hình lớn trước, sau đó thu nhỏ' },
            { en: 'Only design for mobile devices', vi: 'Chỉ thiết kế cho thiết bị mobile' },
            { en: 'Design without media queries', vi: 'Thiết kế không có media queries' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Mobile-First means designing for small screens first, then using min-width media queries to enhance for larger screens.',
            vi: 'Mobile-First có nghĩa là thiết kế cho màn hình nhỏ trước, sau đó sử dụng media queries min-width để nâng cao cho màn hình lớn hơn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What meta tag is essential for responsive design?',
            vi: 'Meta tag nào cần thiết cho responsive design?'
          },
          options: [
            { en: '<meta name="viewport" content="width=device-width, initial-scale=1.0">', vi: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' },
            { en: '<meta name="responsive" content="true">', vi: '<meta name="responsive" content="true">' },
            { en: '<meta name="screen" content="mobile">', vi: '<meta name="screen" content="mobile">' },
            { en: '<meta name="device" content="width=device-width">', vi: '<meta name="device" content="width=device-width">' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The viewport meta tag ensures the page width matches the device width and sets the initial zoom level.',
            vi: 'Viewport meta tag đảm bảo chiều rộng trang khớp với chiều rộng thiết bị và đặt mức zoom ban đầu.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does min-width: 768px mean in a media query?',
            vi: 'min-width: 768px có nghĩa là gì trong một media query?'
          },
          options: [
            { en: 'Apply styles when screen is 768px or wider', vi: 'Áp dụng styles khi màn hình là 768px hoặc rộng hơn' },
            { en: 'Apply styles when screen is 768px or narrower', vi: 'Áp dụng styles khi màn hình là 768px hoặc hẹp hơn' },
            { en: 'Set minimum width to 768px', vi: 'Đặt chiều rộng tối thiểu là 768px' },
            { en: 'Set maximum width to 768px', vi: 'Đặt chiều rộng tối đa là 768px' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'min-width: 768px applies styles when the viewport width is 768px or larger, used in mobile-first design.',
            vi: 'min-width: 768px áp dụng styles khi chiều rộng viewport là 768px hoặc lớn hơn, được sử dụng trong mobile-first design.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'In mobile-first design, which media query approach is used?',
            vi: 'Trong mobile-first design, cách tiếp cận media query nào được sử dụng?'
          },
          options: [
            { en: 'Start with base styles, use min-width to enhance', vi: 'Bắt đầu với base styles, sử dụng min-width để nâng cao' },
            { en: 'Start with desktop styles, use max-width to reduce', vi: 'Bắt đầu với desktop styles, sử dụng max-width để giảm' },
            { en: 'Only use max-width', vi: 'Chỉ sử dụng max-width' },
            { en: 'No media queries needed', vi: 'Không cần media queries' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Mobile-first means starting with styles for small screens, then using min-width media queries to add styles for larger screens.',
            vi: 'Mobile-first có nghĩa là bắt đầu với styles cho màn hình nhỏ, sau đó sử dụng media queries min-width để thêm styles cho màn hình lớn hơn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is a common breakpoint for tablets?',
            vi: 'Breakpoint phổ biến cho máy tính bảng là gì?'
          },
          options: [
            { en: '768px', vi: '768px' },
            { en: '600px', vi: '600px' },
            { en: '480px', vi: '480px' },
            { en: '1024px', vi: '1024px' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '768px is a common breakpoint for tablets, with 600px for large phones and 1024px for desktops.',
            vi: '768px là một breakpoint phổ biến cho máy tính bảng, với 600px cho điện thoại lớn và 1024px cho desktop.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What happens to a flex container when flex-direction: column is applied?',
            vi: 'Điều gì xảy ra với một flex container khi flex-direction: column được áp dụng?'
          },
          options: [
            { en: 'Items stack vertically', vi: 'Các mục xếp dọc' },
            { en: 'Items align horizontally', vi: 'Các mục căn chỉnh ngang' },
            { en: 'Container becomes a grid', vi: 'Container trở thành một grid' },
            { en: 'Items disappear', vi: 'Các mục biến mất' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'flex-direction: column makes flex items stack vertically instead of horizontally.',
            vi: 'flex-direction: column làm cho các flex items xếp dọc thay vì ngang.'
          }
        }
      ],
      7: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What does DOM stand for?',
            vi: 'DOM là viết tắt của gì?'
          },
          options: [
            { en: 'Document Object Model', vi: 'Document Object Model' },
            { en: 'Data Object Model', vi: 'Data Object Model' },
            { en: 'Document Order Model', vi: 'Document Order Model' },
            { en: 'Dynamic Object Model', vi: 'Dynamic Object Model' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'DOM stands for Document Object Model, which represents the structure of HTML documents.',
            vi: 'DOM là viết tắt của Document Object Model, đại diện cho cấu trúc của tài liệu HTML.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which method selects an element by its ID?',
            vi: 'Phương thức nào chọn một phần tử theo ID của nó?'
          },
          options: [
            { en: 'document.getElementById()', vi: 'document.getElementById()' },
            { en: 'document.getElementsByClass()', vi: 'document.getElementsByClass()' },
            { en: 'document.querySelectorAll()', vi: 'document.querySelectorAll()' },
            { en: 'document.findElement()', vi: 'document.findElement()' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'document.getElementById() selects a single element by its unique ID.',
            vi: 'document.getElementById() chọn một phần tử duy nhất theo ID duy nhất của nó.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What property is used to change the HTML content of an element?',
            vi: 'Property nào được sử dụng để thay đổi nội dung HTML của một phần tử?'
          },
          options: [
            { en: 'innerHTML', vi: 'innerHTML' },
            { en: 'textContent', vi: 'textContent' },
            { en: 'content', vi: 'content' },
            { en: 'html', vi: 'html' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'innerHTML allows you to get or set the HTML content inside an element.',
            vi: 'innerHTML cho phép bạn lấy hoặc đặt nội dung HTML bên trong một phần tử.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you change the CSS color property in JavaScript?',
            vi: 'Làm thế nào để thay đổi CSS color property trong JavaScript?'
          },
          options: [
            { en: 'element.style.color = "red";', vi: 'element.style.color = "red";' },
            { en: 'element.style.color = red;', vi: 'element.style.color = red;' },
            { en: 'element.color = "red";', vi: 'element.color = "red";' },
            { en: 'element.css.color = "red";', vi: 'element.css.color = "red";' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'CSS properties are accessed via element.style.propertyName, and hyphenated names become camelCase (background-color becomes backgroundColor).',
            vi: 'CSS properties được truy cập qua element.style.propertyName, và tên có dấu gạch ngang trở thành camelCase (background-color trở thành backgroundColor).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which method creates a new HTML element?',
            vi: 'Phương thức nào tạo một phần tử HTML mới?'
          },
          options: [
            { en: 'document.createElement()', vi: 'document.createElement()' },
            { en: 'document.newElement()', vi: 'document.newElement()' },
            { en: 'document.addElement()', vi: 'document.addElement()' },
            { en: 'document.makeElement()', vi: 'document.makeElement()' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'document.createElement(tagName) creates a new element, which must then be appended to the DOM using appendChild().',
            vi: 'document.createElement(tagName) tạo một phần tử mới, sau đó phải được thêm vào DOM bằng appendChild().'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does getElementsByTagName return?',
            vi: 'getElementsByTagName trả về gì?'
          },
          options: [
            { en: 'An array-like collection of elements', vi: 'Một collection giống mảng các phần tử' },
            { en: 'A single element', vi: 'Một phần tử duy nhất' },
            { en: 'A string', vi: 'Một chuỗi' },
            { en: 'A number', vi: 'Một số' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'getElementsByTagName returns an HTMLCollection (array-like) of all elements with that tag name.',
            vi: 'getElementsByTagName trả về một HTMLCollection (giống mảng) của tất cả các phần tử có tên thẻ đó.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you add a class to an element in JavaScript?',
            vi: 'Làm thế nào để thêm một class vào một phần tử trong JavaScript?'
          },
          options: [
            { en: 'element.classList.add("className")', vi: 'element.classList.add("className")' },
            { en: 'element.addClass("className")', vi: 'element.addClass("className")' },
            { en: 'element.class = "className"', vi: 'element.class = "className"' },
            { en: 'element.add("className")', vi: 'element.add("className")' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'classList.add() is the correct method to add a class to an element.',
            vi: 'classList.add() là phương thức đúng để thêm một class vào một phần tử.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between onclick and addEventListener?',
            vi: 'Sự khác biệt giữa onclick và addEventListener là gì?'
          },
          options: [
            { en: 'addEventListener allows multiple handlers, onclick only one', vi: 'addEventListener cho phép nhiều handlers, onclick chỉ một' },
            { en: 'They are the same', vi: 'Chúng giống nhau' },
            { en: 'onclick is better', vi: 'onclick tốt hơn' },
            { en: 'addEventListener only works in HTML', vi: 'addEventListener chỉ hoạt động trong HTML' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'addEventListener allows multiple event handlers on the same element, while onclick can only have one handler.',
            vi: 'addEventListener cho phép nhiều event handlers trên cùng một phần tử, trong khi onclick chỉ có thể có một handler.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What method is used to add a created element to the page?',
            vi: 'Phương thức nào được sử dụng để thêm một phần tử đã tạo vào trang?'
          },
          options: [
            { en: 'appendChild()', vi: 'appendChild()' },
            { en: 'addChild()', vi: 'addChild()' },
            { en: 'insertElement()', vi: 'insertElement()' },
            { en: 'addElement()', vi: 'addElement()' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'appendChild() adds a node as the last child of a parent element, making it visible on the page.',
            vi: 'appendChild() thêm một node làm con cuối cùng của một phần tử cha, làm cho nó hiển thị trên trang.'
          }
        }
      ]
    }

    // Update each lesson
    for (let lessonNum = 2; lessonNum <= 7; lessonNum++) {
      const lesson = await Lesson.findOne({
        levelId: level1._id,
        lessonNumber: lessonNum
      })

      if (!lesson) {
        console.log(`Lesson ${lessonNum} not found, skipping...`)
        continue
      }

      if (quizData[lessonNum]) {
        lesson.quiz.questions = quizData[lessonNum]
        lesson.quiz.passingScore = 7 // 7 out of 10 (70%)
        await lesson.save()
        console.log(`✅ Added ${quizData[lessonNum].length} quiz questions to Lesson ${lessonNum}`)
      }
    }

    console.log('\n✅ All quiz questions added successfully!')
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

addQuizQuestions()

