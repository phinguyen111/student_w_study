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
      console.error('Level 2 not found.')
      process.exit(1)
    }

    console.log(`Found Level 2: ${level2.title}`)

    // Quiz questions for each lesson
    const quizData = {
      1: [
        {
          type: 'multiple-choice',
          question: {
            en: 'Which HTML element is used to create a form?',
            vi: 'Phần tử HTML nào được sử dụng để tạo một form?'
          },
          options: [
            { en: '<form>', vi: '<form>' },
            { en: '<input>', vi: '<input>' },
            { en: '<fieldset>', vi: '<fieldset>' },
            { en: '<formset>', vi: '<formset>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<form> is the container element that wraps all form controls.',
            vi: '<form> là phần tử container bao bọc tất cả các điều khiển form.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which input type is used for email addresses?',
            vi: 'Loại input nào được sử dụng cho địa chỉ email?'
          },
          options: [
            { en: 'type="email"', vi: 'type="email"' },
            { en: 'type="text"', vi: 'type="text"' },
            { en: 'type="mail"', vi: 'type="mail"' },
            { en: 'type="address"', vi: 'type="address"' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'type="email" provides email validation and mobile keyboard optimization.',
            vi: 'type="email" cung cấp validation email và tối ưu hóa bàn phím mobile.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the required attribute do in a form input?',
            vi: 'Thuộc tính required làm gì trong một form input?'
          },
          options: [
            { en: 'Makes the field mandatory', vi: 'Làm cho trường bắt buộc' },
            { en: 'Sets a default value', vi: 'Đặt giá trị mặc định' },
            { en: 'Hides the field', vi: 'Ẩn trường' },
            { en: 'Disables the field', vi: 'Vô hiệu hóa trường' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The required attribute makes a form field mandatory, preventing submission if empty.',
            vi: 'Thuộc tính required làm cho một trường form bắt buộc, ngăn chặn submit nếu trống.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which semantic element represents the main content of a page?',
            vi: 'Phần tử semantic nào đại diện cho nội dung chính của trang?'
          },
          options: [
            { en: '<main>', vi: '<main>' },
            { en: '<content>', vi: '<content>' },
            { en: '<body>', vi: '<body>' },
            { en: '<section>', vi: '<section>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<main> represents the main content of the document, and there should be only one per page.',
            vi: '<main> đại diện cho nội dung chính của tài liệu, và chỉ nên có một trên mỗi trang.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the purpose of the <nav> element?',
            vi: 'Mục đích của phần tử <nav> là gì?'
          },
          options: [
            { en: 'Contains navigation links', vi: 'Chứa các liên kết điều hướng' },
            { en: 'Creates a navigation bar', vi: 'Tạo thanh điều hướng' },
            { en: 'Defines a navigation menu', vi: 'Định nghĩa menu điều hướng' },
            { en: 'All of the above', vi: 'Tất cả các đáp án trên' }
          ],
          correctAnswer: 3,
          explanation: {
            en: '<nav> is used for navigation links, menus, and navigation bars.',
            vi: '<nav> được sử dụng cho các liên kết điều hướng, menu, và thanh điều hướng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which element is used to create a dropdown list?',
            vi: 'Phần tử nào được sử dụng để tạo danh sách dropdown?'
          },
          options: [
            { en: '<select>', vi: '<select>' },
            { en: '<dropdown>', vi: '<dropdown>' },
            { en: '<list>', vi: '<list>' },
            { en: '<option>', vi: '<option>' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<select> creates a dropdown list, with <option> elements inside for each choice.',
            vi: '<select> tạo danh sách dropdown, với các phần tử <option> bên trong cho mỗi lựa chọn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between <article> and <section>?',
            vi: 'Sự khác biệt giữa <article> và <section> là gì?'
          },
          options: [
            { en: '<article> is independent content, <section> is thematic grouping', vi: '<article> là nội dung độc lập, <section> là nhóm theo chủ đề' },
            { en: 'They are the same', vi: 'Chúng giống nhau' },
            { en: '<section> is for articles, <article> is for sections', vi: '<section> dành cho articles, <article> dành cho sections' },
            { en: '<article> is older, <section> is newer', vi: '<article> cũ hơn, <section> mới hơn' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<article> represents independent, self-contained content, while <section> groups thematically related content.',
            vi: '<article> đại diện cho nội dung độc lập, tự chứa, trong khi <section> nhóm nội dung liên quan theo chủ đề.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which attribute is used to associate a label with an input?',
            vi: 'Thuộc tính nào được sử dụng để liên kết một label với một input?'
          },
          options: [
            { en: 'for (on label) and id (on input)', vi: 'for (trên label) và id (trên input)' },
            { en: 'name', vi: 'name' },
            { en: 'label', vi: 'label' },
            { en: 'connect', vi: 'connect' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The for attribute on <label> should match the id attribute on the <input> element.',
            vi: 'Thuộc tính for trên <label> nên khớp với thuộc tính id trên phần tử <input>.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the <figure> element represent?',
            vi: 'Phần tử <figure> đại diện cho gì?'
          },
          options: [
            { en: 'Self-contained content like images or diagrams', vi: 'Nội dung tự chứa như hình ảnh hoặc sơ đồ' },
            { en: 'A figure or number', vi: 'Một hình hoặc số' },
            { en: 'A decorative element', vi: 'Một phần tử trang trí' },
            { en: 'A form field', vi: 'Một trường form' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '<figure> represents self-contained content, typically images, diagrams, or illustrations, often with a <figcaption>.',
            vi: '<figure> đại diện cho nội dung tự chứa, thường là hình ảnh, sơ đồ, hoặc minh họa, thường kèm theo <figcaption>.'
          }
        }
      ],
      2: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the descendant selector do?',
            vi: 'Descendant selector làm gì?'
          },
          options: [
            { en: 'Selects all descendants, not just direct children', vi: 'Chọn tất cả các phần tử con cháu, không chỉ con trực tiếp' },
            { en: 'Selects only direct children', vi: 'Chỉ chọn con trực tiếp' },
            { en: 'Selects siblings', vi: 'Chọn các phần tử anh em' },
            { en: 'Selects parent elements', vi: 'Chọn các phần tử cha' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'A descendant selector (space) selects all matching descendants at any level, not just direct children.',
            vi: 'Một descendant selector (khoảng trắng) chọn tất cả các phần tử con cháu khớp ở bất kỳ cấp độ nào, không chỉ con trực tiếp.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the + selector (adjacent sibling) do?',
            vi: 'Selector + (adjacent sibling) làm gì?'
          },
          options: [
            { en: 'Selects the next sibling element', vi: 'Chọn phần tử anh em tiếp theo' },
            { en: 'Selects all siblings', vi: 'Chọn tất cả các phần tử anh em' },
            { en: 'Selects the previous sibling', vi: 'Chọn phần tử anh em trước đó' },
            { en: 'Selects parent elements', vi: 'Chọn các phần tử cha' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'The + selector selects the immediately following sibling element.',
            vi: 'Selector + chọn phần tử anh em ngay sau đó.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which pseudo-class selects the first child element?',
            vi: 'Pseudo-class nào chọn phần tử con đầu tiên?'
          },
          options: [
            { en: ':first-child', vi: ':first-child' },
            { en: ':first', vi: ':first' },
            { en: ':child-first', vi: ':child-first' },
            { en: ':first-of-type', vi: ':first-of-type' }
          ],
          correctAnswer: 0,
          explanation: {
            en: ':first-child selects the first child element of its parent.',
            vi: ':first-child chọn phần tử con đầu tiên của parent của nó.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you define a CSS variable?',
            vi: 'Làm thế nào để định nghĩa một CSS variable?'
          },
          options: [
            { en: '--variable-name: value;', vi: '--variable-name: value;' },
            { en: 'var variable-name: value;', vi: 'var variable-name: value;' },
            { en: '$variable-name: value;', vi: '$variable-name: value;' },
            { en: 'variable-name = value;', vi: 'variable-name = value;' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'CSS variables are defined with -- prefix and used with var() function.',
            vi: 'CSS variables được định nghĩa với tiền tố -- và sử dụng với hàm var().'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you use a CSS variable?',
            vi: 'Làm thế nào để sử dụng một CSS variable?'
          },
          options: [
            { en: 'var(--variable-name)', vi: 'var(--variable-name)' },
            { en: '--variable-name', vi: '--variable-name' },
            { en: '$variable-name', vi: '$variable-name' },
            { en: 'variable-name', vi: 'variable-name' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Use var(--variable-name) to reference a CSS variable.',
            vi: 'Sử dụng var(--variable-name) để tham chiếu một CSS variable.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does :nth-child(2n) select?',
            vi: ':nth-child(2n) chọn gì?'
          },
          options: [
            { en: 'Every even-numbered child', vi: 'Mỗi phần tử con số chẵn' },
            { en: 'The second child only', vi: 'Chỉ phần tử con thứ hai' },
            { en: 'Every odd-numbered child', vi: 'Mỗi phần tử con số lẻ' },
            { en: 'All children', vi: 'Tất cả các phần tử con' }
          ],
          correctAnswer: 0,
          explanation: {
            en: ':nth-child(2n) selects every even-numbered child (2, 4, 6, etc.).',
            vi: ':nth-child(2n) chọn mỗi phần tử con số chẵn (2, 4, 6, v.v.).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between :nth-child() and :nth-of-type()?',
            vi: 'Sự khác biệt giữa :nth-child() và :nth-of-type() là gì?'
          },
          options: [
            { en: ':nth-child() counts all children, :nth-of-type() counts only same-type elements', vi: ':nth-child() đếm tất cả các phần tử con, :nth-of-type() chỉ đếm các phần tử cùng loại' },
            { en: 'They are the same', vi: 'Chúng giống nhau' },
            { en: ':nth-of-type() is older', vi: ':nth-of-type() cũ hơn' },
            { en: ':nth-child() only works with divs', vi: ':nth-child() chỉ hoạt động với divs' }
          ],
          correctAnswer: 0,
          explanation: {
            en: ':nth-child() counts all children regardless of type, while :nth-of-type() only counts elements of the same type.',
            vi: ':nth-child() đếm tất cả các phần tử con bất kể loại, trong khi :nth-of-type() chỉ đếm các phần tử cùng loại.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the ::before pseudo-element require?',
            vi: 'Pseudo-element ::before yêu cầu gì?'
          },
          options: [
            { en: 'A content property', vi: 'Một property content' },
            { en: 'A before property', vi: 'Một property before' },
            { en: 'A pseudo property', vi: 'Một property pseudo' },
            { en: 'Nothing, it works automatically', vi: 'Không gì cả, nó hoạt động tự động' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '::before and ::after pseudo-elements require a content property to display, even if it\'s empty (content: "").',
            vi: 'Pseudo-elements ::before và ::after yêu cầu một property content để hiển thị, ngay cả khi nó trống (content: "").'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'Which attribute selector matches links starting with "https"?',
            vi: 'Attribute selector nào khớp với các liên kết bắt đầu bằng "https"?'
          },
          options: [
            { en: 'a[href^="https"]', vi: 'a[href^="https"]' },
            { en: 'a[href="https"]', vi: 'a[href="https"]' },
            { en: 'a[href*="https"]', vi: 'a[href*="https"]' },
            { en: 'a[href$="https"]', vi: 'a[href$="https"]' }
          ],
          correctAnswer: 0,
          explanation: {
            en: '^ matches the beginning, * matches anywhere, $ matches the end of the attribute value.',
            vi: '^ khớp với đầu, * khớp với bất kỳ đâu, $ khớp với cuối của giá trị attribute.'
          }
        }
      ],
      3: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What does flex-wrap: wrap do?',
            vi: 'flex-wrap: wrap làm gì?'
          },
          options: [
            { en: 'Allows flex items to wrap to new lines', vi: 'Cho phép flex items wrap sang dòng mới' },
            { en: 'Prevents wrapping', vi: 'Ngăn chặn wrapping' },
            { en: 'Wraps text inside items', vi: 'Wrap văn bản bên trong items' },
            { en: 'Creates a grid', vi: 'Tạo một grid' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'flex-wrap: wrap allows flex items to wrap to new lines when there\'s not enough space.',
            vi: 'flex-wrap: wrap cho phép flex items wrap sang dòng mới khi không có đủ không gian.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does flex: 1 mean?',
            vi: 'flex: 1 có nghĩa là gì?'
          },
          options: [
            { en: 'Item can grow and shrink, with flex-basis of 0', vi: 'Item có thể grow và shrink, với flex-basis là 0' },
            { en: 'Item has fixed size of 1px', vi: 'Item có kích thước cố định 1px' },
            { en: 'Item cannot grow', vi: 'Item không thể grow' },
            { en: 'Item takes 1% of space', vi: 'Item chiếm 1% không gian' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'flex: 1 is shorthand for flex: 1 1 0, meaning the item can grow and shrink with a basis of 0.',
            vi: 'flex: 1 là shorthand cho flex: 1 1 0, có nghĩa là item có thể grow và shrink với basis là 0.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is grid-template-areas used for?',
            vi: 'grid-template-areas được sử dụng để làm gì?'
          },
          options: [
            { en: 'Naming grid areas for easier layout', vi: 'Đặt tên các vùng grid để layout dễ dàng hơn' },
            { en: 'Setting grid size', vi: 'Đặt kích thước grid' },
            { en: 'Creating grid lines', vi: 'Tạo các đường grid' },
            { en: 'Aligning grid items', vi: 'Căn chỉnh grid items' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'grid-template-areas allows you to name grid areas, making complex layouts easier to understand and maintain.',
            vi: 'grid-template-areas cho phép bạn đặt tên các vùng grid, làm cho các layout phức tạp dễ hiểu và bảo trì hơn.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does grid-column: span 2 do?',
            vi: 'grid-column: span 2 làm gì?'
          },
          options: [
            { en: 'Makes item span 2 columns', vi: 'Làm cho item span 2 cột' },
            { en: 'Creates 2 columns', vi: 'Tạo 2 cột' },
            { en: 'Moves item 2 columns right', vi: 'Di chuyển item 2 cột sang phải' },
            { en: 'Sets column width to 2px', vi: 'Đặt chiều rộng cột là 2px' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'grid-column: span 2 makes the item span across 2 columns.',
            vi: 'grid-column: span 2 làm cho item span qua 2 cột.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does repeat(auto-fit, minmax(200px, 1fr)) do?',
            vi: 'repeat(auto-fit, minmax(200px, 1fr)) làm gì?'
          },
          options: [
            { en: 'Creates responsive grid columns that fit available space', vi: 'Tạo các cột grid responsive vừa với không gian có sẵn' },
            { en: 'Creates exactly 200px columns', vi: 'Tạo chính xác các cột 200px' },
            { en: 'Creates 1 column', vi: 'Tạo 1 cột' },
            { en: 'Disables grid', vi: 'Vô hiệu hóa grid' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'auto-fit creates as many columns as can fit, each at least 200px wide, sharing remaining space equally.',
            vi: 'auto-fit tạo nhiều cột nhất có thể vừa, mỗi cột ít nhất 200px rộng, chia đều không gian còn lại.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between align-items and align-content?',
            vi: 'Sự khác biệt giữa align-items và align-content là gì?'
          },
          options: [
            { en: 'align-items aligns items in a line, align-content aligns lines', vi: 'align-items căn chỉnh items trong một dòng, align-content căn chỉnh các dòng' },
            { en: 'They are the same', vi: 'Chúng giống nhau' },
            { en: 'align-content is for grid only', vi: 'align-content chỉ dành cho grid' },
            { en: 'align-items is deprecated', vi: 'align-items đã lỗi thời' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'align-items aligns items within their flex line, while align-content aligns the flex lines themselves (only works with flex-wrap: wrap).',
            vi: 'align-items căn chỉnh items trong dòng flex của chúng, trong khi align-content căn chỉnh các dòng flex (chỉ hoạt động với flex-wrap: wrap).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does the fr unit represent in CSS Grid?',
            vi: 'Đơn vị fr đại diện cho gì trong CSS Grid?'
          },
          options: [
            { en: 'Fraction of available space', vi: 'Phần của không gian có sẵn' },
            { en: 'Fixed pixels', vi: 'Pixel cố định' },
            { en: 'Percentage', vi: 'Phần trăm' },
            { en: 'Font size', vi: 'Kích thước font' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'fr (fraction) represents a fraction of the available space in the grid container.',
            vi: 'fr (fraction) đại diện cho một phần của không gian có sẵn trong grid container.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does flex-direction: column-reverse do?',
            vi: 'flex-direction: column-reverse làm gì?'
          },
          options: [
            { en: 'Stacks items vertically in reverse order', vi: 'Xếp items dọc theo thứ tự ngược lại' },
            { en: 'Stacks items horizontally', vi: 'Xếp items ngang' },
            { en: 'Reverses the container', vi: 'Đảo ngược container' },
            { en: 'Hides items', vi: 'Ẩn items' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'column-reverse stacks items vertically but in reverse order (bottom to top).',
            vi: 'column-reverse xếp items dọc nhưng theo thứ tự ngược lại (từ dưới lên trên).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does grid-area do?',
            vi: 'grid-area làm gì?'
          },
          options: [
            { en: 'Assigns element to a named grid area', vi: 'Gán phần tử vào một vùng grid có tên' },
            { en: 'Creates a new grid area', vi: 'Tạo một vùng grid mới' },
            { en: 'Sets grid size', vi: 'Đặt kích thước grid' },
            { en: 'Aligns grid items', vi: 'Căn chỉnh grid items' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'grid-area assigns an element to a named area defined in grid-template-areas.',
            vi: 'grid-area gán một phần tử vào một vùng có tên được định nghĩa trong grid-template-areas.'
          }
        }
      ],
      4: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the difference between function declaration and arrow function?',
            vi: 'Sự khác biệt giữa function declaration và arrow function là gì?'
          },
          options: [
            { en: 'Function declarations are hoisted, arrow functions are not', vi: 'Function declarations được hoisted, arrow functions thì không' },
            { en: 'They are identical', vi: 'Chúng giống hệt nhau' },
            { en: 'Arrow functions are faster', vi: 'Arrow functions nhanh hơn' },
            { en: 'Function declarations are deprecated', vi: 'Function declarations đã lỗi thời' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'Function declarations are hoisted (can be called before definition), while arrow functions are not.',
            vi: 'Function declarations được hoisted (có thể được gọi trước khi định nghĩa), trong khi arrow functions thì không.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does addEventListener do?',
            vi: 'addEventListener làm gì?'
          },
          options: [
            { en: 'Attaches an event handler to an element', vi: 'Đính kèm một event handler vào một phần tử' },
            { en: 'Removes an event', vi: 'Xóa một event' },
            { en: 'Creates a new element', vi: 'Tạo một phần tử mới' },
            { en: 'Modifies CSS', vi: 'Sửa đổi CSS' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'addEventListener attaches an event handler function to an element, allowing multiple handlers.',
            vi: 'addEventListener đính kèm một hàm event handler vào một phần tử, cho phép nhiều handlers.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does event.target refer to?',
            vi: 'event.target tham chiếu đến gì?'
          },
          options: [
            { en: 'The element that triggered the event', vi: 'Phần tử đã kích hoạt event' },
            { en: 'The parent element', vi: 'Phần tử cha' },
            { en: 'The document', vi: 'Document' },
            { en: 'The window', vi: 'Window' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'event.target refers to the element on which the event was triggered.',
            vi: 'event.target tham chiếu đến phần tử mà event được kích hoạt.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does querySelector return?',
            vi: 'querySelector trả về gì?'
          },
          options: [
            { en: 'The first matching element', vi: 'Phần tử khớp đầu tiên' },
            { en: 'All matching elements', vi: 'Tất cả các phần tử khớp' },
            { en: 'An array', vi: 'Một mảng' },
            { en: 'A string', vi: 'Một chuỗi' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'querySelector returns the first element that matches the CSS selector, while querySelectorAll returns all matches.',
            vi: 'querySelector trả về phần tử đầu tiên khớp với CSS selector, trong khi querySelectorAll trả về tất cả các phần tử khớp.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does preventDefault() do?',
            vi: 'preventDefault() làm gì?'
          },
          options: [
            { en: 'Prevents the default behavior of an event', vi: 'Ngăn chặn hành vi mặc định của một event' },
            { en: 'Stops event propagation', vi: 'Dừng lan truyền event' },
            { en: 'Removes the element', vi: 'Xóa phần tử' },
            { en: 'Disables the event', vi: 'Vô hiệu hóa event' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'preventDefault() prevents the default action of an event (e.g., form submission, link navigation).',
            vi: 'preventDefault() ngăn chặn hành động mặc định của một event (ví dụ: submit form, điều hướng liên kết).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does classList.toggle() do?',
            vi: 'classList.toggle() làm gì?'
          },
          options: [
            { en: 'Adds class if missing, removes if present', vi: 'Thêm class nếu thiếu, xóa nếu có' },
            { en: 'Only adds the class', vi: 'Chỉ thêm class' },
            { en: 'Only removes the class', vi: 'Chỉ xóa class' },
            { en: 'Checks if class exists', vi: 'Kiểm tra xem class có tồn tại không' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'classList.toggle() adds the class if it\'s not present, and removes it if it is present.',
            vi: 'classList.toggle() thêm class nếu nó không có, và xóa nó nếu nó có.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct syntax for an arrow function with one parameter?',
            vi: 'Cú pháp đúng cho một arrow function với một tham số là gì?'
          },
          options: [
            { en: 'const func = (param) => { }', vi: 'const func = (param) => { }' },
            { en: 'const func = param => { }', vi: 'const func = param => { }' },
            { en: 'Both are correct', vi: 'Cả hai đều đúng' },
            { en: 'const func = => param { }', vi: 'const func = => param { }' }
          ],
          correctAnswer: 2,
          explanation: {
            en: 'Both (param) => and param => are valid syntax for arrow functions with one parameter.',
            vi: 'Cả (param) => và param => đều là cú pháp hợp lệ cho arrow functions với một tham số.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does insertBefore() do?',
            vi: 'insertBefore() làm gì?'
          },
          options: [
            { en: 'Inserts an element before a reference element', vi: 'Chèn một phần tử trước một phần tử tham chiếu' },
            { en: 'Inserts an element after a reference element', vi: 'Chèn một phần tử sau một phần tử tham chiếu' },
            { en: 'Moves an element', vi: 'Di chuyển một phần tử' },
            { en: 'Clones an element', vi: 'Nhân bản một phần tử' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'insertBefore(newElement, referenceElement) inserts newElement before the referenceElement in the DOM.',
            vi: 'insertBefore(newElement, referenceElement) chèn newElement trước referenceElement trong DOM.'
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
            { en: 'They are identical', vi: 'Chúng giống hệt nhau' },
            { en: 'onclick is better', vi: 'onclick tốt hơn' },
            { en: 'addEventListener is deprecated', vi: 'addEventListener đã lỗi thời' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'addEventListener allows multiple event handlers on the same element, while onclick can only have one handler.',
            vi: 'addEventListener cho phép nhiều event handlers trên cùng một phần tử, trong khi onclick chỉ có thể có một handler.'
          }
        }
      ],
      5: [
        {
          type: 'multiple-choice',
          question: {
            en: 'What does array.push() do?',
            vi: 'array.push() làm gì?'
          },
          options: [
            { en: 'Adds element to the end of array', vi: 'Thêm phần tử vào cuối mảng' },
            { en: 'Adds element to the beginning', vi: 'Thêm phần tử vào đầu' },
            { en: 'Removes element from end', vi: 'Xóa phần tử từ cuối' },
            { en: 'Removes element from beginning', vi: 'Xóa phần tử từ đầu' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'push() adds one or more elements to the end of an array and returns the new length.',
            vi: 'push() thêm một hoặc nhiều phần tử vào cuối mảng và trả về độ dài mới.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does array.forEach() do?',
            vi: 'array.forEach() làm gì?'
          },
          options: [
            { en: 'Executes a function for each array element', vi: 'Thực thi một hàm cho mỗi phần tử mảng' },
            { en: 'Creates a new array', vi: 'Tạo một mảng mới' },
            { en: 'Filters array elements', vi: 'Lọc các phần tử mảng' },
            { en: 'Sorts the array', vi: 'Sắp xếp mảng' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'forEach() executes a provided function once for each array element.',
            vi: 'forEach() thực thi một hàm được cung cấp một lần cho mỗi phần tử mảng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you access an object property?',
            vi: 'Làm thế nào để truy cập một object property?'
          },
          options: [
            { en: 'object.property or object["property"]', vi: 'object.property hoặc object["property"]' },
            { en: 'object->property', vi: 'object->property' },
            { en: 'object::property', vi: 'object::property' },
            { en: 'object.property only', vi: 'chỉ object.property' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'You can access object properties using dot notation (object.property) or bracket notation (object["property"]).',
            vi: 'Bạn có thể truy cập object properties bằng dot notation (object.property) hoặc bracket notation (object["property"]).'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does for...of loop iterate over?',
            vi: 'Vòng lặp for...of lặp qua gì?'
          },
          options: [
            { en: 'Array values', vi: 'Các giá trị mảng' },
            { en: 'Object keys', vi: 'Các khóa object' },
            { en: 'Object values', vi: 'Các giá trị object' },
            { en: 'Array indices', vi: 'Các chỉ số mảng' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'for...of iterates over the values of iterable objects like arrays.',
            vi: 'for...of lặp qua các giá trị của các đối tượng có thể lặp như mảng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does for...in loop iterate over?',
            vi: 'Vòng lặp for...in lặp qua gì?'
          },
          options: [
            { en: 'Object keys', vi: 'Các khóa object' },
            { en: 'Array values', vi: 'Các giá trị mảng' },
            { en: 'Array indices', vi: 'Các chỉ số mảng' },
            { en: 'Object values', vi: 'Các giá trị object' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'for...in iterates over the enumerable property names (keys) of an object.',
            vi: 'for...in lặp qua các tên thuộc tính có thể liệt kê (khóa) của một đối tượng.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does array.map() return?',
            vi: 'array.map() trả về gì?'
          },
          options: [
            { en: 'A new array with transformed elements', vi: 'Một mảng mới với các phần tử đã biến đổi' },
            { en: 'The original array', vi: 'Mảng gốc' },
            { en: 'A single value', vi: 'Một giá trị duy nhất' },
            { en: 'Nothing', vi: 'Không gì cả' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'map() creates a new array with the results of calling a function on every element.',
            vi: 'map() tạo một mảng mới với kết quả của việc gọi một hàm trên mỗi phần tử.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What does array.filter() do?',
            vi: 'array.filter() làm gì?'
          },
          options: [
            { en: 'Creates new array with elements that pass a test', vi: 'Tạo mảng mới với các phần tử vượt qua một kiểm tra' },
            { en: 'Removes all elements', vi: 'Xóa tất cả các phần tử' },
            { en: 'Sorts the array', vi: 'Sắp xếp mảng' },
            { en: 'Reverses the array', vi: 'Đảo ngược mảng' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'filter() creates a new array with elements that pass the test implemented by the provided function.',
            vi: 'filter() tạo một mảng mới với các phần tử vượt qua kiểm tra được triển khai bởi hàm được cung cấp.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'What is the correct syntax for a for loop?',
            vi: 'Cú pháp đúng cho một vòng lặp for là gì?'
          },
          options: [
            { en: 'for (let i = 0; i < 5; i++) { }', vi: 'for (let i = 0; i < 5; i++) { }' },
            { en: 'for (i = 0; i < 5; i++) { }', vi: 'for (i = 0; i < 5; i++) { }' },
            { en: 'for i in range(5) { }', vi: 'for i in range(5) { }' },
            { en: 'Both first and second are correct', vi: 'Cả câu đầu và câu hai đều đúng' }
          ],
          correctAnswer: 3,
          explanation: {
            en: 'Both let i = 0 and i = 0 are valid, though let is preferred for block scope.',
            vi: 'Cả let i = 0 và i = 0 đều hợp lệ, mặc dù let được ưa chuộng cho block scope.'
          }
        },
        {
          type: 'multiple-choice',
          question: {
            en: 'How do you get the length of an array?',
            vi: 'Làm thế nào để lấy độ dài của một mảng?'
          },
          options: [
            { en: 'array.length', vi: 'array.length' },
            { en: 'array.size', vi: 'array.size' },
            { en: 'array.count', vi: 'array.count' },
            { en: 'array.length()', vi: 'array.length()' }
          ],
          correctAnswer: 0,
          explanation: {
            en: 'length is a property, not a method, so use array.length (not array.length()).',
            vi: 'length là một property, không phải method, vì vậy sử dụng array.length (không phải array.length()).'
          }
        }
      ]
    }

    // Update each lesson
    for (let lessonNum = 1; lessonNum <= 5; lessonNum++) {
      const lesson = await Lesson.findOne({
        levelId: level2._id,
        lessonNumber: lessonNum
      })

      if (!lesson) {
        console.log(`Lesson ${lessonNum} not found, skipping...`)
        continue
      }

      if (quizData[lessonNum]) {
        lesson.quiz.questions = quizData[lessonNum]
        lesson.quiz.passingScore = 7 // 7 out of 9 (78%)
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

