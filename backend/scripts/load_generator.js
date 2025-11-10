// /*
//   Simple WebSocket load generator
//   Usage:
//     node scripts/load_generator.js --rps=100 --duration=60 --users=50 --url=http://localhost:3000 --token=demo-token
// */

// import { io } from 'socket.io-client';
// import { randomUUID } from 'crypto';

// const args = Object.fromEntries(process.argv.slice(2).map(kv => {
//   const [k, v] = kv.replace(/^--/, '').split('=');
//   return [k, v ?? true];
// }));

// const URL = args.url || 'http://localhost:3000';
// const TOKEN = args.token || process.env.JWT_TOKEN || 'demo-token';
// const RPS = Number(args.rps || 50); // requests per second
// const DURATION = Number(args.duration || 30); // seconds
// const USERS = Number(args.users || 20);

// const routes = ['/home', '/dashboard', '/profile', '/settings', '/products', '/cart', '/checkout'];
// const actions = ['click', 'view', 'scroll', 'submit', 'error', 'navigation'];

// function createClient(userId) {
//   const socket = io(URL, { auth: { token: TOKEN }, transports: ['websocket', 'polling'] });
//   return new Promise((resolve) => {
//     socket.on('connect', () => resolve(socket));
//   });
// }

// function makeEvent(userId, sessionId, i) {
//   return {
//     timestamp: new Date().toISOString(),
//     userId,
//     sessionId,
//     route: routes[Math.floor(Math.random() * routes.length)],
//     action: actions[Math.floor(Math.random() * actions.length)],
//     metadata: { loadgen: true },
//     clientEventId: `${userId}-${Date.now()}-${i}`
//   };
// }

// async function main() {
//   console.log(`Starting load: ${RPS} evt/s for ${DURATION}s with ${USERS} users → ${URL}`);
//   const users = Array.from({ length: USERS }).map(() => ({ userId: randomUUID(), sessionId: randomUUID() }));
//   const sockets = await Promise.all(users.map(u => createClient(u.userId)));

//   const start = Date.now();
//   let sent = 0;
//   let tick = 0;

//   const interval = setInterval(() => {
//     tick += 1;
//     for (let i = 0; i < RPS; i++) {
//       const u = users[(sent + i) % USERS];
//       const s = sockets[(sent + i) % USERS];
//       s.emit('event', makeEvent(u.userId, u.sessionId, sent + i));
//     }
//     sent += RPS;
//     if ((Date.now() - start) / 1000 >= DURATION) {
//       clearInterval(interval);
//       console.log(`Done. Sent ${sent} events in ${((Date.now() - start) / 1000).toFixed(1)}s`);
//       setTimeout(() => sockets.forEach(s => s.close()), 500);
//     }
//   }, 1000);
// }

// main().catch((e) => {
//   console.error('Load generator error:', e);
//   process.exit(1);
// });


import { io } from 'socket.io-client';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const routes = ['/home', '/dashboard', '/profile', '/settings', '/products', '/cart', '/checkout'];
const actions = ['click', 'view', 'scroll', 'submit', 'error', 'navigation'];

function createClient(userId) {
  const socket = io('http://localhost:3000', { 
    auth: { token: process.env.JWT_TOKEN || 'demo-token' }, 
    transports: ['websocket', 'polling'] 
  });
  
  return new Promise((resolve) => {
    socket.on('connect', () => resolve(socket));
  });
}

function makeEvent(userId, sessionId, i) {
  return {
    timestamp: new Date().toISOString(),
    userId,
    sessionId,
    route: routes[Math.floor(Math.random() * routes.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    metadata: { 
      loadgen: true,
      generatedBy: 'Navi-1105',
      generatedAt: '2025-11-07 10:08:17'
    },
    clientEventId: `${userId}-${Date.now()}-${i}`
  };
}

export async function generateDemoTraffic(config = {}) {
  const {
    rps = 20,
    duration = 30,
    users = 5,
    url = 'http://localhost:3000'
  } = config;

  console.log(`Starting demo traffic: ${rps} evt/s for ${duration}s with ${users} users`);
  const demoUsers = Array.from({ length: users }).map(() => ({ 
    userId: randomUUID(), 
    sessionId: randomUUID() 
  }));
  
  const sockets = await Promise.all(demoUsers.map(u => createClient(u.userId)));
  const start = Date.now();
  let sent = 0;

  const interval = setInterval(() => {
    for (let i = 0; i < rps; i++) {
      const u = demoUsers[(sent + i) % users];
      const s = sockets[(sent + i) % users];
      s.emit('event', makeEvent(u.userId, u.sessionId, sent + i));
    }
    sent += rps;
    if ((Date.now() - start) / 1000 >= duration) {
      clearInterval(interval);
      console.log(`Demo complete. Sent ${sent} events`);
      setTimeout(() => sockets.forEach(s => s.close()), 500);
    }
  }, 1000);
}

// CLI support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(process.argv.slice(2).map(kv => {
    const [k, v] = kv.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }));

  generateDemoTraffic({
    rps: Number(args.rps || 50),
    duration: Number(args.duration || 30),
    users: Number(args.users || 20),
    url: args.url || 'http://localhost:3000'
  });
}