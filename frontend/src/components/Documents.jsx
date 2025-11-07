import React, { useState } from 'react';

export default function Documents() {
  const [documents] = useState([
    { id: 1, name: 'Project Proposal.pdf', size: '2.4 MB', date: '2024-01-15', type: 'PDF' },
    { id: 2, name: 'Financial Report Q4.xlsx', size: '1.8 MB', date: '2024-01-14', type: 'Excel' },
    { id: 3, name: 'Meeting Notes.docx', size: '456 KB', date: '2024-01-13', type: 'Word' },
    { id: 4, name: 'Design Mockups.sketch', size: '5.2 MB', date: '2024-01-12', type: 'Sketch' },
    { id: 5, name: 'Contract Agreement.pdf', size: '3.1 MB', date: '2024-01-11', type: 'PDF' },
    { id: 6, name: 'Invoice Template.docx', size: '234 KB', date: '2024-01-10', type: 'Word' },
  ]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'Excel': return '📊';
      case 'Word': return '📝';
      case 'Sketch': return '🎨';
      default: return '📎';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-1)' }}>
            Documents
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: '16px', margin: 0 }}>
            Manage your documents and files
          </p>
        </div>
        <button className="glass" style={{
          padding: '12px 24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          background: 'linear-gradient(135deg, var(--brand-1), var(--brand-2))',
          color: 'white'
        }}>
          + Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {documents.map((doc) => (
          <div key={doc.id} className="glass" style={{
            padding: '20px',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--card-shadow)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px' }}>{getFileIcon(doc.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{doc.size}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--glass-stroke)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{doc.date}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-stroke)',
                  background: 'var(--glass-bg)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--text-1)'
                }}>
                  View
                </button>
                <button style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-stroke)',
                  background: 'var(--glass-bg)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--text-1)'
                }}>
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

