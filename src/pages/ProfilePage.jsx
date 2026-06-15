import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Award, TrendingUp, Zap, Shield, Palette, Gamepad2, Trophy } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [walletCoins, setWalletCoins] = useState(() => parseFloat(localStorage.getItem('croevo_coins') || '50'));
  const [lifetimeCoins, setLifetimeCoins] = useState(() => parseFloat(localStorage.getItem('croevo_lifetime_coins') || '50'));
  const [rigLevel, setRigLevel] = useState(() => parseInt(localStorage.getItem('croevo_rig_level') || '1', 10));
  const [servicesCount, setServicesCount] = useState(() => parseInt(localStorage.getItem('croevo_services_count') || '0', 10));
  const [gamesPlayed, setGamesPlayed] = useState(() => parseInt(localStorage.getItem('croevo_games_played') || '0', 10));
  const [totalScore, setTotalScore] = useState(() => parseInt(localStorage.getItem('croevo_total_score') || '0', 10));
  const [unlockedThemes, setUnlockedThemes] = useState(() => JSON.parse(localStorage.getItem('croevo_unlocked_themes') || '["default"]'));

  const RIG_NAMES = ['CPU Miner', 'GPU Mining Rig', 'ASIC Miner H6', 'Quantum Hash Matrix'];
  const currentRig = RIG_NAMES[Math.min(rigLevel - 1, 3)];

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="profile-title">Player Profile</h1>
        <div style={{ width: '80px' }} />
      </div>

      <div className="profile-grid">
        {/* User Card */}
        <div className="profile-card user-card">
          <div className="card-icon">
            <User size={40} />
          </div>
          <h2>Welcome Operator</h2>
          <p className="card-subtitle">Croevo Infinity Player</p>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">Level</span>
              <span className="stat-value">{Math.min(Math.floor(lifetimeCoins / 100) + 1, 99)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rank</span>
              <span className="stat-value" style={{ color: '#ffaa00' }}>Gold</span>
            </div>
          </div>
        </div>

        {/* Coins Card */}
        <div className="profile-card coins-card">
          <div className="card-icon" style={{ color: '#ffaa00' }}>
            <TrendingUp size={40} />
          </div>
          <h2>Wealth</h2>
          <div className="coins-display">
            <div className="coin-stat">
              <span className="coin-label">Current Balance</span>
              <span className="coin-value">🪙 {walletCoins.toFixed(2)}</span>
            </div>
            <div className="coin-stat">
              <span className="coin-label">Lifetime Earned</span>
              <span className="coin-value">💎 {lifetimeCoins.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Mining Rig Card */}
        <div className="profile-card rig-card">
          <div className="card-icon" style={{ color: '#00e5ff' }}>
            <Zap size={40} />
          </div>
          <h2>Mining Rig</h2>
          <p className="rig-name">{currentRig}</p>
          <p className="rig-level">Level {rigLevel} / 4</p>
          <div className="rig-progress">
            <div className="progress-bar" style={{ width: `${(rigLevel / 4) * 100}%` }} />
          </div>
        </div>

        {/* Services Card */}
        <div className="profile-card services-card">
          <div className="card-icon" style={{ color: '#ee4455' }}>
            <Shield size={40} />
          </div>
          <h2>Services</h2>
          <p className="services-count">{servicesCount} Deployed</p>
          <p className="services-desc">Active modifiers & enhancements</p>
          <div className="service-badges">
            <span className="badge">Themes: {unlockedThemes.length}</span>
          </div>
        </div>

        {/* Games Stats Card */}
        <div className="profile-card stats-card">
          <div className="card-icon" style={{ color: '#39d98a' }}>
            <Gamepad2 size={40} />
          </div>
          <h2>Gaming Stats</h2>
          <div className="game-stats-grid">
            <div className="game-stat">
              <span className="label">Games</span>
              <span className="value">{gamesPlayed}</span>
            </div>
            <div className="game-stat">
              <span className="label">Total Score</span>
              <span className="value">{totalScore}</span>
            </div>
          </div>
        </div>

        {/* Achievements Card */}
        <div className="profile-card achievements-card">
          <div className="card-icon" style={{ color: '#bc13fe' }}>
            <Trophy size={40} />
          </div>
          <h2>Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement unlocked">
              <span className="achievement-emoji">🎮</span>
              <span className="achievement-label">First Game</span>
            </div>
            <div className="achievement unlocked">
              <span className="achievement-emoji">💰</span>
              <span className="achievement-label">Rich Player</span>
            </div>
            <div className={`achievement ${walletCoins > 500 ? 'unlocked' : 'locked'}`}>
              <span className="achievement-emoji">👑</span>
              <span className="achievement-label">Millionaire</span>
            </div>
            <div className={`achievement ${rigLevel >= 3 ? 'unlocked' : 'locked'}`}>
              <span className="achievement-emoji">⚡</span>
              <span className="achievement-label">Tech Master</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="profile-actions">
        <button className="action-btn" onClick={() => navigate('/wallet')}>
          Go to Wallet
        </button>
        <button className="action-btn" onClick={() => navigate('/')}>
          Play Games
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
