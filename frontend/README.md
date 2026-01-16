# StarGPT Frontend

React-based chat UI for the StarGPT AI chatbot application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults shown):
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- **Chat Layout**: Sidebar with conversation list + main chat window
- **Message Bubbles**: Distinct styling for user and assistant messages
- **Streaming Responses**: Real-time rendering of AI responses as they stream
- **Typing Indicator**: Shows when AI is processing
- **Auto-scroll**: Automatically scrolls to latest message
- **Conversation Switching**: Click any conversation in sidebar to switch
- **Mode Switcher**: Toggle between default/interview/code modes

## Component Structure

- `ChatLayout`: Main container, handles auth state
- `Sidebar`: Conversation list and navigation
- `ChatWindow`: Main chat area
- `MessageList`: Scrollable list of messages
- `MessageBubble`: Individual message component
- `MessageInput`: Text input with send button
- `TypingIndicator`: Animated dots while waiting
- `ModeSwitcher`: Mode selection buttons
- `LoginForm`: Authentication UI

## State Management

Uses React Context API (`ChatContext`) for global state:
- User authentication
- Conversations list
- Active conversation
- Messages
- Streaming state
- Loading/error states
