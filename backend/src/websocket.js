import { EventService } from './services/eventService.js';
import { AggregationService } from './services/aggregationService.js';
import jwt from 'jsonwebtoken';

const eventService = new EventService();
const aggregationService = new AggregationService();

export function setupWebSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        if (process.env.NODE_ENV !== 'production') {
          socket.userId = 'demo-user';
          return next();
        }
        return next(new Error('Authentication error'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.userId || decoded.id || 'demo-user';
      next();
    } catch (e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // simple token bucket per socket for backpressure (max 50 events/sec)
    const bucket = { tokens: 50, lastRefill: Date.now() };
    const refillRate = 50; // tokens per second
    function takeToken() {
      const now = Date.now();
      const elapsed = (now - bucket.lastRefill) / 1000;
      const refill = Math.floor(elapsed * refillRate);
      if (refill > 0) {
        bucket.tokens = Math.min(2 * refillRate, bucket.tokens + refill);
        bucket.lastRefill = now;
      }
      if (bucket.tokens > 0) { bucket.tokens -= 1; return true; }
      return false;
    }

    socket.on('join-dashboard', async (room = 'main') => {
      socket.join(room);
      const aggregates = await aggregationService.getLatestAggregates();
      socket.emit('initial-state', { aggregates, room });
    });

    socket.on('event', async (eventData) => {
      // payload size safety (~16KB)
      const size = Buffer.byteLength(JSON.stringify(eventData || {}));
      if (size > 16 * 1024) {
        return socket.emit('error', { message: 'Payload too large' });
      }
      if (!takeToken()) {
        return socket.emit('error', { message: 'Rate limit: too many events' });
      }
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

    // replay-on-reconnect (basic): client requests latest aggregates and recent events
    socket.on('reconnect-request', async () => {
      const aggregates = await aggregationService.getLatestAggregates();
      const recentEvents = await eventService.getRecentEvents(100);
      socket.emit('reconnect-data', { aggregates, recentEvents });
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
        io.to('main').emit('aggregate-update', { window, aggregates, timestamp: Date.now() });
      } catch (e) {
        // log and continue
      }
    }, window);
  });
}


