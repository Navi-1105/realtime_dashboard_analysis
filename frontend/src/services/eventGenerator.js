import { v4 as uuidv4 } from 'uuid';
import { sendEvent } from './api.js';

const routes = ['/home', '/dashboard', '/profile', '/settings', '/products', '/cart', '/checkout'];
const actions = ['click', 'view', 'scroll', 'submit', 'error', 'navigation'];

// Store active traffic generators
const activeGenerators = new Map();

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

/**
 * Start continuous traffic generation
 * @param {Object} socket - WebSocket connection
 * @param {Number} eventsPerSecond - Number of events to generate per second (default: 80)
 * @param {Number} numUsers - Number of simulated users (default: 20)
 * @returns {Function} Stop function to call when you want to stop generation
 */
export function startContinuousTraffic(socket, eventsPerSecond = 80, numUsers = 20) {
  const generatorId = `gen-${Date.now()}-${Math.random()}`;
  
  // Create multiple users
  const users = Array.from({ length: numUsers }).map(() => ({
    userId: uuidv4(),
    sessionId: uuidv4()
  }));

  let eventCount = 0;
  let intervalId = null;
  
  // HTTP request queue and throttling (only used when WebSocket is not available)
  const httpQueue = [];
  let httpProcessing = false;
  const maxConcurrentHttpRequests = 5; // Limit concurrent HTTP requests
  let activeHttpRequests = 0;
  
  // Process HTTP queue with throttling
  const processHttpQueue = async () => {
    if (httpProcessing || httpQueue.length === 0) return;
    httpProcessing = true;
    
    while (httpQueue.length > 0 && activeHttpRequests < maxConcurrentHttpRequests) {
      const event = httpQueue.shift();
      activeHttpRequests++;
      
      sendEvent(event)
        .catch(err => {
          console.warn('Failed to send event via HTTP:', err.message);
        })
        .finally(() => {
          activeHttpRequests--;
          // Process next item in queue after a small delay
          setTimeout(() => processHttpQueue(), 50);
        });
    }
    
    httpProcessing = false;
  };

  const generateEvent = (user, index) => {
    const event = {
      timestamp: new Date().toISOString(),
      userId: user.userId,
      sessionId: user.sessionId,
      route: routes[Math.floor(Math.random() * routes.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      metadata: { 
        userAgent: 'test-generator', 
        timestamp: Date.now(),
        generatorId 
      },
      clientEventId: `${user.userId}-${Date.now()}-${index}`
    };

    // Always prefer WebSocket if available and connected
    if (socket && socket.connected) {
      socket.emit('event', event);
    } else {
      // Use HTTP with queue and throttling
      httpQueue.push(event);
      processHttpQueue();
    }
    eventCount++;
  };

  // Generate events continuously
  // Spread events evenly across the second to avoid bursts
  const eventsPerInterval = Math.ceil(eventsPerSecond / 10); // 10 intervals per second = 100ms intervals
  const intervalMs = 100; // Update every 100ms
  
  intervalId = setInterval(() => {
    for (let i = 0; i < eventsPerInterval; i++) {
      const user = users[eventCount % numUsers];
      generateEvent(user, eventCount);
    }
  }, intervalMs);

  // Store the generator
  activeGenerators.set(generatorId, {
    intervalId,
    httpQueue,
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      // Clear HTTP queue
      httpQueue.length = 0;
      activeGenerators.delete(generatorId);
    }
  });

  // Return stop function
  return () => {
    const generator = activeGenerators.get(generatorId);
    if (generator) {
      generator.stop();
    }
  };
}

/**
 * Stop all active traffic generators
 */
export function stopAllTraffic() {
  activeGenerators.forEach((generator) => {
    generator.stop();
  });
  activeGenerators.clear();
}


