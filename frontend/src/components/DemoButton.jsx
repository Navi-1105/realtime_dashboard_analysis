DOimport React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function DemoButton() {
  const { token } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerateDemo() {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration: 30,
          rps: 20,
          users: 5
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start demo generation');
      }

      const data = await response.json();
      console.log('Demo traffic started:', data);
      
    } catch (err) {
      console.error('Demo generation failed:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="demo-button-container">
      <button
        onClick={handleGenerateDemo}
        disabled={isGenerating}
        className={`demo-button ${isGenerating ? 'loading' : ''}`}
      >
        {isGenerating ? 'Generating...' : 'Generate Demo Data'}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <style jsx>{`
        .demo-button {
          padding: 10px 20px;
          font-size: 16px;
          border-radius: 4px;
          border: none;
          background: #3498db;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-button:hover {
          background: #2980b9;
        }

        .demo-button.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-message {
          color: #e74c3c;
          margin-top: 10px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}