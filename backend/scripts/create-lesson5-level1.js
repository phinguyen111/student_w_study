import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const createLesson5 = async () => {
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

    // Check if lesson 5 already exists
    const existingLesson = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 5
    })

    if (existingLesson) {
      console.log('Lesson 5 already exists. Deleting it first...')
      await Lesson.findByIdAndDelete(existingLesson._id)
      console.log('Deleted existing lesson 5')
    }

    // Create lesson 5 content based on CodeSignal
    const lesson5 = {
      levelId: level1._id,
      lessonNumber: 5,
      title: {
        en: 'Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS',
        vi: 'Thành thạo Thiết kế Web Đẹp mắt: Positioning, Transitions, và Animations trong CSS'
      },
      content: {
        en: `# Mastering Stylish Web Designs: Positioning, Transitions, and Animations in CSS

## Introduction: Enhancing Web Designs

Welcome, eager learners! In today's exciting web design lesson, we're diving into **CSS positioning**, **transitions**, and **animations**. These dynamic enhancements breathe life into sterile web pages, creating vibrant and interactive digital experiences. Ready to jump in? Let's go!

## Understanding Positioning in CSS

In CSS, the \`position\` property controls an element's location on a web page. Here's what different \`position\` values do:

* **Static:** By default, an element is static, occupying its natural place in the flow of the document.
* **Relative:** A relative element can move from its natural place based on the \`top\`, \`right\`, \`bottom\`, \`left\` properties. Other elements still behave as if it's in its original position.
* **Absolute:** The position is set relative to the nearest positioned ancestor, not from the top of the page.
* **Fixed:** The element's position is "fixed" to the viewport, so it stays in the same place even when you scroll the page.

The \`top\`, \`right\`, \`bottom\`, and \`left\` properties are used in conjunction with all positioning types except static. For relative positioning, these properties will "push" the element from its normal position down, left, up, and right respectively. But for absolute and fixed, they position the element at a specific distance from the top, right, bottom, and left edge of its containing element respectively.

Here's an illustration in code:

\`\`\`css
.relative-box {
  position: relative;
  top: 20px;
  left: 30px;
}

.absolute-box {
  position: absolute;
  top: 50px;
  right: 20px;
}

.fixed-box {
  position: fixed;
  bottom: 10px;
  right: 10px;
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

* \`ease\` (starts slow, increases speed, then ends slow)
* \`linear\` (equal speed)
* \`ease-in\` (starts slow)
* \`ease-out\` (ends slow)
* \`ease-in-out\` (starts slow and ends slow)

The difference between \`ease\` and \`ease-in-out\` is that \`ease\` speeds up sooner. For example, consider a button that slowly changes from blue to green when hovered over:

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

.animated-box {
  animation: slide 2s ease infinite;
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

\`<animation-name>\` is the name of the animation. \`<animation-duration>\` and \`<animation-timing-function>\` are similar to the transition parameters. \`<animation-iteration-count>\` specifies how many times animation repeats, type \`infinite\` for endless repetition.

In some scenarios, you might want your animation to rotate its direction every time it completes a cycle. In that case you add a parameter called \`<animation-direction>\` to your \`animation\` property with the value \`alternate\` in the end. Specifically, the above code can be rewritten in the following way:

\`\`\`css
.animated-box {
  animation: slide 2s ease infinite alternate;
}
\`\`\`

## Lesson Summary and Next Steps

Great job! By mastering CSS positioning, transitions, and animations, you have taken a significant step forward. Now, get ready for practice exercises to reinforce your knowledge. Keep practicing, and soon, you'll intuitively create visually stunning web designs. Let's proceed!`,
        vi: `# Thành thạo Thiết kế Web Đẹp mắt: Positioning, Transitions, và Animations trong CSS

## Giới thiệu: Nâng cao Thiết kế Web

Chào mừng, các học viên háo hức! Trong bài học thiết kế web thú vị hôm nay, chúng ta sẽ đi sâu vào **CSS positioning**, **transitions**, và **animations**. Những cải tiến động này thổi sức sống vào các trang web tĩnh, tạo ra trải nghiệm kỹ thuật số sống động và tương tác. Sẵn sàng bắt đầu? Hãy đi thôi!

## Hiểu về Positioning trong CSS

Trong CSS, property \`position\` kiểm soát vị trí của một phần tử trên trang web. Đây là những gì các giá trị \`position\` khác nhau làm:

* **Static:** Theo mặc định, một phần tử là static, chiếm vị trí tự nhiên của nó trong luồng tài liệu.
* **Relative:** Một phần tử relative có thể di chuyển từ vị trí tự nhiên của nó dựa trên các properties \`top\`, \`right\`, \`bottom\`, \`left\`. Các phần tử khác vẫn hoạt động như thể nó ở vị trí ban đầu.
* **Absolute:** Vị trí được đặt tương đối với ancestor được định vị gần nhất, không phải từ đầu trang.
* **Fixed:** Vị trí của phần tử được "cố định" vào viewport, vì vậy nó vẫn ở cùng một chỗ ngay cả khi bạn cuộn trang.

Các properties \`top\`, \`right\`, \`bottom\`, và \`left\` được sử dụng kết hợp với tất cả các loại positioning trừ static. Đối với relative positioning, các properties này sẽ "đẩy" phần tử từ vị trí bình thường của nó xuống, trái, lên, và phải tương ứng. Nhưng đối với absolute và fixed, chúng định vị phần tử ở một khoảng cách cụ thể từ cạnh trên, phải, dưới, và trái của phần tử chứa nó tương ứng.

Đây là minh họa trong code:

\`\`\`css
.relative-box {
  position: relative;
  top: 20px;
  left: 30px;
}

.absolute-box {
  position: absolute;
  top: 50px;
  right: 20px;
}

.fixed-box {
  position: fixed;
  bottom: 10px;
  right: 10px;
}
\`\`\`

Lưu ý rằng các từ 7 ký tự trong các properties \`border\` là ký hiệu thập lục phân của một số màu.

## Tìm hiểu về Transitions

Transitions trong CSS cho phép bạn thay đổi giá trị property một cách dần dần, tạo ra hiệu ứng mượt mà. Bằng cách chỉ định các tham số transition như sau:

\`\`\`css
transition: <transition-property> <transition-duration> <transition-timing-function>;
\`\`\`

chúng ta yêu cầu thay đổi property \`<transition-property>\` trong khoảng thời gian \`<transition-duration>\` (thường chấp nhận giá trị bằng giây (s) hoặc mili giây (ms), ví dụ: \`2s\` hoặc \`2000ms\`) sử dụng hàm \`<transition-timing-function>\`.

Hàm timing có thể có các giá trị sau:

* \`ease\` (bắt đầu chậm, tăng tốc độ, sau đó kết thúc chậm)
* \`linear\` (tốc độ bằng nhau)
* \`ease-in\` (bắt đầu chậm)
* \`ease-out\` (kết thúc chậm)
* \`ease-in-out\` (bắt đầu chậm và kết thúc chậm)

Sự khác biệt giữa \`ease\` và \`ease-in-out\` là \`ease\` tăng tốc sớm hơn. Ví dụ, hãy xem xét một nút từ từ thay đổi từ xanh dương sang xanh lá khi hover:

\`\`\`css
.button {
  background-color: blue;
  transition: background-color 0.5s ease;
}

.button:hover {
  background-color: green;
}
\`\`\`

\`:hover\` được gọi là pseudoclass, áp dụng một style cụ thể cho một phần tử khi hover. Đừng lo lắng nếu bạn chưa hiểu nó bây giờ. Chúng ta sẽ đi vào chi tiết hơn sau.

## Khám phá Animations trong CSS

Trong khi transitions cung cấp các hiệu ứng cơ bản, \`animations\` cho phép bạn định nghĩa nhiều thay đổi style tại các điểm khác nhau, tạo ra các hiệu ứng hình ảnh phức tạp. Giống như transitions, chúng đi từ một CSS style này sang style khác nhưng cung cấp nhiều kiểm soát hơn.

Animations được định nghĩa bằng cách sử dụng \`keyframes\`. Đây là ví dụ animation:

\`\`\`css
@keyframes slide {
  0% {
    left: 0px;
  }
  100% {
    left: 200px;
  }
}

.animated-box {
  animation: slide 2s ease infinite;
}
\`\`\`

Hãy xem xét kỹ hơn dòng sau:

\`\`\`css
0% {
  left: 0px;
}
\`\`\`

Đây là một keyframe. \`0%\` đại diện cho điểm bắt đầu của một chu kỳ animation (\`100%\` đại diện cho điểm kết thúc của chu kỳ, và bất kỳ phần trăm nào ở giữa đại diện cho điểm tương ứng trong thời gian trong chu kỳ đó). Bộ quy tắc kèm theo chỉ định CSS property (hoặc các properties) được áp dụng tại thời điểm cụ thể này của animation. Trong trường hợp này, CSS property \`left\` được đặt thành \`0px\`, định vị hộp ở cạnh trái của phần tử chứa nó khi animation bắt đầu. Điều quan trọng cần lưu ý là nhiều properties có thể được định nghĩa trong các dấu ngoặc nhọn này, cho phép nhiều thay đổi style được animate đồng thời.

Khi thêm một animation đã được định nghĩa vào phần tử, chúng ta sử dụng property sau:

\`\`\`css
animation: <animation-name> <animation-duration> <animation-timing-function> <animation-iteration-count>;
\`\`\`

\`<animation-name>\` là tên của animation. \`<animation-duration>\` và \`<animation-timing-function>\` tương tự như các tham số transition. \`<animation-iteration-count>\` chỉ định số lần animation lặp lại, gõ \`infinite\` để lặp lại vô tận.

Trong một số trường hợp, bạn có thể muốn animation của mình xoay hướng mỗi khi hoàn thành một chu kỳ. Trong trường hợp đó, bạn thêm một tham số gọi là \`<animation-direction>\` vào property \`animation\` của bạn với giá trị \`alternate\` ở cuối. Cụ thể, code trên có thể được viết lại theo cách sau:

\`\`\`css
.animated-box {
  animation: slide 2s ease infinite alternate;
}
\`\`\`

## Tóm tắt bài học và Bước tiếp theo

Làm tốt lắm! Bằng cách thành thạo CSS positioning, transitions, và animations, bạn đã thực hiện một bước tiến đáng kể. Bây giờ, hãy sẵn sàng cho các bài tập thực hành để củng cố kiến thức của bạn. Tiếp tục thực hành, và sớm thôi, bạn sẽ trực quan tạo ra các thiết kế web trực quan tuyệt đẹp. Hãy tiếp tục!`
      },
      codeExample: `<!DOCTYPE html>
<html>
<head>
    <title>CSS Positioning, Transitions, and Animations</title>
    <style>
        /* Positioning Examples */
        .relative-box {
            position: relative;
            top: 20px;
            left: 30px;
            background-color: lightblue;
            padding: 20px;
        }
        
        .absolute-box {
            position: absolute;
            top: 50px;
            right: 20px;
            background-color: lightgreen;
            padding: 20px;
        }
        
        .fixed-box {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: lightcoral;
            padding: 20px;
        }
        
        /* Transition Example */
        .button {
            background-color: blue;
            color: white;
            padding: 10px 20px;
            transition: background-color 0.5s ease;
        }
        
        .button:hover {
            background-color: green;
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
            animation: slide 2s ease infinite alternate;
            background-color: lightblue;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="relative-box">Relative Position</div>
    <div class="absolute-box">Absolute Position</div>
    <div class="fixed-box">Fixed Position</div>
    
    <button class="button">Hover Me (Transition)</button>
    
    <div class="animated-box">Animated Box</div>
</body>
</html>`,
      codeExercise: {
        language: 'html',
        starterCode: `<!DOCTYPE html>
<html>
<head>
    <title>Exercise: Interactive Page</title>
    <style>
        /* Add your CSS here */
    </style>
</head>
<body>
    <div class="container">
        <div class="box box1">Box 1</div>
        <div class="box box2">Box 2</div>
        <button class="btn">Hover Me</button>
        <div class="animated-element">Animated Element</div>
    </div>
</body>
</html>`,
        description: `🎯 Bài tập: Tạo một trang web tương tác với Positioning, Transitions, và Animations!

Sử dụng CSS để tạo các hiệu ứng động và tương tác với các yêu cầu sau:

1. **CSS Positioning**: Sử dụng ít nhất 2 loại positioning khác nhau:
   - position: relative (với top, left, right, hoặc bottom)
   - position: absolute (với top, left, right, hoặc bottom)
   - position: fixed (với top, left, right, hoặc bottom)

2. **CSS Transitions**: Tạo ít nhất 1 transition với:
   - transition property (ví dụ: background-color, color, transform)
   - transition-duration (ví dụ: 0.5s, 1s)
   - transition-timing-function (ví dụ: ease, linear, ease-in, ease-out, ease-in-out)
   - Sử dụng :hover để kích hoạt transition

3. **CSS Animations**: Tạo ít nhất 1 animation với:
   - @keyframes (định nghĩa ít nhất 2 keyframes: 0% và 100%)
   - animation-name
   - animation-duration
   - animation-timing-function
   - animation-iteration-count (ví dụ: infinite, 3, 5)

4. **Animation Direction** (tùy chọn): Sử dụng animation-direction: alternate nếu muốn animation đổi hướng

5. **Styling**: Sử dụng ít nhất 3 CSS properties khác nhau từ: background-color, color, padding, margin, border, transform

Yêu cầu:
- Phải sử dụng cả Positioning, Transitions, và Animations
- Phải có ít nhất 1 :hover effect với transition
- Phải có ít nhất 1 @keyframes animation
- Code phải là HTML và CSS hợp lệ
- Trang web phải có các hiệu ứng động và tương tác rõ ràng

Chúc may mắn! ✨`,
        outputCriteria: [
          {
            snippet: 'position: relative',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'position: absolute',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'position: fixed',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: 'top:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'left:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'right:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'bottom:',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'transition:',
            points: 2,
            penalty: 0
          },
          {
            snippet: ':hover',
            points: 1.5,
            penalty: 0
          },
          {
            snippet: '@keyframes',
            points: 2,
            penalty: 0
          },
          {
            snippet: 'animation:',
            points: 2,
            penalty: 0
          },
          {
            snippet: '0%',
            points: 1,
            penalty: 0
          },
          {
            snippet: '100%',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'infinite',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'alternate',
            points: 1,
            penalty: 0
          },
          {
            snippet: 'ease',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'linear',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'ease-in',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'ease-out',
            points: 0.5,
            penalty: 0
          },
          {
            snippet: 'transform:',
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

    const createdLesson = await Lesson.create(lesson5)

    // Add to level
    const level = await Level.findById(level1._id)
    if (level) {
      if (!level.lessons.includes(createdLesson._id)) {
        level.lessons.push(createdLesson._id)
        await level.save()
      }
    }

    console.log('\n✅ Lesson 5 created successfully!')
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

createLesson5()

