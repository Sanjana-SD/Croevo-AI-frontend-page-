import React from 'react';
import './CareersPage.css';

const quests = [
  {
    role: 'Engine Arch-Mage',
    level: 'Lvl 80+',
    type: 'Backend Architecture',
    reward: 'Competitive Loot + Equity',
    desc: 'Wield the power of Python and Rust to build the core generative heart of Croevo.'
  },
  {
    role: 'Pixel Paladin',
    level: 'Lvl 60+',
    type: 'Frontend Wizardry',
    reward: 'Global Impact + Remote XP',
    desc: 'Craft premium HUDs and interfaces that bridge the gap between human and AI.'
  },
  {
    role: 'Community Guardian',
    level: 'Lvl 50+',
    type: 'Culture & Growth',
    reward: 'Passive Buffs + Travel',
    desc: 'Nurture the world\'s most creative gaming community and lead the revolution.'
  }
];

const CareersPage = () => {
  return (
    <div className="careers-page">
      <header className="page-header">
        <h1 className="brand-name">Join the Guild</h1>
        <p className="subtitle">Choose your class and embark on the ultimate quest</p>
      </header>
      
      <div className="quest-grid">
        {quests.map((quest, index) => (
          <div key={index} className="quest-card">
            <div className="quest-details">
              <div className="quest-meta">
                <span>{quest.type}</span>
                <span>•</span>
                <span>{quest.level}</span>
              </div>
              <h3>{quest.role}</h3>
              <p className="feature-description" style={{ fontSize: '14px' }}>{quest.desc}</p>
            </div>
            <div className="quest-reward">
              <span className="reward-amount">{quest.reward}</span>
              <button className="btn btn-primary btn-quest">ACCEPT QUEST</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareersPage;
