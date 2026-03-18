import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './SystemMonitor.css';

const SystemMonitor = () => {
  const [stats, setStats] = useState({
    cpu: 45,
    mem: 62,
    net: 120
  });

  const [logs, setLogs] = useState([
    'Initializing neural core...',
    'Kernel optimized for gaming.',
    'System status: OPTIMAL'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: Math.floor(Math.random() * 30 + 40),
        mem: Math.floor(Math.random() * 10 + 60),
        net: Math.floor(Math.random() * 50 + 100)
      });
      
      const newLogs = [...logs];
      const actions = ['Asset synth updated', 'Logic chain verified', 'Syncing user intent...', 'Buffer clear [0x2A]'];
      newLogs.shift();
      newLogs.push(actions[Math.floor(Math.random() * actions.length)]);
      setLogs(newLogs);
    }, 3000);
    return () => clearInterval(interval);
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel system-monitor"
    >
      <div className="monitor-header">
        <span>SYS_MONITOR_HUD</span>
        <span>v2.0.4</span>
      </div>
      
      <div className="stat-item">
        <div className="stat-label">
          <span>NEURAL_LOAD</span>
          <span>{stats.cpu}%</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div 
            className="progress-bar-fill"
            animate={{ width: `${stats.cpu}%` }}
          />
        </div>
      </div>

      <div className="stat-item">
        <div className="stat-label">
          <span>MEM_BUFFER</span>
          <span>{stats.mem}%</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div 
            className="progress-bar-fill"
            animate={{ width: `${stats.mem}%` }}
            style={{ background: 'var(--neon-purple)', boxShadow: '0 0 10px var(--glow-purple)' }}
          />
        </div>
      </div>

      <div className="live-log">
        {logs.map((log, i) => (
          <div key={i} style={{ opacity: (i + 1) / logs.length }}>{`> ${log}`}</div>
        ))}
      </div>
    </motion.div>
  );
};

export default SystemMonitor;
