# Interest-Based Video Chat - Frontend

Frontend application for the interest-based one-to-one video conferencing platform using React and Vite.

## Architecture Overview

```
src/
├── components/        # Reusable React components
├── context/          # React Context for global state (Auth)
├── hooks/            # Custom React hooks (WebRTC management)
├── pages/            # Page components (Login, Register, VideoChat)
├── services/         # API and Socket.IO communication
├── styles/           # CSS stylesheets
├── webrtc/           # WebRTC utilities and peer connection logic
└── main.jsx          # Application entry point
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **WebRTC API** - Peer-to-peer video/audio
- **Context API** - State management

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
   - `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)
   - `VITE_SOCKET_URL` - Socket.IO server URL (default: http://localhost:5000)

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will start on http://localhost:5173

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

### Pages

- **Login** - User login page
- **Register** - User registration with interest selection
- **VideoChat** - Main video chat interface with matching and WebRTC

### Components

- **VideoStream** - Renders video element for media streams
- **CallButton** - Reusable button for call actions

### Context & Hooks

- **AuthContext** - Global authentication state management
- **usePeerConnection** - Custom hook managing WebRTC peer connection lifecycle

### Services

- **api.js** - API client for backend communication
- **socket.js** - Socket.IO connection and event handling

### WebRTC

- **RTCPeerConnection.js** - WebRTC utilities and peer connection helpers

## Features

### Authentication
- Register with email, password, full name, and interests
- Login with email and password
- Protected routes requiring authentication
- Session persistence with localStorage

### Matching & Queue
- Users join matching queue
- Backend matches users by common interests
- Real-time notifications via Socket.IO

### Video Chat
- Establish peer-to-peer WebRTC connection
- Exchange SDP offers/answers
- Share ICE candidates
- Audio and video controls
- End call functionality

### UI
- Responsive design (mobile, tablet, desktop)
- Real-time status updates
- Error handling and display
- Loading states
- User profile information display

## Key Implementation Details

### State Management

**AuthContext:**
- Manages user authentication state
- Persists token and user data in localStorage
- Provides login/logout/updateUser methods

### WebRTC Flow

1. **Initialization**: Get user media (audio/video)
2. **Matching**: Join queue and find match
3. **Connection**:
   - Offeror creates offer and sends via Socket.IO
   - Answerer receives offer, creates answer
   - Both peers exchange ICE candidates
4. **Streaming**: Media streams peer-to-peer
5. **Cleanup**: Close connections and stop media tracks

### Socket Events

**Emitted Events:**
- `user-join-queue` - Join matching queue
- `leave-queue` - Leave queue
- `offer` - Send WebRTC offer
- `answer` - Send WebRTC answer
- `ice-candidate` - Send ICE candidate
- `end-call` - Terminate call

**Received Events:**
- `match-found` - Match found notification
- `waiting-for-match` - In queue waiting
- `offer` - Received offer
- `answer` - Received answer
- `ice-candidate` - Received ICE candidate
- `call-ended` - Call terminated by peer

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

**Requirements:**
- getUserMedia API support
- WebRTC API support
- ES6+ JavaScript support

## Development Workflow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173 in browser
4. Register or login
5. Join queue to search for matches
6. Call will establish when match is found

## Troubleshooting

**WebRTC Connection Failed**
- Check browser console for errors
- Verify backend is running
- Check CORS and Socket.IO configuration
- Ensure firewall allows WebRTC traffic

**No Camera/Microphone Access**
- Check browser permissions
- Grant camera/microphone access when prompted
- Verify devices are available

**Missing Matches**
- Ensure at least 2 users are in queue
- Check both users have common interests
- Verify backend matching service is working

**Socket.IO Connection Issues**
- Check VITE_SOCKET_URL in .env
- Verify backend is listening on correct port
- Check for CORS errors in console

## Performance Optimization

- Lazy loading of routes (future enhancement)
- Memoization of context consumers (future enhancement)
- Efficient state updates
- Media stream auto-cleanup

## Future Enhancements

- User profiles with avatars
- Chat messaging during calls
- Call recording
- User ratings/reputation
- Blocked users list
- Call history
- Screen sharing
- Multiple audio codecs
- Network quality indicators
- Admin dashboard

## Security Considerations

- JWT token stored locally (secure for SPA)
- HTTPS recommended for production
- CORS properly configured
- Input validation on all forms
- Protected routes require authentication
- Sensitive data not exposed to client

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

Proprietary - All rights reserved
