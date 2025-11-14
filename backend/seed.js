import dotenv from 'dotenv';
import connectDB from './config/database.js';
import User from './models/User.js';
import Language from './models/Language.js';
import Level from './models/Level.js';
import Lesson from './models/Lesson.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Language.deleteMany({});
    await Level.deleteMany({});
    await Lesson.deleteMany({});

    // Create admin user
    const admin = await User.create({
      email: 'admin@learncode.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });

    // Create test user
    const user = await User.create({
      email: 'user@learncode.com',
      password: 'user123',
      name: 'Test User',
      role: 'user'
    });

    console.log('Users created');

    // Create Web Development language (combining HTML, CSS, JS)
    const webDevLang = await Language.create({
      name: 'Web Development',
      slug: 'web-development',
      description: 'Learn HTML, CSS, and JavaScript - The complete web development stack',
      icon: '🌐'
    });

    console.log('Languages created');

    // Create Web Development Level
    const webDevLevel1 = await Level.create({
      languageId: webDevLang._id,
      levelNumber: 1,
      title: 'HTML Fundamentals',
      description: 'Learn HTML basics and structure'
    });

    webDevLang.levels = [webDevLevel1._id];
    await webDevLang.save();

    // Create HTML Lessons - Based on CodeSignal Learn (Level 1)
    const htmlLesson1 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 1,
      title: 'Exploring the Essentials of HTML: An Introduction to Webpage Structures',
      content: `# Exploring the Essentials of HTML: An Introduction to Webpage Structures

Hi there! Today, we embark on your web development journey with **HTML** — **H**yper**T**ext **M**arkup **L**anguage, the cornerstone of any webpage. Just as bones provide structure to the human body, HTML structures web pages. By the end of this lesson, you should understand how webpages are structured and create your first HTML webpage.

## Introduction to the Internet and Web Pages

The Internet is a colossus of interconnected computers. When you type a website address, or URL, into your web browser, the browser requests the webpage from a computer known as a server. The server, in turn, sends back the requested webpage to your browser. Webpages are written in \`HTML\`, which your browser reads and translates into structured pages that you see when browsing the web, complete with text, images, and other type of content.

## HTML Basics

\`HTML\` organizes and structures web content using tags, which are denoted by \`<tagname>\`. For instance, to create a paragraph of text, we surround the text between an opening \`<p>\` tag and a closing \`</p>\` tag. Like so:

\`\`\`html
<p>This is a paragraph.</p>
\`\`\`

The opening and closing tags, along with the content together are called an HTML element.

There are many other tags in HTML used for different purposes. Here are a few:

- **\`<h1>\` to \`<h6>\`**: These tags are used to create different levels of headings, allowing content to be divided into sections. The \`<h1>\` tag is the biggest among them and is used for primary headings, while the \`<h2>\` is used for sub-headings. Each subsequent heading tag from \`<h3>\` to \`<h6>\` represents a progressively smaller heading size and \`<h6>\` represents the smallest one.

- **\`<a>\`**: This tag is used for hyperlinks.

- **\`<img>\`**: This is used to embed images in the webpage.

We'll go further into these and more in later sections.

## HTML Document Structure

HTML documents consist of sections, each marked by specific tags that serve a specific function in the webpage:

- **\`<!DOCTYPE html>\`**: Identifies the document as an HTML5 document.
- **\`<html>\`**: Encloses the HTML document.
- **\`<head>\`**: Contains meta-information about the HTML document, not visible on the page itself but necessary for browsers and search engines. One of the key elements that reside in the \`<head>\` section is the \`<title>\` tag.
- **\`<title>\`**: The content within the title tag is used as the page title. This is what is displayed in the tab or window title bar of your browser and is crucial for SEO (Search Engine Optimization). A descriptive and relevant title helps users navigate their browser tabs and can improve your website ranking in search engines.
- **\`<body>\`**: Hosts the content visible to web users — text, images, links, etc.

Here's a simple instance of an HTML document structure:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My First Webpage</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This is my first HTML page!</p>
</body>
</html>
\`\`\`

Given this structure, our browser can read and interpret the HTML to display a webpage complete with a title, header, and a paragraph of text. Note that \`<!-- text -->\` is the comment syntax in HTML. Comments do not effect your code or show up on the webpage. They are there to leave notes for others who will read your code or your future self.

## Basic HTML Tags and Attributes

Attributes provide extra details about an element, affecting its appearance and behavior. Here are some examples:

**Links**: To create hyperlinks, we use the \`<a>\` element, along with the \`href\` attribute which specifies the link's destination.

\`\`\`html
<a href="https://example.com">Visit Example</a>
\`\`\`

**Images**: The \`<img>\` element is used to embed images. The location of the image file is specified in the \`src\` attribute, while the \`alt\` attribute can provide text if the image fails to load, enhancing site accessibility:

\`\`\`html
<img src="image.jpg" alt="Description of image">
\`\`\`

It's important to note that the \`<img>\` tag in HTML does not require its own closing tag \`</img>\`. This is because this element is designed not to encapsulate content within it. Such elements that don't require a closing tag are referred to as **void** elements.

## Lesson Summary and Upcoming Practice

Congratulations on completing this introductory HTML lesson! You've grasped the basics: the structure, tags, elements, and attributes. Up next, we will delve into some hands-on sessions where you'll shift from theory to practice. Happy coding!`,
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Welcome to HTML</h1>
    <h2>Introduction</h2>
    <p>This is a paragraph of text. HTML structures web content using tags.</p>
    
    <!-- This is a comment -->
    
    <a href="https://example.com">Visit Example</a>
    
    <img src="image.jpg" alt="Description of image">
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>My First Webpage</title>
</head>
<body>
    <!-- 
    BÀI TẬP: Tạo trang web đầu tiên của bạn
    
    Yêu cầu:
    1. Thêm một heading chính (h1) với nội dung "Welcome to My Website"
    2. Thêm một subheading (h2) với nội dung "About Me"
    3. Thêm một đoạn văn (p) giới thiệu về bản thân bạn
    4. Thêm một liên kết (a) đến "https://www.example.com" với text "Visit Example"
    5. Thêm một hình ảnh (img) với src="https://via.placeholder.com/300" và alt="Placeholder Image"
    
    Gợi ý: Sử dụng các thẻ <h1>, <h2>, <p>, <a href="...">, và <img src="..." alt="...">
    -->
</body>
</html>`,
        language: 'html',
        description: '🎯 Bài tập: Tạo trang web HTML đầu tiên của bạn! Hãy thêm heading, subheading, paragraph, link và image theo yêu cầu trong phần comment.'
      },
      quiz: {
        questions: [
          {
            question: 'What does HTML stand for?',
            options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink Text Markup Language'],
            correctAnswer: 0,
            explanation: 'HTML stands for HyperText Markup Language.'
          },
          {
            question: 'Which tag is used to create a paragraph?',
            options: ['<para>', '<p>', '<paragraph>', '<text>'],
            correctAnswer: 1,
            explanation: 'The <p> tag is used to create paragraphs in HTML.'
          },
          {
            question: 'What is the root element of an HTML document?',
            options: ['<body>', '<head>', '<html>', '<document>'],
            correctAnswer: 2,
            explanation: '<html> is the root element that contains all other elements.'
          },
          {
            question: 'How many heading levels does HTML have?',
            options: ['4', '5', '6', '7'],
            correctAnswer: 2,
            explanation: 'HTML has 6 heading levels from <h1> to <h6>.'
          },
          {
            question: 'Which attribute is used to specify the destination of a hyperlink?',
            options: ['link', 'href', 'url', 'src'],
            correctAnswer: 1,
            explanation: 'The href attribute specifies the link\'s destination in the <a> tag.'
          },
          {
            question: 'What is a void element in HTML?',
            options: [
              'An element that requires a closing tag',
              'An element that does not require a closing tag',
              'An element that cannot have attributes',
              'An element that is invisible'
            ],
            correctAnswer: 1,
            explanation: 'Void elements like <img> do not require a closing tag because they don\'t encapsulate content.'
          },
          {
            question: 'Which section contains meta-information about the HTML document?',
            options: ['<body>', '<head>', '<footer>', '<meta>'],
            correctAnswer: 1,
            explanation: 'The <head> section contains meta-information about the document, including the <title> tag.'
          }
        ],
        passingScore: 7
      }
    });

    const htmlLesson2 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 2,
      title: 'Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting',
      content: `# Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting

Excited about diving deeper into **HTML**? Our focus today is structuring web content using HTML. In this lesson, we'll explore HTML lists, tables, and formatting tags. These elements organize and clarify your web pages, enhancing the user experience. Let's get started.

## Exploring HTML Lists

Lists offer an efficient presentation of organized information. HTML includes both unordered (with bullet points) and ordered (numbered) lists.

### Unordered Lists

Often, we use unordered lists for text items of equal importance. The \`<ul>\` tag signifies the list, and the \`<li>\` tag encloses each item.

Consider this shopping list example:

\`\`\`html
<ul>
  <li>Milk</li>
  <li>Bread</li>
  <li>Eggs</li>
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

In HTML, tables use the \`<table>\` tag. The \`<tr>\` tag facilitates new rows, and \`<td>\` is for cells within the rows. Headers use the \`<th>\` tag.

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

- **\`<b>\`** makes text bold.
- **\`<i>\`** italicizes text.
- **\`<u>\`** underlines text.
- **\`<s>\`** strikes through text.
- **\`<br>\`** inserts a line break.
- **\`<hr>\`** draws a horizontal line.

For example:

\`\`\`html
<p>This is <b>bold</b> and this is <i>italic</i>.</p>
<p>This is <u>underlined</u> and this is <s>strikethrough</s>.</p>
<p>Line 1<br>Line 2</p>
<hr>
<p>Above is a horizontal rule</p>
\`\`\`

However, \`<b>\` and \`<i>\` tags are presentational. For a more modern approach, use the \`<strong>\` and \`<em>\` semantic tags instead.

## HTML Entities

Special characters like \`<\` or \`&\` require HTML entities to display.

- \`&lt;\` for \`<\`
- \`&gt;\` for \`>\`
- \`&amp;\` for \`&\`
- \`&deg;\` for \`°\`
- \`&copy;\` for \`©\`

Here's an example:

\`\`\`html
<p>The temperature is 25&deg;C</p>
<p>&copy; 2024 My Company</p>
<p>Use &lt;div&gt; for containers</p>
\`\`\`

## Lesson Summary

Great job! Through this lesson, you've learned to organize and structure **HTML** content using lists, tables, and formatting. These elements are essential for creating well-structured, readable web pages.`,
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Lists, Tables, and Formatting</title>
</head>
<body>
    <h1>My Shopping List</h1>
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
    
    <h2>Student Grades</h2>
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
    
    <h2>Text Formatting</h2>
    <p>This is <strong>bold</strong> and this is <em>italic</em>.</p>
    <p>Temperature: 25&deg;C</p>
    <hr>
    <p>&copy; 2024 LearnCode</p>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>My Recipe Book</title>
</head>
<body>
    <h1>My Recipe</h1>
    
    <!-- 
    BÀI TẬP: Tạo trang recipe với lists, tables và formatting
    
    Yêu cầu:
    1. Tạo một ordered list (ol) với 3 bước làm coffee:
       - Bước 1: Boil water
       - Bước 2: Add coffee
       - Bước 3: Stir and serve
    
    2. Tạo một unordered list (ul) cho ingredients với ít nhất 3 nguyên liệu
    
    3. Tạo một table với 2 cột: "Nutrient" và "Amount"
       Thêm ít nhất 2 dòng dữ liệu
    
    4. Trong phần Notes:
       - Sử dụng <strong> cho text quan trọng
       - Sử dụng <em> cho text nhấn mạnh
       - Thêm một horizontal rule (hr)
    
    Gợi ý: Sử dụng <ol>, <ul>, <li>, <table>, <tr>, <th>, <td>, <strong>, <em>, <hr>
    -->
    
    <h2>Steps</h2>
    
    <h2>Ingredients</h2>
    
    <h2>Nutrition Facts</h2>
    
    <h2>Notes</h2>
</body>
</html>`,
        language: 'html',
        description: '🎯 Bài tập: Tạo trang recipe hoàn chỉnh! Sử dụng ordered list cho các bước, unordered list cho nguyên liệu, table cho thông tin dinh dưỡng, và các thẻ formatting.'
      },
      quiz: {
        questions: [
          {
            question: 'Which tag is used to create an unordered list?',
            options: ['<ol>', '<ul>', '<li>', '<list>'],
            correctAnswer: 1,
            explanation: '<ul> is used to create unordered lists with bullet points.'
          },
          {
            question: 'Which tag is used to create table rows?',
            options: ['<td>', '<tr>', '<th>', '<table>'],
            correctAnswer: 1,
            explanation: '<tr> is used to create table rows in HTML.'
          },
          {
            question: 'What is the difference between <b> and <strong>?',
            options: [
              'They are identical',
              '<b> is semantic, <strong> is presentational',
              '<strong> is semantic, <b> is presentational',
              'Neither exists in HTML'
            ],
            correctAnswer: 2,
            explanation: '<strong> is semantic (meaningful), while <b> is presentational (visual only).'
          },
          {
            question: 'Which HTML entity represents the copyright symbol?',
            options: ['&copy;', '&copyright;', '&c;', '&copyright;'],
            correctAnswer: 0,
            explanation: '&copy; is the HTML entity for the copyright symbol ©.'
          },
          {
            question: 'How do you create a nested list in HTML?',
            options: [
              'You cannot nest lists',
              'Place a <ul> or <ol> inside an <li>',
              'Use the <nest> tag',
              'Use special attributes'
            ],
            correctAnswer: 1,
            explanation: 'You can nest lists by placing a <ul> or <ol> inside an <li> element.'
          },
          {
            question: 'What does the <hr> tag do?',
            options: [
              'Creates a hyperlink',
              'Creates a horizontal rule/line',
              'Creates a header',
              'Creates a row'
            ],
            correctAnswer: 1,
            explanation: '<hr> creates a horizontal rule, which is a horizontal line across the page.'
          },
          {
            question: 'Which tag is used for table header cells?',
            options: ['<td>', '<th>', '<thead>', '<header>'],
            correctAnswer: 1,
            explanation: '<th> is used for table header cells, which are typically bold and centered.'
          }
        ],
        passingScore: 7
      }
    });

    // CSS Lesson 3 - Based on CodeSignal Learn
    const cssLesson1 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 3,
      title: 'Dressing Up Your Webpages: Beginning with CSS Styling',
      content: `# Dressing Up Your Webpages: Beginning with CSS Styling

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

This targets HTML elements with a particular class attribute. They are preceded by a dot (.) in CSS (The \`/*\` and \`*/\` notations used in the code snippet below mark the comments in CSS):

\`\`\`css
/* This is a CSS comment */
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

### div

This is a block-level element. By default, block-level elements create line breaks before and after themselves, and occupy the full width of their parent element.

\`\`\`html
<div style="background-color: yellow;">
    <h2>Heading</h2>
    <p>Paragraph</p>
</div>
\`\`\`

In this case both \`h2\` and \`p\` elements will have a yellow background occupying not only the text but the full row.

### span

This is an inline element, meaning it only occupies necessary space and doesn't cause line breaks.

\`\`\`html
<p>This is a <span style="color: blue;">blue</span> word.</p>
\`\`\`

Notice that the word "blue" is colored in blue. That's the \`span\` tag at work!

### Key Concepts

To help you understand this better, let's define some additional terms:

- **Parent and Child Elements:** In HTML, elements are often enclosed within other elements. The enclosing element is called the **parent element**, and the enclosed elements are known as the **child elements**. In the above example, the \`div\` element is a parent element to the \`h2\` and \`p\` child elements.

- **Block-level Elements:** By default, a block-level element starts on a new line, causes a line break after itself, and expands to fill the full width of its parent element. \`<div>\`, \`<p>\`, and \`<h1>\` through \`<h6>\` are some examples. Though these elements behave this way by default, their behavior can be modified using advanced CSS techniques.

- **Inline Elements:** On the other hand, inline elements do not start on a new line and do not cause a line break after them. They take up only as much width as necessary for their content. Multiple inline elements can be placed next to each other on the same line. Examples of inline elements include \`<span>\`, \`<a>\`, \`<img>\`, etc.

Understanding the concepts of parent and child elements, as well as block-level and inline elements, and how to use \`div\` and \`span\` tags are essential for effective webpage layout and styling.

## Lesson Summary

Congratulations! You have successfully mastered the basics of CSS. The knowledge you acquired today is the first step towards creating appealing and dynamic webpages. Up next, we have hands-on exercises to reinforce your understanding. Remember, practice is the ladder to mastery. Let's dive in and code happily!`,
      codeExample: `<!DOCTYPE html>
<html>
<head>
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
            background-color: blue;
            color: white;
            padding: 20px;
        }
        
        /* Block-level element */
        .container {
            background-color: yellow;
            padding: 10px;
        }
    </style>
</head>
<body>
    <div id="header">
        <h1>Welcome to CSS</h1>
    </div>
    
    <div class="container">
        <h2>Block-level Element</h2>
        <p>This paragraph is inside a div with yellow background.</p>
    </div>
    
    <p>This is a <span style="color: blue;">blue</span> word using inline span.</p>
    
    <p class="important-text">This text is important and styled with a class!</p>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* 
        BÀI TẬP: Luyện tập CSS Selectors
        
        Yêu cầu:
        1. Style tất cả thẻ h1: màu đỏ (red) và font size 32px
        
        2. Tạo class selector .highlight: background màu vàng (yellow)
        
        3. Tạo ID selector #main-title: màu chữ xanh dương (blue)
        
        4. Style tất cả thẻ p: font size 16px
        
        Gợi ý:
        - Element selector: h1 { ... }
        - Class selector: .highlight { ... }
        - ID selector: #main-title { ... }
        - Màu: red, blue, yellow
        - Font size: 32px, 16px
        */
    </style>
</head>
<body>
    <h1 id="main-title">Welcome to CSS</h1>
    <p>This is a regular paragraph.</p>
    <p class="highlight">This paragraph should have a yellow background.</p>
    <p>Another regular paragraph.</p>
    <div class="highlight">This div should also have a yellow background.</div>
</body>
</html>`,
        language: 'html',
        description: '🎯 Bài tập: Luyện tập CSS Selectors! Style h1 elements, tạo class selector .highlight, tạo ID selector #main-title, và style tất cả paragraphs.'
      },
      quiz: {
        questions: [
          {
            question: 'What does CSS stand for?',
            options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
            correctAnswer: 1,
            explanation: 'CSS stands for Cascading Style Sheets.'
          },
          {
            question: 'Which symbol is used for class selectors in CSS?',
            options: ['#', '.', '*', '@'],
            correctAnswer: 1,
            explanation: 'Class selectors use a dot (.) in CSS, like .my-class'
          },
          {
            question: 'Which symbol is used for ID selectors in CSS?',
            options: ['#', '.', '*', '@'],
            correctAnswer: 0,
            explanation: 'ID selectors use a hash (#) in CSS, like #my-id'
          },
          {
            question: 'What is the difference between block-level and inline elements?',
            options: [
              'Block-level elements don\'t take full width',
              'Inline elements start on a new line',
              'Block-level elements start on a new line and take full width',
              'There is no difference'
            ],
            correctAnswer: 2,
            explanation: 'Block-level elements start on a new line and take the full width, while inline elements stay on the same line and only take necessary space.'
          },
          {
            question: 'Which tag is a block-level element?',
            options: ['<span>', '<a>', '<div>', '<img>'],
            correctAnswer: 2,
            explanation: '<div> is a block-level element, while <span>, <a>, and <img> are inline elements.'
          },
          {
            question: 'How many ways can you connect CSS to HTML?',
            options: ['1', '2', '3', '4'],
            correctAnswer: 2,
            explanation: 'There are three ways: inline CSS (style attribute), internal CSS (<style> tag), and external CSS (separate .css file).'
          },
          {
            question: 'What is the parent element in this code: <div><p>Text</p></div>?',
            options: ['<p>', '<div>', 'Both', 'Neither'],
            correctAnswer: 1,
            explanation: '<div> is the parent element that contains <p> as a child element.'
          },
          {
            question: 'Which method is best for larger projects?',
            options: ['Inline CSS', 'Internal CSS', 'External CSS', 'All are equal'],
            correctAnswer: 2,
            explanation: 'External CSS is best for larger projects as it keeps styles organized in separate files and can be reused across multiple pages.'
          }
        ],
        passingScore: 7
      }
    });

    // CSS Lesson 4 - Mastering CSS: Display Properties and Designing Layouts
    const cssLesson2 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 4,
      title: 'Mastering CSS: Display Properties and Designing Layouts',
      content: `# Mastering CSS: Display Properties and Designing Layouts

Hello, learners! Today, we're going to explore important parts of making a website with CSS: the CSS Box Model, Flexbox, and Grid.

## Introduction and Lesson Objectives

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
    border: 5px solid black;
    margin: 10px;
}
\`\`\`

By manipulating the padding, border, and margin, you can position and resize HTML elements, which aids in layout design.

## Flexbox Layout Basics

Introducing **Flexbox**, a layout model that brings harmony and order to your web pages. In a Flexbox layout, all HTML elements find a place with good coordination, much like a Wheelbarrow race! Let's dive into Flexbox!

\`\`\`html
<div class="flex_demo">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
\`\`\`

\`\`\`css
.flex_demo {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.flex_demo > div {
    background-color: lightblue;
    padding: 20px;
    margin: 10px;
}
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

\`\`\`html
<div class="grid_demo">
    <div>Grid Item 1</div>
    <div>Grid Item 2</div>
    <div>Grid Item 3</div>
    <div>Grid Item 4</div>
</div>
\`\`\`

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

The CSS class \`.grid_demo\` lays out HTML elements in a grid layout, giving a totally new perspective for web layout design. Let's understand this grid layout step by step:

1. \`display: grid;\` is applied to convert our container element into a Grid layout.
2. \`grid-template-columns: auto auto;\` This tells the browser to generate a grid layout with two columns of equal width. The number of times "auto" is repeated determines the number of columns.
3. \`gap: 10px;\` defines the size of the gap between the rows and columns in the grid.
4. \`.grid_demo > div\` is an example of the child selector (\`>\`) that we discussed previously. In this case, all direct \`div\` children of \`.grid_demo\` will have a \`background-color\` of lightblue, \`padding\` of 20px, and the text in each division will be centered within its container.

## Lesson Summary

Well done! We've ventured further into CSS, concentrating on learning the ins and outs of positioning elements and designing layouts with powerful techniques like \`Flexbox\` and \`Grid\`. Up next, we have practical exercises to solidify this newly gained knowledge. Each progressive step increases our understanding of CSS, empowering us to create feature-rich, aesthetically pleasing web pages. Let's continue learning, and as always, happy coding!`,
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Box Model Example */
        .box-model {
            width: 200px;
            height: 100px;
            padding: 20px;
            border: 5px solid black;
            margin: 10px;
            background-color: lightblue;
        }
        
        /* Flexbox Example */
        .flex_demo {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: #f0f0f0;
            padding: 20px;
            margin: 20px 0;
        }
        
        .flex_demo > div {
            background-color: lightblue;
            padding: 20px;
            margin: 10px;
            border-radius: 5px;
        }
        
        /* Grid Example */
        .grid_demo {
            display: grid;
            grid-template-columns: auto auto;
            gap: 10px;
            margin: 20px 0;
        }
        
        .grid_demo > div {
            background-color: lightblue;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>CSS Box Model, Flexbox, and Grid</h1>
    
    <h2>Box Model</h2>
    <div class="box-model">Content with padding, border, and margin</div>
    
    <h2>Flexbox Layout</h2>
    <div class="flex_demo">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
    </div>
    
    <h2>Grid Layout</h2>
    <div class="grid_demo">
        <div>Grid Item 1</div>
        <div>Grid Item 2</div>
        <div>Grid Item 3</div>
        <div>Grid Item 4</div>
    </div>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* 
        BÀI TẬP: Luyện tập CSS Box Model, Flexbox và Grid
        
        Yêu cầu:
        
        1. Box Model - Style .box:
           - Thêm padding: 20px
           - Thêm border: 3px solid black
           - Thêm margin: 15px
        
        2. Flexbox - Style .container:
           - Tạo flexbox container: display: flex
           - Căn giữa theo chiều ngang: justify-content: center
           - Căn giữa theo chiều dọc: align-items: center
        
        3. Grid - Style .grid-container:
           - Tạo grid container: display: grid
           - Tạo 3 cột bằng nhau: grid-template-columns: repeat(3, 1fr)
           - Thêm khoảng cách: gap: 15px
        
        Gợi ý:
        - Box Model: padding, border, margin
        - Flexbox: display: flex, justify-content, align-items
        - Grid: display: grid, grid-template-columns, gap
        */
        
        .container {
            background-color: #f0f0f0;
            padding: 20px;
            height: 200px;
        }
        
        .item {
            background-color: lightblue;
            padding: 20px;
            margin: 10px;
            border-radius: 5px;
        }
        
        .grid-container {
            margin: 20px 0;
        }
        
        .grid-item {
            background-color: lightgreen;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
        }
        
        .box {
            background-color: lightcoral;
            width: 150px;
            height: 100px;
        }
    </style>
</head>
<body>
    <h1>CSS Layout Practice</h1>
    
    <h2>Box Model</h2>
    <div class="box">Box with padding, border, and margin</div>
    
    <h2>Flexbox</h2>
    <div class="container">
        <div class="item">Item 1</div>
        <div class="item">Item 2</div>
        <div class="item">Item 3</div>
    </div>
    
    <h2>Grid</h2>
    <div class="grid-container">
        <div class="grid-item">1</div>
        <div class="grid-item">2</div>
        <div class="grid-item">3</div>
        <div class="grid-item">4</div>
        <div class="grid-item">5</div>
        <div class="grid-item">6</div>
    </div>
</body>
</html>`,
        language: 'html',
        description: '🎯 Bài tập: Luyện tập CSS Layout! Hoàn thành CSS để tạo flexbox container với items căn giữa, grid với 3 cột, và style box với padding, border, margin.'
      },
      quiz: {
        questions: [
          {
            question: 'What are the four components of the CSS Box Model?',
            options: [
              'Content, Padding, Border, Margin',
              'Width, Height, Padding, Margin',
              'Content, Spacing, Border, Outline',
              'Size, Padding, Border, Space'
            ],
            correctAnswer: 0,
            explanation: 'The CSS Box Model consists of Content, Padding, Border, and Margin.'
          },
          {
            question: 'What does display: flex do?',
            options: [
              'Creates a grid layout',
              'Turns the element into a Flex container',
              'Makes elements invisible',
              'Changes text direction'
            ],
            correctAnswer: 1,
            explanation: 'display: flex turns an element into a Flex container, allowing you to use Flexbox properties.'
          },
          {
            question: 'What does justify-content: space-around do?',
            options: [
              'Centers items',
              'Distributes items evenly with equal space around them',
              'Aligns items to the start',
              'Creates equal space only between items'
            ],
            correctAnswer: 1,
            explanation: 'space-around distributes items evenly with equal space around each item.'
          },
          {
            question: 'What does align-items control in Flexbox?',
            options: [
              'Horizontal alignment',
              'Vertical alignment (cross axis)',
              'Item spacing',
              'Item order'
            ],
            correctAnswer: 1,
            explanation: 'align-items controls alignment along the cross axis (perpendicular to justify-content).'
          },
          {
            question: 'What does the child combinator (>) select?',
            options: [
              'All descendants',
              'Direct children only',
              'Sibling elements',
              'Parent elements'
            ],
            correctAnswer: 1,
            explanation: 'The > combinator selects only direct children of the specified element.'
          },
          {
            question: 'What does display: grid do?',
            options: [
              'Creates a flex container',
              'Converts element into a Grid layout',
              'Hides the element',
              'Creates inline elements'
            ],
            correctAnswer: 1,
            explanation: 'display: grid converts the element into a Grid layout container.'
          },
          {
            question: 'What does grid-template-columns: auto auto create?',
            options: [
              'One column',
              'Two columns of equal width',
              'Three columns',
              'Four columns'
            ],
            correctAnswer: 1,
            explanation: 'grid-template-columns: auto auto creates two columns of equal width.'
          },
          {
            question: 'What does the gap property do in CSS Grid?',
            options: [
              'Controls item alignment',
              'Defines space between rows and columns',
              'Sets grid size',
              'Controls item order'
            ],
            correctAnswer: 1,
            explanation: 'gap defines the size of the gap between rows and columns in the grid.'
          }
        ],
        passingScore: 7
      }
    });

    webDevLevel1.lessons = [htmlLesson1._id, htmlLesson2._id, cssLesson1._id, cssLesson2._id];
    await webDevLevel1.save();

    console.log('Seed data created successfully!');
    console.log('Admin: admin@learncode.com / admin123');
    console.log('User: user@learncode.com / user123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
