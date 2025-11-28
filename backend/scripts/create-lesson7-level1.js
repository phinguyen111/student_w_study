import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson7 = async () => {
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

    // Check if lesson 7 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 7
    })

    if (existingLesson) {
      console.log('Lesson 7 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 7')
    }

    // Create lesson 7 content based on CodeSignal
    const lesson7 = {
      levelId: level1._id,
      lessonNumber: 7,
      title: {
        en: 'Interactive Web Development with JavaScript and DOM',
        vi: 'Phát triển Web Tương tác với JavaScript và DOM'
      },
      content: {
        en: `# Interactive Web Development with JavaScript and DOM

## Introduction to JavaScript and DOM

Welcome aboard! In today's lesson, we are exploring the dynamic duo of **JavaScript** and the **Document Object Model** (DOM). Working in tandem with the DOM, we can manipulate and update our web pages in real-time based on user interactions.

Do you remember how some websites greet, "Good morning!" during the day and "Good night!" after sundown? This dynamic behavior is exactly what we aim to achieve using JavaScript and DOM.

## Linking JavaScript to HTML

To introduce JavaScript into HTML, we need the \`<script>\` tag. Although JavaScript can be written directly inside HTML, it's often tidier to store it in separate files:

\`\`\`html
<script src="script.js"></script>
\`\`\`

Inline \`<script>\` tags also serve as an option:

\`\`\`html
<script>
  document.getElementById('myParagraph').innerHTML = 'Hello, World!';
</script>
\`\`\`

The \`innerHTML\` property is a powerful tool that allows us to get the content of elements or directly insert content into elements in our HTML. In the code above, we used \`innerHTML\` to change the text content of a paragraph.

## Understanding DOM Manipulation

Atomic yet immense, DOM manipulation is achievable via JavaScript. This tool offers us the ability to grasp elements and perform operations on them much like a craftsman working on his creation. Here are some handy methods for DOM manipulation:

* \`document.getElementById(id)\`: This function fetches an element using its unique ID, much like how you would find a book in a library.
* \`document.getElementsByTagName(name)\`: It selects all elements that share a specified tag name, such as all paragraphs (\`<p>\`).
* \`document.getElementsByClassName(name)\`: This function retrieves all elements having the provided class name.
* \`document.querySelector(selector)\`: Just as you pick out your favorite fruit from a basket, it selects the first element that matches the supplied CSS selector.

Selectors that return multiple elements (\`getElementsByTagName\` and \`getElementsByClassName\`) return a JS array of elements, so you need to select which element in the list you want through array indexing.

Below, we have an illustration of how we can select an HTML element and modify its content and style:

\`\`\`html
<h1 id="title">Original Title</h1>
<button onclick="changeTitle()">Change Title</button>

<script>
function changeTitle() {
  var titleElement = document.getElementById('title');
  titleElement.style.color = 'red';
  titleElement.innerHTML = 'New Title';
}
</script>
\`\`\`

The \`<button>\` tag in HTML is used to create a clickable button on your webpage. Contained within the opening and closing \`<button>\` tags, you can place text or images. This content is what users see and click on. The \`onclick\` attribute is an event attribute that instructs the browser to execute a specific JavaScript function when the button is clicked. The function to be executed is specified right within the \`onclick\` attribute.

In this case, once the button is clicked it triggers the \`changeTitle()\` method. Within this method, we're setting the \`style.color\` property of \`titleElement\`. \`titleElement.style.color = 'red';\` alters the CSS color of the text within this element to red.

Using getElements or querySelector to access an element is just the starting point. Once you have the reference to an element, there are many things you can do to manipulate it.

* **Modifying content**: As you've seen with \`innerHTML\`, after selecting an element, you can directly manipulate its content.
* **Changing style**: You can change any CSS property of an element using \`element.style.property\`. This covers a range of alterations from colors, dimensions, positioning, to transitions, transformations and visibility. **Note**: In JavaScript, CSS property names that contain a hyphen (like \`background-color\`) are converted to camelCase (becomes \`backgroundColor\`). This is due to the fact that hyphens are not allowed in JavaScript variable names.

## Manipulating Elements

Modifying content via \`innerHTML\` and changing style via \`element.style.property\` is just the beginning. Look at more options of manipulating elements.

* **Adding or removing classes**: You can add a new class to an element with \`element.classList.add('className')\` or remove a class with \`element.classList.remove('className')\`.
* **Setting or getting attributes**: You can change any attribute of an element using \`element.setAttribute('attrName', 'attrValue')\` or retrieve it with \`element.getAttribute('attrName')\`.
* **Event handling**: With a reference to an element, you can attach an event listener that will execute a specified function when the event occurs, using syntax like \`element.addEventListener('click', function)\`. Note that when adding an event, the function does not require \`()\` like \`onclick\`.
* **Creation and deletion of elements**: Using methods such as \`document.createElement('tagName')\` to create an element or \`element.removeChild(childElement)\` to remove a child element.

The \`document.createElement('tagName')\` will create an empty element with the tag name you provide. However, when an element is created like this, it does not automatically appear on the webpage. To make it visible, you have to append the new element to an existing element on the page using \`appendChild()\`. The \`appendChild()\` method places a node as the last child of its parent. With \`appendChild()\`, you can also dynamically add new content to your document.

With just a few keystrokes in JavaScript, voila, you've transformed the entire persona of your webpage!

## Lesson Summary

Great job, future web wizards! You have now mastered the art of manipulating web pages using JavaScript and the DOM! From linking JavaScript to your HTML, understanding how to select elements using methods like \`getElementById\`, \`getElementsByTagName\` and \`querySelector\`, to dynamically updating these elements by changing their content, style, attributes or even adding and removing them.

You've learned how JavaScript can interact with the DOM to update your webpages in real-time, providing the ability to create a rich and interactive user experience that can respond to user inputs and actions dynamically.

Next up are practice exercises for you to apply this newfound knowledge and help turn this knowledge into an intuitive understanding. Then, in future lessons, we'll venture into more advanced topics and broaden your understanding of JavaScript and web development as a whole.

Buckle up and let's continue to explore the wonderful and exciting world of JavaScript and web development!`,
        vi: `# Phát triển Web Tương tác với JavaScript và DOM

## Giới thiệu về JavaScript và DOM

Chào mừng bạn! Trong bài học hôm nay, chúng ta sẽ khám phá bộ đôi động của **JavaScript** và **Document Object Model** (DOM). Làm việc cùng với DOM, chúng ta có thể thao tác và cập nhật các trang web của mình theo thời gian thực dựa trên tương tác của người dùng.

Bạn có nhớ cách một số trang web chào, "Chào buổi sáng!" vào ban ngày và "Chúc ngủ ngon!" sau khi mặt trời lặn không? Hành vi động này chính xác là những gì chúng ta nhắm đến đạt được bằng cách sử dụng JavaScript và DOM.

## Liên kết JavaScript với HTML

Để đưa JavaScript vào HTML, chúng ta cần thẻ \`<script>\`. Mặc dù JavaScript có thể được viết trực tiếp bên trong HTML, nhưng thường gọn gàng hơn khi lưu trữ nó trong các file riêng biệt:

\`\`\`html
<script src="script.js"></script>
\`\`\`

Thẻ \`<script>\` inline cũng là một lựa chọn:

\`\`\`html
<script>
  document.getElementById('myParagraph').innerHTML = 'Xin chào, Thế giới!';
</script>
\`\`\`

Property \`innerHTML\` là một công cụ mạnh mẽ cho phép chúng ta lấy nội dung của các phần tử hoặc trực tiếp chèn nội dung vào các phần tử trong HTML của chúng ta. Trong code trên, chúng ta đã sử dụng \`innerHTML\` để thay đổi nội dung văn bản của một đoạn văn.

## Hiểu về DOM Manipulation

Nhỏ nhưng to lớn, DOM manipulation có thể đạt được thông qua JavaScript. Công cụ này cung cấp cho chúng ta khả năng nắm bắt các phần tử và thực hiện các thao tác trên chúng giống như một thợ thủ công làm việc trên tác phẩm của mình. Đây là một số phương thức hữu ích cho DOM manipulation:

* \`document.getElementById(id)\`: Hàm này lấy một phần tử bằng ID duy nhất của nó, giống như cách bạn tìm một cuốn sách trong thư viện.
* \`document.getElementsByTagName(name)\`: Nó chọn tất cả các phần tử có cùng tên thẻ được chỉ định, chẳng hạn như tất cả các đoạn văn (\`<p>\`).
* \`document.getElementsByClassName(name)\`: Hàm này lấy tất cả các phần tử có tên class được cung cấp.
* \`document.querySelector(selector)\`: Giống như bạn chọn trái cây yêu thích từ một giỏ, nó chọn phần tử đầu tiên khớp với CSS selector được cung cấp.

Các selector trả về nhiều phần tử (\`getElementsByTagName\` và \`getElementsByClassName\`) trả về một mảng JS các phần tử, vì vậy bạn cần chọn phần tử nào trong danh sách bạn muốn thông qua array indexing.

Dưới đây, chúng ta có một minh họa về cách chúng ta có thể chọn một phần tử HTML và sửa đổi nội dung và style của nó:

\`\`\`html
<h1 id="title">Tiêu đề gốc</h1>
<button onclick="changeTitle()">Đổi tiêu đề</button>

<script>
function changeTitle() {
  var titleElement = document.getElementById('title');
  titleElement.style.color = 'red';
  titleElement.innerHTML = 'Tiêu đề mới';
}
</script>
\`\`\`

Thẻ \`<button>\` trong HTML được sử dụng để tạo một nút có thể nhấp trên trang web của bạn. Chứa trong các thẻ \`<button>\` mở và đóng, bạn có thể đặt văn bản hoặc hình ảnh. Nội dung này là những gì người dùng thấy và nhấp vào. Thuộc tính \`onclick\` là một thuộc tính sự kiện hướng dẫn trình duyệt thực thi một hàm JavaScript cụ thể khi nút được nhấp. Hàm được thực thi được chỉ định ngay trong thuộc tính \`onclick\`.

Trong trường hợp này, một khi nút được nhấp, nó kích hoạt phương thức \`changeTitle()\`. Trong phương thức này, chúng ta đang đặt property \`style.color\` của \`titleElement\`. \`titleElement.style.color = 'red';\` thay đổi màu CSS của văn bản trong phần tử này thành màu đỏ.

Sử dụng getElements hoặc querySelector để truy cập một phần tử chỉ là điểm khởi đầu. Một khi bạn có tham chiếu đến một phần tử, có nhiều điều bạn có thể làm để thao tác nó.

* **Sửa đổi nội dung**: Như bạn đã thấy với \`innerHTML\`, sau khi chọn một phần tử, bạn có thể trực tiếp thao tác nội dung của nó.
* **Thay đổi style**: Bạn có thể thay đổi bất kỳ CSS property nào của một phần tử bằng cách sử dụng \`element.style.property\`. Điều này bao gồm một loạt các thay đổi từ màu sắc, kích thước, định vị, đến transitions, transformations và visibility. **Lưu ý**: Trong JavaScript, tên CSS property chứa dấu gạch ngang (như \`background-color\`) được chuyển đổi sang camelCase (trở thành \`backgroundColor\`). Điều này là do thực tế là dấu gạch ngang không được phép trong tên biến JavaScript.

## Thao tác Elements

Sửa đổi nội dung qua \`innerHTML\` và thay đổi style qua \`element.style.property\` chỉ là khởi đầu. Hãy xem thêm các tùy chọn thao tác elements.

* **Thêm hoặc xóa classes**: Bạn có thể thêm một class mới vào một phần tử với \`element.classList.add('className')\` hoặc xóa một class với \`element.classList.remove('className')\`.
* **Đặt hoặc lấy attributes**: Bạn có thể thay đổi bất kỳ attribute nào của một phần tử bằng cách sử dụng \`element.setAttribute('attrName', 'attrValue')\` hoặc lấy nó với \`element.getAttribute('attrName')\`.
* **Event handling**: Với tham chiếu đến một phần tử, bạn có thể đính kèm một event listener sẽ thực thi một hàm được chỉ định khi sự kiện xảy ra, sử dụng cú pháp như \`element.addEventListener('click', function)\`. Lưu ý rằng khi thêm một sự kiện, hàm không yêu cầu \`()\` như \`onclick\`.
* **Tạo và xóa elements**: Sử dụng các phương thức như \`document.createElement('tagName')\` để tạo một phần tử hoặc \`element.removeChild(childElement)\` để xóa một phần tử con.

\`document.createElement('tagName')\` sẽ tạo một phần tử trống với tên thẻ bạn cung cấp. Tuy nhiên, khi một phần tử được tạo như vậy, nó không tự động xuất hiện trên trang web. Để làm cho nó hiển thị, bạn phải thêm phần tử mới vào một phần tử hiện có trên trang bằng cách sử dụng \`appendChild()\`. Phương thức \`appendChild()\` đặt một node làm con cuối cùng của parent của nó. Với \`appendChild()\`, bạn cũng có thể thêm nội dung mới động vào tài liệu của mình.

Chỉ với một vài lần gõ phím trong JavaScript, bạn đã biến đổi toàn bộ giao diện của trang web của mình!

## Tóm tắt bài học

Làm tốt lắm, các phù thủy web tương lai! Bây giờ bạn đã thành thạo nghệ thuật thao tác các trang web bằng JavaScript và DOM! Từ việc liên kết JavaScript với HTML của bạn, hiểu cách chọn các phần tử bằng các phương thức như \`getElementById\`, \`getElementsByTagName\` và \`querySelector\`, đến việc cập nhật động các phần tử này bằng cách thay đổi nội dung, style, attributes hoặc thậm chí thêm và xóa chúng.

Bạn đã học cách JavaScript có thể tương tác với DOM để cập nhật các trang web của bạn theo thời gian thực, cung cấp khả năng tạo ra trải nghiệm người dùng phong phú và tương tác có thể phản hồi với đầu vào và hành động của người dùng một cách động.

Tiếp theo là các bài tập thực hành để bạn áp dụng kiến thức mới có được này và giúp biến kiến thức này thành sự hiểu biết trực quan. Sau đó, trong các bài học tương lai, chúng ta sẽ đi sâu vào các chủ đề nâng cao hơn và mở rộng sự hiểu biết của bạn về JavaScript và phát triển web nói chung.

Hãy chuẩn bị và tiếp tục khám phá thế giới tuyệt vời và thú vị của JavaScript và phát triển web!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>JavaScript and DOM</title>
</head>
<body>
    <h1 id="title">Original Title</h1>
    <p id="content">Original Content</p>
    <button onclick="changeContent()">Change Content</button>
    <button onclick="changeStyle()">Change Style</button>
    
    <script>
        function changeContent() {
            var titleElement = document.getElementById('title');
            titleElement.innerHTML = 'New Title';
            
            var contentElement = document.getElementById('content');
            contentElement.innerHTML = 'New Content';
        }
        
        function changeStyle() {
            var titleElement = document.getElementById('title');
            titleElement.style.color = 'red';
            titleElement.style.fontSize = '32px';
            titleElement.style.backgroundColor = 'yellow';
        }
    </script>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Interactive Page</title>
    <style>
        .highlight {
            background-color: yellow;
            color: red;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <h1 id="heading">Welcome</h1>
    <p id="text">This is some text.</p>
    <button id="btn1">Change Text</button>
    <button id="btn2">Change Style</button>
    <button id="btn3">Add Element</button>
    
    <div id="container"></div>
    
    <script>
        // Add your JavaScript here
    </script>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web tương tác với JavaScript và DOM!

Sử dụng JavaScript để thao tác DOM và tạo các tương tác động với các yêu cầu sau:

1. **DOM Selection**: Sử dụng ít nhất 2 phương thức khác nhau để chọn elements:
   - document.getElementById()
   - document.getElementsByTagName() hoặc document.getElementsByClassName() hoặc document.querySelector()

2. **Modifying Content**: Sử dụng innerHTML để thay đổi nội dung của ít nhất 2 elements khác nhau

3. **Changing Style**: Sử dụng element.style.property để thay đổi ít nhất 3 CSS properties khác nhau (nhớ chuyển đổi sang camelCase, ví dụ: backgroundColor, fontSize)

4. **Event Handling**: Tạo ít nhất 2 event handlers:
   - Sử dụng onclick attribute hoặc addEventListener('click', function)
   - Mỗi button phải có chức năng khác nhau

5. **Class Manipulation**: Sử dụng classList.add() hoặc classList.remove() để thêm/xóa class cho ít nhất 1 element

6. **Element Creation**: Sử dụng document.createElement() và appendChild() để tạo và thêm ít nhất 1 element mới vào trang

Yêu cầu:
- Phải sử dụng cả DOM selection, content modification, style changes, và event handling
- Phải có ít nhất 1 element được tạo động bằng JavaScript
- Code phải là HTML và JavaScript hợp lệ
- Trang web phải có các tương tác rõ ràng và hoạt động khi click buttons

Chúc may mắn! 🚀`,
        outputCriteria: [
          {
            snippet: 'document.getElementById',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'document.getElementsByTagName',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'document.getElementsByClassName',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'document.querySelector',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: '.innerHTML',
            points: 2,
            penalty: 0
          },
          {
            snippet: '.style.',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'backgroundColor',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'fontSize',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'color',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'onclick',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'addEventListener',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'classList.add',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'classList.remove',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'document.createElement',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'appendChild',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'function',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'getElementById',
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

    const createdLesson = await Lesson.create(lesson7)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 7 created successfully!')
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

createLesson7()

