import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import './index.css';

export default function App() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }, [dark]);
  return (
    <div className="container">
      <aside className="sidebar glass" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))' }} />
        {['🏠', '📈', '💳', '🧾', '⚙️'].map((i, idx) => (
          <button key={idx} type="button" className="glass" style={{ width: 44, height: 44, borderRadius: 12, display:'grid', placeItems:'center', border:'none', cursor:'pointer' }} onClick={()=>console.log('Sidebar click', idx)}>{i}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button type="button" className="glass" style={{ width: 44, height: 44, borderRadius: 100, display:'grid', placeItems:'center', border:'none', cursor:'pointer' }} onClick={()=>console.log('Profile click')}>👤</button>
      </aside>

      <header className="topbar glass" style={{ display:'flex', alignItems:'center', gap:16, padding:16, borderRadius: '22px' }}>
        <div className="glass" style={{ flex:1, padding:'12px 16px', borderRadius: 14, display:'flex', alignItems:'center', gap:10 }}>
          <span>🔎</span>
          <input placeholder="Search" style={{ border:'none', outline:'none', background:'transparent', width:'100%', fontSize:14 }} />
        </div>
        <button className="glass" style={{ padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer' }} onClick={() => alert('Notifications placeholder')}>🔔</button>
        <button className="glass" style={{ padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer' }} onClick={() => setDark(v => !v)} aria-label="Toggle dark mode">{dark ? '🌞' : '🌙'}</button>
      </header>

      <main className="content">
        <Dashboard />
      </main>
    </div>
  );
}


