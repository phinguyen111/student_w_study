import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Lesson from '../models/Lesson.js'
import Level from '../models/Level.js'
import Language from '../models/Language.js'

dotenv.config()

const updateLesson2Description = async () => {
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

    // Find lesson 2
    const lesson2 = await Lesson.findOne({
      levelId: level1._id,
      lessonNumber: 2
    })

    if (!lesson2) {
      console.error('Lesson 2 not found.')
      process.exit(1)
    }

    console.log(`Found Lesson 2: ${lesson2.title.en || lesson2.title}`)

    // Update description to Vietnamese
    const vietnameseDescription = `🎯 Bài tập: Tạo một trang công thức nấu ăn hoàn chỉnh!

Sử dụng các phần tử HTML sau để xây dựng trang công thức của bạn:

1. **Unordered List (<ul> và <li>)**: Tạo danh sách nguyên liệu với ít nhất 3 mục
2. **Ordered List (<ol> và <li>)**: Tạo hướng dẫn nấu ăn với ít nhất 3 bước
3. **Table (<table>, <tr>, <th>, <td>)**: Tạo bảng thông tin dinh dưỡng với ít nhất 2 hàng (bao gồm hàng tiêu đề)
4. **Formatting Tags**: Sử dụng ít nhất 2 thẻ định dạng khác nhau từ: <b>, <i>, <u>, <s>, <strong>, <em>
5. **HTML Entities**: Sử dụng ít nhất 1 HTML entity (như &deg; cho nhiệt độ hoặc &copy; cho bản quyền)

Yêu cầu:
- Phải bao gồm tất cả 5 phần tử trên
- Code phải là HTML hợp lệ
- Sử dụng cấu trúc và tổ chức đúng cách

Chúc may mắn! 🍳`

    // Update codeExercise description
    lesson2.codeExercise.description = vietnameseDescription

    await lesson2.save()

    console.log('\n✅ Lesson 2 description updated to Vietnamese!')
    console.log(`Description length: ${vietnameseDescription.length} characters`)
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

updateLesson2Description()

