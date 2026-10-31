import React from 'react';
import { Scale, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-indigo flex items-center justify-center text-white">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">saral<span className="text-brand-indigo">DOCS</span></span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Simplifying legal paperwork for India's 1.4B individuals & small businesses. Built for Ministry of Law & Justice Hackathon 🇮🇳
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li><a href="#features" className="hover:text-brand-indigo">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-brand-indigo">How It Works</a></li>
            <li><a href="#templates" className="hover:text-brand-indigo">Templates</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Popular Docs</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <li>Rent Agreement 🏠</li>
            <li>Freelance Contract 🤝</li>
            <li>NDA Agreement 📄</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h4>
          <div className="flex gap-4 text-slate-600 dark:text-slate-400">
            <a href="#" className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:text-brand-indigo"><Github className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:text-brand-indigo"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:text-brand-indigo"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4 text-center">
        <p>© 2026 saralDOCS. All rights reserved.</p>
        <p className="max-w-md">Disclaimer: saralDOCS provides automated legal drafting guidance, not a substitute for formal legal advice from a licensed advocate.</p>
      </div>
    </footer>
  );
}