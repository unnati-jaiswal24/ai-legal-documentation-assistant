import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Sections for Home Page
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import TemplatesSection from './sections/TemplatesSection';
import LiveDemoSection from './sections/LiveDemoSection';
import TrustSection from './sections/TrustSection';
import FAQSection from './sections/FAQSection';

// Page Views
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

// Home Page Component
function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <LiveDemoSection />
      <TrustSection />
      <FAQSection />
    </>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Routes>
        {/* Full Landing Page Route */}
        <Route
          path="/"
          element={
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <main className="flex-grow">
                <Home />
              </main>
              <Footer />
            </>
          }
        />

        {/* Authentication & App Dashboard Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}