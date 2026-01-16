# ⭐ StarGPT - AI Chat Application

A modern, full-stack AI chat application powered by Google's Gemini API with real-time streaming responses, conversation management, and a beautiful user interface.

![StarGPT](https://img.shields.io/badge/StarGPT-AI%20Chat-FEB05D?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

## ✨ Features

- 🤖 **AI-Powered Chat** - Integrated with Google Gemini 2.5 Flash Lite for intelligent responses
- 💬 **Real-time Streaming** - Server-Sent Events (SSE) for smooth, real-time AI responses
- 📝 **Conversation Management** - Create, switch, and manage multiple chat conversations
- 🔐 **User Authentication** - Secure JWT-based authentication system
- 🎨 **Modern UI** - Beautiful, responsive interface with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌙 **Dark Theme** - Eye-friendly dark mode with custom color palette
- ⚡ **Fast & Efficient** - Optimized performance with rate limiting and context management
- 💾 **Persistent Storage** - MongoDB for reliable data persistence
- 🔒 **Production Ready** - Built with security and scalability in mind

## 🎨 Color Palette

- **Light Gray**: `#F5F2F2` - Primary text and light accents
- **Orange**: `#FEB05D` - Buttons and call-to-action elements
- **Blue**: `#5A7ACD` - User messages and focus states
- **Dark Gray**: `#2B2A2A` - Backgrounds and surfaces

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Google Gemini API** - AI model
- **bcryptjs** - Password hashing
- **express-rate-limit** - API rate limiting

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **CSS3** - Styling with custom properties
- **Context API** - State management
- **Axios** - HTTP client
- **Inter Font** - Typography

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/starGPT.git
cd starGPT
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=StarGPT

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here

# Server Configuration
PORT=5000
```

### 4. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and paste it in your `.env` file

## 🎯 Running the Application

### Development Mode

**Option 1: Run both servers separately**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option 2: Run from root (if configured)**

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 📁 Project Structure

```
starGPT/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── db.js        # MongoDB connection
│   │   │   └── env.js       # Environment loader
│   │   ├── controllers/     # Route controllers
│   │   │   └── chatController.js
│   │   ├── middlewares/     # Express middlewares
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── contextValidator.js
│   │   ├── models/          # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Conversation.js
│   │   │   └── Message.js
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── conversationRoutes.js
│   │   │   └── messageRoutes.js
│   │   ├── services/        # Business logic
│   │   │   ├── geministreamService.js
│   │   │   ├── memoryService.js
│   │   │   └── usageLogger.js
│   │   ├── utils/           # Utility functions
│   │   └── app.js           # Express app setup
│   ├── server.js            # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatLayout.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ModeSwitcher.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── contexts/        # React contexts
│   │   │   └── ChatContext.jsx
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env                     # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Conversations
- `GET /api/conversations` - Get all conversations
- `POST /api/conversations` - Create new conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/messages` - Create new message

### Chat
- `GET /api/chat/stream` - Stream AI responses (SSE)

## 🎨 UI Components

### Main Components
- **ChatLayout** - Main application layout
- **Sidebar** - Conversation list and navigation
- **ChatWindow** - Main chat interface
- **MessageBubble** - Individual message display
- **MessageInput** - Message input with auto-resize
- **LoginForm** - Authentication interface

### Features
- Smooth animations and transitions
- Real-time message streaming
- Auto-scrolling chat window
- Responsive design
- Custom scrollbars
- Loading states
- Error handling

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation
- CORS protection
- Environment variable protection
- Secure MongoDB connection

## ⚡ Performance Optimizations

- Context size validation
- Token counting and limits
- Conversation summarization
- Efficient database queries
- Response streaming
- Client-side caching
- Optimized re-renders

## 🐛 Troubleshooting

### Common Issues

**1. API Key Invalid Error**
```
Error: API key not valid
```
**Solution**: Make sure you have a valid Gemini API key in your `.env` file.

**2. Model Not Found Error**
```
Error: models/gemini-1.5-flash-latest is not found
```
**Solution**: Update `GEMINI_MODEL` in `.env` to `gemini-2.5-flash-lite`.

**3. MongoDB Connection Error**
```
Error: MONGO_URI is not defined
```
**Solution**: Ensure your MongoDB connection string is correctly set in `.env`.

**4. Port Already in Use**
```
Error: Port 5000 is already in use
```
**Solution**: Change the `PORT` in `.env` or kill the process using that port.

## 📝 Available Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🌟 Features in Detail

### Real-time Streaming
The application uses Server-Sent Events (SSE) to stream AI responses in real-time, providing a smooth and interactive chat experience.

### Conversation Management
Users can create multiple conversations, switch between them, and manage their chat history efficiently.

### Context Management
The system intelligently manages conversation context, including:
- Recent message history
- Conversation summarization
- Token counting and limits
- Context size validation

### Usage Tracking
Built-in usage logging tracks:
- Token consumption
- Request success/failure
- Response times
- User activity

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- MongoDB for database solutions
- React community for amazing tools
- All contributors and supporters

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact via email
- Check the documentation

---

Made with ❤️ and ☕ by Harsh K. Singh
