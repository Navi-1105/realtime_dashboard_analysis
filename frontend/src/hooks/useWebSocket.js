import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN = import.meta.env.VITE_JWT_TOKEN || 'demo-token';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [socket, setSocket] = useState(null);
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return; // ensure single instance
    created.current = true;

    const s = io(BACKEND_URL, {
      auth: { token: TOKEN },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: 10,
    });

    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      // Request replay data on reconnect
      s.emit('reconnect-request');
    });
    s.on('disconnect', () => setConnected(false));
    s.on('connect_error', (err) => {
      console.error('WS connect_error', err?.message || err);
      setConnected(false);
    });
    s.on('event-ack', () => setLastUpdate(Date.now()));
    s.on('aggregate-update', () => setLastUpdate(Date.now()));
    s.on('reconnect-data', () => setLastUpdate(Date.now()));

    return () => s.close();
  }, []);

  return { connected, socket, lastUpdate };
}


