import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket.js';
import ActiveUsersChart from './Charts/ActiveUsersChart.jsx';
import EventsPerSecondChart from './Charts/EventsPerSecondChart.jsx';
import TopRoutesChart from './Charts/TopRoutesChart.jsx';
import ErrorRateChart from './Charts/ErrorRateChart.jsx';
import { generateTestEvents } from '../services/eventGenerator.js';

export default function Dashboard() {
  const [aggregates, setAggregates] = useState({});
  const [timeRange, setTimeRange] = useState(60000);
  const { connected, socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-dashboard', 'main');
    socket.on('initial-state', ({ aggregates }) => setAggregates(aggregates));
    socket.on('aggregate-update', ({ window, aggregates }) => setAggregates(prev => ({ ...prev, [window]: aggregates })));
    return () => {
      socket.off('initial-state');
      socket.off('aggregate-update');
    };
  }, [socket]);

  const data = aggregates[timeRange] || aggregates[60000] || {};

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:24 }}>
      <div style={{ display:'grid', gap:24 }}>
        <div className="glass" style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', padding:24, gap:24 }}>
          <div className="glass" style={{ borderRadius:16, padding:20, display:'grid', gap:8, alignContent:'space-between' }}>
            <p className="card-title">My Balance</p>
            <div className="number-lg">${(data.totalEvents || 17754).toLocaleString()}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-2)' }}>
              <span>Monthly</span>
              <span>▾</span>
            </div>
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
                <div style={{ fontWeight:600 }}>${[300,35,400,25,112,56,80,49][i % 8]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding:16, display:'flex', gap:12, alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ color: connected ? '#16a34a' : '#ef4444' }}>{connected ? '●' : '○'}</span>
            <span style={{ color:'var(--text-2)' }}>{connected ? 'Live' : 'Offline'}</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <select value={timeRange} onChange={(e)=>setTimeRange(Number(e.target.value))} className="glass" style={{ padding:'10px 12px', borderRadius:10, border:'none', background:'transparent' }}>
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={60000}>60s</option>
            </select>
            <button className="btn-primary" onClick={()=> socket && generateTestEvents(socket, 80)}>Generate Demo Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}


