import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = ({ onOpenWaitlist }) => {
  const [promptContent, setPromptContent] = useState('');
  const targetPrompt = "Create a sci-fi rogue-like with neon aesthetics...";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setPromptContent(targetPrompt.slice(0, index));
      index++;
      if (index > targetPrompt.length) clearInterval(timer);
    }, 50).hero;
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">
          Turn Ideas Into
          <span>Playable Reality</span>
        </h1>
        <p className="subtitle">The AI-powered engine for the next generation of games.</p>
      </motion.div>

      <motion.div 
        className="glass-panel terminal-window"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="terminal-header">
          <div className="dots">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
          </div>
          <div className="terminal-status">AI_ENGINE::READY</div>
        </div>
        <div className="terminal-body">
          <div className="prompt-line">
            <span className="prompt-user">USER@CROEVO:~$</span> {promptContent}
          </div>
          {promptContent.length === targetPrompt.length && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="prompt-line"
              style={{ marginTop: '1rem' }}
            >
              <span className="prompt-engine">AI ENGINE:</span> Generating assets, logic, and environment... <span className="neon-text-cyan">[DONE]</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div 
        className="cta-group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <button onClick={onOpenWaitlist} className="btn btn-primary">Join the Revolution</button>
        <a href="#features" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Explore Mechanics</a>
      </motion.div>
    </section>
  );
};

export default Hero;
