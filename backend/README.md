# Interest-Based Video Chat - Backend

Backend server for the interest-based one-to-one video conferencing platform.

## Architecture Overview

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers (thin layer)
├── middleware/      # Express middleware (auth, rate limiting, error handling)
├── models/          # MongoDB schemas (Mongoose)
├── routes/          # API route definitions
├── services/        # Business logic (matching algorithm, etc.)
├── sockets/         # Socket.IO handlers (WebRTC signaling)
├── utils/           # Utility functions (validators, helpers)
└── server.js        # Main server entry point
```

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `PORT` - Server port (default: 5000)

3. **Ensure MongoDB is running:**
   ```bash
   # Start MongoDB locally or use a remote URI in .env
   ```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register`
  - Register a new user
  - Body: `{ email, password, fullName, interests[] }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/login`
  - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- **GET** `/api/auth/me`
  - Get current user profile (requires token)
  - Returns: `{ user }`

- **PUT** `/api/auth/me`
  - Update user profile (requires token)
  - Body: `{ fullName, interests[] }`
  - Returns: `{ user }`

## Socket.IO Events

The server handles real-time WebRTC signaling through Socket.IO:

### Client → Server Events

- **user-join-queue** - Join matching queue
  - Data: `{ userId }`
  - Response: `match-found` or `waiting-for-match`

- **leave-queue** - Leave matching queue
  - Data: `{ userId }`

- **offer** - Send WebRTC offer
  - Data: `{ targetUserId, offer }`

- **answer** - Send WebRTC answer
  - Data: `{ targetUserId, answer }`

- **ice-candidate** - Send ICE candidate
  - Data: `{ targetUserId, candidate }`

- **end-call** - Terminate call
  - Data: `{ userId, targetUserId }`

### Server → Client Events

- **match-found** - Match found with another user
  - Data: `{ matchedUserId, matchedUser, commonInterests[] }`

- **waiting-for-match** - Waiting in queue
  - Data: `{ message }`

- **offer** - Received offer from peer
  - Data: `{ offer, senderId }`

- **answer** - Received answer from peer
  - Data: `{ answer, senderId }`

- **ice-candidate** - Received ICE candidate
  - Data: `{ candidate, senderId }`

- **call-ended** - Call terminated by other peer
  - Data: `{ message }`

- **error** - Error occurred
  - Data: `{ message }`

## Matching Algorithm

The backend uses an in-memory matching queue that:

1. Maintains a queue of users waiting for matches
2. When a new user joins, finds the best match based on common interests
3. Prioritizes users with more common interests
4. Skips users already in a call
5. Emits `match-found` event to both matched users

The matching is done in O(n) time where n is the queue size.

## Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Authentication**: All protected endpoints require valid JWT
- **Rate Limiting**: 
  - Login: 5 attempts per 15 minutes
  - Signup: 5 per hour
  - API: 100 requests per 15 minutes
- **CORS**: Configured to accept requests from frontend only
- **Input Validation**: Email, password, and interest validation

## Database Models

### User Model

```javascript
{
  email: String (unique),
  passwordHash: String,
  fullName: String,
  interests: [String],
  avatar: String (optional),
  isVerified: Boolean,
  isBanned: Boolean,
  reputationScore: Number (0-1000),
  isOnline: Boolean,
  socketId: String,
  inCall: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

## Development Notes

- The server stores matching queue in memory (resets on restart)
- For production, consider persistent queue in Redis
- Socket.IO uses long-polling and WebSocket transports
- WebRTC signaling is complete; actual media streams are peer-to-peer

## Troubleshooting

**MongoDB Connection Failed**
- Ensure MongoDB is running locally or remote URI is correct in `.env`

**CORS Errors**
- Check `CORS_ORIGIN` in `.env` matches your frontend URL

**Socket.IO Connection Issues**
- Verify `CORS_ORIGIN` in server
- Check firewall for port access
- Try clearing browser cache

## Future Enhancements

- Persistent matching queue (Redis)
- User reputation/rating system
- Interest categories and tags
- Call history and statistics
- User blocking and reporting
- Admin dashboard
