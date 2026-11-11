import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleDarkMode() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('saraldocs-theme', next ? 'dark' : 'light');
    setDarkMode(next);
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#101410]">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
      <Footer />
    </div>
  );
}
