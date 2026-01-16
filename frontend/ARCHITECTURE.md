# React Chat UI Architecture

## Component Structure

### Layout Components

**`ChatLayout`** (`components/ChatLayout.jsx`)
- **Purpose**: Main container component that orchestrates the entire chat interface
- **Props**: None (uses context)
- **Responsibilities**:
  - Checks authentication state via `useChat()` hook
  - Renders `LoginForm` if user is not authenticated
  - Renders `Sidebar` + `ChatWindow` if user is authenticated
- **State**: None (delegates to context)

**`Sidebar`** (`components/Sidebar.jsx`)
- **Purpose**: Left sidebar showing conversation list and controls
- **Props**: None (uses context)
- **Features**:
  - "New Chat" button to create conversations
  - List of all user conversations (clickable)
  - Active conversation highlighting
  - Mode switcher (when conversation is active)
  - User info and logout button
- **State**: None (uses context for conversations list)

**`ChatWindow`** (`components/ChatWindow.jsx`)
- **Purpose**: Main chat area container
- **Props**: None (uses context)
- **Structure**:
  - Header bar
  - `MessageList` component (scrollable)
  - `MessageInput` component (fixed at bottom)
- **State**: None (delegates to child components)

### Message Components

**`MessageList`** (`components/MessageList.jsx`)
- **Purpose**: Scrollable container for all messages
- **Props**: None (uses context)
- **Features**:
  - Renders all messages from context
  - Shows streaming text if `isStreaming` is true
  - Shows `TypingIndicator` when waiting for first chunk
  - **Auto-scroll**: Uses `useEffect` + `scrollIntoView` to scroll to bottom on new messages
- **State**: Uses `useRef` for messages end element reference

**`MessageBubble`** (`components/MessageBubble.jsx`)
- **Purpose**: Individual message display component
- **Props**:
  - `message`: Object with `{ id, role, content, createdAt }`
  - `isStreaming`: Boolean (optional, shows blinking cursor)
- **Features**:
  - Different styling for `user` vs `assistant` roles
  - Timestamp display
  - Streaming cursor animation when `isStreaming={true}`
  - Fade-in animation on mount
- **State**: None (pure presentational)

**`TypingIndicator`** (`components/TypingIndicator.jsx`)
- **Purpose**: Animated dots shown while waiting for AI response
- **Props**: None
- **Features**: Three bouncing dots animation
- **State**: None (pure presentational)

**`MessageInput`** (`components/MessageInput.jsx`)
- **Purpose**: Text input area with send button
- **Props**: None (uses context)
- **Features**:
  - Auto-resizing textarea (grows with content, max height)
  - Enter key to send (Shift+Enter for new line)
  - Disabled state during streaming
  - Placeholder text changes based on state
- **State**: Local `input` state for controlled input

### Control Components

**`ModeSwitcher`** (`components/ModeSwitcher.jsx`)
- **Purpose**: Toggle conversation mode (default/interview/code)
- **Props**:
  - `conversationId`: String (ID of active conversation)
  - `currentMode`: String (current mode value)
- **Features**:
  - Three mode buttons
  - Active mode highlighting
  - Calls API to update conversation mode
  - Refreshes conversation list after update
- **State**: Local `updating` state for loading indicator

**`LoginForm`** (`components/LoginForm.jsx`)
- **Purpose**: Authentication UI (login/register)
- **Props**: None (uses context)
- **Features**:
  - Toggle between login and register modes
  - Email and password inputs
  - Error message display
  - Loading state during API calls
- **State**: Local state for `isLogin`, `email`, `password`, `error`, `loading`

## State Management

### ChatContext (`contexts/ChatContext.jsx`)

**Global State** (managed via React Context API):

1. **`user`**: Current authenticated user object (`{ id, email }`)
2. **`conversations`**: Array of conversation objects
3. **`activeConversationId`**: String ID of currently active conversation
4. **`messages`**: Array of message objects for active conversation
5. **`isStreaming`**: Boolean indicating if AI is currently streaming
6. **`streamingText`**: String containing partial streaming response
7. **`loading`**: Boolean for loading states
8. **`error`**: String for error messages

**Actions** (functions exposed via context):

- **`loadConversations()`**: Fetches all user conversations
- **`loadMessages(conversationId)`**: Loads messages for a conversation
- **`switchConversation(conversationId)`**: Switches active conversation and loads its messages
- **`createConversation(title, mode)`**: Creates new conversation and switches to it
- **`sendMessage(content)`**: Sends user message and streams AI response
- **`login(email, password)`**: Authenticates user
- **`register(email, password)`**: Registers new user
- **`logout()`**: Clears all state and logs out

### State Flow Example: Sending a Message

1. User types in `MessageInput` → local state updates
2. User clicks Send → `handleSubmit` calls `sendMessage(content)` from context
3. `sendMessage` in context:
   - Adds user message to `messages` array immediately (optimistic update)
   - Sets `isStreaming = true`
   - Calls `createChatStream()` service
4. `createChatStream` opens SSE connection:
   - On each chunk: calls `onChunk` callback → updates `streamingText` in context
   - On completion: calls `onDone` → sets `isStreaming = false`, reloads messages
5. `MessageList` component:
   - Renders all messages from `messages` array
   - If `isStreaming && streamingText`: renders streaming message bubble
   - `useEffect` watches `streamingText` → auto-scrolls on each update
6. When stream completes:
   - `streamingText` cleared
   - Full assistant message appears in `messages` array (from reload)

### State Flow Example: Switching Conversations

1. User clicks conversation in `Sidebar` → calls `switchConversation(id)`
2. `switchConversation` in context:
   - Sets `activeConversationId = id`
   - Clears `streamingText` and `isStreaming`
   - Calls `loadMessages(id)`
3. `loadMessages`:
   - Sets `loading = true`
   - Fetches messages from API
   - Updates `messages` array
   - Sets `loading = false`
4. `ChatWindow` re-renders with new messages
5. `MessageList` displays new conversation's messages

## Key Design Decisions

### Why Context API instead of Redux?

- **Simplicity**: Less boilerplate for a single-page chat app
- **Built-in**: No external dependencies
- **Sufficient**: State is mostly local to chat functionality
- **Future-proof**: Easy to migrate to Redux/Zustand if needed

### Component Composition

- **Presentational vs Container**: Clear separation
  - Presentational: `MessageBubble`, `TypingIndicator` (pure, props-based)
  - Container: `ChatLayout`, `Sidebar` (uses context, orchestrates)
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components like `MessageBubble` can be used anywhere

### Auto-scroll Strategy

- Uses `useRef` to reference the bottom element
- `useEffect` watches `messages`, `streamingText`, `isStreaming`
- Calls `scrollIntoView({ behavior: 'smooth' })` on changes
- Smooth scrolling provides better UX than instant jumps

### Streaming UX

- **Optimistic Update**: User message appears immediately
- **Progressive Rendering**: Assistant response builds character-by-character
- **Visual Feedback**: Blinking cursor during streaming
- **Fallback**: Typing indicator if stream hasn't started yet
- **Completion**: Full message persists after stream ends

## File Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ChatLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── MessageInput.jsx
│   │   ├── TypingIndicator.jsx
│   │   ├── ModeSwitcher.jsx
│   │   └── LoginForm.jsx
│   ├── contexts/            # React Context providers
│   │   └── ChatContext.jsx
│   ├── services/           # API and utility services
│   │   ├── api.js          # Axios instance + API functions
│   │   └── chatStream.js   # SSE streaming helper
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css          # Global styles
├── package.json
├── vite.config.js
└── index.html
```
