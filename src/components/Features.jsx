import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Globe, Shield, Rocket, Layers } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: <Cpu size={32} />,
    title: "Neural Engine",
    description: "Deep learning models specialized in game mechanic generation.",
    color: "var(--accent-cyan)"
  },
  {
    icon: <Zap size={32} />,
    title: "Instant Build",
    description: "Go from prompt to prototype in under 30 seconds.",
    color: "var(--neon-purple)"
  },
  {
    icon: <Globe size={32} />,
    title: "Universal Export",
    description: "Deploy to Web, PC, and Mobile with zero configuration.",
    color: "var(--neon-green)"
  },
  {
    icon: <Shield size={32} />,
    title: "Secure Auth",
    description: "Blockchain-integrated asset ownership and security.",
    color: "var(--accent-cyan)"
  },
  {
    icon: <Rocket size={32} />,
    title: "Infinite Scale",
    description: "Serverless infrastructure that scales with your player base.",
    color: "var(--neon-purple)"
  },
  {
    icon: <Layers size={32} />,
    title: "Asset Synth",
    description: "Generate 3D models and textures with text descriptions.",
    color: "var(--neon-green)"
  }
];

const Features = ({ onOpenWaitlist }) => {
  return (
    <section id="features" className="features">
      <div className="features-grid">
        {features.map((f, i) => (
          <motion.div 
            key={i} 
            className="glass-panel feature-card" 
            onClick={onOpenWaitlist}
            whileHover={{ y: -10, borderColor: f.color, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon" style={{ color: f.color }}>{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-description">{f.description}</p>
            <div className="card-decoration" style={{ background: f.color }}></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
