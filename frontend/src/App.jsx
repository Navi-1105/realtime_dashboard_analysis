import React from 'react';
import Dashboard from './components/Dashboard.jsx';
import './index.css';

export default function App() {
  return (
    <div className="container">
      <aside className="sidebar glass" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))' }} />
        {['🏠', '📈', '💳', '🧾', '⚙️'].map((i, idx) => (
          <div key={idx} className="glass" style={{ width: 44, height: 44, borderRadius: 12, display:'grid', placeItems:'center' }}>{i}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="glass" style={{ width: 44, height: 44, borderRadius: 100, display:'grid', placeItems:'center' }}>👤</div>
      </aside>

      <header className="topbar glass" style={{ display:'flex', alignItems:'center', gap:16, padding:16, borderRadius: '22px' }}>
        <div className="glass" style={{ flex:1, padding:'12px 16px', borderRadius: 14, display:'flex', alignItems:'center', gap:10 }}>
          <span>🔎</span>
          <input placeholder="Search" style={{ border:'none', outline:'none', background:'transparent', width:'100%', fontSize:14 }} />
        </div>
        <div className="glass" style={{ padding:'10px 14px', borderRadius:14 }}>🔔</div>
        <div className="glass" style={{ padding:'10px 14px', borderRadius:14 }}>🌙</div>
      </header>

      <main className="content">
        <Dashboard />
      </main>
    </div>
  );
}


