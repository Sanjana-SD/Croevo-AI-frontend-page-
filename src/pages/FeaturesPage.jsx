import React from 'react';
import './FeaturesPage.css';

const skills = [
  {
    icon: '🧠',
    title: 'Neural Prompt Processing',
    description: 'Our advanced NLP engine translates your natural language descriptions into complex game logic and structural blueprints instantly.',
    stats: ['INT +50', 'SPD +30']
  },
  {
    icon: '✨',
    title: 'Generative Asset Synthesis',
    description: 'Automatically generate 2D/3D assets, textures, and environments tailored to your game\'s unique aesthetic.',
    stats: ['CRT +Max', 'LUK +10']
  },
  {
    icon: '⚙️',
    title: 'Real-time Logic Injection',
    description: 'Inject mechanics and behaviors on the fly. No compilation, no waiting. Just pure creativity in motion.',
    stats: ['AGI +40', 'TEC +25']
  },
  {
    icon: '🛡️',
    title: 'Community Governance',
    description: 'Share, trade, and evolve games within a player-owned ecosystem. The future of gaming is collaborative.',
    stats: ['CHR +20', 'DEF +15']
  }
];

const FeaturesPage = () => {
  return (
    <div className="features-page">
      <header className="page-header">
        <h1 className="brand-name">Tech Mastery</h1>
        <p className="subtitle">Unlocking the possibilities of AI-driven creation</p>
      </header>
      
      <div className="skill-tree-container">
        {skills.map((skill, index) => (
          <div key={index} className="skill-node">
            <div className="skill-icon-hex">{skill.icon}</div>
            <div className="skill-info">
              <h3 className="feature-title">{skill.title}</h3>
              <p className="feature-description">{skill.description}</p>
              <div className="skill-stats">
                {skill.stats.map((stat, sIndex) => (
                  <span key={sIndex} className="stat-chip">{stat}</span>
                ))}
              </div>
            </div>
            {index < skills.length - 1 && <div className="skill-line"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;
