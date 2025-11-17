# Google Analytics Tracking Documentation

## Tổng quan

Hệ thống đã được tích hợp Google Analytics 4 (GA4) với các tính năng tracking nâng cao để theo dõi hành vi người dùng khi rời khỏi trang web.

## Cấu hình

### Biến môi trường cần thiết

Thêm vào file `.env.local`:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics Measurement ID
NEXT_PUBLIC_GA_API_SECRET=your_api_secret  # API Secret cho Measurement Protocol (optional nhưng khuyến nghị)
```

### Lấy API Secret

1. Vào Google Analytics > Admin > Data Streams
2. Chọn stream của bạn
3. Scroll xuống "Measurement Protocol API secrets"
4. Tạo secret mới và copy vào `.env.local`

## Các tính năng tracking

### 1. Exit Tracking (Theo dõi khi rời trang)

#### External Link Clicks
- Track khi người dùng click vào link ngoài
- Thông tin: domain đích, URL đầy đủ, text của link, thời gian trên trang, scroll depth

#### Before Unload
- Track khi người dùng đóng tab/trình duyệt
- Sử dụng Measurement Protocol API với sendBeacon để đảm bảo tracking đáng tin cậy

#### Page Hide
- Track khi trang bị ẩn (đặc biệt quan trọng trên mobile)
- Phát hiện nếu trang được cache (persisted)

#### Visibility Change
- Track khi tab được chuyển đi/chuyển lại
- Track khi window bị minimize/restore

### 2. User Engagement Tracking

#### Scroll Depth
- Track độ sâu scroll (25%, 50%, 75%, 100%)
- Lưu scroll depth tối đa cho mỗi trang

#### Exit Intent
- Phát hiện khi chuột rời khỏi viewport từ phía trên (exit intent)
- Đếm số lần exit intent

### 3. User Actions Tracking

#### Copy/Paste Events
- Track khi người dùng copy nội dung
- Track khi người dùng paste nội dung
- Đo độ dài text được copy/paste

#### Right-Click (Context Menu)
- Track khi người dùng right-click

#### Window Blur/Focus
- Track khi window mất/gain focus

## Các Events được track

### Exit Events
- `exit_link_click` - Click vào external link
- `exit_beforeunload` - Đóng tab/trình duyệt
- `exit_unload` - Page unload
- `exit_pagehide` - Page hide (mobile)
- `exit_visibility_hidden` - Tab bị ẩn
- `exit_visibility_visible` - Tab được hiển thị lại
- `exit_window_blur` - Window mất focus
- `exit_window_focus` - Window gain focus
- `exit_intent` - Exit intent (mouse leave top)

### Engagement Events
- `scroll_depth` - Scroll milestones (25%, 50%, 75%, 100%)
- `page_view` - Page view với thời gian trên trang

### User Action Events
- `content_copy` - Copy content
- `content_paste` - Paste content
- `right_click` - Right-click context menu

## Event Parameters

Mỗi event bao gồm các parameters sau:

### Common Parameters
- `event_category` - Loại event (Exit, Engagement, User Action)
- `event_label` - Label mô tả
- `value` - Giá trị số (nếu có)
- `page_path` - Đường dẫn trang
- `page_title` - Tiêu đề trang
- `time_on_page` - Thời gian trên trang (giây)
- `scroll_depth` - Độ sâu scroll (%)
- `engagement_time_msec` - Thời gian engagement (milliseconds)

### Exit-Specific Parameters
- `link_url` - URL của external link
- `link_text` - Text của link
- `destination_domain` - Domain đích
- `destination_path` - Path đích
- `exit_intent_count` - Số lần exit intent
- `persisted` - Trang có được cache không (pagehide)

## Sử dụng trong code

### Track custom event

```typescript
import { sendGAEvent, sendGAEventReliable } from '@/lib/gaTracking'

// Standard event
sendGAEvent('custom_event', {
  event_category: 'Custom',
  event_label: 'Label',
  value: 100
})

// Reliable event (sử dụng MP API)
sendGAEventReliable('important_event', {
  event_category: 'Important',
  event_label: 'Label'
}, true) // useMP = true
```

### Set user properties

```typescript
import { setUserId, setUserProperties } from '@/lib/gaTracking'

// Set user ID
setUserId('user123')

// Set custom properties
setUserProperties({
  user_type: 'premium',
  subscription_status: 'active'
})
```

## Measurement Protocol API

Hệ thống sử dụng Measurement Protocol API cho các exit events quan trọng để đảm bảo tracking đáng tin cậy ngay cả khi trang đang đóng.

### Ưu điểm
- Hoạt động ngay cả khi trang đang đóng (sendBeacon)
- Đáng tin cậy hơn gtag cho exit events
- Hoạt động tốt trên mobile

### Cách hoạt động
1. Sử dụng `navigator.sendBeacon()` để gửi data
2. Fallback về `gtag` nếu sendBeacon không khả dụng
3. Tự động retry với gtag nếu MP API fail

## Best Practices

1. **Sử dụng MP API cho exit events**: Đảm bảo tracking khi trang đóng
2. **Track scroll depth**: Hiểu được mức độ engagement
3. **Track exit intent**: Phát hiện khi người dùng muốn rời đi
4. **Monitor external links**: Biết người dùng đi đâu

## Debugging

### Kiểm tra events trong GA4
1. Vào Google Analytics > Reports > Engagement > Events
2. Tìm các events theo tên
3. Xem chi tiết parameters

### Kiểm tra trong Console
```javascript
// Kiểm tra gtag có sẵn
console.log(window.gtag)

// Kiểm tra dataLayer
console.log(window.dataLayer)

// Test event
window.gtag('event', 'test_event', {
  event_category: 'Test',
  event_label: 'Test Label'
})
```

## Lưu ý

1. **Privacy**: Hệ thống không track thông tin cá nhân nhạy cảm
2. **Performance**: Tracking được tối ưu để không ảnh hưởng performance
3. **Reliability**: Sử dụng sendBeacon cho exit events để đảm bảo data không bị mất
4. **Mobile**: Pagehide event quan trọng cho mobile tracking

## Troubleshooting

### Events không xuất hiện trong GA4
- Kiểm tra `NEXT_PUBLIC_GA_ID` đã đúng chưa
- Kiểm tra console có lỗi không
- Đợi 24-48 giờ để data xuất hiện (real-time có thể delay)

### Exit events không track
- Kiểm tra `NEXT_PUBLIC_GA_API_SECRET` đã set chưa
- Kiểm tra browser có hỗ trợ sendBeacon không
- Xem console logs để debug

