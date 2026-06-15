import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import './Navbar.css';

const Navbar = ({ onOpenWaitlist }) => {
  const { balance, coinDelta } = useCoins();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-brand">
        CROEVO<span>AI</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          HOME
          <span className="hud-dot"></span>
        </NavLink>
        <NavLink to="/features" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          FEATURES
          <span className="hud-dot"></span>
        </NavLink>
        <NavLink to="/faq" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          FAQ
          <span className="hud-dot"></span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          PROFILE
          <span className="hud-dot"></span>
        </NavLink>
        <NavLink to="/wallet" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          WALLET
          <span className="hud-dot"></span>
        </NavLink>
      </div>

      {/* Coin Balance HUD */}
      <div className="coin-hud" onClick={() => navigate('/wallet')} title="Open Wallet">
        <span className="coin-hud-icon">🪙</span>
        <motion.span
          className="coin-hud-balance"
          key={balance}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          {balance.toLocaleString()}
        </motion.span>
        <AnimatePresence>
          {coinDelta && (
            <motion.span
              className={`coin-hud-delta ${coinDelta > 0 ? 'positive' : 'negative'}`}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              {coinDelta > 0 ? `+${coinDelta}` : coinDelta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <button onClick={onOpenWaitlist} className="nav-item nav-cta" style={{ border: 'none', cursor: 'pointer', background: 'var(--bright-cyan)' }}>
        LAUNCH SOON
      </button>
    </nav>
  );
};

export default Navbar;
