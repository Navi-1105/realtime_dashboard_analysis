import React, { useState } from 'react';
import { login } from '../services/api.js';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      if (response.success && response.token) {
        // Store token in localStorage
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        onLogin(response.token, response.user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))', display: 'grid', placeItems: 'center', fontSize: 28 }}>
              📊
            </div>
          </div>
          <h1>Analytics Dashboard</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" style={{ 
              padding: '12px 16px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: 12, 
              color: '#ef4444',
              marginBottom: 20,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary login-button"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: 16, 
              fontWeight: 600,
              marginTop: 8,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo" style={{ marginTop: 24, padding: 16, background: 'rgba(124, 58, 237, 0.05)', borderRadius: 12, fontSize: 13, color: 'var(--text-2)' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Demo Credentials:</p>
          <div style={{ display: 'grid', gap: 4 }}>
            <div>👤 <strong>admin</strong> / admin123</div>
            <div>👤 <strong>demo</strong> / demo123</div>
            <div>👤 <strong>user</strong> / user123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

