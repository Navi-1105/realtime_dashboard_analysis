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

    console.log('🔌 Initializing WebSocket connection to:', BACKEND_URL);
    console.log('   Using token:', TOKEN ? 'Yes (provided)' : 'No');

    const s = io(BACKEND_URL, {
      auth: { token: TOKEN },
      transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: true, // Force new connection
      upgrade: true,
      rememberUpgrade: false,
      autoConnect: true
    });

    setSocket(s);

    s.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setConnected(true);
      // Request replay data on reconnect
      s.emit('reconnect-request');
    });
    s.on('disconnect', (reason) => {
      console.warn('⚠️ WebSocket disconnected:', reason);
      setConnected(false);
    });
    s.on('connect_error', (err) => {
      console.error('❌ WebSocket connect_error:', err?.message || err);
      setConnected(false);
    });
    s.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      setConnected(true);
    });
    s.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnection attempt ${attemptNumber}`);
    });
    s.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after all attempts');
      setConnected(false);
    });
    s.on('event-ack', () => setLastUpdate(Date.now()));
    s.on('aggregate-update', () => setLastUpdate(Date.now()));
    s.on('reconnect-data', () => setLastUpdate(Date.now()));

    return () => s.close();
  }, []);

  return { connected, socket, lastUpdate };
}


