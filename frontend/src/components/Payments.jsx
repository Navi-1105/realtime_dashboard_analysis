import React, { useState } from 'react';

export default function Payments() {
  const [transactions] = useState([
    { id: 1, date: '2024-01-15', amount: 1250, status: 'Completed', description: 'Payment from Client A' },
    { id: 2, date: '2024-01-14', amount: 850, status: 'Pending', description: 'Payment from Client B' },
    { id: 3, date: '2024-01-13', amount: 2100, status: 'Completed', description: 'Payment from Client C' },
    { id: 4, date: '2024-01-12', amount: 450, status: 'Failed', description: 'Payment from Client D' },
    { id: 5, date: '2024-01-11', amount: 3200, status: 'Completed', description: 'Payment from Client E' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Failed': return '#ef4444';
      default: return 'var(--text-2)';
    }
  };

  const totalAmount = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-1)' }}>
          Payments
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '16px', margin: 0 }}>
          Manage and track your payments
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-1)' }}>
            ₹{totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>Pending Payments</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-1)' }}>
            {transactions.filter(t => t.status === 'Pending').length}
          </div>
        </div>
        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '8px' }}>Total Transactions</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-1)' }}>
            {transactions.length}
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: '16px', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 20px', color: 'var(--text-1)' }}>
          Recent Transactions
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-stroke)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid var(--glass-stroke)' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-1)' }}>{transaction.date}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-1)' }}>{transaction.description}</td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>
                    ₹{transaction.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: `${getStatusColor(transaction.status)}20`,
                      color: getStatusColor(transaction.status)
                    }}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

