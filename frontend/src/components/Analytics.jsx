import React from 'react';
import Dashboard from './Dashboard.jsx';

export default function Analytics() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-1)' }}>
          Analytics Overview
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '16px', margin: 0 }}>
          Real-time analytics and performance metrics
        </p>
      </div>
      <Dashboard />
    </div>
  );
}

