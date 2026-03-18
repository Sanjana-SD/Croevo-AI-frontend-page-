import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Diamond, Infinity } from 'lucide-react';
import './Creators.css';

const reasons = [
  {
    icon: <Rocket size={40} />,
    title: 'Zero Barrier Entry',
    desc: 'No more learning complex syntax or engine internals. Use natural language to build what you imagine instantly.',
    color: 'var(--accent-cyan)'
  },
  {
    icon: <Diamond size={40} />,
    title: 'Instant Monetization',
    desc: 'Our ecosystem is built for creators to earn from day one. Tokenized assets and player-driven economies.',
    color: 'var(--neon-purple)'
  },
  {
    icon: <Infinity size={40} />,
    title: 'Infinite Scalability',
    desc: 'From a small platformer to a massive multiplayer world, Croevo AI scales your vision without additional overhead.',
    color: 'var(--neon-green)'
  }
];

const Creators = () => {
  return (
    <section className="creators-section">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="brand-name">Why Join the Revolution?</h2>
        <p className="subtitle">Empowering the next generation of game architects</p>
      </motion.div>
      
      <div className="creator-grid">
        {reasons.map((reason, index) => (
          <motion.div 
            key={index} 
            className="glass-panel creator-card"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ y: -10, borderColor: reason.color }}
          >
            <span className="creator-icon" style={{ color: reason.color }}>{reason.icon}</span>
            <h3>{reason.title}</h3>
            <p>{reason.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Creators;
