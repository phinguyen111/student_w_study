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
      name: {
        vi: 'Phát Triển Web',
        en: 'Web Development'
      },
      slug: 'web-development',
      description: {
        vi: 'Học HTML, CSS và JavaScript - Bộ công cụ phát triển web hoàn chỉnh',
        en: 'Learn HTML, CSS, and JavaScript - The complete web development stack'
      },
      icon: '🌐'
    });

    console.log('Languages created');

    // Create Web Development Level
    const webDevLevel1 = await Level.create({
      languageId: webDevLang._id,
      levelNumber: 1,
      title: {
        vi: 'Cơ Bản về HTML',
        en: 'basic HTML,CSS,JAVASCRIPT'
      },
      description: {
        vi: 'Học các kiến thức cơ bản và cấu trúc HTML',
        en: 'Learn HTML basics and structure'
      }
    });

    // Create Web Development Level 2
    const webDevLevel2 = await Level.create({
      languageId: webDevLang._id,
      levelNumber: 2,
      title: {
        vi: 'HTML Nâng Cao',
        en: 'Advanced HTML.CSS'
      },
      description: {
        vi: 'Học các kỹ thuật HTML nâng cao và tổ chức nội dung',
        en: 'Learn advanced HTML techniques and content organization'
      }
    });

    webDevLang.levels = [webDevLevel1._id, webDevLevel2._id];
    await webDevLang.save();

    // Create HTML Lessons - Based on CodeSignal Learn (Level 1)
    const htmlLesson1 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 1,
      title: {
        vi: 'Exploring the Essentials of HTML: An Introduction to Webpage Structures',
        en: 'Exploring the Essentials of HTML: An Introduction to Webpage Structures'
      },
      content: {
        vi: `# Exploring the Essentials of HTML: An Introduction to Webpage Structures

## Topic Overview and Actualization

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
        en: `# Exploring the Essentials of HTML: An Introduction to Webpage Structures

## Topic Overview and Actualization

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

Congratulations on completing this introductory HTML lesson! You've grasped the basics: the structure, tags, elements, and attributes. Up next, we will delve into some hands-on sessions where you'll shift from theory to practice. Happy coding!`
      },
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
    -->
</body>
</html>`,
        language: 'html',
        description: {
          vi: '🎯 Bài tập: Tạo trang web HTML đầu tiên của bạn! Hãy thêm heading, subheading, paragraph, link và image theo yêu cầu trong phần comment.',
          en: '🎯 Exercise: Create your first HTML webpage! Add heading, subheading, paragraph, link and image as required in the comment section.'
        }
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
      title: {
        vi: 'Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting',
        en: 'Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting'
      },
      content: {
        vi: `# Structuring and Organizing Web Content with HTML Lists, Tables, and Formatting

## Introduction

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

## Lesson Summary and Practice

Great job! Through this lesson, you've learned to organize and structure **HTML** content using lists, tables, and formatting. Now's the time to cement this learning through real-life exercises — a critical step toward becoming an efficient web developer. Let's start practicing!`,
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

## Lesson Summary and Practice

Great job! Through this lesson, you've learned to organize and structure **HTML** content using lists, tables, and formatting. Now's the time to cement this learning through real-life exercises — a critical step toward becoming an efficient web developer. Let's start practicing!`
      },
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
    -->
    
    <h2>Steps</h2>
    
    <h2>Ingredients</h2>
    
    <h2>Nutrition Facts</h2>
    
    <h2>Notes</h2>
</body>
</html>`,
        language: 'html',
        description: {
          vi: '🎯 Bài tập: Tạo trang recipe hoàn chỉnh! Sử dụng ordered list cho các bước, unordered list cho nguyên liệu, table cho thông tin dinh dưỡng, và các thẻ formatting.',
          en: '🎯 Exercise: Create a complete recipe page! Use ordered list for steps, unordered list for ingredients, table for nutrition facts, and formatting tags.'
        }
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
      title: {
        vi: 'Dressing Up Your Webpages: Beginning with CSS Styling',
        en: 'Dressing Up Your Webpages: Beginning with CSS Styling'
      },
      content: {
        vi: `# Dressing Up Your Webpages: Beginning with CSS Styling

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

Congratulations! You have successfully mastered the basics of CSS. The knowledge you acquired today is the first step towards creating appealing and dynamic webpages. Up next, we have hands-on exercises to reinforce your understanding. Remember, practice is the ladder to mastery. Let's dive in and code happily!`
      },
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
        description: {
          vi: '🎯 Bài tập: Luyện tập CSS Selectors! Style h1 elements, tạo class selector .highlight, tạo ID selector #main-title, và style tất cả paragraphs.',
          en: '🎯 Exercise: Practice CSS Selectors! Style h1 elements, create class selector .highlight, create ID selector #main-title, and style all paragraphs.'
        }
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
      title: {
        vi: 'Mastering CSS: Display Properties and Designing Layouts',
        en: 'Mastering CSS: Display Properties and Designing Layouts'
      },
      content: {
        vi: `# Mastering CSS: Display Properties and Designing Layouts

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

Well done! We've ventured further into CSS, concentrating on learning the ins and outs of positioning elements and designing layouts with powerful techniques like \`Flexbox\` and \`Grid\`. Up next, we have practical exercises to solidify this newly gained knowledge. Each progressive step increases our understanding of CSS, empowering us to create feature-rich, aesthetically pleasing web pages. Let's continue learning, and as always, happy coding!`
      },
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
        description: {
          vi: '🎯 Bài tập: Luyện tập CSS Layout! Hoàn thành CSS để tạo flexbox container với items căn giữa, grid với 3 cột, và style box với padding, border, margin.',
          en: '🎯 Exercise: Practice CSS Layout! Complete CSS to create flexbox container with centered items, grid with 3 columns, and style box with padding, border, margin.'
        }
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

    // CSS Lesson 5 - Mastering Stylish Web Designs: Positioning, Transitions, and Animations
    const cssLesson3 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 5,
      title: {
        vi: 'Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS',
        en: 'Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS'
      },
      content: {
        vi: `# Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS

## Introduction: Enhancing Web Designs

Welcome, eager learners! In today's exciting web design lesson, we're diving into **CSS positioning**, **transitions**, and **animations**. These dynamic enhancements breathe life into sterile web pages, creating vibrant and interactive digital experiences. Ready to jump in? Let's go!

## Understanding Positioning in CSS

In CSS, the \`position\` property controls an element's location on a web page. Here's what different \`position\` values do:

* **Static:** By default, an element is static, occupying its natural place in the flow of the document.
* **Relative:** A relative element can move from its natural place based on the \`top\`, \`right\`, \`bottom\`, \`left\` properties. Other elements still behave as if it's in its original position.
* **Absolute:** The position is set relative to the nearest positioned ancestor, not from the top of the page.
* **Fixed:** The element's position is "fixed" to the viewport, so it stays in the same place even when you scroll the page.

The \`top\`, \`right\`, \`bottom\`, and \`left\` properties are used in conjunction with all positioning types except static. For relative positioning, these properties will "push" the element from its normal position down, left, up, and right respectively. But for absolute and fixed, they position the element at a specific distance from the top, right, bottom, and left edge of its containing element.

Here's an illustration in code:

\`\`\`css
.relative-box {
    position: relative;
    top: 20px;
    left: 30px;
    background-color: #ff6b6b;
}

.absolute-box {
    position: absolute;
    top: 50px;
    right: 20px;
    background-color: #4ecdc4;
}

.fixed-box {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #ffe66d;
}
\`\`\`

Note that the 7-symbol words in the \`border\` properties are hexadecimal notations of some colors.

## Getting to Know Transitions

Transitions in CSS let you gradually change property values, creating a smooth effect. By specifying the transition parameters like so:

\`\`\`css
transition: <transition-property> <transition-duration> <transition-timing-function>;
\`\`\`

we require to change the property \`<transition-property>\` within \`<transition-duration>\` amount of time (typically accepts values in seconds (s) or milliseconds (ms), e.g., \`2s\` or \`2000ms\`) using the function \`<transition-timing-function>\`.

The timing function can have the following values:

* **'ease'** (starts slow, increases speed, then ends slow)
* **'linear'** (equal speed)
* **'ease-in'** (starts slow)
* **'ease-out'** (ends slow)
* **'ease-in-out'** (starts slow and ends slow)

The difference between 'ease' and 'ease-in-out' is that 'ease' speeds up sooner. For example, consider a button that slowly changes from blue to green when hovered over:

\`\`\`css
.button {
    background-color: blue;
    transition: background-color 0.5s ease;
}

.button:hover {
    background-color: green;
}
\`\`\`

\`:hover\` is called a pseudoclass, that applies a specific style to an element when hovered over. Do not worry if you don't understand it now. We'll go into more detail later on.

## Exploring Animations in CSS

While transitions offer basic effects, \`animations\` allow you to define multiple style changes at various points, creating complex visual effects. Like transitions, they go from one CSS style to another but offer much more control.

Animations are defined using \`keyframes\`. Here's an animation example:

\`\`\`css
@keyframes slide {
    0% {
        left: 0px;
    }
    100% {
        left: 200px;
    }
}

.box {
    position: relative;
    animation: slide 2s ease-in-out infinite;
}
\`\`\`

Let's take a closer look at the following line:

\`\`\`css
0% {
    left: 0px;
}
\`\`\`

This is a keyframe. \`0%\` represents the starting point of one cycle of the animation (\`100%\` represents the ending point of the cycle, and any percentage in between represents the corresponding point in time within that cycle). The accompanying rule set specifies the CSS property (or properties) that are to be applied at this particular moment of the animation. In this case, the CSS \`left\` property is set to \`0px\`, positioning the box at the left edge of its containing element when the animation starts. It's important to note that multiple properties could be defined within these braces, allowing multiple style changes to be animated simultaneously.

When adding an already defined animation to the element, we use the following property:

\`\`\`css
animation: <animation-name> <animation-duration> <animation-timing-function> <animation-iteration-count>;
\`\`\`

\`<animation-name>\` is the name of the animation. \`<animation-duration>\` and \`<animation-timing-function>\` are similar to the transition parameters. \`<animation-iteration-count>\` specifies how many times animation repeats, type 'infinite' for endless repetition.

In some scenarios, you might want your animation to rotate its direction every time it completes a cycle. In that case you add a parameter called \`<animation-direction>\` to your \`animation\` property with the value \`alternate\` in the end. Specifically, the above code can be rewritten in the following way:

\`\`\`css
.box {
    position: relative;
    animation: slide 2s ease-in-out infinite alternate;
}
\`\`\`

## Lesson Summary and Next Steps

Great job! By mastering CSS positioning, transitions, and animations, you have taken a significant step forward. Now, get ready for practice exercises to reinforce your knowledge. Keep practicing, and soon, you'll intuitively create visually stunning web designs. Let's proceed!`,
        en: `# Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS

## Introduction: Enhancing Web Designs

Welcome, eager learners! In today's exciting web design lesson, we're diving into **CSS positioning**, **transitions**, and **animations**. These dynamic enhancements breathe life into sterile web pages, creating vibrant and interactive digital experiences. Ready to jump in? Let's go!

## Understanding Positioning in CSS

In CSS, the \`position\` property controls an element's location on a web page. Here's what different \`position\` values do:

* **Static:** By default, an element is static, occupying its natural place in the flow of the document.
* **Relative:** A relative element can move from its natural place based on the \`top\`, \`right\`, \`bottom\`, \`left\` properties. Other elements still behave as if it's in its original position.
* **Absolute:** The position is set relative to the nearest positioned ancestor, not from the top of the page.
* **Fixed:** The element's position is "fixed" to the viewport, so it stays in the same place even when you scroll the page.

The \`top\`, \`right\`, \`bottom\`, and \`left\` properties are used in conjunction with all positioning types except static. For relative positioning, these properties will "push" the element from its normal position down, left, up, and right respectively. But for absolute and fixed, they position the element at a specific distance from the top, right, bottom, and left edge of its containing element.

Here's an illustration in code:

\`\`\`css
.relative-box {
    position: relative;
    top: 20px;
    left: 30px;
    background-color: #ff6b6b;
}

.absolute-box {
    position: absolute;
    top: 50px;
    right: 20px;
    background-color: #4ecdc4;
}

.fixed-box {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #ffe66d;
}
\`\`\`

Note that the 7-symbol words in the \`border\` properties are hexadecimal notations of some colors.

## Getting to Know Transitions

Transitions in CSS let you gradually change property values, creating a smooth effect. By specifying the transition parameters like so:

\`\`\`css
transition: <transition-property> <transition-duration> <transition-timing-function>;
\`\`\`

we require to change the property \`<transition-property>\` within \`<transition-duration>\` amount of time (typically accepts values in seconds (s) or milliseconds (ms), e.g., \`2s\` or \`2000ms\`) using the function \`<transition-timing-function>\`.

The timing function can have the following values:

* **'ease'** (starts slow, increases speed, then ends slow)
* **'linear'** (equal speed)
* **'ease-in'** (starts slow)
* **'ease-out'** (ends slow)
* **'ease-in-out'** (starts slow and ends slow)

The difference between 'ease' and 'ease-in-out' is that 'ease' speeds up sooner. For example, consider a button that slowly changes from blue to green when hovered over:

\`\`\`css
.button {
    background-color: blue;
    transition: background-color 0.5s ease;
}

.button:hover {
    background-color: green;
}
\`\`\`

\`:hover\` is called a pseudoclass, that applies a specific style to an element when hovered over. Do not worry if you don't understand it now. We'll go into more detail later on.

## Exploring Animations in CSS

While transitions offer basic effects, \`animations\` allow you to define multiple style changes at various points, creating complex visual effects. Like transitions, they go from one CSS style to another but offer much more control.

Animations are defined using \`keyframes\`. Here's an animation example:

\`\`\`css
@keyframes slide {
    0% {
        left: 0px;
    }
    100% {
        left: 200px;
    }
}

.box {
    position: relative;
    animation: slide 2s ease-in-out infinite;
}
\`\`\`

Let's take a closer look at the following line:

\`\`\`css
0% {
    left: 0px;
}
\`\`\`

This is a keyframe. \`0%\` represents the starting point of one cycle of the animation (\`100%\` represents the ending point of the cycle, and any percentage in between represents the corresponding point in time within that cycle). The accompanying rule set specifies the CSS property (or properties) that are to be applied at this particular moment of the animation. In this case, the CSS \`left\` property is set to \`0px\`, positioning the box at the left edge of its containing element when the animation starts. It's important to note that multiple properties could be defined within these braces, allowing multiple style changes to be animated simultaneously.

When adding an already defined animation to the element, we use the following property:

\`\`\`css
animation: <animation-name> <animation-duration> <animation-timing-function> <animation-iteration-count>;
\`\`\`

\`<animation-name>\` is the name of the animation. \`<animation-duration>\` and \`<animation-timing-function>\` are similar to the transition parameters. \`<animation-iteration-count>\` specifies how many times animation repeats, type 'infinite' for endless repetition.

In some scenarios, you might want your animation to rotate its direction every time it completes a cycle. In that case you add a parameter called \`<animation-direction>\` to your \`animation\` property with the value \`alternate\` in the end. Specifically, the above code can be rewritten in the following way:

\`\`\`css
.box {
    position: relative;
    animation: slide 2s ease-in-out infinite alternate;
}
\`\`\`

## Lesson Summary and Next Steps

Great job! By mastering CSS positioning, transitions, and animations, you have taken a significant step forward. Now, get ready for practice exercises to reinforce your knowledge. Keep practicing, and soon, you'll intuitively create visually stunning web designs. Let's proceed!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* Positioning Examples */
        .container {
            position: relative;
            width: 400px;
            height: 300px;
            background-color: #f0f0f0;
            margin: 20px;
        }
        
        .relative-box {
            position: relative;
            top: 20px;
            left: 30px;
            background-color: #ff6b6b;
            padding: 15px;
            color: white;
        }
        
        .absolute-box {
            position: absolute;
            top: 50px;
            right: 20px;
            background-color: #4ecdc4;
            padding: 15px;
            color: white;
        }
        
        .fixed-box {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #ffe66d;
            padding: 15px;
            border-radius: 5px;
        }
        
        /* Transition Example */
        .button {
            background-color: #4ecdc4;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.5s ease, transform 0.3s ease;
        }
        
        .button:hover {
            background-color: #45b7b8;
            transform: scale(1.1);
        }
        
        /* Animation Example */
        @keyframes slide {
            0% {
                left: 0px;
            }
            100% {
                left: 200px;
            }
        }
        
        .animated-box {
            position: relative;
            width: 50px;
            height: 50px;
            background-color: #ff6b6b;
            animation: slide 2s ease-in-out infinite alternate;
            border-radius: 5px;
        }
        
        @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }
        
        .rotating-box {
            width: 50px;
            height: 50px;
            background-color: #4ecdc4;
            margin: 20px;
            animation: rotate 2s linear infinite;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>CSS Positioning, Transitions, and Animations</h1>
    
    <h2>Positioning</h2>
    <div class="container">
        <div class="relative-box">Relative Position</div>
        <div class="absolute-box">Absolute Position</div>
    </div>
    <div class="fixed-box">Fixed Position (scroll to see it stays)</div>
    
    <h2>Transitions</h2>
    <button class="button">Hover Me!</button>
    
    <h2>Animations</h2>
    <div class="animated-box"></div>
    <div class="rotating-box"></div>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <style>
        /* 
        BÀI TẬP: Luyện tập CSS Positioning, Transitions và Animations
        
        Yêu cầu:
        
        1. Positioning - Style .box:
           - Đặt position: relative
           - Di chuyển xuống 30px: top: 30px
           - Di chuyển sang phải 50px: left: 50px
           - Thêm background-color: #ff6b6b
        
        2. Transition - Style .button:
           - Thêm transition cho background-color: transition: background-color 0.5s ease
           - Khi hover, đổi background-color thành: #45b7b8
        
        3. Animation - Tạo keyframe animation tên "bounce":
           - 0%: transform: translateY(0)
           - 50%: transform: translateY(-30px)
           - 100%: transform: translateY(0)
        
        4. Áp dụng animation cho .bouncing-box:
           - animation: bounce 1s ease-in-out infinite
        
        Gợi ý:
        - Position: position, top, left
        - Transition: transition property
        - Animation: @keyframes, animation property
        */
        
        .box {
            width: 100px;
            height: 100px;
            padding: 20px;
            color: white;
        }
        
        .button {
            background-color: #4ecdc4;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .bouncing-box {
            width: 50px;
            height: 50px;
            background-color: #4ecdc4;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>CSS Practice</h1>
    
    <h2>Positioning</h2>
    <div class="box">Relative Box</div>
    
    <h2>Transition</h2>
    <button class="button">Hover Me!</button>
    
    <h2>Animation</h2>
    <div class="bouncing-box"></div>
</body>
</html>`,
        language: 'html',
        description: {
          vi: '🎯 Bài tập: Luyện tập CSS Positioning, Transitions và Animations! Style box với relative positioning, thêm transition cho button, và tạo bounce animation.',
          en: '🎯 Exercise: Practice CSS Positioning, Transitions and Animations! Style box with relative positioning, add transition for button, and create bounce animation.'
        }
      },
      quiz: {
        questions: [
          {
            question: 'What is the default value of the position property?',
            options: ['relative', 'absolute', 'static', 'fixed'],
            correctAnswer: 2,
            explanation: 'The default value of position is static, which means the element follows the normal document flow.'
          },
          {
            question: 'What does position: relative do?',
            options: [
              'Positions element relative to the viewport',
              'Positions element relative to its normal position',
              'Positions element relative to the nearest positioned ancestor',
              'Removes element from document flow'
            ],
            correctAnswer: 1,
            explanation: 'position: relative allows you to move an element from its normal position using top, right, bottom, and left properties.'
          },
          {
            question: 'What does position: fixed do?',
            options: [
              'Fixes element to its parent',
              'Fixes element to the viewport (stays when scrolling)',
              'Fixes element to the document',
              'Prevents element from moving'
            ],
            correctAnswer: 1,
            explanation: 'position: fixed positions the element relative to the viewport, so it stays in the same place even when scrolling.'
          },
          {
            question: 'What does the transition property do?',
            options: [
              'Creates animations',
              'Gradually changes property values over time',
              'Changes element position',
              'Hides elements'
            ],
            correctAnswer: 1,
            explanation: 'Transitions allow you to gradually change property values, creating smooth effects when properties change.'
          },
          {
            question: 'Which timing function starts slow and ends slow?',
            options: ['ease', 'ease-in', 'ease-out', 'ease-in-out'],
            correctAnswer: 3,
            explanation: 'ease-in-out starts slow, speeds up in the middle, and ends slow.'
          },
          {
            question: 'What are keyframes used for in CSS?',
            options: [
              'Defining element positions',
              'Defining animation steps at different points in time',
              'Creating transitions',
              'Styling elements'
            ],
            correctAnswer: 1,
            explanation: 'Keyframes define the animation steps at different percentages (0%, 50%, 100%, etc.) of the animation cycle.'
          },
          {
            question: 'What does animation: slide 2s ease-in-out infinite do?',
            options: [
              'Runs slide animation once',
              'Runs slide animation for 2 seconds, repeats infinitely',
              'Runs slide animation twice',
              'Runs slide animation only on hover'
            ],
            correctAnswer: 1,
            explanation: 'This creates an animation named "slide" that runs for 2 seconds, uses ease-in-out timing, and repeats infinitely.'
          },
          {
            question: 'What does animation-direction: alternate do?',
            options: [
              'Plays animation forward only',
              'Reverses animation direction each cycle',
              'Speeds up animation',
              'Slows down animation'
            ],
            correctAnswer: 1,
            explanation: 'alternate makes the animation play forward, then backward, then forward again, creating a back-and-forth effect.'
          }
        ],
        passingScore: 7
      }
    });

    // CSS Lesson 6 - Mastering Adaptive Web Design: Responsive Layouts and Media Queries
    const cssLesson4 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 6,
      title: {
        vi: 'Mastering Adaptive Web Design: Responsive Layouts and Media Queries in CSS',
        en: 'Mastering Adaptive Web Design: Responsive Layouts and Media Queries in CSS'
      },
      content: {
        vi: `# Mastering Adaptive Web Design: Responsive Layouts and Media Queries in CSS

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

@media screen and (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        margin-left: 0;
    }
    
    .main-content {
        width: 100%;
        margin-left: 0;
    }
}
\`\`\`

Note that when we give a value as a percentage, such as \`margin-left: 1%;\`, it means that the left margin is set to 1% of the total width of the parent element. For example, if the parent element has a width of 800px, a \`margin-left: 1%;\` on the child element would be equivalent to 8px.

## Mobile-First Approach in Responsive Design

We can initially structure for big screens and then adapt it for smaller screens. However, in web development, a widely recognized approach is the **Mobile-First Design**. It includes designing for small screens first and then scaling up for larger screens.

Here's an example to illustrate:

\`\`\`css
/* Mobile-first: base styles for small screens */
.container {
    width: 100%;
    padding: 10px;
}

.box {
    width: 100%;
    margin-bottom: 10px;
}

/* Tablet and larger screens */
@media screen and (min-width: 768px) {
    .container {
        padding: 20px;
    }
    
    .box {
        width: 48%;
        display: inline-block;
    }
}

/* Desktop screens */
@media screen and (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .box {
        width: 31%;
    }
}
\`\`\`

In this mobile-first approach, we start with styles for small screens (mobile devices), then use \`min-width\` media queries to add styles for larger screens as needed.

## Lesson Summary

That concludes our lesson! Today, you've unlocked a key aspect of web development! You've learned about:

* Responsive website design — what it involves and why it is significant.
* Media queries — why we use them and their syntax.
* Creating Responsive layouts using Media Queries — how they enhance viewer experience.
* The **Mobile-First** design approach — how it ensures a better responsive design.

It's now time to practice. In the upcoming exercises, you'll build a responsive webpage layout that should adapt to different screen sizes. Enhance your web-development skills and explore more in the following exercises! Good luck!`,
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

@media screen and (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
        margin-left: 0;
    }
    
    .main-content {
        width: 100%;
        margin-left: 0;
    }
}
\`\`\`

Note that when we give a value as a percentage, such as \`margin-left: 1%;\`, it means that the left margin is set to 1% of the total width of the parent element. For example, if the parent element has a width of 800px, a \`margin-left: 1%;\` on the child element would be equivalent to 8px.

## Mobile-First Approach in Responsive Design

We can initially structure for big screens and then adapt it for smaller screens. However, in web development, a widely recognized approach is the **Mobile-First Design**. It includes designing for small screens first and then scaling up for larger screens.

Here's an example to illustrate:

\`\`\`css
/* Mobile-first: base styles for small screens */
.container {
    width: 100%;
    padding: 10px;
}

.box {
    width: 100%;
    margin-bottom: 10px;
}

/* Tablet and larger screens */
@media screen and (min-width: 768px) {
    .container {
        padding: 20px;
    }
    
    .box {
        width: 48%;
        display: inline-block;
    }
}

/* Desktop screens */
@media screen and (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .box {
        width: 31%;
    }
}
\`\`\`

In this mobile-first approach, we start with styles for small screens (mobile devices), then use \`min-width\` media queries to add styles for larger screens as needed.

## Lesson Summary

That concludes our lesson! Today, you've unlocked a key aspect of web development! You've learned about:

* Responsive website design — what it involves and why it is significant.
* Media queries — why we use them and their syntax.
* Creating Responsive layouts using Media Queries — how they enhance viewer experience.
* The **Mobile-First** design approach — how it ensures a better responsive design.

It's now time to practice. In the upcoming exercises, you'll build a responsive webpage layout that should adapt to different screen sizes. Enhance your web-development skills and explore more in the following exercises! Good luck!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Base styles for mobile */
        .container {
            width: 100%;
            padding: 10px;
        }
        
        .header {
            background-color: #4ecdc4;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .sidebar {
            background-color: #ffe66d;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .main-content {
            background-color: #f0f0f0;
            padding: 15px;
        }
        
        .box {
            background-color: #ff6b6b;
            color: white;
            padding: 20px;
            margin-bottom: 10px;
            text-align: center;
        }
        
        /* Tablet and larger screens */
        @media screen and (min-width: 768px) {
            .container {
                display: flex;
                padding: 20px;
            }
            
            .sidebar {
                width: 25%;
                margin-right: 20px;
                margin-bottom: 0;
            }
            
            .main-content {
                width: 75%;
            }
            
            .box {
                width: 48%;
                display: inline-block;
                margin-right: 2%;
            }
        }
        
        /* Desktop screens */
        @media screen and (min-width: 1024px) {
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .box {
                width: 31%;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Responsive Web Design</h1>
    </div>
    
    <div class="container">
        <div class="sidebar">
            <h2>Sidebar</h2>
            <p>This sidebar adapts to screen size.</p>
        </div>
        
        <div class="main-content">
            <h2>Main Content</h2>
            <div class="box">Box 1</div>
            <div class="box">Box 2</div>
            <div class="box">Box 3</div>
        </div>
    </div>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* 
        BÀI TẬP: Tạo Responsive Layout với Media Queries
        
        Yêu cầu:
        
        1. Mobile-first: Base styles cho .container và .box:
           - .container: width: 100%, padding: 10px
           - .box: width: 100%, margin-bottom: 10px
        
        2. Tablet (min-width: 768px):
           - .container: display: flex
           - .box: width: 48%, display: inline-block
        
        3. Desktop (min-width: 1024px):
           - .container: max-width: 1200px, margin: 0 auto
           - .box: width: 31%
        
        Gợi ý:
        - Mobile-first: bắt đầu với styles cho mobile
        - Media queries: @media screen and (min-width: ...)
        - Flexbox: display: flex
        */
        
        .container {
            /* Base styles for mobile */
        }
        
        .box {
            background-color: #4ecdc4;
            color: white;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Responsive Layout Practice</h1>
    
    <div class="container">
        <div class="box">Box 1</div>
        <div class="box">Box 2</div>
        <div class="box">Box 3</div>
    </div>
</body>
</html>`,
        language: 'html',
        description: {
          vi: '🎯 Bài tập: Tạo Responsive Layout với Media Queries! Sử dụng mobile-first approach, thêm media queries cho tablet và desktop.',
          en: '🎯 Exercise: Create Responsive Layout with Media Queries! Use mobile-first approach, add media queries for tablet and desktop.'
        }
      },
      quiz: {
        questions: [
          {
            question: 'What is Responsive Web Design?',
            options: [
              'Designing only for mobile devices',
              'Designing websites that adapt to different screen sizes',
              'Designing websites with fixed layouts',
              'Designing only for desktop computers'
            ],
            correctAnswer: 1,
            explanation: 'Responsive Web Design ensures that web pages detect the viewer\'s screen size and adjust the layout accordingly.'
          },
          {
            question: 'What are CSS Media Queries used for?',
            options: [
              'To change font sizes',
              'To apply CSS rules when specific conditions are met',
              'To add colors to elements',
              'To create animations'
            ],
            correctAnswer: 1,
            explanation: 'Media queries implement certain CSS rules when specific conditions are fulfilled, such as screen size.'
          },
          {
            question: 'What does @media screen and (max-width: 600px) mean?',
            options: [
              'Applies styles when screen width is exactly 600px',
              'Applies styles when screen width is greater than 600px',
              'Applies styles when screen width is 600px or less',
              'Applies styles on print media'
            ],
            correctAnswer: 2,
            explanation: 'max-width: 600px applies styles when the viewport is 600 pixels wide or less.'
          },
          {
            question: 'What is the Mobile-First approach?',
            options: [
              'Designing for desktop first, then mobile',
              'Designing for mobile devices first, then scaling up for larger screens',
              'Designing only for mobile devices',
              'Designing for tablets only'
            ],
            correctAnswer: 1,
            explanation: 'Mobile-First Design includes designing for small screens first and then scaling up for larger screens using min-width media queries.'
          },
          {
            question: 'What does min-width media query do?',
            options: [
              'Applies styles when screen is smaller than the value',
              'Applies styles when screen is larger than or equal to the value',
              'Applies styles only on mobile',
              'Applies styles only on desktop'
            ],
            correctAnswer: 1,
            explanation: 'min-width applies styles when the screen width is greater than or equal to the specified value.'
          },
          {
            question: 'What does 1% margin mean in percentage values?',
            options: [
              '1 pixel',
              '1% of the parent element\'s width',
              '1% of the viewport height',
              'Fixed 10 pixels'
            ],
            correctAnswer: 1,
            explanation: 'Percentage values are relative to the parent element. margin-left: 1% means 1% of the parent element\'s total width.'
          },
          {
            question: 'What is the media type in @media screen and (max-width: 600px)?',
            options: ['screen', 'max-width', '600px', 'and'],
            correctAnswer: 0,
            explanation: '\'screen\' is the media type, which specifies that these styles apply to screen devices (not print).'
          },
          {
            question: 'Why is Mobile-First approach recommended?',
            options: [
              'It\'s easier to code',
              'It ensures better performance and user experience on mobile devices',
              'It works only on mobile',
              'It reduces file size'
            ],
            correctAnswer: 1,
            explanation: 'Mobile-First approach ensures better performance and user experience by prioritizing mobile devices and then enhancing for larger screens.'
          }
        ],
        passingScore: 7
      }
    });

    // JavaScript Lesson 7 - Interactive Web Development with JavaScript and DOM
    const jsLesson1 = await Lesson.create({
      levelId: webDevLevel1._id,
      lessonNumber: 7,
      title: {
        vi: 'Interactive Web Development with JavaScript and DOM',
        en: 'Interactive Web Development with JavaScript and DOM'
      },
      content: {
        vi: `# Interactive Web Development with JavaScript and DOM

## Introduction to JavaScript and DOM

Welcome aboard! In today's lesson, we are exploring the dynamic duo of **JavaScript** and the **Document Object Model** (DOM). Working in tandem with the DOM, we can manipulate and update our web pages in real-time based on user interactions.

Do you remember how some websites greet, "Good morning!" during the day and "Good night!" after sundown? This dynamic behavior is exactly what we aim to achieve using JavaScript and DOM.

## Linking JavaScript to HTML

To introduce JavaScript into HTML, we need the \`<script>\` tag. Although JavaScript can be written directly inside HTML, it's often tidier to store it in separate files:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <p id="greeting">Hello</p>
    <script src="script.js"></script>
</body>
</html>
\`\`\`

Inline \`<script>\` tags also serve as an option:

\`\`\`html
<script>
    document.getElementById('greeting').innerHTML = 'Hello, World!';
</script>
\`\`\`

The \`innerHTML\` property is a powerful tool that allows us to get the content of elements or directly insert content into elements in our HTML. In the code above, we used \`innerHTML\` to change the text content of a paragraph.

## Understanding DOM Manipulation

Atomic yet immense, DOM manipulation is achievable via JavaScript. This tool offers us the ability to grasp elements and perform operations on them much like a craftsman working on his creation. Here are some handy methods for DOM manipulation:

* **\`document.getElementById(id)\`**: This function fetches an element using its unique ID, much like how you would find a book in a library.
* **\`document.getElementsByTagName(name)\`**: It selects all elements that share a specified tag name, such as all paragraphs (\`<p>\`).
* **\`document.getElementsByClassName(name)\`**: This function retrieves all elements having the provided class name.
* **\`document.querySelector(selector)\`**: Just as you pick out your favorite fruit from a basket, it selects the first element that matches the supplied CSS selector.

Selectors that return multiple elements (\`getElementsByTagName\` and \`getElementsByClassName\`) return a JS array of elements, so you need to select which element in the list you want through array indexing.

Below, we have an illustration of how we can select an HTML element and modify its content and style:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>DOM Manipulation</title>
</head>
<body>
    <h1 id="title">Original Title</h1>
    <button onclick="changeTitle()">Change Title</button>
    
    <script>
        function changeTitle() {
            var titleElement = document.getElementById('title');
            titleElement.innerHTML = 'New Title';
            titleElement.style.color = 'red';
        }
    </script>
</body>
</html>
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
        en: `# Interactive Web Development with JavaScript and DOM

## Introduction to JavaScript and DOM

Welcome aboard! In today's lesson, we are exploring the dynamic duo of **JavaScript** and the **Document Object Model** (DOM). Working in tandem with the DOM, we can manipulate and update our web pages in real-time based on user interactions.

Do you remember how some websites greet, "Good morning!" during the day and "Good night!" after sundown? This dynamic behavior is exactly what we aim to achieve using JavaScript and DOM.

## Linking JavaScript to HTML

To introduce JavaScript into HTML, we need the \`<script>\` tag. Although JavaScript can be written directly inside HTML, it's often tidier to store it in separate files:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <p id="greeting">Hello</p>
    <script src="script.js"></script>
</body>
</html>
\`\`\`

Inline \`<script>\` tags also serve as an option:

\`\`\`html
<script>
    document.getElementById('greeting').innerHTML = 'Hello, World!';
</script>
\`\`\`

The \`innerHTML\` property is a powerful tool that allows us to get the content of elements or directly insert content into elements in our HTML. In the code above, we used \`innerHTML\` to change the text content of a paragraph.

## Understanding DOM Manipulation

Atomic yet immense, DOM manipulation is achievable via JavaScript. This tool offers us the ability to grasp elements and perform operations on them much like a craftsman working on his creation. Here are some handy methods for DOM manipulation:

* **\`document.getElementById(id)\`**: This function fetches an element using its unique ID, much like how you would find a book in a library.
* **\`document.getElementsByTagName(name)\`**: It selects all elements that share a specified tag name, such as all paragraphs (\`<p>\`).
* **\`document.getElementsByClassName(name)\`**: This function retrieves all elements having the provided class name.
* **\`document.querySelector(selector)\`**: Just as you pick out your favorite fruit from a basket, it selects the first element that matches the supplied CSS selector.

Selectors that return multiple elements (\`getElementsByTagName\` and \`getElementsByClassName\`) return a JS array of elements, so you need to select which element in the list you want through array indexing.

Below, we have an illustration of how we can select an HTML element and modify its content and style:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>DOM Manipulation</title>
</head>
<body>
    <h1 id="title">Original Title</h1>
    <button onclick="changeTitle()">Change Title</button>
    
    <script>
        function changeTitle() {
            var titleElement = document.getElementById('title');
            titleElement.innerHTML = 'New Title';
            titleElement.style.color = 'red';
        }
    </script>
</body>
</html>
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

Buckle up and let's continue to explore the wonderful and exciting world of JavaScript and web development!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>JavaScript and DOM</title>
    <style>
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
        
        .box {
            background-color: #4ecdc4;
            color: white;
            padding: 20px;
            margin: 10px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <h1 id="title">Welcome to JavaScript</h1>
    <p id="description">This is a paragraph.</p>
    
    <button onclick="changeContent()">Change Content</button>
    <button onclick="changeStyle()">Change Style</button>
    <button onclick="toggleClass()">Toggle Class</button>
    <button onclick="createElement()">Create Element</button>
    
    <div id="container"></div>
    
    <script>
        function changeContent() {
            document.getElementById('title').innerHTML = 'Title Changed!';
            document.getElementById('description').innerHTML = 'Content updated with JavaScript!';
        }
        
        function changeStyle() {
            var title = document.getElementById('title');
            title.style.color = 'red';
            title.style.fontSize = '32px';
        }
        
        function toggleClass() {
            var description = document.getElementById('description');
            description.classList.toggle('highlight');
        }
        
        function createElement() {
            var container = document.getElementById('container');
            var newBox = document.createElement('div');
            newBox.className = 'box';
            newBox.innerHTML = 'New Box';
            container.appendChild(newBox);
        }
    </script>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>DOM Practice</title>
    <style>
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1 id="title">Original Title</h1>
    <p id="text">This is some text.</p>
    <div id="container"></div>
    
    <button onclick="changeTitle()">Change Title</button>
    <button onclick="highlightText()">Highlight Text</button>
    <button onclick="addNewElement()">Add New Element</button>
    
    <script>
        /* 
        BÀI TẬP: Luyện tập JavaScript và DOM
        
        Yêu cầu:
        
        1. Tạo function changeTitle():
           - Lấy element với id "title" bằng getElementById
           - Đổi innerHTML thành "New Title!"
           - Đổi style.color thành "blue"
        
        2. Tạo function highlightText():
           - Lấy element với id "text" bằng getElementById
           - Thêm class "highlight" bằng classList.add('highlight')
        
        3. Tạo function addNewElement():
           - Tạo một thẻ p mới bằng createElement('p')
           - Set innerHTML của thẻ mới thành "This is a new paragraph"
           - Append thẻ mới vào element có id "container" bằng appendChild
        
        Gợi ý:
        - getElementById('id')
        - innerHTML
        - style.color
        - classList.add('className')
        - createElement('tagName')
        - appendChild(element)
        */
        
        function changeTitle() {
            // Your code here
        }
        
        function highlightText() {
            // Your code here
        }
        
        function addNewElement() {
            // Your code here
        }
    </script>
</body>
</html>`,
        language: 'html',
        description: {
          vi: '🎯 Bài tập: Luyện tập JavaScript và DOM! Sử dụng getElementById để chọn elements, thay đổi content và style, thêm class, và tạo elements mới.',
          en: '🎯 Exercise: Practice JavaScript and DOM! Use getElementById to select elements, change content and style, add classes, and create new elements.'
        }
      },
      quiz: {
        questions: [
          {
            question: 'What is the DOM?',
            options: [
              'A programming language',
              'Document Object Model - a representation of HTML elements',
              'A CSS framework',
              'A database system'
            ],
            correctAnswer: 1,
            explanation: 'DOM stands for Document Object Model, which is a representation of HTML elements that JavaScript can interact with.'
          },
          {
            question: 'How do you select an element by ID in JavaScript?',
            options: [
              'document.getElementByID(id)',
              'document.getElementById(id)',
              'document.selectById(id)',
              'document.findElement(id)'
            ],
            correctAnswer: 1,
            explanation: 'document.getElementById(id) is the correct method to select an element by its ID.'
          },
          {
            question: 'What does innerHTML do?',
            options: [
              'Changes the element\'s ID',
              'Gets or sets the HTML content inside an element',
              'Changes the element\'s style',
              'Removes the element'
            ],
            correctAnswer: 1,
            explanation: 'innerHTML is a property that allows you to get or set the HTML content inside an element.'
          },
          {
            question: 'How do you change the background color of an element using JavaScript?',
            options: [
              'element.style.background-color = "red"',
              'element.style.backgroundColor = "red"',
              'element.color = "red"',
              'element.background = "red"'
            ],
            correctAnswer: 1,
            explanation: 'In JavaScript, CSS properties with hyphens are converted to camelCase. background-color becomes backgroundColor.'
          },
          {
            question: 'What does classList.add() do?',
            options: [
              'Removes a class from an element',
              'Adds a class to an element',
              'Changes the element\'s ID',
              'Creates a new element'
            ],
            correctAnswer: 1,
            explanation: 'classList.add() adds a CSS class to an element.'
          },
          {
            question: 'What does document.createElement() return?',
            options: [
              'An element already on the page',
              'A new empty element',
              'A string',
              'Nothing'
            ],
            correctAnswer: 1,
            explanation: 'document.createElement() creates and returns a new empty element with the specified tag name.'
          },
          {
            question: 'What is needed to make a newly created element visible on the page?',
            options: [
              'Nothing, it appears automatically',
              'You need to append it to an existing element using appendChild()',
              'You need to set its innerHTML',
              'You need to add an ID to it'
            ],
            correctAnswer: 1,
            explanation: 'A newly created element must be appended to an existing element on the page using appendChild() to become visible.'
          },
          {
            question: 'What is the difference between onclick and addEventListener?',
            options: [
              'There is no difference',
              'onclick requires parentheses after the function name, addEventListener does not',
              'addEventListener allows multiple event listeners, onclick does not',
              'onclick only works on buttons'
            ],
            correctAnswer: 2,
            explanation: 'addEventListener allows you to attach multiple event listeners to the same element, while onclick can only have one handler.'
          }
        ],
        passingScore: 7
      }
    });

    const level2Lesson2 = await Lesson.create({
      levelId: webDevLevel2._id,
      lessonNumber: 2,
      title: {
        vi: 'HTML5 Semantic Elements',
        en: 'HTML5 Semantic Elements'
      },
      content: {
        vi: `# HTML5 Semantic Elements

## Giới thiệu

HTML5 giới thiệu các **semantic elements** - các thẻ có ý nghĩa rõ ràng về nội dung mà chúng chứa. Thay vì chỉ sử dụng \`<div>\` và \`<span>\`, semantic elements giúp code dễ đọc hơn, cải thiện SEO, và hỗ trợ accessibility tốt hơn.

## Tại sao sử dụng Semantic Elements?

- **SEO tốt hơn**: Search engines hiểu rõ cấu trúc trang
- **Accessibility**: Screen readers dễ dàng điều hướng
- **Maintainability**: Code dễ đọc và bảo trì hơn
- **Semantic meaning**: Mỗi element có ý nghĩa rõ ràng

## Các Semantic Elements chính

### Header
Phần đầu trang, thường chứa logo, navigation, hoặc tiêu đề:
\`\`\`html
<header>
  <h1>Website Title</h1>
  <nav>Navigation links</nav>
</header>
\`\`\`

### Nav
Phần điều hướng chính của trang:
\`\`\`html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
\`\`\`

### Main
Nội dung chính của trang (chỉ nên có một \`<main>\`):
\`\`\`html
<main>
  <h2>Main Content</h2>
  <p>This is the main content of the page.</p>
</main>
\`\`\`

### Article
Nội dung độc lập, có thể phân phối riêng (blog post, news article):
\`\`\`html
<article>
  <h2>Article Title</h2>
  <p>Article content...</p>
</article>
\`\`\`

### Section
Phần nội dung có chủ đề riêng:
\`\`\`html
<section>
  <h2>Section Title</h2>
  <p>Section content...</p>
</section>
\`\`\`

### Aside
Nội dung phụ, sidebar (quảng cáo, links liên quan):
\`\`\`html
<aside>
  <h3>Related Links</h3>
  <ul>
    <li><a href="#">Link 1</a></li>
  </ul>
</aside>
\`\`\`

### Footer
Phần cuối trang (copyright, links, contact info):
\`\`\`html
<footer>
  <p>&copy; 2024 My Website. All rights reserved.</p>
</footer>
\`\`\`

## Ví dụ Layout hoàn chỉnh

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Semantic HTML Layout</title>
</head>
<body>
    <header>
        <h1>My Website</h1>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Article content goes here...</p>
        </article>
        
        <section>
            <h2>Related Section</h2>
            <p>Section content...</p>
        </section>
    </main>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Additional information...</p>
    </aside>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>
\`\`\`

## So sánh với Div

**Trước (không semantic):**
\`\`\`html
<div id="header">...</div>
<div id="main">...</div>
<div id="footer">...</div>
\`\`\`

**Sau (semantic):**
\`\`\`html
<header>...</header>
<main>...</main>
<footer>...</footer>
\`\`\`

## Tóm tắt

Semantic elements giúp code HTML rõ ràng, dễ hiểu hơn, và cải thiện SEO cùng accessibility. Hãy sử dụng chúng thay vì \`<div>\` khi có thể!`,
        en: `# HTML5 Semantic Elements

## Introduction

HTML5 introduces **semantic elements** - tags with clear meaning about the content they contain. Instead of just using \`<div>\` and \`<span>\`, semantic elements make code more readable, improve SEO, and better support accessibility.

## Why Use Semantic Elements?

- **Better SEO**: Search engines understand page structure better
- **Accessibility**: Screen readers can navigate more easily
- **Maintainability**: Code is easier to read and maintain
- **Semantic meaning**: Each element has clear meaning

## Main Semantic Elements

### Header
Page header, usually contains logo, navigation, or title:
\`\`\`html
<header>
  <h1>Website Title</h1>
  <nav>Navigation links</nav>
</header>
\`\`\`

### Nav
Main navigation section of the page:
\`\`\`html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
\`\`\`

### Main
Main content of the page (should only have one \`<main>\`):
\`\`\`html
<main>
  <h2>Main Content</h2>
  <p>This is the main content of the page.</p>
</main>
\`\`\`

### Article
Independent content that can be distributed separately (blog post, news article):
\`\`\`html
<article>
  <h2>Article Title</h2>
  <p>Article content...</p>
</article>
\`\`\`

### Section
Content section with its own theme:
\`\`\`html
<section>
  <h2>Section Title</h2>
  <p>Section content...</p>
</section>
\`\`\`

### Aside
Side content, sidebar (ads, related links):
\`\`\`html
<aside>
  <h3>Related Links</h3>
  <ul>
    <li><a href="#">Link 1</a></li>
  </ul>
</aside>
\`\`\`

### Footer
Page footer (copyright, links, contact info):
\`\`\`html
<footer>
  <p>&copy; 2024 My Website. All rights reserved.</p>
</footer>
\`\`\`

## Complete Layout Example

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Semantic HTML Layout</title>
</head>
<body>
    <header>
        <h1>My Website</h1>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Article Title</h2>
            <p>Article content goes here...</p>
        </article>
        
        <section>
            <h2>Related Section</h2>
            <p>Section content...</p>
        </section>
    </main>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Additional information...</p>
    </aside>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>
\`\`\`

## Comparison with Div

**Before (non-semantic):**
\`\`\`html
<div id="header">...</div>
<div id="main">...</div>
<div id="footer">...</div>
\`\`\`

**After (semantic):**
\`\`\`html
<header>...</header>
<main>...</main>
<footer>...</footer>
\`\`\`

## Summary

Semantic elements make HTML code clearer, easier to understand, and improve SEO and accessibility. Use them instead of \`<div>\` when possible!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Semantic HTML</title>
</head>
<body>
    <header>
        <h1>My Blog</h1>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <article>
            <h2>Blog Post Title</h2>
            <p>This is the main content of the blog post...</p>
        </article>
        
        <section>
            <h2>Comments</h2>
            <p>User comments go here...</p>
        </section>
    </main>
    
    <aside>
        <h3>Related Posts</h3>
        <ul>
            <li><a href="#">Post 1</a></li>
            <li><a href="#">Post 2</a></li>
        </ul>
    </aside>
    
    <footer>
        <p>&copy; 2024 My Blog. All rights reserved.</p>
    </footer>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Semantic Layout</title>
</head>
<body>
    <!-- 
    BÀI TẬP: Tạo layout semantic HTML
    
    Yêu cầu:
    1. Thêm <header> với <h1> "My Website" và <nav> với 2 links: Home, About
    2. Thêm <main> chứa một <article> với <h2> "Article Title" và một paragraph
    3. Thêm <aside> với <h3> "Sidebar" và một paragraph
    4. Thêm <footer> với copyright text
    -->
</body>
</html>`,
        expectedOutput: 'Complete semantic HTML layout with header, nav, main, article, aside, and footer'
      },
      quiz: {
        questions: [
          {
            question: 'What is the main purpose of semantic HTML elements?',
            options: [
              'To make pages load faster',
              'To give meaning to content and improve SEO/accessibility',
              'To add styling',
              'To create animations'
            ],
            correctAnswer: 1,
            explanation: 'Semantic elements give meaning to content, making it easier for search engines and screen readers to understand the page structure.'
          },
          {
            question: 'How many <main> elements should a page typically have?',
            options: ['One', 'Two', 'As many as needed', 'None'],
            correctAnswer: 0,
            explanation: 'A page should typically have only one <main> element containing the main content.'
          },
          {
            question: 'Which semantic element is best for a blog post?',
            options: ['<section>', '<article>', '<div>', '<aside>'],
            correctAnswer: 1,
            explanation: '<article> is designed for independent, distributable content like blog posts.'
          },
          {
            question: 'What is the difference between <section> and <article>?',
            options: [
              '<section> is for independent content, <article> is for themed sections',
              '<article> is for independent content, <section> is for themed sections',
              'They are the same',
              '<section> is for headers, <article> is for footers'
            ],
            correctAnswer: 1,
            explanation: '<article> is for independent, distributable content, while <section> is for thematically grouped content.'
          },
          {
            question: 'Which element is typically used for navigation links?',
            options: ['<nav>', '<header>', '<menu>', '<links>'],
            correctAnswer: 0,
            explanation: 'The <nav> element is specifically designed for navigation links.'
          },
          {
            question: 'What should be placed in the <footer> element?',
            options: [
              'Main content',
              'Navigation links',
              'Copyright, contact info, and related links',
              'Only images'
            ],
            correctAnswer: 2,
            explanation: 'The <footer> typically contains copyright information, contact details, and related links.'
          },
          {
            question: 'Which semantic element is best for sidebar content?',
            options: ['<section>', '<aside>', '<div>', '<sidebar>'],
            correctAnswer: 1,
            explanation: 'The <aside> element is designed for sidebar content, related information, or advertisements.'
          }
        ],
        passingScore: 7
      }
    });
    await webDevLevel1.save();

    // Create Level 2 Lessons - Advanced HTML.CSS
    const level2Lesson1 = await Lesson.create({
      levelId: webDevLevel2._id,
      lessonNumber: 1,
      title: {
        vi: 'Advanced HTML Forms và Input Types',
        en: 'Advanced HTML Forms and Input Types'
      },
      content: {
        vi: `# Advanced HTML Forms và Input Types

## Giới thiệu

Sau khi đã nắm vững HTML cơ bản, bây giờ chúng ta sẽ học về **HTML Forms** - một trong những thành phần quan trọng nhất để tương tác với người dùng. Forms cho phép người dùng nhập dữ liệu, gửi thông tin, và tương tác với website.

## Cấu trúc Form cơ bản

Form trong HTML được tạo bằng thẻ \`<form>\`. Thẻ này chứa các input fields và có các thuộc tính quan trọng:

- **\`action\`**: URL nơi form sẽ được gửi đến
- **\`method\`**: Phương thức gửi (GET hoặc POST)

\`\`\`html
<form action="/submit" method="POST">
  <!-- Input fields sẽ được đặt ở đây -->
</form>
\`\`\`

## Các loại Input Types

HTML5 cung cấp nhiều loại input khác nhau để thu thập dữ liệu phù hợp:

### Text Input
\`\`\`html
<input type="text" name="username" placeholder="Enter your username">
\`\`\`

### Email Input
Tự động validate định dạng email:
\`\`\`html
<input type="email" name="email" placeholder="Enter your email" required>
\`\`\`

### Password Input
Ẩn ký tự khi nhập:
\`\`\`html
<input type="password" name="password" placeholder="Enter password">
\`\`\`

### Number Input
Chỉ cho phép nhập số:
\`\`\`html
<input type="number" name="age" min="1" max="120" value="18">
\`\`\`

### Date Input
Chọn ngày tháng:
\`\`\`html
<input type="date" name="birthday">
\`\`\`

### Checkbox
Cho phép chọn nhiều lựa chọn:
\`\`\`html
<input type="checkbox" name="hobby" value="reading"> Reading
<input type="checkbox" name="hobby" value="sports"> Sports
\`\`\`

### Radio Button
Chỉ cho phép chọn một lựa chọn:
\`\`\`html
<input type="radio" name="gender" value="male" id="male">
<label for="male">Male</label>
<input type="radio" name="gender" value="female" id="female">
<label for="female">Female</label>
\`\`\`

### Select Dropdown
Danh sách lựa chọn:
\`\`\`html
<select name="country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="vn">Vietnam</option>
  <option value="uk">United Kingdom</option>
</select>
\`\`\`

### Textarea
Vùng nhập văn bản nhiều dòng:
\`\`\`html
<textarea name="message" rows="4" cols="50" placeholder="Enter your message"></textarea>
\`\`\`

## Form Attributes quan trọng

- **\`required\`**: Bắt buộc phải điền
- **\`placeholder\`**: Gợi ý nội dung
- **\`value\`**: Giá trị mặc định
- **\`name\`**: Tên field (quan trọng khi submit form)
- **\`id\`**: Định danh duy nhất
- **\`min\` / \`max\`**: Giới hạn giá trị (cho number, date)

## Label và Form Accessibility

Luôn sử dụng \`<label>\` để liên kết với input, giúp cải thiện accessibility:

\`\`\`html
<label for="email">Email Address:</label>
<input type="email" id="email" name="email" required>
\`\`\`

## Submit Button

Button để gửi form:
\`\`\`html
<button type="submit">Submit</button>
<!-- hoặc -->
<input type="submit" value="Submit Form">
\`\`\`

## Ví dụ Form hoàn chỉnh

\`\`\`html
<form action="/register" method="POST">
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div>
    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="13" max="100">
  </div>
  
  <div>
    <label>Gender:</label>
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">Male</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">Female</label>
  </div>
  
  <button type="submit">Register</button>
</form>
\`\`\`

## Tóm tắt

Bạn đã học về các loại input types trong HTML, cách tạo form hoàn chỉnh, và các attributes quan trọng. Forms là cầu nối giữa người dùng và website, vì vậy việc hiểu rõ chúng rất quan trọng!`,
        en: `# Advanced HTML Forms and Input Types

## Introduction

After mastering basic HTML, we'll now learn about **HTML Forms** - one of the most important components for user interaction. Forms allow users to input data, submit information, and interact with websites.

## Basic Form Structure

Forms in HTML are created using the \`<form>\` tag. This tag contains input fields and has important attributes:

- **\`action\`**: URL where the form will be submitted
- **\`method\`**: Submission method (GET or POST)

\`\`\`html
<form action="/submit" method="POST">
  <!-- Input fields will be placed here -->
</form>
\`\`\`

## Input Types

HTML5 provides many different input types to collect appropriate data:

### Text Input
\`\`\`html
<input type="text" name="username" placeholder="Enter your username">
\`\`\`

### Email Input
Automatically validates email format:
\`\`\`html
<input type="email" name="email" placeholder="Enter your email" required>
\`\`\`

### Password Input
Hides characters when typing:
\`\`\`html
<input type="password" name="password" placeholder="Enter password">
\`\`\`

### Number Input
Only allows numeric input:
\`\`\`html
<input type="number" name="age" min="1" max="120" value="18">
\`\`\`

### Date Input
Select date:
\`\`\`html
<input type="date" name="birthday">
\`\`\`

### Checkbox
Allows multiple selections:
\`\`\`html
<input type="checkbox" name="hobby" value="reading"> Reading
<input type="checkbox" name="hobby" value="sports"> Sports
\`\`\`

### Radio Button
Allows only one selection:
\`\`\`html
<input type="radio" name="gender" value="male" id="male">
<label for="male">Male</label>
<input type="radio" name="gender" value="female" id="female">
<label for="female">Female</label>
\`\`\`

### Select Dropdown
Selection list:
\`\`\`html
<select name="country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="vn">Vietnam</option>
  <option value="uk">United Kingdom</option>
</select>
\`\`\`

### Textarea
Multi-line text input area:
\`\`\`html
<textarea name="message" rows="4" cols="50" placeholder="Enter your message"></textarea>
\`\`\`

## Important Form Attributes

- **\`required\`**: Field must be filled
- **\`placeholder\`**: Hint text
- **\`value\`**: Default value
- **\`name\`**: Field name (important when submitting form)
- **\`id\`**: Unique identifier
- **\`min\` / \`max\`**: Value limits (for number, date)

## Label and Form Accessibility

Always use \`<label>\` to link with input, improving accessibility:

\`\`\`html
<label for="email">Email Address:</label>
<input type="email" id="email" name="email" required>
\`\`\`

## Submit Button

Button to submit form:
\`\`\`html
<button type="submit">Submit</button>
<!-- or -->
<input type="submit" value="Submit Form">
\`\`\`

## Complete Form Example

\`\`\`html
<form action="/register" method="POST">
  <div>
    <label for="username">Username:</label>
    <input type="text" id="username" name="username" required>
  </div>
  
  <div>
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div>
    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="13" max="100">
  </div>
  
  <div>
    <label>Gender:</label>
    <input type="radio" id="male" name="gender" value="male">
    <label for="male">Male</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">Female</label>
  </div>
  
  <button type="submit">Register</button>
</form>
\`\`\`

## Summary

You've learned about different input types in HTML, how to create complete forms, and important attributes. Forms are the bridge between users and websites, so understanding them is crucial!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>Advanced Forms</title>
</head>
<body>
    <h1>Registration Form</h1>
    <form action="/register" method="POST">
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" placeholder="Enter username" required>
        </div>
        
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" placeholder="your@email.com" required>
        </div>
        
        <div>
            <label for="age">Age:</label>
            <input type="number" id="age" name="age" min="13" max="100" value="18">
        </div>
        
        <div>
            <label>Gender:</label>
            <input type="radio" id="male" name="gender" value="male">
            <label for="male">Male</label>
            <input type="radio" id="female" name="gender" value="female">
            <label for="female">Female</label>
        </div>
        
        <div>
            <label for="country">Country:</label>
            <select id="country" name="country">
                <option value="">Select country</option>
                <option value="us">United States</option>
                <option value="vn">Vietnam</option>
            </select>
        </div>
        
        <button type="submit">Register</button>
    </form>
</body>
</html>`,
      codeExercise: {
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
</head>
<body>
    <h1>Contact Us</h1>
    <form>
        <!-- 
        BÀI TẬP: Tạo form liên hệ hoàn chỉnh
        
        Yêu cầu:
        1. Thêm input text cho tên (name="name") với label "Name:" và required
        2. Thêm input email cho email (name="email") với label "Email:" và required
        3. Thêm textarea cho message (name="message") với label "Message:" và rows="5"
        4. Thêm checkbox với value="newsletter" và label "Subscribe to newsletter"
        5. Thêm submit button với text "Send Message"
        -->
    </form>
</body>
</html>`,
        expectedOutput: 'Form with name input, email input, message textarea, newsletter checkbox, and submit button'
      },
      quiz: {
        questions: [
          {
            question: 'Which input type automatically validates email format?',
            options: ['type="text"', 'type="email"', 'type="mail"', 'type="emailaddress"'],
            correctAnswer: 1,
            explanation: 'The type="email" input automatically validates that the entered value is a valid email format.'
          },
          {
            question: 'Which attribute makes an input field required?',
            options: ['mandatory', 'required', 'must', 'needed'],
            correctAnswer: 1,
            explanation: 'The required attribute makes an input field mandatory and prevents form submission if empty.'
          },
          {
            question: 'What is the difference between checkbox and radio buttons?',
            options: [
              'Checkbox allows multiple selections, radio allows only one',
              'Radio allows multiple selections, checkbox allows only one',
              'They are the same',
              'Checkbox is for text, radio is for numbers'
            ],
            correctAnswer: 0,
            explanation: 'Checkboxes allow multiple selections, while radio buttons allow only one selection from a group.'
          },
          {
            question: 'Which tag is used to create a dropdown selection list?',
            options: ['<dropdown>', '<select>', '<list>', '<option>'],
            correctAnswer: 1,
            explanation: 'The <select> tag creates a dropdown list, with <option> tags for each choice.'
          },
          {
            question: 'What does the "name" attribute do in form inputs?',
            options: [
              'Sets the placeholder text',
              'Identifies the field when the form is submitted',
              'Sets the default value',
              'Makes the field required'
            ],
            correctAnswer: 1,
            explanation: 'The name attribute identifies the field when the form is submitted, allowing the server to process the data.'
          },
          {
            question: 'Which input type hides the characters as the user types?',
            options: ['type="text"', 'type="hidden"', 'type="password"', 'type="secret"'],
            correctAnswer: 2,
            explanation: 'The type="password" input hides characters as the user types for security purposes.'
          },
          {
            question: 'What is the purpose of the <label> tag in forms?',
            options: [
              'To style the form',
              'To improve accessibility and link text to input fields',
              'To submit the form',
              'To validate the input'
            ],
            correctAnswer: 1,
            explanation: 'The <label> tag improves accessibility by linking descriptive text to input fields, making forms more user-friendly.'
          }
        ],
        passingScore: 7
      }
    });

    const level2Lesson3 = await Lesson.create({
      levelId: webDevLevel2._id,
      lessonNumber: 3,
      title: { vi: 'Advanced CSS Selectors và Pseudo-classes', en: 'Advanced CSS Selectors and Pseudo-classes' },
      content: {
        vi: `# Advanced CSS Selectors và Pseudo-classes\n\n## Giới thiệu\n\nSau khi đã nắm vững CSS cơ bản, bây giờ chúng ta sẽ học về **Advanced Selectors** và **Pseudo-classes**.\n\n## Advanced Selectors\n\n### Descendant Selector\n\`\`\`css\ndiv p { color: blue; }\n\`\`\`\n\n### Child Selector (>)\n\`\`\`css\ndiv > p { color: red; }\n\`\`\`\n\n### Attribute Selectors\n\`\`\`css\n[type="text"] { border: 1px solid #ccc; }\n[href^="https"] { color: green; }\n\`\`\`\n\n## Pseudo-classes\n\n\`\`\`css\na:hover { color: red; }\ninput:focus { border: 2px solid blue; }\np:first-child { font-weight: bold; }\nli:nth-child(even) { background-color: #f0f0f0; }\n\`\`\`\n\n## Pseudo-elements\n\n\`\`\`css\np::before { content: "Note: "; }\np::first-letter { font-size: 2em; color: red; }\n\`\`\`\n\n## Tóm tắt\n\nAdvanced selectors và pseudo-classes giúp bạn target elements chính xác hơn!`,
        en: `# Advanced CSS Selectors and Pseudo-classes\n\n## Introduction\n\nAfter mastering basic CSS, we'll learn about **Advanced Selectors** and **Pseudo-classes**.\n\n## Advanced Selectors\n\n### Descendant Selector\n\`\`\`css\ndiv p { color: blue; }\n\`\`\`\n\n### Child Selector (>)\n\`\`\`css\ndiv > p { color: red; }\n\`\`\`\n\n### Attribute Selectors\n\`\`\`css\n[type="text"] { border: 1px solid #ccc; }\n[href^="https"] { color: green; }\n\`\`\`\n\n## Pseudo-classes\n\n\`\`\`css\na:hover { color: red; }\ninput:focus { border: 2px solid blue; }\np:first-child { font-weight: bold; }\nli:nth-child(even) { background-color: #f0f0f0; }\n\`\`\`\n\n## Pseudo-elements\n\n\`\`\`css\np::before { content: "Note: "; }\np::first-letter { font-size: 2em; color: red; }\n\`\`\`\n\n## Summary\n\nAdvanced selectors and pseudo-classes help you target elements more precisely!`
      },
      codeExample: `<!DOCTYPE html>\n<html>\n<head><title>Advanced CSS Selectors</title>\n<style>\ndiv p { color: blue; }\nul > li { font-weight: bold; }\ninput[type="text"] { border: 2px solid blue; }\na:hover { color: red; }\nli:nth-child(odd) { background-color: #f0f0f0; }\np::first-letter { font-size: 2em; color: red; }\n</style>\n</head>\n<body>\n<div><p>Paragraph in div</p></div>\n<ul><li>Item 1</li><li>Item 2</li></ul>\n<input type="text" placeholder="Type here">\n<a href="#">Hover me</a>\n</body>\n</html>`,
      codeExercise: { starterCode: `<!DOCTYPE html>\n<html>\n<head><title>CSS Selectors Practice</title>\n<style>\n/* Style div p, ul > li, input[type="email"], a:hover, li:nth-child(even), p::before */\n</style>\n</head>\n<body>\n<div><p>Paragraph 1</p><p>Paragraph 2</p></div>\n<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>\n<input type="email" placeholder="Email">\n<a href="#">Hover Link</a>\n</body>\n</html>`, expectedOutput: 'Styled elements using advanced selectors and pseudo-classes' },
      quiz: {
        questions: [
          { question: 'What is the difference between "div p" and "div > p"?', options: ['"div p" selects direct children, "div > p" selects all descendants', '"div p" selects all descendants, "div > p" selects direct children', 'They are the same', '"div p" is invalid syntax'], correctAnswer: 1, explanation: '"div p" selects all <p> inside <div> at any level, while "div > p" only selects direct children.' },
          { question: 'Which pseudo-class styles a link when hovering?', options: [':active', ':hover', ':focus', ':visited'], correctAnswer: 1, explanation: ':hover styles an element when the user hovers over it.' },
          { question: 'What does [href^="https"] select?', options: ['Links ending with "https"', 'Links containing "https"', 'Links starting with "https"', 'Links with exact value "https"'], correctAnswer: 2, explanation: 'The ^= operator selects elements whose attribute value starts with the specified value.' },
          { question: 'Which selector targets the second child element?', options: [':first-child', ':second-child', ':nth-child(2)', ':child(2)'], correctAnswer: 2, explanation: ':nth-child(2) targets the second child element.' },
          { question: 'What is the purpose of ::before pseudo-element?', options: ['To add content before an element', 'To select elements before', 'To create animations', 'To hide elements'], correctAnswer: 0, explanation: '::before is used to insert content before an element\'s content.' },
          { question: 'Which selector selects all paragraphs that are siblings following h2?', options: ['h2 p', 'h2 > p', 'h2 + p', 'h2 ~ p'], correctAnswer: 3, explanation: 'h2 ~ p (general sibling selector) selects all <p> elements that are siblings following <h2>.' },
          { question: 'What does :not(.class) selector do?', options: ['Selects elements with the class', 'Selects all elements except those with the class', 'Selects elements without any class', 'It is invalid syntax'], correctAnswer: 1, explanation: ':not(.class) selects all elements except those that have the specified class.' }
        ],
        passingScore: 7
      }
    });

    const level2Lesson4 = await Lesson.create({
      levelId: webDevLevel2._id,
      lessonNumber: 4,
      title: { vi: 'CSS Flexbox Layout', en: 'CSS Flexbox Layout' },
      content: {
        vi: `# CSS Flexbox Layout\n\n## Giới thiệu\n\n**Flexbox** là một layout model mạnh mẽ trong CSS, giúp bạn dễ dàng tạo các layout responsive và flexible.\n\n## Flex Container\n\n\`\`\`css\n.container { display: flex; }\n\`\`\`\n\n## Flex Direction\n\n\`\`\`css\n.container {\n  flex-direction: row;        /* Mặc định: ngang */\n  flex-direction: column;     /* Dọc */\n}\n\`\`\`\n\n## Justify Content\n\n\`\`\`css\n.container {\n  justify-content: flex-start;   /* Bên trái */\n  justify-content: center;       /* Giữa */\n  justify-content: space-between; /* Cách đều */\n}\n\`\`\`\n\n## Align Items\n\n\`\`\`css\n.container {\n  align-items: center;      /* Giữa cross axis */\n  align-items: stretch;     /* Mặc định */\n}\n\`\`\`\n\n## Flex Properties\n\n\`\`\`css\n.item {\n  flex: 1; /* Grow và shrink */\n}\n\`\`\`\n\n## Tóm tắt\n\nFlexbox giúp tạo layout linh hoạt và responsive một cách dễ dàng!`,
        en: `# CSS Flexbox Layout\n\n## Introduction\n\n**Flexbox** is a powerful CSS layout model that makes it easy to create responsive and flexible layouts.\n\n## Flex Container\n\n\`\`\`css\n.container { display: flex; }\n\`\`\`\n\n## Flex Direction\n\n\`\`\`css\n.container {\n  flex-direction: row;        /* Default: horizontal */\n  flex-direction: column;     /* Vertical */\n}\n\`\`\`\n\n## Justify Content\n\n\`\`\`css\n.container {\n  justify-content: flex-start;   /* Left */\n  justify-content: center;       /* Center */\n  justify-content: space-between; /* Even spacing */\n}\n\`\`\`\n\n## Align Items\n\n\`\`\`css\n.container {\n  align-items: center;      /* Center of cross axis */\n  align-items: stretch;     /* Default */\n}\n\`\`\`\n\n## Flex Properties\n\n\`\`\`css\n.item {\n  flex: 1; /* Grow and shrink */\n}\n\`\`\`\n\n## Summary\n\nFlexbox makes it easy to create flexible and responsive layouts!`
      },
      codeExample: `<!DOCTYPE html>\n<html>\n<head><title>Flexbox Layout</title>\n<style>\n.container { display: flex; justify-content: space-between; align-items: center; height: 200px; border: 2px solid #333; }\n.item { flex: 1; padding: 20px; background-color: lightblue; margin: 10px; }\n</style>\n</head>\n<body>\n<div class="container">\n<div class="item">Item 1</div>\n<div class="item">Item 2</div>\n<div class="item">Item 3</div>\n</div>\n</body>\n</html>`,
      codeExercise: { starterCode: `<!DOCTYPE html>\n<html>\n<head><title>Flexbox Practice</title>\n<style>\n.container { /* Set display: flex, justify-content: center, align-items: center */ }\n.item { /* Set flex: 1, padding: 20px, background-color: lightblue */ }\n</style>\n</head>\n<body>\n<div class="container">\n<div class="item">Item 1</div>\n<div class="item">Item 2</div>\n<div class="item">Item 3</div>\n</div>\n</body>\n</html>`, expectedOutput: 'Flexbox container with centered items' },
      quiz: {
        questions: [
          { question: 'What property is used to create a flex container?', options: ['flex: 1', 'display: flex', 'flex-container: true', 'layout: flex'], correctAnswer: 1, explanation: 'display: flex creates a flex container, enabling flexbox layout for its children.' },
          { question: 'What does justify-content: space-between do?', options: ['Centers items', 'Distributes space evenly with no space at ends', 'Distributes space evenly with space at ends', 'Aligns items to the start'], correctAnswer: 1, explanation: 'space-between distributes items evenly with space between them but no space at the ends.' },
          { question: 'What is the default flex-direction?', options: ['column', 'row', 'row-reverse', 'column-reverse'], correctAnswer: 1, explanation: 'The default flex-direction is row, which arranges items horizontally.' },
          { question: 'What does flex: 1 mean?', options: ['Item cannot grow or shrink', 'Item can grow and shrink, with basis of 0', 'Item has fixed width of 1px', 'Item is hidden'], correctAnswer: 1, explanation: 'flex: 1 is shorthand for flex: 1 1 0, meaning the item can grow and shrink with a basis of 0.' },
          { question: 'Which property aligns items along the cross axis?', options: ['justify-content', 'align-items', 'align-content', 'flex-align'], correctAnswer: 1, explanation: 'align-items aligns items along the cross axis (perpendicular to the main axis).' },
          { question: 'What does flex-wrap: wrap do?', options: ['Prevents items from wrapping', 'Allows items to wrap to new lines', 'Reverses the order of items', 'Centers items'], correctAnswer: 1, explanation: 'flex-wrap: wrap allows flex items to wrap to new lines when they don\'t fit in one line.' },
          { question: 'How do you center content both horizontally and vertically with flexbox?', options: ['justify-content: center', 'align-items: center', 'Both justify-content: center and align-items: center', 'flex-center: true'], correctAnswer: 2, explanation: 'You need both justify-content: center (horizontal) and align-items: center (vertical) to center content in both directions.' }
        ],
        passingScore: 7
      }
    });

    const level2Lesson5 = await Lesson.create({
      levelId: webDevLevel2._id,
      lessonNumber: 5,
      title: { vi: 'CSS Grid Layout', en: 'CSS Grid Layout' },
      content: {
        vi: `# CSS Grid Layout\n\n## Giới thiệu\n\n**CSS Grid** là một layout system mạnh mẽ cho phép bạn tạo các layout phức tạp với rows và columns.\n\n## Grid Container\n\n\`\`\`css\n.container { display: grid; }\n\`\`\`\n\n## Grid Template Columns\n\n\`\`\`css\n.container {\n  grid-template-columns: 200px 200px 200px; /* 3 columns */\n  grid-template-columns: 1fr 2fr 1fr;        /* 3 columns: 1:2:1 ratio */\n  grid-template-columns: repeat(3, 1fr);    /* 3 columns, mỗi 1fr */\n}\n\`\`\`\n\n## Gap\n\n\`\`\`css\n.container {\n  gap: 20px; /* Khoảng cách giữa items */\n}\n\`\`\`\n\n## Grid Item Placement\n\n\`\`\`css\n.item {\n  grid-column: 1 / 3;  /* Từ column 1 đến 3 */\n  grid-row: 1 / 2;     /* Từ row 1 đến 2 */\n}\n\`\`\`\n\n## Grid Areas\n\n\`\`\`css\n.container {\n  grid-template-areas:\n    "header header header"\n    "sidebar main main"\n    "footer footer footer";\n}\n.header { grid-area: header; }\n\`\`\`\n\n## Tóm tắt\n\nCSS Grid là công cụ mạnh mẽ để tạo layout 2D phức tạp!`,
        en: `# CSS Grid Layout\n\n## Introduction\n\n**CSS Grid** is a powerful layout system that allows you to create complex layouts with rows and columns.\n\n## Grid Container\n\n\`\`\`css\n.container { display: grid; }\n\`\`\`\n\n## Grid Template Columns\n\n\`\`\`css\n.container {\n  grid-template-columns: 200px 200px 200px; /* 3 columns */\n  grid-template-columns: 1fr 2fr 1fr;        /* 3 columns: 1:2:1 ratio */\n  grid-template-columns: repeat(3, 1fr);     /* 3 columns, each 1fr */\n}\n\`\`\`\n\n## Gap\n\n\`\`\`css\n.container {\n  gap: 20px; /* Space between items */\n}\n\`\`\`\n\n## Grid Item Placement\n\n\`\`\`css\n.item {\n  grid-column: 1 / 3;  /* From column 1 to 3 */\n  grid-row: 1 / 2;     /* From row 1 to 2 */\n}\n\`\`\`\n\n## Grid Areas\n\n\`\`\`css\n.container {\n  grid-template-areas:\n    "header header header"\n    "sidebar main main"\n    "footer footer footer";\n}\n.header { grid-area: header; }\n\`\`\`\n\n## Summary\n\nCSS Grid is a powerful tool for creating complex 2D layouts!`
      },
      codeExample: `<!DOCTYPE html>\n<html>\n<head><title>Grid Layout</title>\n<style>\n.container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }\n.item { padding: 20px; background-color: lightblue; }\n</style>\n</head>\n<body>\n<div class="container">\n<div class="item">Item 1</div>\n<div class="item">Item 2</div>\n<div class="item">Item 3</div>\n<div class="item">Item 4</div>\n<div class="item">Item 5</div>\n<div class="item">Item 6</div>\n</div>\n</body>\n</html>`,
      codeExercise: { starterCode: `<!DOCTYPE html>\n<html>\n<head><title>Grid Practice</title>\n<style>\n.container { /* Set display: grid, grid-template-columns: repeat(3, 1fr), gap: 20px */ }\n.item { /* Set padding: 20px, background-color: lightblue */ }\n</style>\n</head>\n<body>\n<div class="container">\n<div class="item">Item 1</div>\n<div class="item">Item 2</div>\n<div class="item">Item 3</div>\n<div class="item">Item 4</div>\n<div class="item">Item 5</div>\n<div class="item">Item 6</div>\n</div>\n</body>\n</html>`, expectedOutput: 'Grid layout with 3 columns and 6 items' },
      quiz: {
        questions: [
          { question: 'What property is used to create a grid container?', options: ['grid: 1', 'display: grid', 'grid-container: true', 'layout: grid'], correctAnswer: 1, explanation: 'display: grid creates a grid container, enabling CSS Grid layout.' },
          { question: 'What does "fr" unit mean in grid-template-columns?', options: ['Fixed pixels', 'Fraction of available space', 'Font size', 'Frame rate'], correctAnswer: 1, explanation: '"fr" stands for fraction and represents a fraction of the available space in the grid container.' },
          { question: 'What does repeat(3, 1fr) create?', options: ['3 rows with 1fr each', '3 columns with 1fr each', '1 column with 3fr', '3 grids'], correctAnswer: 1, explanation: 'repeat(3, 1fr) creates 3 columns, each taking 1 fraction of the available space.' },
          { question: 'What does grid-column: 1 / 3 mean?', options: ['Item spans from column 1 to column 3', 'Item is in column 1 and row 3', 'Item has 1 column and 3 rows', 'Item is hidden'], correctAnswer: 0, explanation: 'grid-column: 1 / 3 means the item spans from grid line 1 to grid line 3 (columns 1 and 2).' },
          { question: 'What is the purpose of grid-template-areas?', options: ['To define grid gaps', 'To create named grid areas for easier layout', 'To set grid item sizes', 'To animate the grid'], correctAnswer: 1, explanation: 'grid-template-areas allows you to define named areas in the grid, making complex layouts easier to manage.' },
          { question: 'What does gap: 20px do?', options: ['Sets margin between items', 'Sets space between grid rows and columns', 'Sets padding inside items', 'Creates a gap in the layout'], correctAnswer: 1, explanation: 'gap: 20px sets the space between grid rows and columns to 20px.' },
          { question: 'What is the difference between justify-items and justify-content in grid?', options: ['They are the same', 'justify-items aligns items within their cells, justify-content aligns the grid within the container', 'justify-content aligns items, justify-items aligns the grid', 'Neither exists in grid'], correctAnswer: 1, explanation: 'justify-items aligns grid items within their grid cells, while justify-content aligns the entire grid within its container.' }
        ],
        passingScore: 7
      }
    });

    webDevLevel1.lessons = [htmlLesson1._id, htmlLesson2._id, cssLesson1._id, cssLesson2._id, cssLesson3._id, cssLesson4._id, jsLesson1._id];
    await webDevLevel1.save();

    webDevLevel2.lessons = [level2Lesson1._id, level2Lesson2._id, level2Lesson3._id, level2Lesson4._id, level2Lesson5._id];
    await webDevLevel2.save();

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
