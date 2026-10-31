import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Scale } from 'lucide-react';

export default function Navbar({ darkMode, toggleDarkMode }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <Scale className="w-6 h-6" />
          <span>saralDOCS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-medium text-slate-600 dark:text-slate-300">
          <Link to="/features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</Link>
          <Link to="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Templates</Link>
          <Link to="/demo" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Live Demo</Link>
          <Link to="/faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600">Sign In</Link>
          <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">Try Free</Link>
        </div>
      </div>
    </header>
  );
}