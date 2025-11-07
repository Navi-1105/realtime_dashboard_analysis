import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { setupWebSocket, aggregationService } from './websocket.js';
import eventRoutes from './routes/events.js';
import healthRoutes from './routes/health.js';
import metricsRoutes from './routes/metrics.js';
import aggregatesRoutes from './routes/aggregates.js';
import { authMiddleware } from './middleware/auth.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type']
  },
  allowEIO3: true // Allow Engine.IO v3 clients
});

app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Realtime Analytics Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      events: '/api/events',
      aggregates: '/api/aggregates/latest',
      websocket: 'ws://localhost:3000'
    },
    docs: 'See README.md for API documentation'
  });
});

// Health check (no auth)
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);
app.use('/api/aggregates', aggregatesRoutes);

// Rate limiting for API
app.use('/api', rateLimiter);

// Protected REST endpoints
app.use('/api/events', authMiddleware, eventRoutes);

// WebSocket
setupWebSocket(io);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  // Flush all pending aggregates
  try {
    await aggregationService.flushAll();
  } catch (err) {
    console.error('Error flushing aggregates:', err);
  }
  
  // Close server
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();


