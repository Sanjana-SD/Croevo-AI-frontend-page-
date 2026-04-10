import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GameLab.css';

/* ── keyword → built-in game resolver ── */
const KEYWORD_MAP = [
  { keys: ['snake', 'worm', 'slither'], game: 'snake' },
  { keys: ['brick', 'breaker', 'paddle', 'pong', 'ball'], game: 'brickbreaker' },
  { keys: ['platform', 'jump', 'run', 'hop', 'gap', 'climb'], game: 'platformer' },
  { keys: ['space', 'invader', 'shoot', 'laser', 'alien', 'bullet', 'gun', 'war'], game: 'spaceinvaders' },
  { keys: ['coin', 'collect', 'gold', 'pickup', 'treasure'], game: 'coincollector' },
];

const BUILTIN_PROMPTS = new Set([
  'dodge falling asteroids',
  'classic snake game',
  'break all the bricks with a ball',
  'jump between platforms and collect coins',
  'shoot alien invaders from space',
  'collect all the gold coins',
]);

function isBuiltinPrompt(text) {
  if (BUILTIN_PROMPTS.has(text)) return true;
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keys) {
      if (lower.includes(kw)) return true;
    }
  }
  return false;
}

const GameLab = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  /* ---- handle submit → navigate to game page ---- */
  const handleSubmit = () => {
    const text = prompt.trim() || 'asteroids';
    const builtin = isBuiltinPrompt(text);
    navigate('/game', { state: { prompt: text, builtin } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <section id="game-lab" className="game-lab">
      <div className="game-lab-inner">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="game-lab-heading">Game <span>Lab</span></h2>
          <p className="game-lab-subtitle">Describe a game. Play it instantly.</p>
        </motion.div>

        {/* Input */}
        <motion.div className="game-lab-input-area" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5 }}>
          <textarea
            className="game-lab-textarea"
            placeholder="e.g. a cat jumping over obstacles to collect fish..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <div className="game-lab-submit-row">
            <button className="game-lab-generate-btn" onClick={handleSubmit}>
              GENERATE
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GameLab;
