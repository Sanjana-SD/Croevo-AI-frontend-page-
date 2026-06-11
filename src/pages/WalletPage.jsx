<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Shield, Zap, Sparkles, Hammer, Cpu, Terminal, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WalletPage.css';

const RIG_DETAILS = {
  1: { name: 'CPU Miner', rate: 0.5, cost: 0, icon: Cpu, desc: 'Uses idle processor threads to mine coins.' },
  2: { name: 'GPU Mining Rig', rate: 2.0, cost: 50, icon: Hammer, desc: 'Employs graphics processing units for faster hashing.' },
  3: { name: 'ASIC Miner H6', rate: 8.0, cost: 150, icon: Terminal, desc: 'Dedicated integrated circuit optimized for coin mining.' },
  4: { name: 'Quantum Hash Matrix', rate: 30.0, cost: 400, icon: Sparkles, desc: 'Experimental subatomic matrix rendering massive returns.' }
};

const WalletPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState('');

  // Core coin state
  const [walletCoins, setWalletCoins] = useState(() => {
    return parseFloat(localStorage.getItem('croevo_coins') || '50');
  });

  const [lifetimeCoins, setLifetimeCoins] = useState(() => {
    return parseFloat(localStorage.getItem('croevo_lifetime_coins') || '50');
  });

  // Idle Mining Level State (1 to 4)
  const [rigLevel, setRigLevel] = useState(() => {
    return parseInt(localStorage.getItem('croevo_rig_level') || '1', 10);
  });

  // Services state
  const [shieldActive, setShieldActive] = useState(() => {
    return localStorage.getItem('croevo_shield_active') === 'true';
  });

  const [speedHackActive, setSpeedHackActive] = useState(() => {
    return localStorage.getItem('croevo_speed_hack_active') === 'true';
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('croevo_theme') || 'default';
  });

  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    return JSON.parse(localStorage.getItem('croevo_unlocked_themes') || '["default"]');
  });

  const [servicesCount, setServicesCount] = useState(() => {
    return parseInt(localStorage.getItem('croevo_services_count') || '0', 10);
  });

  // Transaction history state
  const [logs, setLogs] = useState(() => {
    const defaultLogs = [
      { time: new Date().toLocaleTimeString(), text: 'Wallet initialized with starter assets.' }
    ];
    return JSON.parse(localStorage.getItem('croevo_transactions') || JSON.stringify(defaultLogs));
  });

  // Floating text click coordinates
  const [clickAuras, setClickAuras] = useState([]);
  const clickIdRef = useRef(0);

  // Sync wallet coins
  useEffect(() => {
    localStorage.setItem('croevo_coins', walletCoins.toString());
  }, [walletCoins]);

  useEffect(() => {
    localStorage.setItem('croevo_lifetime_coins', lifetimeCoins.toString());
  }, [lifetimeCoins]);

  // Sync rig levels
  useEffect(() => {
    localStorage.setItem('croevo_rig_level', rigLevel.toString());
  }, [rigLevel]);

  // Sync theme configurations
  useEffect(() => {
    localStorage.setItem('croevo_theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem('croevo_unlocked_themes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  // Sync counts and powers
  useEffect(() => {
    localStorage.setItem('croevo_services_count', servicesCount.toString());
  }, [servicesCount]);

  // Idle Mining loop
  useEffect(() => {
    const rate = RIG_DETAILS[rigLevel]?.rate || 0.5;
    const interval = setInterval(() => {
      setWalletCoins(prev => {
        const added = rate / 10; // tick every 100ms for smooth counter flow
        setLifetimeCoins(life => Number((life + added).toFixed(2)));
        return Number((prev + added).toFixed(2));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [rigLevel]);

  // Cooldown & Logger helpers
  const addLog = (text) => {
    const newLogs = [{ time: new Date().toLocaleTimeString(), text }, ...logs].slice(0, 10);
    setLogs(newLogs);
    localStorage.setItem('croevo_transactions', JSON.stringify(newLogs));
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Clicker handler
  const handleCoinClick = (e) => {
    // Generate floating text offset
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add CC
    setWalletCoins(prev => Number((prev + 1.0).toFixed(2)));
    setLifetimeCoins(life => Number((life + 1.0).toFixed(2)));

    // Add visual click aura
    const newAura = { id: clickIdRef.current++, x, y };
    setClickAuras(prev => [...prev, newAura]);

    // Clean up click aura
    setTimeout(() => {
      setClickAuras(prev => prev.filter(c => c.id !== newAura.id));
    }, 850);
  };

  // Buy Mining Rig
  const handlePurchaseRig = (level) => {
    const detail = RIG_DETAILS[level];
    if (walletCoins < detail.cost) {
      showToastMsg('Insufficient coins to upgrade rig!');
      return;
    }
    setWalletCoins(prev => Number((prev - detail.cost).toFixed(2)));
    setRigLevel(level);
    addLog(`Upgraded mining rig to Level ${level}: ${detail.name}.`);
    showToastMsg(`Upgraded to ${detail.name}!`);
  };

  // Shop exchange handler
  const handleExchange = (serviceId, cost) => {
    if (walletCoins < cost) {
      showToastMsg('Insufficient Croevo Coins!');
      return;
    }

    if (serviceId === 'theme-cyberpunk') {
      if (unlockedThemes.includes('cyberpunk')) {
        const newTheme = activeTheme === 'cyberpunk' ? 'default' : 'cyberpunk';
        setActiveTheme(newTheme);
        addLog(`Toggled Cyberpunk theme to ${newTheme === 'cyberpunk' ? 'Active' : 'Inactive'}.`);
        showToastMsg(newTheme === 'cyberpunk' ? 'Cyberpunk Theme Active!' : 'Default Theme Active');
      } else {
        setWalletCoins(prev => Number((prev - cost).toFixed(2)));
        setUnlockedThemes(prev => [...prev, 'cyberpunk']);
        setActiveTheme('cyberpunk');
        setServicesCount(c => c + 1);
        addLog('Exchanged coins to unlock Cyberpunk Theme.');
        showToastMsg('Cyberpunk Theme Unlocked & Active!');
      }
    } else if (serviceId === 'theme-neon-purple') {
      if (unlockedThemes.includes('neon-purple')) {
        const newTheme = activeTheme === 'neon-purple' ? 'default' : 'neon-purple';
        setActiveTheme(newTheme);
        addLog(`Toggled Neon Purple theme to ${newTheme === 'neon-purple' ? 'Active' : 'Inactive'}.`);
        showToastMsg(newTheme === 'neon-purple' ? 'Neon Purple Theme Active!' : 'Default Theme Active');
      } else {
        setWalletCoins(prev => Number((prev - cost).toFixed(2)));
        setUnlockedThemes(prev => [...prev, 'neon-purple']);
        setActiveTheme('neon-purple');
        setServicesCount(c => c + 1);
        addLog('Exchanged coins to unlock Neon Purple Theme.');
        showToastMsg('Neon Purple Theme Unlocked & Active!');
      }
    } else if (serviceId === 'shield') {
      setWalletCoins(prev => Number((prev - cost).toFixed(2)));
      setShieldActive(true);
      localStorage.setItem('croevo_shield_active', 'true');
      setServicesCount(c => c + 1);
      addLog('Purchased Shield Barrier custom modifier for next game run.');
      showToastMsg('Shield Barrier loaded for next game run!');
    } else if (serviceId === 'ai-boost') {
      setWalletCoins(prev => Number((prev - cost).toFixed(2)));
      localStorage.setItem('croevo_ai_boost_active', 'true');
      setServicesCount(c => c + 1);
      addLog('Purchased AI Prompt Charger boost.');
      showToastMsg('AI Prompt Charger activated! Visual instructions loaded in Editor.');
    } else if (serviceId === 'speed-hack') {
      setWalletCoins(prev => Number((prev - cost).toFixed(2)));
      setSpeedHackActive(true);
      localStorage.setItem('croevo_speed_hack_active', 'true');
      setServicesCount(c => c + 1);
      addLog('Purchased Speed Customizer mod to slow obstacles.');
      showToastMsg('Speed Customizer loaded for next game run!');
    }
  };

  const currentRig = RIG_DETAILS[rigLevel];
  const nextRigLevel = rigLevel < 4 ? rigLevel + 1 : null;
  const nextRig = nextRigLevel ? RIG_DETAILS[nextRigLevel] : null;

  return (
    <div className={`wallet-page-container theme-${activeTheme}`}>
      <div className="wallet-header-section">
        <h1 className="wallet-main-heading">Croevo <span>Coins Dashboard</span></h1>
        <p className="wallet-subheading">Generate hashes, manage automated rigs, and exchange coins for AI operations.</p>
      </div>

      <div className="wallet-layout-grid">
        {/* LEFT COLUMN: Clicker & Dashboard stats */}
        <div className="wallet-left-col">
          {/* Section 1: Core Clicker */}
          <div className="wallet-panel clicker-panel">
            <h2 className="panel-heading">Manual Hashing</h2>
            <p className="panel-subheading">Click the golden coin matrix to manually increment hashes</p>
            
            <div className="clicker-coin-wrapper">
              <button className="gold-coin-button" onClick={handleCoinClick}>
                <div className="gold-coin-inner">
                  <Coins className="coin-core-icon" />
                </div>
                {/* Click floating indicators */}
                <AnimatePresence>
                  {clickAuras.map(aura => (
                    <motion.span
                      key={aura.id}
                      className="click-plus-one"
                      initial={{ opacity: 1, scale: 0.8, x: aura.x, y: aura.y }}
                      animate={{ opacity: 0, y: aura.y - 120, scale: 1.4, rotate: (aura.id % 2 === 0 ? 15 : -15) }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      +1.0 CC
                    </motion.span>
                  ))}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Section 2: Rig levels & Upgrades */}
          <div className="wallet-panel mining-upgrades-panel">
            <h2 className="panel-heading">Rig Customizer</h2>
            <p className="panel-subheading">Level up automated cloud miners to generate idle hashes</p>
            
            <div className="rig-status-card">
              <div className="rig-status-left">
                <Cpu size={24} className="rig-glow-icon" />
                <div>
                  <span className="rig-label">ACTIVE RIG</span>
                  <span className="rig-value">{currentRig.name}</span>
                </div>
              </div>
              <div className="rig-status-right">
                <span className="rig-label">AUTO-MINE RATE</span>
                <span className="rig-value">+{currentRig.rate.toFixed(1)} CC/s</span>
              </div>
            </div>

            {nextRig && (
              <div className="next-rig-card">
                <div className="next-rig-header">
                  <div className="next-title-col">
                    <span className="next-label">UPGRADE TO LEVEL {nextRigLevel}</span>
                    <span className="next-name">{nextRig.name}</span>
                  </div>
                  <button 
                    className="rig-upgrade-btn"
                    onClick={() => handlePurchaseRig(nextRigLevel)}
                    disabled={walletCoins < nextRig.cost}
                  >
                    UPGRADE FOR {nextRig.cost} CC
                  </button>
                </div>
                <p className="next-rig-desc">{nextRig.desc} (Boosts rate to +{nextRig.rate} CC/sec)</p>
              </div>
            )}
            
            <div className="all-rigs-preview">
              {Object.keys(RIG_DETAILS).map(lvl => {
                const level = parseInt(lvl, 10);
                const isOwned = level <= rigLevel;
                const RigIcon = RIG_DETAILS[level].icon;
                return (
                  <div key={level} className={`rig-preview-icon ${isOwned ? 'owned' : ''} ${level === rigLevel ? 'active' : ''}`}>
                    <RigIcon size={16} />
                    <span>Lvl {level}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Statistics, Shop, Logs */}
        <div className="wallet-right-col">
          {/* Statistics Card */}
          <div className="wallet-panel stats-panel">
            <h2 className="panel-heading">Financial Overview</h2>
            
            <div className="stats-dashboard-grid">
              <div className="stat-card-inner">
                <span className="label">BALANCE</span>
                <span className="value text-gold">🪙 {walletCoins.toFixed(2)} CC</span>
              </div>
              <div className="stat-card-inner">
                <span className="label">AUTO HASH RATE</span>
                <span className="value text-cyan">⚡ +{currentRig.rate.toFixed(1)}/s</span>
              </div>
              <div className="stat-card-inner">
                <span className="label">LIFETIME ACCRUED</span>
                <span className="value">{lifetimeCoins.toFixed(1)} CC</span>
              </div>
              <div className="stat-card-inner">
                <span className="label">SERVICES DEPLOYED</span>
                <span className="value">{servicesCount} Items</span>
              </div>
            </div>
          </div>

          {/* Shop Card */}
          <div className="wallet-panel shop-panel">
            <h2 className="panel-heading">Services Exchange Shop</h2>
            <p className="panel-subheading">Exchange accumulated coins for modifiers inside the Game Lab</p>

            <div className="wallet-shop-grid">
              {/* Cyberpunk Theme */}
              <div className={`wallet-shop-card ${activeTheme === 'cyberpunk' ? 'selected' : ''}`}>
                <div className="shop-details">
                  <span className="title">Cyberpunk Gold Layout</span>
                  <span className="desc">Recolors interface highlights to Cyberpunk neon gold</span>
                </div>
                <button 
                  className={`shop-btn ${unlockedThemes.includes('cyberpunk') ? 'owned' : ''}`}
                  onClick={() => handleExchange('theme-cyberpunk', 15)}
                >
                  {unlockedThemes.includes('cyberpunk') ? (
                    activeTheme === 'cyberpunk' ? 'ACTIVE' : 'USE'
                  ) : (
                    '15 CC'
                  )}
                </button>
              </div>

              {/* Neon Purple Theme */}
              <div className={`wallet-shop-card ${activeTheme === 'neon-purple' ? 'selected' : ''}`}>
                <div className="shop-details">
                  <span className="title">Neon Purple Layout</span>
                  <span className="desc">Recolors interface highlights to cyber purple & violet</span>
                </div>
                <button 
                  className={`shop-btn ${unlockedThemes.includes('neon-purple') ? 'owned' : ''}`}
                  onClick={() => handleExchange('theme-neon-purple', 15)}
                >
                  {unlockedThemes.includes('neon-purple') ? (
                    activeTheme === 'neon-purple' ? 'ACTIVE' : 'USE'
                  ) : (
                    '15 CC'
                  )}
                </button>
              </div>

              {/* Shield Barrier */}
              <div className={`wallet-shop-card ${shieldActive ? 'active-power' : ''}`}>
                <div className="shop-details">
                  <span className="title">Shield Barrier Mod</span>
                  <span className="desc">Grants +2 extra lives or blocks collision once on next game run</span>
                </div>
                <button 
                  className={`shop-btn ${shieldActive ? 'loaded' : ''}`}
                  onClick={() => handleExchange('shield', 25)}
                  disabled={shieldActive}
                >
                  {shieldActive ? 'LOADED' : '25 CC'}
                </button>
              </div>

              {/* AI Assistant boost */}
              <div className="wallet-shop-card">
                <div className="shop-details">
                  <span className="title">AI Prompt Charger</span>
                  <span className="desc">Loads a polished visual enhancement command into the editor</span>
                </div>
                <button 
                  className="shop-btn"
                  onClick={() => handleExchange('ai-boost', 30)}
                >
                  30 CC
                </button>
              </div>

              {/* Speed Customizer */}
              <div className={`wallet-shop-card ${speedHackActive ? 'active-power' : ''}`}>
                <div className="shop-details">
                  <span className="title">Speed Customizer</span>
                  <span className="desc">Slows built-in game obstacles/enemies by 35% on next run</span>
                </div>
                <button 
                  className={`shop-btn ${speedHackActive ? 'loaded' : ''}`}
                  onClick={() => handleExchange('speed-hack', 40)}
                  disabled={speedHackActive}
                >
                  {speedHackActive ? 'LOADED' : '40 CC'}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Logs */}
          <div className="wallet-panel logs-panel">
            <h2 className="panel-heading"><Terminal size={14} style={{ marginRight: 6 }} /> Transaction Ledger</h2>
            <div className="logs-container">
              {logs.map((log, idx) => (
                <div key={idx} className="log-row">
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-text">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Actions Area */}
      <div className="deploy-cta-container">
        <div className="deploy-cta-card">
          <div className="cta-left">
            <TrendingUp size={24} className="text-cyan animate-pulse" />
            <div>
              <h3>Ready to test enhancements?</h3>
              <p>Head to the Game Lab workspace. Modifiers will automatically deploy on game start.</p>
            </div>
          </div>
          <button className="cta-play-btn" onClick={() => navigate('/')}>
            <span>ENTER GAME LAB</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Toast popup */}
      <div className={`wallet-toast ${toast ? 'visible' : ''}`}>{toast}</div>
=======
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '../context/CoinContext';
import './WalletPage.css';

const SERVICES = [
  {
    id: 'ai-game-gen',
    icon: '🎮',
    title: 'AI Game Generation',
    description: 'Generate a custom AI-powered game from a text prompt.',
    cost: 100,
  },
  {
    id: 'asset-pack',
    icon: '🎨',
    title: 'Premium Asset Pack',
    description: 'Unlock exclusive 2D/3D assets for your generated games.',
    cost: 250,
  },
  {
    id: 'priority-queue',
    icon: '⚡',
    title: 'Priority Queue',
    description: 'Skip the generation queue and get instant results.',
    cost: 150,
  },
  {
    id: 'custom-skin',
    icon: '🖌️',
    title: 'Custom Game Skin',
    description: 'Apply unique visual themes to your generated games.',
    cost: 200,
  },
  {
    id: 'pro-unlock',
    icon: '🚀',
    title: 'Pro Feature Unlock',
    description: 'Access advanced AI features and experimental models.',
    cost: 500,
  },
];

const EARN_METHODS = [
  { icon: '🎁', title: 'Welcome Bonus', amount: 500 },
  { icon: '☀️', title: 'Daily Login', amount: 50 },
  { icon: '📝', title: 'Join Waitlist', amount: 100 },
  { icon: '🔍', title: 'Explore Features', amount: 10 },
  { icon: '🕹️', title: 'Generate a Game', amount: 25 },
];

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const WalletPage = () => {
  const { balance, transactions, canClaimDaily, claimDailyReward, spendCoins } = useCoins();
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBuy = (service) => {
    const success = spendCoins(service.cost, `Purchased: ${service.title}`);
    if (success) {
      showToast(`✅ ${service.title} unlocked!`);
    } else {
      showToast(`❌ Not enough CroCoins!`);
    }
  };

  const handleDailyClaim = () => {
    const success = claimDailyReward();
    if (success) {
      showToast('☀️ +50 CroCoins claimed!');
    }
  };

  return (
    <div className="wallet-page">
      {/* Header */}
      <motion.header
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Cro<span>Wallet</span></h1>
        <p className="subtitle">Earn, spend, and manage your CroCoins</p>
      </motion.header>

      {/* Balance Hero */}
      <motion.div
        className="balance-hero"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="balance-coin-icon">🪙</div>
        <motion.div
          className="balance-amount"
          key={balance}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {balance.toLocaleString()}
        </motion.div>
        <div className="balance-label">CroCoins</div>
        <button
          className="daily-reward-btn"
          onClick={handleDailyClaim}
          disabled={!canClaimDaily()}
        >
          {canClaimDaily() ? (
            <>Claim Daily Reward<span className="reward-sparkle">✨</span></>
          ) : (
            'Already Claimed Today'
          )}
        </button>
      </motion.div>

      {/* Service Store */}
      <motion.section
        className="service-store"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="wallet-section-title">🛒 Service Store</h2>
        <div className="store-grid">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              className="store-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
            >
              <div className="store-card-icon">{service.icon}</div>
              <h3 className="store-card-title">{service.title}</h3>
              <p className="store-card-desc">{service.description}</p>
              <div className="store-card-footer">
                <span className="store-price">🪙 {service.cost}</span>
                <button
                  className="store-buy-btn"
                  onClick={() => handleBuy(service)}
                  disabled={balance < service.cost}
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Transaction History */}
      <motion.section
        className="transaction-history"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <h2 className="wallet-section-title">📜 Transaction History</h2>
        <div className="tx-list">
          {transactions.length === 0 ? (
            <div className="tx-empty">No transactions yet. Start earning CroCoins!</div>
          ) : (
            transactions.map((tx) => (
              <motion.div
                key={tx.id}
                className="tx-item"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="tx-info">
                  <span className="tx-label">{tx.label}</span>
                  <span className="tx-time">{formatTime(tx.timestamp)}</span>
                </div>
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>

      {/* How to Earn */}
      <motion.section
        className="earn-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <h2 className="wallet-section-title">💡 How to Earn</h2>
        <div className="earn-grid">
          {EARN_METHODS.map((method, i) => (
            <motion.div
              key={i}
              className="earn-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.07 }}
            >
              <div className="earn-card-icon">{method.icon}</div>
              <div className="earn-card-title">{method.title}</div>
              <div className="earn-card-amount">+{method.amount} 🪙</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="coin-toast"
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <span className="coin-toast-icon">🪙</span>
            <span className="coin-toast-text">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> 0910c5aef3e52c74bae8ed950610bba69e0f4d49
    </div>
  );
};

export default WalletPage;
