import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/GameLab.css';
import { GAME_STARTERS, resolveGame } from '../components/gameCore';

const GameView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const mode = qs.get('mode') || 'ai';
  const promptParam = qs.get('prompt') || '';

  const canvasRef = useRef(null);
  const iframeRef = useRef(null);
  const rafRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({});
  const [aiHtml, setAiHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTyping = () => false;
    const down = (e) => { if (isTyping()) return; keysRef.current[e.key] = true; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); };
    const up = (e) => { if (isTyping()) return; keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    // Load data from sessionStorage
    if (mode === 'ai') {
      const html = sessionStorage.getItem('aiGameHtml');
      if (html) {
        setAiHtml(html);
        setLoading(false);
      } else {
        // nothing to show
        setLoading(false);
      }
    } else {
      // builtin prompt either passed as query param or stored
      const prompt = promptParam || sessionStorage.getItem('builtinPrompt') || 'asteroids';
      const gameKey = resolveGame(prompt);
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = 600;
      canvas.height = 400;
      const starter = GAME_STARTERS[gameKey] || GAME_STARTERS['asteroids'];
      const game = starter(canvas, keysRef.current);
      gameRef.current = game;
      setLoading(false);

      function loop() { try { game.tick(); } catch (_) {} rafRef.current = requestAnimationFrame(loop); }
      rafRef.current = requestAnimationFrame(loop);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }
  }, [mode, promptParam]);

  const handleRestart = () => {
    if (mode === 'ai') {
      const iframe = iframeRef.current;
      if (iframe) {
        const src = iframe.srcdoc;
        iframe.srcdoc = '';
        setTimeout(() => { iframe.srcdoc = src; }, 50);
      }
    } else {
      if (gameRef.current && gameRef.current.reset) gameRef.current.reset();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // small feedback
      alert('URL copied to clipboard');
    } catch (e) {
      console.warn('copy failed', e);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 960 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} className="game-lab-tool-btn">Back</button>
          <div>
            <button onClick={handleRestart} className="game-lab-tool-btn">Restart</button>
            <button onClick={handleShare} className="game-lab-tool-btn" style={{ marginLeft: 8 }}>Share</button>
          </div>
        </div>

        <div className={`game-lab-canvas-wrapper`}>
          {loading && <div className="game-lab-placeholder">Loading...</div>}

          {mode === 'ai' && aiHtml && (
            <iframe
              ref={iframeRef}
              title="AI Generated Game"
              srcDoc={aiHtml}
              sandbox="allow-scripts"
              style={{ width: '100%', aspectRatio: '3 / 2', border: 'none', background: '#050810' }}
            />
          )}

          {mode === 'builtin' && (
            <canvas ref={canvasRef} />
          )}

          {(!aiHtml && mode === 'ai') && (
            <div className="game-lab-placeholder">No AI game found — go back and try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameView;
