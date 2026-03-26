import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/mongodb.js';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/index.js';
import authRoutes from './routes/auth.js';
import callsRoutes from './routes/calls.js';
import { setupSocketHandlers } from './sockets/signaling.js';

// Load environment variables
dotenv.config();

/** Comma-separated CORS_ORIGIN values (e.g. http://localhost:5173,https://192.168.1.5:5173) */
const corsOrigin = (process.env.CORS_ORIGIN?.split(',') ?? [])
  .map((s) => s.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => {
  if (/^https?:\/\//i.test(origin)) return origin;
  return `https://${origin}`;
};

const corsOriginNormalized = corsOrigin.map(normalizeOrigin);
const fallbackAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://localhost:5173',
  'https://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL ? [normalizeOrigin(process.env.FRONTEND_URL)] : []),
  ...(process.env.VERCEL_URL ? [normalizeOrigin(process.env.VERCEL_URL)] : []),
].filter(Boolean);
const allowedOrigins = [...new Set([...corsOriginNormalized, ...fallbackAllowedOrigins])];
const allowedOriginRegex = [/^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i];
const corsOriginOption =
  allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;

const app = express();
const httpServer = createServer(app);

// Needed when running behind proxies/load balancers (Railway/Vercel)
app.set('trust proxy', 1);

// CORS-enabled origin matcher
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser tools (curl, server-to-server)
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginRegex.some((pattern) => pattern.test(origin));
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      console.log('CORS origin allowed:', origin || 'no-origin');
      callback(null, origin || true);
    } else {
      console.warn('CORS origin denied:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Allow HTTP OPTIONS on all routes (preflight)
app.options('*', cors(corsOptions));

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOriginOption,
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Connect to MongoDB
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calls', callsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so the server accepts connections from other machines on the LAN
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  ConnectSphere Backend   ║`);
  console.log(`║  Server running on port ${PORT}       ║`);
  console.log(`║  Environment: ${process.env.NODE_ENV || 'development'}              ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('✓ SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✓ HTTP server closed');
  });
});

