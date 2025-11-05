import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { setupWebSocket } from './websocket.js';
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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

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

startServer();


