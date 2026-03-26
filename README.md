# ConnectSphere Platform

A production-quality, interest-based one-to-one video conferencing platform for authenticated users. Similar to Omegle but with proper authentication, interest matching, and WebRTC-based peer-to-peer video streaming.

## 🎯 Overview

This monorepo contains a complete, scalable video conferencing solution with:
- **User Authentication** - JWT-based secure login/registration
- **Interest-Based Matching** - Intelligent algorithm to match users with common interests
- **WebRTC Signaling** - Backend handles only signaling, media streams peer-to-peer
- **Real-time Communication** - Socket.IO for real-time events and signaling
- **Production-Ready Architecture** - Clean separation of concerns, scalable design

## 📁 Project Structure

```
connectsphere/
├── backend/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (matching)
│   │   ├── sockets/          # Socket.IO handlers
│   │   ├── utils/            # Validators & helpers
│   │   └── server.js         # Express + Socket.IO setup
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React Context (Auth)
│   │   ├── hooks/            # Custom hooks (WebRTC)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API & Socket.IO clients
│   │   ├── styles/           # CSS stylesheets
│   │   ├── webrtc/           # WebRTC utilities
│   │   └── main.jsx          # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/
│   ├── architecture.md       # System design
│   ├── api-contracts.md      # API documentation
│   └── uml/                  # UML diagrams
│
├── CONTRIBUTING.md
├── README.md                 # This file
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env
# MONGO_URI=mongodb://localhost:27017/interest-video-chat
# JWT_SECRET=your_secret_key_here
# PORT=5000

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env (defaults are usually fine)
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

### 3. Test the Application

1. Open http://localhost:5173 in your browser
2. Register a new account with email and interests
3. Open another browser window (incognito) and register another account
4. Both users should join the queue
5. System will match them based on common interests
6. WebRTC connection will establish automatically
7. Video/audio stream peer-to-peer

## 🏗️ Architecture

### Backend Architecture

**Tech Stack:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (WebRTC signaling)
- JWT Authentication
- bcryptjs (Password hashing)

**Key Components:**
- **Controllers** - Handle HTTP requests (thin layer)
- **Services** - Business logic (matching algorithm)
- **Middleware** - Auth, rate limiting, error handling
- **Models** - MongoDB schemas with validation
- **Sockets** - WebRTC signaling and real-time events
- **utils** - Validation and helper functions

**Matching Algorithm:**
- In-memory queue of waiting users
- O(n) complexity matching by common interests
- Prioritizes users with more common interests
- Skips users already in calls

### Frontend Architecture

**Tech Stack:**
- React 18 + Vite
- React Router (client-side routing)
- Socket.IO Client (real-time communication)
- WebRTC API (peer-to-peer media)
- Context API (state management)

**Key Components:**
- **AuthContext** - Global auth state
- **usePeerConnection** - WebRTC lifecycle management
- **pages/** - Login, Register, VideoChat
- **services/** - API client, Socket.IO client
- **webrtc/** - WebRTC utilities

### Data Flow

```
User Registration/Login
    ↓
JWT Token + Store in localStorage
    ↓
AuthContext provides token globally
    ↓
Socket.IO connects with user ID
    ↓
User joins matching queue
    ↓
Backend matches users by interests
    ↓
match-found event emitted
    ↓
WebRTC signaling begins
    ↓
One peer creates offer
    ↓
Other peer sends answer
    ↓
ICE candidates exchanged
    ↓
Media stream flows peer-to-peer
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Rate Limiting** - 5 login attempts per 15 min, 5 signups per hour
- **CORS Protection** - Whitelist frontend origin
- **Input Validation** - Email, password, interest validation
- **Protected Routes** - All endpoints require valid JWT
- **No Server Streaming** - All media is peer-to-peer

## 🎮 API Endpoints

### Authentication

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user (protected)
PUT    /api/auth/me           - Update profile (protected)
GET    /api/health            - Health check
```

See [docs/api-contracts.md](docs/api-contracts.md) for full API documentation.

## 🔌 Socket.IO Events

### Client → Server
- `user-join-queue` - Join matching queue
- `leave-queue` - Leave queue
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `end-call` - End call

### Server → Client
- `match-found` - New match available
- `waiting-for-match` - In queue, searching
- `offer` - Received offer
- `answer` - Received answer
- `ice-candidate` - Received ICE candidate
- `call-ended` - Call ended
- `error` - Error occurred

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  passwordHash: String,
  fullName: String,
  interests: [String],
  avatar: String,
  isVerified: Boolean,
  isBanned: Boolean,
  reputationScore: Number (0-1000),
  isOnline: Boolean,
  socketId: String,
  inCall: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the Platform

### Scenario 1: Single Match
1. Register User A with interests: [Gaming, Sports]
2. Register User B with interests: [Sports, Music]
3. Both join queue
4. System matches them (common interest: Sports)
5. Call establishes

### Scenario 2: Multiple Queued Users
1. Register 3 users with different interests
2. All join queue simultaneously
3. System matches based on interest overlap
4. Test error handling when match fails

### Scenario 3: Network Issues
1. Start call
2. Close browser tab
3. Verify disconnect event fires
4. Verify user removed from queue

## 📈 Performance Considerations

- **Matching Algorithm** - O(n) per match request (queue size)
- **Memory Usage** - Queue only stores user IDs and interests (minimal)
- **WebRTC** - Uses standard STUN servers, no TURN required for many networks
- **Socket.IO** - Handles reconnection automatically
- **Database** - Optimized queries with indexes

**Scaling Strategy:**
- Replace in-memory queue with Redis for horizontal scaling
- Load balance WebRTC signaling servers
- Database read replicas for auth
- CDN for static assets
- Monitor connection quality metrics

## 🐛 Troubleshooting

### Backend Won't Start
```
Error: MONGO_URI not found
→ Create .env file from .env.example
→ Ensure MongoDB is running
```

### WebRTC Connection Fails
```
Error: Failed to get media
→ Grant camera/microphone permissions
→ Check devices are available
→ Verify HTTPS (not strictly needed for localhost)
```

### Socket.IO Connection Issues
```
Error: Cannot connect to Socket.IO
→ Verify backend is running on port 5000
→ Check VITE_SOCKET_URL in frontend .env
→ Check firewall/network settings
```

### No Matches Found
```
Issue: Users queued but no match
→ Verify both users have common interests
→ Check backend console for match attempts
→ Ensure at least 2 users in queue
```

## 📚 Documentation

- [Backend README](backend/README.md) - Server setup and architecture
- [Frontend README](frontend/README.md) - Client setup and architecture
- [API Contracts](docs/api-contracts.md) - Full API documentation
- [System Architecture](docs/architecture.md) - System design overview
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

## 🔄 Development Workflow

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - MongoDB (if not running as service)
mongod

# Open http://localhost:5173 in browser
```

## 🚢 Production Deployment

### Backend
1. Set environment variables (production values)
2. Build: `npm run build` (if applicable)
3. Deploy to hosting (Heroku, AWS, DigitalOcean, etc.)
4. Use managed MongoDB (Atlas, AWS DocumentDB, etc.)
5. Set up HTTPS, CORS for production domain

### Frontend
1. Build: `npm run build`
2. Deploy static files to CDN (Vercel, Netlify, S3, etc.)
3. Configure API URLs for production backend

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Code style and standards
- Git workflow
- Pull request process
- Issue reporting

## 📝 License

Proprietary - All rights reserved

## 👨‍💼 Author

Built as a production-quality demonstration of:
- Full-stack JavaScript development
- Real-time communication (Socket.IO)
- WebRTC peer-to-peer streaming
- Modern React patterns
- Scalable backend architecture
- Security best practices

## 🎓 Learning Resources

- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Socket.IO Guide](https://socket.io/docs/)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB University](https://university.mongodb.com)

---

**Current Version:** 1.0.0
**Last Updated:** February 2026
**Status:** Production Ready ✅
Interest-based 1-to-1 video conferencing app (MERN + WebRTC)

