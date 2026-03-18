import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WaitlistModal from './components/WaitlistModal';
import BackgroundCanvas from './components/BackgroundCanvas';
import SystemMonitor from './components/SystemMonitor';
import CustomCursor from './components/CustomCursor';
import Home from './pages/Home';
import FeaturesPage from './pages/FeaturesPage';
import FAQPage from './pages/FAQPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' && showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, [location.pathname, showSplash]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="app-container">
      <CustomCursor />
      <BackgroundCanvas />
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="main-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Navbar onOpenWaitlist={toggleModal} />
            <SystemMonitor />
            <main className="content-wrap">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home onOpenWaitlist={toggleModal} />} />
                    <Route path="/features" element={<FeaturesPage onOpenWaitlist={toggleModal} />} />
                    <Route path="/faq" element={<FAQPage />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>
            <Footer />
            <WaitlistModal isOpen={isModalOpen} onClose={toggleModal} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
