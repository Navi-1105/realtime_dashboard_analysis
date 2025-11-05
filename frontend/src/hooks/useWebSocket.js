import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN = import.meta.env.VITE_JWT_TOKEN || 'demo-token';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      auth: { token: TOKEN },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('event-ack', () => setLastUpdate(Date.now()));
    socket.on('aggregate-update', () => setLastUpdate(Date.now()));

    return () => socket.close();
  }, []);

  return { connected, socket: socketRef.current, lastUpdate };
}


