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
    </div>
  );
};

export default WalletPage;
