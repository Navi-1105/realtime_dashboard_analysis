import { v4 as uuidv4 } from 'uuid';
import { sendEvent } from './api.js';

const routes = ['/home', '/dashboard', '/profile', '/settings', '/products', '/cart', '/checkout'];
const actions = ['click', 'view', 'scroll', 'submit', 'error', 'navigation'];

export function generateTestEvents(socket, count = 10) {
  const userId = uuidv4();
  const sessionId = uuidv4();

  for (let i = 0; i < count; i++) {
    setTimeout(async () => {
      const event = {
        timestamp: new Date().toISOString(),
        userId,
        sessionId,
        route: routes[Math.floor(Math.random() * routes.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        metadata: { userAgent: 'test-generator', timestamp: Date.now() },
        clientEventId: `${userId}-${Date.now()}-${i}`
      };
      if (socket && socket.connected) {
        socket.emit('event', event);
      } else {
        try { await sendEvent(event); } catch {}
      }
    }, i * 10);
  }
}


