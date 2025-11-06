/*
  Automated traffic generator - runs continuously
  Usage: node scripts/auto_traffic.js
*/
import { io } from 'socket.io-client';
import { randomUUID } from 'crypto';

const URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TOKEN = process.env.JWT_TOKEN || process.argv[2] || 'demo-token';
const RPS = Number(process.env.RPS || 80); // events per second
const USERS = Number(process.env.USERS || 20);

const routes = ['/home', '/dashboard', '/profile', '/settings', '/products', '/cart', '/checkout'];
const actions = ['click', 'view', 'scroll', 'submit', 'error', 'navigation'];

function createClient(userId) {
  return new Promise((resolve) => {
    const socket = io(URL, {
      auth: { token: TOKEN },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', () => {
      console.log(`Waiting for server... retrying in 2s`);
      setTimeout(() => resolve(createClient(userId)), 2000);
    });
  });
}

function makeEvent(userId, sessionId, i) {
  return {
    timestamp: new Date().toISOString(),
    userId,
    sessionId,
    route: routes[Math.floor(Math.random() * routes.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    metadata: { autoTraffic: true },
    clientEventId: `${userId}-${Date.now()}-${i}`
  };
}

async function main() {
  console.log(`🚀 Auto-traffic generator starting...`);
  console.log(`   Target: ${URL}`);
  console.log(`   Rate: ${RPS} events/sec`);
  console.log(`   Users: ${USERS}`);
  console.log(`   Press Ctrl+C to stop\n`);

  // Wait for server to be ready
  let socket = null;
  for (let i = 0; i < 10; i++) {
    try {
      socket = await createClient('auto-user-0');
      if (socket.connected) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!socket || !socket.connected) {
    console.error('❌ Could not connect to server. Is backend running?');
    process.exit(1);
  }

  console.log('✅ Connected to server\n');

  const users = Array.from({ length: USERS }).map(() => ({
    userId: randomUUID(),
    sessionId: randomUUID(),
    socket: null
  }));

  // Connect all users
  for (const user of users) {
    user.socket = await createClient(user.userId);
  }

  let sent = 0;
  const startTime = Date.now();

  // Continuous traffic generation
  const interval = setInterval(() => {
    for (let i = 0; i < RPS; i++) {
      const user = users[sent % USERS];
      const event = makeEvent(user.userId, user.sessionId, sent);
      if (user.socket && user.socket.connected) {
        user.socket.emit('event', event);
      }
      sent++;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const avgRps = (sent / elapsed).toFixed(1);
    process.stdout.write(`\r📊 Sent ${sent} events (${avgRps} evt/s avg) - ${new Date().toLocaleTimeString()}`);
  }, 1000);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping traffic generator...');
    clearInterval(interval);
    users.forEach(u => u.socket?.close());
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Sent ${sent} events in ${elapsed}s`);
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

