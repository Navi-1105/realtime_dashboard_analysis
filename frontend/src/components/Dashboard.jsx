import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import ActiveUsersChart from './Charts/ActiveUsersChart.jsx';
import EventsPerSecondChart from './Charts/EventsPerSecondChart.jsx';
import TopRoutesChart from './Charts/TopRoutesChart.jsx';
import ErrorRateChart from './Charts/ErrorRateChart.jsx';
import { startContinuousTraffic, stopAllTraffic } from '../services/eventGenerator.js';
import { getLatestAggregates } from '../services/api.js';

export default function Dashboard() {
  const [aggregates, setAggregates] = useState({});
  const [timeRange, setTimeRange] = useState(60000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [eventsPerSecond, setEventsPerSecond] = useState(80);
  const stopTrafficRef = useRef(null);
  const { connected, socket } = useWebSocket();
  
  // Debug WebSocket connection on mount and when it changes
  useEffect(() => {
    console.log('🔌 WebSocket connection status changed:', {
      connected,
      socketExists: !!socket,
      socketConnected: socket?.connected,
      socketId: socket?.id
    });
  }, [connected, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-dashboard', 'main');
    socket.on('initial-state', ({ aggregates }) => {
      console.log('Initial state received:', aggregates);
      setAggregates(aggregates);
    });
    socket.on('aggregate-update', ({ window, aggregates }) => {
      console.log(`Aggregate update for window ${window}:`, aggregates);
      setAggregates(prev => {
        const newAggregates = { ...prev };
        newAggregates[window] = { ...aggregates }; // Create new object reference
        return newAggregates;
      });
    });
    socket.on('reconnect-data', ({ aggregates }) => {
      if (aggregates) {
        console.log('Reconnect data received:', aggregates);
        setAggregates(aggregates);
      }
    });
    return () => {
      socket.off('initial-state');
      socket.off('aggregate-update');
      socket.off('reconnect-data');
    };
  }, [socket]);

  // Polling fallback when offline
  useEffect(() => {
    if (connected) return; // only when offline
    let timer = null;
    const tick = async () => {
      try {
        const latest = await getLatestAggregates();
        setAggregates(latest || {});
      } catch {}
      timer = setTimeout(tick, 2000);
    };
    tick();
    return () => timer && clearTimeout(timer);
  }, [connected]);

  // Cleanup traffic generation on unmount
  useEffect(() => {
    return () => {
      if (stopTrafficRef.current) {
        stopTrafficRef.current();
        stopTrafficRef.current = null;
      }
      stopAllTraffic();
    };
  }, []);

  const handleToggleTraffic = () => {
    if (isGenerating) {
      // Stop traffic generation
      if (stopTrafficRef.current) {
        stopTrafficRef.current();
        stopTrafficRef.current = null;
      }
      stopAllTraffic();
      setIsGenerating(false);
    } else {
      // Start traffic generation
      // Debug WebSocket connection status
      console.log('🔍 Checking WebSocket status:');
      console.log('  - socket exists:', !!socket);
      console.log('  - socket.connected:', socket?.connected);
      console.log('  - connected state:', connected);
      console.log('  - socket.id:', socket?.id);
      
      // Wait a moment for socket to connect if it exists but isn't connected yet
      if (socket && !socket.connected && !connected) {
        console.log('⏳ Socket exists but not connected, waiting 2 seconds...');
        setTimeout(() => {
          if (socket.connected || connected) {
            console.log('✅ Socket connected after wait, starting traffic');
            const stopFn = startContinuousTraffic(socket, eventsPerSecond, 20);
            stopTrafficRef.current = stopFn;
            setIsGenerating(true);
          } else {
            console.warn('⚠️ Socket still not connected after wait, using HTTP fallback');
            const httpRate = Math.min(eventsPerSecond, 10);
            const stopFn = startContinuousTraffic(null, httpRate, 20);
            stopTrafficRef.current = stopFn;
            setIsGenerating(true);
          }
        }, 2000);
        return;
      }
      
      // Prefer WebSocket if available and connected
      const isWebSocketReady = socket && (socket.connected === true || connected === true);
      
      if (isWebSocketReady) {
        console.log('✅ Starting traffic with WebSocket connection');
        const stopFn = startContinuousTraffic(socket, eventsPerSecond, 20);
        stopTrafficRef.current = stopFn;
        setIsGenerating(true);
      } else {
        // Try to connect socket if it exists but isn't connected
        if (socket && !socket.connected) {
          console.log('🔄 Attempting to connect socket...');
          socket.connect();
          // Wait a bit and try again
          setTimeout(() => {
            if (socket.connected) {
              console.log('✅ Socket connected, starting traffic');
              const stopFn = startContinuousTraffic(socket, eventsPerSecond, 20);
              stopTrafficRef.current = stopFn;
              setIsGenerating(true);
            } else {
              console.warn('⚠️ Socket connection failed, using HTTP fallback');
              const httpRate = Math.min(eventsPerSecond, 10);
              const stopFn = startContinuousTraffic(null, httpRate, 20);
              stopTrafficRef.current = stopFn;
              setIsGenerating(true);
            }
          }, 2000);
          return;
        }
        
        // Use HTTP API with reduced rate to avoid overwhelming browser
        console.warn('⚠️ WebSocket not available, using HTTP with reduced rate');
        console.warn('   Socket state:', {
          exists: !!socket,
          connected: socket?.connected,
          id: socket?.id,
          componentConnected: connected
        });
        
        const httpRate = Math.min(eventsPerSecond, 10); // Max 10 req/s for HTTP
        if (httpRate < eventsPerSecond) {
          const message = `WebSocket not connected. Using HTTP fallback with reduced rate: ${httpRate}/s (requested: ${eventsPerSecond}/s)\n\nPlease ensure the backend server is running on http://localhost:3000`;
          alert(message);
        }
        const stopFn = startContinuousTraffic(null, httpRate, 20);
        stopTrafficRef.current = stopFn;
        setIsGenerating(true);
      }
    }
  };

  // Create a new object reference to ensure charts detect changes
  const data = useMemo(() => {
    const selectedData = aggregates[timeRange] || aggregates[60000] || {};
    return { ...selectedData }; // Always return a new object
  }, [aggregates, timeRange]);
  
  // Debug: Log data updates
  useEffect(() => {
    console.log('Dashboard - aggregates:', aggregates);
    console.log('Dashboard - timeRange:', timeRange);
    console.log('Dashboard - current data for charts:', data);
    console.log('Dashboard - data keys:', Object.keys(data));
    if (data.eventsPerSecond !== undefined) {
      console.log('Dashboard - eventsPerSecond:', data.eventsPerSecond);
    }
    if (data.uniqueUsers !== undefined) {
      console.log('Dashboard - uniqueUsers:', data.uniqueUsers);
    }
    if (data.routes !== undefined) {
      console.log('Dashboard - routes:', data.routes);
      console.log('Dashboard - routes type:', typeof data.routes);
      console.log('Dashboard - routes keys:', Object.keys(data.routes || {}));
    }
  }, [data, aggregates, timeRange]);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24 }}>
      <div style={{ display:'grid', gap:24 }}>
        <div className="glass" style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', padding:24, gap:24 }}>
          <div className="glass" style={{ borderRadius:16, padding:20, display:'grid', gap:8, alignContent:'space-between' }}>
            <p className="card-title">My Balance</p>
            <div className="number-lg">₹{(data.totalEvents || 17754).toLocaleString()}</div>
            <button type="button" style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-2)', background:'transparent', border:'none', cursor:'pointer', width:'fit-content' }} onClick={()=>alert('Timeframe menu coming soon')}>Monthly ▾</button>
          </div>
          <div className="glass" style={{ borderRadius:16, padding:20 }}>
            <p className="card-title">Performance</p>
            <div className="chart-300">
              <EventsPerSecondChart data={data} />
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
          <div className="glass" style={{ padding:20 }}>
            <p className="card-title">Active Users</p>
            <div className="chart-300">
              <ActiveUsersChart data={data} />
            </div>
          </div>
          <div className="glass" style={{ padding:20 }}>
            <p className="card-title">Error Rate</p>
            <div className="chart-300">
              <ErrorRateChart data={data} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gap:24 }}>
        <div className="glass" style={{ padding:20 }}>
          <p className="card-title">Top Routes</p>
          <div className="chart-300">
            <TopRoutesChart data={data} />
          </div>
        </div>

        <div className="glass" style={{ padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <p className="card-title">Transaction History</p>
            <div className="glass" style={{ padding:'6px 10px', borderRadius:10, fontSize:12, color:'var(--text-2)' }}>
              Sort by ▾
            </div>
          </div>
          <div className="hidden-scroll" style={{ maxHeight: 340, overflowY:'auto', marginTop:8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto', padding:'14px 6px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div className="glass" style={{ width:36, height:36, borderRadius:10, display:'grid', placeItems:'center' }}>🛒</div>
                  <div>
                    <div style={{ fontWeight:600 }}>Shopping</div>
                    <div style={{ fontSize:12, color:'var(--text-2)' }}>05 June 2021</div>
                  </div>
                </div>
                <div style={{ fontWeight:600 }}>₹{[300,35,400,25,112,56,80,49][i % 8]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding:16, display:'flex', gap:12, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ color: (connected || isGenerating) ? '#16a34a' : '#ef4444', fontSize:'18px' }}>{(connected || isGenerating) ? '●' : '○'}</span>
            <span style={{ color:'var(--text-2)', fontWeight:500 }}>
              {connected ? 'Live (WebSocket)' : isGenerating ? 'Live (HTTP)' : 'Offline'}
            </span>
            {socket && !socket.connected && !connected && (
              <button 
                onClick={() => {
                  console.log('🔄 Manually reconnecting WebSocket...');
                  socket.connect();
                }}
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '12px', 
                  background: 'rgba(124, 58, 237, 0.1)', 
                  border: '1px solid rgba(124, 58, 237, 0.3)', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-1)'
                }}
              >
                Retry Connection
              </button>
            )}
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <select value={timeRange} onChange={(e)=>setTimeRange(Number(e.target.value))} className="glass" style={{ padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:'var(--text-1)', cursor:'pointer', minWidth:'60px' }}>
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={60000}>60s</option>
            </select>
            <select 
              value={eventsPerSecond} 
              onChange={(e)=>setEventsPerSecond(Number(e.target.value))} 
              className="glass" 
              style={{ padding:'10px 12px', borderRadius:10, border:'none', background:'transparent', color:'var(--text-1)', cursor:isGenerating ? 'not-allowed' : 'pointer', opacity:isGenerating ? 0.6 : 1, minWidth:'80px' }}
              disabled={isGenerating}
            >
              <option value={20}>20/s</option>
              <option value={40}>40/s</option>
              <option value={60}>60/s</option>
              <option value={80}>80/s</option>
              <option value={100}>100/s</option>
            </select>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleToggleTraffic}
              style={{ 
                backgroundColor: isGenerating ? '#ef4444' : undefined,
                minWidth: '150px',
                fontWeight:600
              }}
            >
              {isGenerating ? 'Stop Traffic' : 'Generate Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


