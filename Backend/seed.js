require('dotenv').config();
const mongoose = require('mongoose');
const Language = require('./models/Language');
const Lesson = require('./models/Lesson');
const User = require('./models/User');
// --------------------------------
// 🧠 HELPER FUNCTIONS (Giúp tạo cấu trúc section)
// --------------------------------
function theory(heading, content) {
  return { type: 'theory', heading, content };
}
function demo(heading, html, css = '', js = '') {
  return { type: 'demo', heading, demoPayload: { html, css, js } };
}

// --------------------------------
// 📚 DATA DEFINITIONS (NGÔN NGỮ)
// --------------------------------
const LANGUAGE_DATA = [
  {
    id: 'html',
    name: 'HTML',
    summary: 'Ngôn ngữ đánh dấu mô tả cấu trúc trang web, nền tảng của mọi ứng dụng web.',
    icon: 'FaHtml5',
    levels: [
      { level: 1, title: 'Cơ bản (Tags & Structure)', description: 'Học cú pháp, thẻ, văn bản, ảnh, liên kết, danh sách.' },
      { level: 2, title: 'Trung cấp (Forms & Media)', description: 'Form, media, meta tags, semantic, accessibility.' },
      { level: 3, title: 'Nâng cao (APIs & Canvas)', description: 'Canvas, SVG, dialog, responsive images, performance.' }
    ]
  },
  {
    id: 'css',
    name: 'CSS',
    summary: 'Ngôn ngữ tạo kiểu, kiểm soát giao diện và trình bày của tài liệu HTML.',
    icon: 'FaCss3',
    levels: [
      { level: 1, title: 'Cơ bản (Selectors & Box Model)', description: 'Cú pháp, bộ chọn, box model, màu sắc & kiểu chữ.' },
      { level: 2, title: 'Trung cấp (Flexbox & Grid)', description: 'Flexbox và Grid để xây dựng layout; positioning; transform/transition.' },
      { level: 3, title: 'Nâng cao (Animation & Responsive)', description: 'Animation, media queries, variables, hàm CSS hiện đại.' }
    ]
  },
  {
    id: 'js',
    name: 'JavaScript',
    summary: 'Ngôn ngữ lập trình giúp trang web tương tác, logic và năng động.',
    icon: 'FaJs',
    levels: [
      { level: 1, title: 'Cơ bản (Variables & Functions)', description: 'Biến, kiểu dữ liệu, toán tử, vòng lặp, hàm và scope.' },
      { level: 2, title: 'Trung cấp (DOM & Asynchronous)', description: 'DOM, events, bất đồng bộ (Promise, async/await), Fetch API.' },
      { level: 3, title: 'Nâng cao (OOP & Modern ES)', description: 'Class/OOP, Modules, Array methods, Storage, Error handling.' }
    ]
  }
];

// --------------------------------
// 🧩 DATA DEFINITIONS (BÀI HỌC - HTML đã được mở rộng)
// --------------------------------
const LESSON_DATA = [
    // =================================================================
    // ===== HTML LEVEL 1 (Cơ bản) =====
    // =================================================================
    {
      id: 'html-01-introduction', langId: 'html', title: 'Giới thiệu HTML', level: 1, order: 1,
      sections: [
        theory('HTML là gì?', 'HTML (HyperText Markup Language) là ngôn ngữ đánh dấu mô tả cấu trúc cho trang web. Mọi thứ bạn thấy trên trang web đều được đặt trong các thẻ HTML (tags).'),
        theory('Cấu trúc tài liệu cơ bản', 'Mỗi tài liệu HTML hợp lệ phải có 4 phần chính: `<!DOCTYPE html>` (khai báo loại), `<html>` (gốc tài liệu), `<head>` (thông tin metadata), và `<body>` (nội dung hiển thị).'),
        demo('Tài liệu HTML đầu tiên',
`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Trang đầu tiên</title>
  </head>
<body>
  <h1>Xin chào HTML!</h1>
  <p>Đây là bài học HTML đầu tiên của tôi.</p>
</body>
</html>`,
'body{font-family:sans-serif;color:#333}')
      ]
    },
    {
      id: 'html-02-text-formatting', langId: 'html', title: 'Văn bản và Định dạng', level: 1, order: 2,
      sections: [
        theory('Đoạn văn, Ngắt dòng và Đường kẻ ngang', 'Thẻ `<p>` luôn tạo ra một đoạn văn mới. Thẻ `<br>` (break) dùng để ngắt dòng trong cùng một đoạn, còn thẻ `<hr>` (horizontal rule) tạo đường phân cách theo chủ đề.'),
        demo('Ví dụ về các khối văn bản', 
`<p>Đây là đoạn văn đầu tiên. <br>Sử dụng thẻ "br" để ngắt dòng.</p>
<hr>
<p>Đây là đoạn văn thứ hai, được phân cách bởi thẻ "hr".</p>`,
        ),
        theory('Định dạng Ý nghĩa (Semantic)', 'Các thẻ `<strong>` và `<em>` mang ý nghĩa ngữ nghĩa quan trọng. `<strong>` chỉ ra nội dung quan trọng/cấp bách (thường hiển thị **in đậm**), còn `<em>` chỉ ra sự nhấn mạnh (thường hiển thị *in nghiêng*).'),
        demo('Thẻ Strong và Emphasize', 
`<p>Lưu ý: <strong>JavaScript</strong> là phần <em>phức tạp nhất</em>.</p>`,
        'p{font-size:16px} strong{color:#dc2626}'),
        theory('Định dạng Hình thức & Sửa đổi', 'Sử dụng `<b>` (bold), `<i>` (italic) khi không cần ngữ nghĩa. Thẻ `<mark>` để đánh dấu, `<del>` để xóa và `<ins>` để chèn nội dung.'),
        demo('Thẻ Mark, Del, Ins', 
`<p>Giá: <del>500,000 VND</del> <ins>350,000 VND</ins></p>
<p>Tên tài liệu là: <mark>index.html</mark></p>`,
        'ins{color:#10b981; text-decoration: none; font-weight: bold}'),
      ]
    },
    {
      id: 'html-03-links', langId: 'html', title: 'Liên kết (thẻ a)', level: 1, order: 3,
      sections: [
        theory('Thẻ <a> và Thuộc tính href', 'Thẻ `<a>` tạo siêu liên kết, thuộc tính `href` xác định địa chỉ đích.'),
        demo('Liên kết cơ bản', `<a href="https://google.com">Đến Google</a><br><a href="bai-hoc-tiep-theo.html">Bài sau</a>`, 'a{text-decoration:none;color:#0ea5e9;font-weight:bold}'),
        theory('target & Liên kết nội bộ', 'Dùng `target="_blank"` để mở tab mới. Dùng dấu `#` để tạo liên kết nội bộ (neo) đến một `id` trong cùng trang.'),
        demo('Liên kết nâng cao', 
`<a href="mailto:contact@example.com">Gửi Mail</a>
<a href="#footer">Xuống cuối trang</a>`,
        ),
      ]
    },
    {
      id: 'html-04-images', langId: 'html', title: 'Hình ảnh (img)', level: 1, order: 4,
      sections: [
        theory('Thẻ <img> và src/alt', 'Thẻ `<img>` dùng để nhúng ảnh. `src` là đường dẫn, `alt` (text thay thế) bắt buộc cho accessibility và SEO.'),
        demo('Hiển thị hình ảnh',
`<img src="https://placehold.co/400x200/505050/ffffff?text=Placeholder" alt="Ảnh minh họa" title="Ảnh mô tả"/>`,
'img{border-radius:8px}'),
        theory('Đường dẫn cục bộ và title', 'Trong dự án thực tế, bạn sẽ dùng đường dẫn cục bộ (ví dụ: `src="./images/logo.png"`). Thuộc tính `title` hiển thị chú thích khi rê chuột qua ảnh.'),
        demo('Ảnh trong thư mục',
`<img src="images/logo.png" alt="Logo công ty" style="max-width: 100px; height: auto"/>`,
'img{border:1px solid #ccc}'),
      ]
    },
    { id: 'html-05-lists', langId: 'html', title: 'Danh sách UL/OL và DL', level: 1, order: 5,
      sections: [
        theory('Danh sách Không thứ tự (UL)', 'Thẻ `<ul>` tạo danh sách không thứ tự (dùng dấu chấm tròn). Mỗi mục là thẻ `<li>` (list item).'),
        demo('Ví dụ UL',
`<ul>
  <li>Màu Đỏ</li>
  <li>Màu Xanh</li>
  <li>Màu Vàng</li>
</ul>`),
        theory('Danh sách Có thứ tự (OL)', 'Thẻ `<ol>` tạo danh sách có thứ tự (dùng số, chữ cái). Có thể dùng thuộc tính `type="A"` hoặc `type="I"` để thay đổi kiểu đánh số.'),
        demo('Ví dụ OL (La Mã)',
`<ol type="I">
  <li>Lập kế hoạch</li>
  <li>Thực thi</li>
  <li>Đánh giá</li>
</ol>`),
        theory('Danh sách Mô tả (DL)', 'Thẻ `<dl>` chứa các thuật ngữ và mô tả của chúng. Dùng `<dt>` (description term) cho thuật ngữ và `<dd>` (description definition) cho mô tả.'),
        demo('Ví dụ DL',
`<dl>
  <dt>HTML</dt><dd>Ngôn ngữ đánh dấu.</dd>
  <dt>CSS</dt><dd>Ngôn ngữ tạo kiểu.</dd>
</dl>`),
      ]
    },
    { id: 'html-06-tables', langId: 'html', title: 'Bảng (table)', level: 1, order: 6,
      sections: [
        theory('Cấu trúc Bảng', 'Sử dụng `<table>` chứa `<thead>` (header), `<tbody>` (body). Dùng `<tr>` (row), `<th>` (table header), `<td>` (table data).'),
        demo('Bảng cơ bản',
`<table>
  <thead><tr><th>Sản phẩm</th><th>Giá</th></tr></thead>
  <tbody>
    <tr><td>Laptop</td><td>15,000,000</td></tr>
    <tr><td>Mouse</td><td>500,000</td></tr>
  </tbody>
</table>`,
'table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:10px;text-align:left}'),
        theory('Gộp ô (Colspan & Rowspan)', 'Thuộc tính `colspan` gộp các cột. Thuộc tính `rowspan` gộp các hàng.'),
        demo('Bảng Gộp ô',
`<table>
  <tr><th colspan="2">Thông tin</th></tr>
  <tr><td>Tên</td><td>A</td></tr>
  <tr><td rowspan="2">Địa chỉ</td><td>HN</td></tr>
  <tr><td>HCM</td></tr>
</table>`,
'table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:10px;text-align:left}'),
      ]
    },
    { id: 'html-07-forms', langId: 'html', title: 'Form nhập liệu cơ bản', level: 1, order: 7,
      sections: [
        theory('Thẻ <form> & <label>', 'Thẻ `<form>` bao bọc các trường nhập liệu. `<label>` liên kết nhãn với input (`for`/`id`) giúp accessibility.'),
        demo('Form đăng ký',
`<form action="#" method="post">
  <label for="name">Tên:</label> <input type="text" id="name" required><br>
  <label for="mail">Email:</label> <input type="email" id="mail" required><br>
  <button>Đăng ký</button>
</form>`,
'input,button{margin-top:6px;padding:6px}'),
        theory('Các loại Input phổ biến', 'Các loại input quan trọng: `text`, `password`, `email`, `number`, `date`, `radio` (chọn 1), `checkbox` (chọn nhiều).'),
        demo('Input Radio và Checkbox',
`<form>
  <input type="radio" id="m" name="gender" value="male"> <label for="m">Nam</label><br>
  <input type="checkbox" id="news" value="subscribe"> <label for="news">Nhận tin</label><br>
  <textarea placeholder="Ghi chú"></textarea>
</form>`,
'textarea{width:100%;margin-top:10px}'),
      ]
    },

    // =================================================================
    // ===== HTML LEVEL 2 (Trung cấp) =====
    // =================================================================
    { id: 'html-08-media', langId: 'html', title: 'Audio & Video', level: 2, order: 8,
      sections: [
        theory('<audio>', 'Dùng thẻ `<audio>` để nhúng tệp âm thanh. Thuộc tính `controls` hiển thị trình phát, `autoplay` tự động chạy, `loop` lặp lại.'),
        demo('Phát audio',
`<audio controls>
  <source src="https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3" type="audio/mpeg">
  Trình duyệt không hỗ trợ audio.
</audio>`),
        theory('<video> và Phụ đề', 'Thẻ `<video>` để nhúng tệp video. `poster` là ảnh hiển thị trước khi video chạy. Thẻ `<track>` dùng để thêm phụ đề/chú thích.'),
        demo('Phát video có poster',
`<video controls width="100%" poster="https://placehold.co/400x200?text=VIDEO">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <track kind="captions" src="subtitle.vtt" srclang="vi" label="Vietnamese (Example)">
  Trình duyệt không hỗ trợ video.
</video>`)
      ]
    },
    { id: 'html-09-semantic', langId: 'html', title: 'Semantic HTML', level: 2, order: 9,
      sections: [
        theory('Ý nghĩa Ngữ nghĩa', 'Sử dụng các thẻ như `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` thay cho `<div>` để máy tìm kiếm (SEO) và trình đọc màn hình hiểu rõ cấu trúc nội dung.'),
        theory('Phân biệt Article, Section, Aside', 
            '**<article>**: Nội dung độc lập, có thể tự đứng một mình (ví dụ: bài viết blog, bình luận). \n**<section>**: Khối nội dung theo chủ đề (ví dụ: phần giới thiệu, phần liên hệ). \n**<aside>**: Nội dung liên quan nhưng phụ, thường là sidebar hoặc ghi chú.'
        ),
        demo('Bố cục semantic',
`<header><h1>Tên Blog</h1><nav><a href="#">Menu</a></nav></header>
<main>
  <section>
    <h2>Tin tức mới</h2>
    <article><h3>Bài 1</h3><p>Nội dung...</p></article>
    <article><h3>Bài 2</h3><p>Nội dung...</p></article>
  </section>
  <aside>Quảng cáo</aside>
</main>
<footer>© 2025</footer>`,
'header,nav,main,section,article,aside,footer{border:1px dashed #ccc;padding:8px;margin-bottom:6px}'),
      ]
    },
    { id: 'html-10-forms-advanced', langId: 'html', title: 'Form nâng cao & Validation', level: 2, order: 10,
      sections: [
        theory('Validation nâng cao', 'Sử dụng `required`, `pattern` (Regex), `min`, `max`, `step` để ràng buộc dữ liệu đầu vào phía client-side (trình duyệt).'),
        demo('Validation với Pattern',
`<form>
  <label>Mã SP (A-Z, 5 ký tự): <input type="text" pattern="[A-Z]{5}" required title="Phải là 5 ký tự viết hoa"></label>
  <label>Số lượng (max 10): <input type="number" min="1" max="10" value="1"></label>
  <button>Gửi</button>
</form>`),
        theory('Datalist và Autofocus', 'Thẻ `<datalist>` cung cấp gợi ý cho input (không ép buộc). Thuộc tính `autofocus` tự động đặt con trỏ vào trường input khi trang được tải.'),
        demo('Input với Datalist',
`<label for="browser">Chọn trình duyệt:</label>
<input list="browsers" id="browser" name="browser" autofocus>
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
</datalist>`),
      ]
    },
    { id: 'html-11-responsive-images', langId: 'html', title: 'Responsive Images (srcset & picture)', level: 2, order: 11,
      sections: [
        theory('Thuộc tính srcset và sizes', 'Sử dụng `srcset` cho phép trình duyệt chọn tệp ảnh tối ưu nhất dựa trên độ phân giải (w) hoặc mật độ pixel (x) của màn hình, giúp tăng tốc độ tải trang.'),
        demo('Sử dụng srcset',
`<img 
  src="https://placehold.co/640x360" 
  srcset="https://placehold.co/320x180 320w, https://placehold.co/640x360 640w, https://placehold.co/1280x720 1280w" 
  sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1280px" 
  alt="Responsive Image Demo" style="max-width:100%; height: auto;">`),
        theory('Thẻ <picture>', 'Thẻ `<picture>` dùng để hiển thị các tệp ảnh khác nhau (ví dụ: định dạng WebP) hoặc cắt xén ảnh khác nhau tùy theo Media Query (ví dụ: hiển thị ảnh vuông trên mobile, ảnh ngang trên desktop).'),
        demo('Thẻ Picture cho các định dạng',
`<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="https://placehold.co/400x200?text=JPG" alt="Fallback">
</picture>`),
      ]
    },

    // =================================================================
    // ===== HTML LEVEL 3 (Nâng cao) =====
    // =================================================================
    { id: 'html-12-svg-basics', langId: 'html', title: 'SVG cơ bản', level: 3, order: 12,
      sections: [
        theory('SVG là gì?', 'SVG (Scalable Vector Graphics) là định dạng ảnh vector dựa trên XML. Nó sắc nét ở mọi kích thước mà không bị vỡ và có thể được thay đổi kiểu bằng CSS hoặc JavaScript.'),
        demo('Vẽ SVG cơ bản',
`<svg width="200" height="100" viewBox="0 0 200 100">
  <rect x="10" y="10" width="180" height="80" fill="#65C7F7" rx="8"/>
  <circle cx="100" cy="50" r="30" fill="#0052D4"/>
  <text x="100" y="55" font-family="sans-serif" font-size="14" fill="white" text-anchor="middle">SVG</text>
</svg>`),
        theory('Nhúng SVG (Inline vs File)', 'Bạn có thể nhúng trực tiếp mã SVG vào HTML (như trên) hoặc nhúng từ file SVG bên ngoài bằng thẻ `<img>` hoặc CSS `background-image`.'),
        demo('Nhúng SVG bằng thẻ img',
`<img src="icon.svg" alt="Biểu tượng" style="width: 50px; height: auto; border: 1px solid #ccc"/>`),
      ]
    },
    { id: 'html-13-dialog', langId: 'html', title: 'Dialog & Modal (native)', level: 3, order: 13,
      sections: [
        theory('<dialog>', 'Thẻ `<dialog>` cung cấp chức năng modal (hộp thoại) gốc của trình duyệt. Nó có thể được mở bằng phương thức JavaScript `dialog.showModal()`.'),
        theory('Đóng Dialog', 'Cách tốt nhất để đóng `dialog` là sử dụng một `<form>` bên trong với `method="dialog"`. Khi nút trong form này được nhấn, dialog sẽ tự động đóng và form sẽ không gửi dữ liệu.'),
        demo('Ví dụ dialog',
`<button id="open">Mở dialog</button>
<dialog id="dlg">
  <h3>Bạn có chắc chắn?</h3>
  <p>Hành động này không thể hoàn tác.</p>
  <form method="dialog">
    <button>Đóng</button>
  </form>
</dialog>`,
'',
`const dlg = document.getElementById('dlg');
const btn = document.getElementById('open');
btn.addEventListener('click', ()=> dlg.showModal());`)
      ]
    },
    { id: 'html-14-accessibility', langId: 'html', title: 'Accessibility cơ bản (ARIA)', level: 3, order: 14,
      sections: [
        theory('ARIA là gì?', 'ARIA (Accessible Rich Internet Applications) là tập hợp các thuộc tính HTML giúp cải thiện khả năng truy cập cho người dùng khuyết tật, đặc biệt là người dùng trình đọc màn hình.'),
        theory('Các thuộc tính chính', 'Các thuộc tính ARIA quan trọng bao gồm: \n* `aria-label`: Cung cấp nhãn mô tả cho các thành phần không có text (ví dụ: nút icon).\n* `role`: Định nghĩa vai trò của một phần tử (ví dụ: `role="alert"` cho thông báo, `role="button"` cho `<div>` hoạt động như nút).'),
        demo('ARIA cho nút icon',
`<button aria-label="Tìm kiếm" class="icon-btn">🔍</button>
<div role="alert" style="padding: 10px; border: 1px solid red;">Thông báo lỗi!</div>`,
        '.icon-btn{padding: 8px; font-size: 20px;}'),
        theory('ARIA cho Form và Trạng thái', 'Sử dụng `aria-required`, `aria-expanded` (đang mở hay đóng), và `aria-invalid` (dữ liệu không hợp lệ) để thông báo trạng thái chính xác cho người dùng.'),
        demo('ARIA cho Validation',
`<form>
  <label>Tên: <input type="text" aria-required="true" aria-invalid="false"></label>
  <p aria-live="polite" style="margin-top: 5px;">*Vui lòng nhập tên</p>
</form>`),
      ]
    },


    // =================================================================
    // ===== CSS LEVEL 1 (Cơ bản) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'css-01-introduction', langId: 'css', title: 'Cú pháp & Kết nối CSS', level: 1, order: 1,
      sections: [
        theory('Cú pháp', 'Cấu trúc `selector { property: value; }`'),
        theory('Cách nhúng', 'Inline, Internal, External (khuyến nghị).'),
        demo('Internal Style',
`<p>Đoạn văn được tạo kiểu.</p>
<div id="box">Hộp xanh</div>`,
`p{color:red;font-size:20px}
#box{background:#3b82f6;padding:10px;color:#fff}`)
      ]
    },
    {
      id: 'css-02-box-model', langId: 'css', title: 'Mô hình hộp (Box Model)', level: 1, order: 2,
      sections: [
        theory('4 thành phần', '`Content`, `Padding`, `Border`, `Margin`.'),
        demo('Thực hành',
`<div class="box">Content</div>`,
`.box{width:150px;height:50px;background:lightgreen;padding:15px;border:5px solid darkgreen;margin:20px;text-align:center}`)
      ]
    },
    {
      id: 'css-03-typography-colors', langId: 'css', title: 'Kiểu chữ & Màu sắc', level: 1, order: 3,
      sections: [
        theory('Font & line-height', 'Chọn font dễ đọc; `line-height` 1.4–1.8.'),
        demo('Ví dụ',
`<h1>Tiêu đề</h1><p>Đoạn văn có line-height tốt.</p>`,
`body{font-family:sans-serif}h1{color:#0052D4}p{line-height:1.6;color:#333}`)
      ]
    },
    {
      id: 'css-04-backgrounds-borders', langId: 'css', title: 'Nền & Viền', level: 1, order: 4,
      sections: [
        theory('Background', '`background-color`, `background-image`, gradient.'),
        demo('Gradient',
`<div class="card">Card</div>`,
`.card{padding:16px;color:#fff;border-radius:8px;background:linear-gradient(90deg,#0052D4,#65C7F7)}`)
      ]
    },
    {
      id: 'css-05-display-visibility', langId: 'css', title: 'Display & Visibility', level: 1, order: 5,
      sections: [
        theory('display', '`block`, `inline`, `inline-block`, `none`.'),
        demo('Ví dụ',
`<span class="a">A</span><span class="b">B</span>`,
`.a{display:inline-block;width:40px;height:40px;background:#4364F7;color:#fff;text-align:center}
.b{display:none}`)
      ]
    },

    // =================================================================
    // ===== CSS LEVEL 2 (Trung cấp) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'css-06-flexbox', langId: 'css', title: 'Flexbox cơ bản', level: 2, order: 6,
      sections: [
        theory('Trục & căn chỉnh', '`display:flex`, `justify-content`, `align-items`.'),
        demo('Hàng ngang',
`<div class="row"><div>1</div><div>2</div><div>3</div></div>`,
`.row{display:flex;gap:8px}
.row>div{flex:1;background:#EAF4FF;padding:12px;text-align:center}`)
      ]
    },
    {
      id: 'css-07-grid', langId: 'css', title: 'CSS Grid cơ bản', level: 2, order: 7,
      sections: [
        theory('Lưới 2D', '`display:grid`, `grid-template-columns`, `gap`.'),
        demo('Lưới 3 cột',
`<div class="grid">
  <div>A</div><div>B</div><div>C</div><div>D</div>
</div>`,
`.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.grid>div{background:#CFE7FF;padding:12px;text-align:center}`)
      ]
    },
    {
      id: 'css-08-positioning', langId: 'css', title: 'Positioning', level: 2, order: 8,
      sections: [
        theory('relative/absolute/fixed/sticky', 'Điều khiển vị trí phần tử.'),
        demo('Badge góc',
`<div class="wrap">Card<div class="badge">NEW</div></div>`,
`.wrap{position:relative;background:#EAF4FF;padding:24px;border-radius:8px}
.badge{position:absolute;top:8px;right:8px;background:#0052D4;color:#fff;padding:4px 8px;border-radius:999px}`)
      ]
    },
    {
      id: 'css-09-transform-transition', langId: 'css', title: 'Transform & Transition', level: 2, order: 9,
      sections: [
        theory('Hiệu ứng mượt', '`transform`, `transition` giúp UI sống động.'),
        demo('Hover scale',
`<button class="btn">Hover me</button>`,
`.btn{background:#0052D4;color:#fff;border:none;padding:10px 16px;border-radius:8px;transition:transform .2s}
.btn:hover{transform:scale(1.05)}`)
      ]
    },

    // =================================================================
    // ===== CSS LEVEL 3 (Nâng cao) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'css-10-animations', langId: 'css', title: 'Animation', level: 3, order: 10,
      sections: [
        theory('keyframes', 'Định nghĩa chuyển động khung hình.'),
        demo('Pulse',
`<div class="dot"></div>`,
`.dot{width:24px;height:24px;border-radius:50%;background:#65C7F7;animation:pulse 1.2s infinite}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}`)
      ]
    },
    {
      id: 'css-11-media-queries', langId: 'css', title: 'Responsive với Media Queries', level: 3, order: 11,
      sections: [
        theory('Breakpoint', 'Điều chỉnh layout theo kích thước màn hình.'),
        demo('2 cột → 1 cột',
`<div class="layout"><div>Trái</div><div>Phải</div></div>`,
`.layout{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:640px){.layout{grid-template-columns:1fr}}`)
      ]
    },
    {
      id: 'css-12-variables-modern', langId: 'css', title: 'CSS Variables & Hàm hiện đại', level: 3, order: 12,
      sections: [
        theory('Custom properties', 'Khai báo ở :root; dùng `var(--name)`.'),
        demo('Theme nhanh',
`<div class="card">Card</div>`,
`:root{--brand:#0052D4}
.card{background:var(--brand);color:#fff;padding:16px;border-radius:8px}`)
      ]
    },

    // =================================================================
    // ===== JS LEVEL 1 (Cơ bản) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'js-01-variables', langId: 'js', title: 'Biến (var, let, const)', level: 1, order: 1,
      sections: [
        theory('Biến & khai báo', '`let`/`const` hiện đại (tránh dùng `var` trừ khi cần).'),
        demo('Kiểm tra typeof',
`<p id="result"></p>`, '',
`const name = 'John';
let age = 25;
let active = true;
document.getElementById('result').innerHTML = 'name: '+typeof name+', age: '+typeof age+', active: '+typeof active;`)
      ]
    },
    {
      id: 'js-02-functions', langId: 'js', title: 'Hàm & Tham số', level: 1, order: 2,
      sections: [
        theory('Function & Arrow', 'Khác nhau ở `this` và cú pháp.'),
        demo('Ví dụ',
`<p id="out"></p>`, '',
`function area(w,h){return w*h}
const perim=(w,h)=>2*(w+h)
document.getElementById('out').innerHTML = 'S= '+area(5,4)+', P= '+perim(5,4)`)
      ]
    },
    {
      id: 'js-03-arrays-objects', langId: 'js', title: 'Mảng & Đối tượng', level: 1, order: 3,
      sections: [
        theory('Cấu trúc dữ liệu', 'Mảng lưu danh sách; Object lưu cặp key–value.'),
        demo('Thao tác cơ bản',
`<pre id="out"></pre>`, '',
`const langs=['HTML','CSS','JS'];
const dev={name:'Lan',skills:langs};
document.getElementById('out').textContent = JSON.stringify(dev,null,2);`)
      ]
    },
    {
      id: 'js-04-control-flow', langId: 'js', title: 'Điều kiện & Vòng lặp', level: 1, order: 4,
      sections: [
        theory('if/else; for; while', 'Điều khiển luồng chương trình.'),
        demo('Tính tổng 1..N',
`<input id="n" type="number" value="5"> <button id="run">Tính</button>
<p id="sum"></p>`, '',
`document.getElementById('run').onclick=()=>{
  const N=+document.getElementById('n').value;
  let s=0;for(let i=1;i<=N;i++) s+=i;
  document.getElementById('sum').textContent='Tổng = '+s;
}`)
      ]
    },

    // =================================================================
    // ===== JS LEVEL 2 (Trung cấp) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'js-05-dom-basics', langId: 'js', title: 'DOM cơ bản', level: 2, order: 5,
      sections: [
        theory('Chọn & thao tác', '`getElementById`, `querySelector`, chỉnh `textContent`, `classList`.'),
        demo('Toggle class',
`<div id="box" class="card">Box</div>
<button id="tgl">Toggle highlight</button>`,
`.card{padding:12px;border:1px solid #ccc}
.highlight{background:#FFFAE6}`,
`const b=document.getElementById('box');
document.getElementById('tgl').onclick=()=>b.classList.toggle('highlight');`)
      ]
    },
    {
      id: 'js-06-events', langId: 'js', title: 'Sự kiện', level: 2, order: 6,
      sections: [
        theory('addEventListener', 'Lắng nghe click, input, keydown...'),
        demo('Counter',
`<button id="inc">+</button> <span id="c">0</span> <button id="dec">-</button>`, '',
`let x=0;const c=document.getElementById('c');
document.getElementById('inc').onclick=()=>{x++;c.textContent=x}
document.getElementById('dec').onclick=()=>{x--;c.textContent=x}`)
      ]
    },
    {
      id: 'js-07-async-fetch', langId: 'js', title: 'Bất đồng bộ & Fetch API', level: 2, order: 7,
      sections: [
        theory('Promise & async/await', 'Xử lý tác vụ I/O không chặn UI.'),
        demo('Fetch JSON (demo)',
`<button id="load">Tải dữ liệu</button>
<pre id="data"></pre>`, '',
`document.getElementById('load').onclick=async()=>{
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  const json = await res.json();
  document.getElementById('data').textContent = JSON.stringify(json,null,2);
}`)
      ]
    },
    {
      id: 'js-08-error-handling', langId: 'js', title: 'Xử lý lỗi (try/catch)', level: 2, order: 8,
      sections: [
        theory('try/catch/finally', 'Giúp chương trình ổn định khi có ngoại lệ.'),
        demo('Ví dụ',
`<button id="run">Run</button>
<pre id="out"></pre>`, '',
`document.getElementById('run').onclick=()=>{
  try{ throw new Error('Lỗi demo'); }
  catch(e){ document.getElementById('out').textContent=e.message; }
  finally{ console.log('done'); }
}`)
      ]
    },

    // =================================================================
    // ===== JS LEVEL 3 (Nâng cao) ===== (Giữ nguyên)
    // =================================================================
    {
      id: 'js-09-oop-classes', langId: 'js', title: 'Lập trình Hướng đối tượng (Class)', level: 3, order: 9,
      sections: [
        theory('class & constructor', 'Định nghĩa khuôn mẫu đối tượng.'),
        demo('Ví dụ lớp',
`<pre id="out"></pre>`, '',
`class Person{constructor(name){this.name=name} greet(){return 'Hi '+this.name}}
const p=new Person('Lan');
document.getElementById('out').textContent=p.greet();`)
      ]
    },
    {
      id: 'js-10-array-methods', langId: 'js', title: 'Array methods hiện đại', level: 3, order: 10,
      sections: [
        theory('map/filter/reduce', 'Xử lý dữ liệu mảng ngắn gọn.'),
        demo('Tính tổng giá',
`<pre id="out"></pre>`, '',
`const cart=[{name:'A',price:10},{name:'B',price:15}];
const total=cart.reduce((s,i)=>s+i.price,0);
document.getElementById('out').textContent='Tổng: '+total;`)
      ]
    },
    {
      id: 'js-11-storage-json', langId: 'js', title: 'localStorage & JSON', level: 3, order: 11,
      sections: [
        theory('Lưu nhẹ phía client', 'Dùng JSON.stringify/parse để lưu đối tượng.'),
        demo('Lưu & tải',
`<button id="save">Lưu</button> <button id="load">Tải</button>
<pre id="out"></pre>`, '',
`document.getElementById('save').onclick=()=>{
  const user={name:'Lan',score:100};
  localStorage.setItem('user', JSON.stringify(user));
}
document.getElementById('load').onclick=()=>{
  const u=JSON.parse(localStorage.getItem('user')||'null');
  document.getElementById('out').textContent=JSON.stringify(u,null,2);
}`)
      ]
    },
    {
      id: 'js-12-modules-overview', langId: 'js', title: 'Modules (overview)', level: 3, order: 12,
      sections: [
        theory('ES Modules', 'Sử dụng `import`/`export` (môi trường bundler hoặc type="module").'),
        demo('Minh hoạ (pseudo)',
`<p>Ví dụ modules cần bundler hoặc file tách riêng. Ở đây minh hoạ khái niệm.</p>`,
'',
`// export const add=(a,b)=>a+b
// import { add } from './math.js'
// console.log(add(2,3))`)
      ]
    }
];
const USER_DATA = [
  {
    name: 'Admin Học Code',
    email: 'admin@learncode.com',
    password: 'password123',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=6',
    
    // THÔNG SỐ TIẾN TRÌNH KHỞI TẠO:
    totalXp: 500, 
    currentStreak: 10,
    lessonsCompletedCount: 30,
    lastActivityDate: new Date(), 
  },
  {
    name: 'Dev Luyện',
    email: 'devluyen@learncode.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=1',
    
    // THÔNG SỐ TIẾN TRÌNH KHỞI TẠO:
    totalXp: 1200, 
    currentStreak: 25,
    lessonsCompletedCount: 58,
    lastActivityDate: new Date(),
  },
  {
    name: 'Học Viên A',
    email: 'userA@learncode.com',
    password: 'password123',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=2',
    
    // THÔNG SỐ TIẾN TRÌNH KHỞI TẠO:
    totalXp: 100, 
    currentStreak: 0,
    lessonsCompletedCount: 5,
    lastActivityDate: null,
  },
];


// --------------------------------
// 🚀 RUN LOGIC (Tối ưu hóa logic thực thi)
// --------------------------------
async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Xóa dữ liệu cũ song song (tối ưu)
  console.log('🔄 Đang xóa dữ liệu cũ...');
  await Promise.all([
    Language.deleteMany({}),
    Lesson.deleteMany({}),
    User.deleteMany({})
  ]);

  // Tạo dữ liệu Languages song song (tối ưu)
  console.log('🏗️ Đang tạo Language (HTML, CSS, JS)...');
  await Promise.all(
    LANGUAGE_DATA.map(lang => Language.create(lang))
  );

  // Tạo dữ liệu Lessons
  console.log('🧩 Đang tạo Lessons (Tổng cộng 36 bài học)...');
  await Lesson.create(LESSON_DATA);
   console.log('👥 Đang tạo User (Admin và User thường)...');
  await Promise.all(
    USER_DATA.map(user => User.create(user))
  );

  console.log('✅ Seed đầy đủ cho HTML, CSS, JS (Levels 1→3) đã được tạo!');
  await mongoose.disconnect();

 
}

run().catch((e)=>{
  console.error('❌ Lỗi xảy ra trong quá trình seeding:', e);
  process.exit(1);
});