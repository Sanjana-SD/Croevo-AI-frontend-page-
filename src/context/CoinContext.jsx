import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CoinContext = createContext(null);

const STORAGE_KEY = 'croevo-wallet';
const WELCOME_BONUS = 500;
const DAILY_REWARD = 50;

function loadWallet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore corrupt data */ }
  return null;
}

function saveWallet(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CoinProvider({ children }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [coinDelta, setCoinDelta] = useState(null); // for animation triggers

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadWallet();
    if (saved) {
      setBalance(saved.balance ?? 0);
      setTransactions(saved.transactions ?? []);
      setDailyRewardClaimed(saved.dailyRewardClaimed ?? null);
    } else {
      // First-time user — welcome bonus
      const welcomeTx = {
        id: crypto.randomUUID(),
        type: 'earn',
        amount: WELCOME_BONUS,
        label: 'Welcome Bonus 🎉',
        timestamp: new Date().toISOString(),
      };
      setBalance(WELCOME_BONUS);
      setTransactions([welcomeTx]);
    }
    setInitialized(true);
  }, []);

  // Persist on every change (after init)
  useEffect(() => {
    if (!initialized) return;
    saveWallet({ balance, transactions, dailyRewardClaimed });
  }, [balance, transactions, dailyRewardClaimed, initialized]);

  const addCoins = useCallback((amount, label = 'Earned') => {
    const tx = {
      id: crypto.randomUUID(),
      type: 'earn',
      amount,
      label,
      timestamp: new Date().toISOString(),
    };
    setBalance(prev => prev + amount);
    setTransactions(prev => [tx, ...prev].slice(0, 50)); // keep last 50
    setCoinDelta(amount);
    setTimeout(() => setCoinDelta(null), 1500);
  }, []);

  const spendCoins = useCallback((amount, label = 'Purchase') => {
    if (balance < amount) return false;
    const tx = {
      id: crypto.randomUUID(),
      type: 'spend',
      amount,
      label,
      timestamp: new Date().toISOString(),
    };
    setBalance(prev => prev - amount);
    setTransactions(prev => [tx, ...prev].slice(0, 50));
    setCoinDelta(-amount);
    setTimeout(() => setCoinDelta(null), 1500);
    return true;
  }, [balance]);

  const canClaimDaily = useCallback(() => {
    if (!dailyRewardClaimed) return true;
    const last = new Date(dailyRewardClaimed);
    const now = new Date();
    return now.toDateString() !== last.toDateString();
  }, [dailyRewardClaimed]);

  const claimDailyReward = useCallback(() => {
    if (!canClaimDaily()) return false;
    addCoins(DAILY_REWARD, 'Daily Login Reward ☀️');
    setDailyRewardClaimed(new Date().toISOString());
    return true;
  }, [canClaimDaily, addCoins]);

  const value = {
    balance,
    transactions,
    coinDelta,
    addCoins,
    spendCoins,
    canClaimDaily,
    claimDailyReward,
    DAILY_REWARD,
  };

  return (
    <CoinContext.Provider value={value}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error('useCoins must be used within CoinProvider');
  return ctx;
}
