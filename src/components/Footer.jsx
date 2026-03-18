import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="system-status">
          SYSTEM_VERSION: 1.0.4 // STATUS: OPTIMAL
        </div>
        <div className="social-links">
          <a href="#">TWITTER</a>
          <a href="#">DISCORD</a>
          <a href="#">GITHUB</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
