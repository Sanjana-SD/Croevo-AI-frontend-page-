import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onOpenWaitlist }) => {
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
      </div>
      <button onClick={onOpenWaitlist} className="nav-item nav-cta" style={{ border: 'none', cursor: 'pointer', background: 'var(--bright-cyan)' }}>
        LAUNCH SOON
      </button>
    </nav>
  );
};

export default Navbar;
