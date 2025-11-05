import { EventService } from './services/eventService.js';
import { AggregationService } from './services/aggregationService.js';
import jwt from 'jsonwebtoken';

const eventService = new EventService();
const aggregationService = new AggregationService();

export function setupWebSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId || decoded.id || 'demo-user';
      next();
    } catch (e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-dashboard', async () => {
      const aggregates = await aggregationService.getLatestAggregates();
      socket.emit('initial-state', { aggregates });
    });

    socket.on('event', async (eventData) => {
      try {
        const event = {
          ...eventData,
          timestamp: new Date(eventData.timestamp || Date.now()),
          serverReceivedAt: new Date()
        };
        await eventService.storeEvent(event);
        await aggregationService.processEvent(event);
        socket.emit('event-ack', { clientEventId: event.clientEventId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to process event', error: err.message });
      }
    });
  });

  startAggregationBroadcast(io);
}

function startAggregationBroadcast(io) {
  const intervals = [1000, 5000, 60000];
  intervals.forEach((window) => {
    setInterval(async () => {
      try {
        const aggregates = await aggregationService.getWindowAggregates(window);
        io.emit('aggregate-update', { window, aggregates, timestamp: Date.now() });
      } catch (e) {
        // log and continue
      }
    }, window);
  });
}


