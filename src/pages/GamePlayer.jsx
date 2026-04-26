import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CareersPage.css';

const GamePlayer = () => {
  const iframeRef = useRef(null);
  const [html, setHtml] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('aiGameHtml');
    if (stored) {
      setHtml(stored);
      // Optionally remove so back/refresh won't re-open unexpectedly
      // sessionStorage.removeItem('aiGameHtml');
    } else {
      // Nothing to play — go back
      setTimeout(() => navigate(-1), 800);
    }
  }, [navigate]);

  return (
    <div style={{ padding: 20, minHeight: '60vh' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>Back</button>
        <h2 style={{ margin: 0 }}>Play Generated Game</h2>
      </div>

      {html ? (
        <iframe
          ref={iframeRef}
          title="AI Game Player"
          srcDoc={html}
          sandbox="allow-scripts"
          style={{ width: '100%', maxWidth: 960, height: 640, border: '1px solid rgba(0,0,0,0.12)', display: 'block' }}
        />
      ) : (
        <div>No game found. Redirecting...</div>
      )}
    </div>
  );
};

export default GamePlayer;
