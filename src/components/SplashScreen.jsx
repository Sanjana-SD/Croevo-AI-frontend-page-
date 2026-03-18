import React from 'react';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="centered-content">
      <div className="splash-screen">
        <div className="gamepad-container">
          <svg
            className="gamepad-icon"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gamepad Body Outline */}
            <path
              d="M30 40C20 40 15 50 15 65C15 80 25 85 35 85C45 85 50 80 50 75C50 80 55 85 65 85C75 85 85 80 85 65C85 50 80 40 70 40H30Z"
              stroke="#00bfff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* D-Pad Detail */}
            <path
              d="M25 60H35M30 55V65"
              stroke="#00bfff"
              strokeWidth="1"
              strokeLinecap="round"
            />
            {/* Buttons Detail */}
            <circle cx="70" cy="55" r="2" stroke="#00bfff" strokeWidth="1" />
            <circle cx="70" cy="65" r="2" stroke="#00bfff" strokeWidth="1" />
            <circle cx="65" cy="60" r="2" stroke="#00bfff" strokeWidth="1" />
            <circle cx="75" cy="60" r="2" stroke="#00bfff" strokeWidth="1" />
            
            {/* Neural/Circuit Lines Detail */}
            <path
              d="M50 40V30M50 30L40 20M50 30L60 20"
              stroke="#00bfff"
              strokeWidth="0.5"
              strokeOpacity="0.6"
            />
            <path
              d="M30 40C30 35 35 30 40 30"
              stroke="#00bfff"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
            <path
              d="M70 40C70 35 65 30 60 30"
              stroke="#00bfff"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
            
            {/* Center Connection */}
            <path
              d="M48 55H52M48 60H52"
              stroke="#00bfff"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="brand-name">Croevo AI</h1>
        <p className="subtitle">Elevating Gaming Intelligence</p>
      </div>
    </div>
  );
};

export default SplashScreen;
