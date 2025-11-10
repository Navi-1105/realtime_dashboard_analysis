import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket = io(BACKEND_URL, {
  auth: {
    token: 'demo-token' // or your actual JWT token
  },
  transports: ['websocket', 'polling'],
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10
});

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
});