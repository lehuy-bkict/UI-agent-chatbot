# Agent Builder Guide Chatbot

Demo chatbot kết nối tới **Agent Builder**, phục vụ hướng dẫn cách tích hợp dự án với Agent Builder.

## Mục đích

Hệ thống này được xây dựng để:

- Hướng dẫn cách kết nối ứng dụng React tới API của Agent Builder
- Demo luồng gửi tin nhắn và nhận phản hồi từ Agent
- Làm tài liệu tham khảo cho việc tích hợp Agent Builder vào các dự án khác

## Tính năng

- **Chat Popup** — Widget chat góc phải màn hình, mở/đóng mượt mà
- **Expand Mode** — Mở rộng chat thành modal hỗ trợ kéo thả và resize
- **Markdown Rendering** — Phản hồi của bot hiển thị đầy đủ Markdown (GFM: bảng, danh sách, code block...)
- **Thinking Indicator** — Hiệu ứng "đang suy nghĩ" khi chờ phản hồi
- **Emoji Picker** — Chèn emoji vào tin nhắn
- **Xóa lịch sử** — Reset cuộc trò chuyện về trạng thái ban đầu

## Cấu trúc dự án

demo_chatbot/
├── public/
│   └── index.html              # HTML gốc, load emoji-mart từ CDN
├── src/
│   ├── agentConfig.js          # Cấu hình Agent (API Key, URL) & API Service
│   ├── sharedComponents.js     # UI Components dùng chung (Message, EmojiPicker, BotAvatar, ThinkingIndicator)
│   ├── App.js                  # Component chính — Chat Popup (widget góc phải)
│   ├── expand.js               # Component Expand Chat (modal kéo thả, resize)
│   ├── App.css                 # Stylesheet chung
│   └── index.js                # Entry point React
├── package.json
└── README.md

## Cài đặt & Chạy

# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build production
npm run build

## Cấu hình Agent

Mở file `src/agentConfig.js` và cập nhật các giá trị sau:

const API_KEY = "your-api-key-here";
const AGENT_ID = "your-agent-id-here";
const API_URL = `https://agent.sec.samsung.net/api/v1/run/${AGENT_ID}?stream=false`;

| Biến | Mô tả |
|------|-------|
| `API_KEY` | Khóa xác thực API (x-api-key header) |
| `AGENT_ID` | ID của Agent đã tạo trên Agent Builder |
| `API_URL` | Endpoint API, tự động ghép `AGENT_ID` vào URL |

## API Reference

### `sendMessageToAgent(message)`

Gửi tin nhắn tới Agent Builder API và nhận phản hồi.

**Parameters:**
| Tên | Type | Mô tả |
|-----|------|-------|
| `message` | `string` | Nội dung tin nhắn của người dùng |

**Returns:** `Promise<{ text: string, hasError: boolean }>`

| Field | Type | Mô tả |
|-------|------|-------|
| `text` | `string` | Nội dung phản hồi từ Agent (hoặc JSON raw nếu không parse được) |
| `hasError` | `boolean` | `true` nếu Agent trả về lỗi |

**Request format:**
```json
{
  "input_type": "chat",
  "output_type": "chat",
  "input_value": "Nội dung tin nhắn"
}