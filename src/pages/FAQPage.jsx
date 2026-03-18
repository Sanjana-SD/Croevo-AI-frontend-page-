import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Database } from 'lucide-react';
import './FAQPage.css';

const faqs = [
  {
    k: "What exactly is Croevo AI?",
    v: "Croevo AI is a next-generation game engine that uses advanced generative models to turn natural language prompts into fully playable games, assets, and logic systems."
  },
  {
    k: "Do I need coding knowledge?",
    v: "No. Our platform is designed for creators of all levels. You describe what you want in plain English, and our AI handles the underlying code and assets."
  },
  {
    k: "Can I monetize my games?",
    v: "Absolutely. Games created on Croevo are owned by the creators, with integrated tools for sharing and future monetization within our ecosystem."
  },
  {
    k: "What platforms are supported?",
    v: "Initially, games are optimized for web and mobile browsers, with export options for standalone platforms coming in later versions."
  },
  {
    k: "When is the full launch?",
    v: "We are currently in private beta. Join the waitlist to get early access as we scale our infrastructure."
  }
];

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="faq-page">
      <motion.header 
        className="page-header"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="neon-text-purple" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Database size={24} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', letterSpacing: '2px' }}>VIRTUAL_VOL_01</span>
        </div>
        <h1 className="brand-name">Data Archives</h1>
        <p className="subtitle">Frequently Asked Questions & System Intel</p>
      </motion.header>
      
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index} 
            className={`glass-panel faq-item ${activeIndex === index ? 'active' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button 
              className="faq-question" 
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <span>{faq.k}</span>
              <motion.span 
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                className="faq-icon"
              >
                <ChevronDown size={18} />
              </motion.span>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="faq-answer-wrap"
                >
                  <div className="faq-answer">
                    {faq.v}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
