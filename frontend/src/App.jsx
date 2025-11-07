import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import Analytics from './components/Analytics.jsx';
import Payments from './components/Payments.jsx';
import Documents from './components/Documents.jsx';
import Settings from './components/Settings.jsx';
import Login from './components/Login.jsx';
import { verifyToken } from './services/api.js';
import './index.css';

export default function App() {
  const [dark, setDark] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }, [dark]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const result = await verifyToken();
          if (result && result.valid) {
            setIsAuthenticated(true);
            setUser(result.user);
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          } else {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-gradient)' }}>
        <div className="glass" style={{ padding: '40px', borderRadius: 20 }}>
          <div style={{ fontSize: 18, color: 'var(--text-1)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }
  
  const sidebarItems = ['🏠', '📈', '💳', '🧾', '⚙️'];
  const sidebarLabels = ['Home', 'Analytics', 'Payments', 'Documents', 'Settings'];
  
  return (
    <div className="container">
      <aside className="sidebar glass" style={{ padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))' }} />
        {sidebarItems.map((icon, idx) => (
          <button
            key={idx}
            type="button"
            className={`sidebar-btn ${activeSidebarItem === idx ? 'active' : ''}`}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeSidebarItem === idx 
                ? 'linear-gradient(135deg, var(--brand-1), var(--brand-2))'
                : 'var(--glass-bg)',
              transform: activeSidebarItem === idx ? 'scale(1.15)' : 'scale(1)',
              boxShadow: activeSidebarItem === idx 
                ? '0 4px 15px rgba(124, 58, 237, 0.4)'
                : 'var(--card-shadow)'
            }}
            onClick={() => {
              setActiveSidebarItem(idx);
            }}
            title={sidebarLabels[idx]}
          >
            {icon}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="sidebar-btn"
          style={{
            width: 44,
            height: 44,
            borderRadius: 100,
            display: 'grid',
            placeItems: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'var(--glass-bg)'
          }}
          onClick={() => console.log('Profile click')}
          title="Profile"
        >
          👤
        </button>
      </aside>

      <header className="topbar glass" style={{ display:'flex', alignItems:'center', gap:16, padding:16, borderRadius: '22px' }}>
        <div className="glass" style={{ flex:1, padding:'12px 16px', borderRadius: 14, display:'flex', alignItems:'center', gap:10 }}>
          <span>🔎</span>
          <input placeholder="Search" style={{ border:'none', outline:'none', background:'transparent', width:'100%', fontSize:14 }} />
        </div>
        <button className="glass" style={{ padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer' }} onClick={() => alert('Notifications placeholder')}>🔔</button>
        <button className="glass" style={{ padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer' }} onClick={() => setDark(v => !v)} aria-label="Toggle dark mode">{dark ? '🌞' : '🌙'}</button>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{user.username}</span>
            <button 
              className="glass" 
              style={{ padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer', fontSize: 12 }}
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="content">
        {activeSidebarItem === 0 && <Dashboard />}
        {activeSidebarItem === 1 && <Analytics />}
        {activeSidebarItem === 2 && <Payments />}
        {activeSidebarItem === 3 && <Documents />}
        {activeSidebarItem === 4 && <Settings user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}


