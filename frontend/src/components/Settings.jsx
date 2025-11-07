import React, { useState } from 'react';

export default function Settings({ user, onLogout }) {
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoRefresh: true,
    refreshInterval: 30
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-1)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '16px', margin: 0 }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px', color: 'var(--text-1)' }}>
          Profile Information
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '8px' }}>
              Username
            </label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-stroke)',
                background: 'var(--glass-bg)',
                color: 'var(--text-1)',
                fontSize: '14px',
                opacity: 0.6
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-stroke)',
                background: 'var(--glass-bg)',
                color: 'var(--text-1)',
                fontSize: '14px',
                opacity: 0.6
              }}
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px', color: 'var(--text-1)' }}>
          Preferences
        </h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px' }}>
                Push Notifications
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                Receive notifications for important updates
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: settings.notifications ? 'var(--brand-1)' : 'var(--glass-stroke)',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: settings.notifications ? 'translateX(24px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px' }}>
                Email Alerts
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                Get email notifications for important events
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: settings.emailAlerts ? 'var(--brand-1)' : 'var(--glass-stroke)',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: settings.emailAlerts ? 'translateX(24px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px' }}>
                Auto Refresh
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                Automatically refresh dashboard data
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: settings.autoRefresh ? 'var(--brand-1)' : 'var(--glass-stroke)',
                borderRadius: '24px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '18px',
                  width: '18px',
                  left: '3px',
                  bottom: '3px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  transform: settings.autoRefresh ? 'translateX(24px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>

          {settings.autoRefresh && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '8px' }}>
                Refresh Interval: {settings.refreshInterval} seconds
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="10"
                value={settings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px', color: 'var(--text-1)' }}>
          Account Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="glass"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid var(--glass-stroke)',
              background: 'var(--glass-bg)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-1)'
            }}
          >
            Change Password
          </button>
          <button
            className="glass"
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid var(--glass-stroke)',
              background: 'var(--glass-bg)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-1)'
            }}
          >
            Export Data
          </button>
          <button
            className="glass"
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ef4444'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

